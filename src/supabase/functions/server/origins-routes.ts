/**
 * ORIGINS ROUTES - In-App Currency System
 * Origins = Creator earnings currency with fixed USD correspondence
 * 1 Origin = $1 USD
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface OriginsWallet {
  userId: string;
  balance: number;              // Current Origins balance
  totalEarned: number;          // Lifetime earned
  totalWithdrawn: number;       // Lifetime withdrawn
  pendingCommissions: number;   // Commissions not yet credited
  lastUpdated: string;
}

interface OriginsTransaction {
  id: string;
  userId: string;
  type: 'commission' | 'withdrawal' | 'bonus' | 'refund';
  amount: number;               // Positive for credits, negative for withdrawals
  description: string;
  metadata?: {
    referralId?: string;        // For commissions
    withdrawalId?: string;      // For withdrawals
    purchaseAmount?: number;    // Original purchase amount
    multiplier?: number;        // Streak multiplier applied
  };
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
}

// ============================================================================
// GET WALLET
// ============================================================================

/**
 * GET /origins/wallet/:userId
 * Get user's Origins wallet
 */
app.get('/wallet/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    let wallet = await kv.get(`origins:wallet:${userId}`);
    
    if (!wallet) {
      // Initialize wallet
      wallet = {
        userId,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingCommissions: 0,
        lastUpdated: new Date().toISOString()
      };
      await kv.set(`origins:wallet:${userId}`, wallet);
    }

    return c.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('❌ Get wallet error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get wallet'
    }, 500);
  }
});

// ============================================================================
// ADD ORIGINS (Commission / Bonus)
// ============================================================================

/**
 * POST /origins/add
 * Add Origins to wallet (internal use)
 */
app.post('/add', async (c) => {
  try {
    const {
      userId,
      amount,
      type,
      description,
      metadata
    } = await c.req.json();

    if (!userId || !amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid parameters'
      }, 400);
    }

    // Get wallet
    let wallet = await kv.get(`origins:wallet:${userId}`);
    
    if (!wallet) {
      wallet = {
        userId,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingCommissions: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    // Update wallet
    wallet.balance += amount;
    wallet.totalEarned += amount;
    wallet.lastUpdated = new Date().toISOString();
    
    await kv.set(`origins:wallet:${userId}`, wallet);

    // Create transaction
    const transaction: OriginsTransaction = {
      id: `orig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: type || 'commission',
      amount,
      description: description || 'Origins earned',
      metadata,
      status: 'completed',
      date: new Date().toISOString()
    };

    // Save transaction
    const transactionsKey = `origins:transactions:${userId}`;
    const transactions = await kv.get(transactionsKey) || [];
    transactions.unshift(transaction);
    
    // Keep last 200 transactions
    if (transactions.length > 200) {
      transactions.splice(200);
    }
    
    await kv.set(transactionsKey, transactions);

    console.log(`✅ Added ${amount} Origins to ${userId}`);

    return c.json({
      success: true,
      wallet,
      transaction
    });
  } catch (error) {
    console.error('❌ Add Origins error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add Origins'
    }, 500);
  }
});

// ============================================================================
// DEDUCT ORIGINS (Withdrawal)
// ============================================================================

/**
 * POST /origins/deduct
 * Deduct Origins from wallet (internal use)
 */
app.post('/deduct', async (c) => {
  try {
    const {
      userId,
      amount,
      description,
      metadata
    } = await c.req.json();

    if (!userId || !amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid parameters'
      }, 400);
    }

    // Get wallet
    const wallet = await kv.get(`origins:wallet:${userId}`);
    
    if (!wallet) {
      return c.json({
        success: false,
        error: 'Wallet not found'
      }, 404);
    }

    // Check balance
    if (wallet.balance < amount) {
      return c.json({
        success: false,
        error: `Insufficient balance. Available: ${wallet.balance}, Required: ${amount}`
      }, 400);
    }

    // Update wallet
    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;
    wallet.lastUpdated = new Date().toISOString();
    
    await kv.set(`origins:wallet:${userId}`, wallet);

    // Create transaction
    const transaction: OriginsTransaction = {
      id: `orig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'withdrawal',
      amount: -amount,
      description: description || 'Withdrawal',
      metadata,
      status: 'completed',
      date: new Date().toISOString()
    };

    // Save transaction
    const transactionsKey = `origins:transactions:${userId}`;
    const transactions = await kv.get(transactionsKey) || [];
    transactions.unshift(transaction);
    
    if (transactions.length > 200) {
      transactions.splice(200);
    }
    
    await kv.set(transactionsKey, transactions);

    console.log(`✅ Deducted ${amount} Origins from ${userId}`);

    return c.json({
      success: true,
      wallet,
      transaction
    });
  } catch (error) {
    console.error('❌ Deduct Origins error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deduct Origins'
    }, 500);
  }
});

// ============================================================================
// GET TRANSACTIONS
// ============================================================================

/**
 * GET /origins/transactions/:userId?limit=50&offset=0
 * Get user's Origins transactions
 */
app.get('/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const transactions = await kv.get(`origins:transactions:${userId}`) || [];

    // Paginate
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    return c.json({
      success: true,
      transactions: paginatedTransactions,
      pagination: {
        offset,
        limit,
        total: transactions.length,
        hasMore: offset + limit < transactions.length
      }
    });
  } catch (error) {
    console.error('❌ Get transactions error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get transactions'
    }, 500);
  }
});

// ============================================================================
// CREDIT COMMISSION (with Multiplier)
// ============================================================================

/**
 * POST /origins/credit-commission
 * Credit commission to creator wallet with streak multiplier
 */
app.post('/credit-commission', async (c) => {
  try {
    const {
      creatorId,
      referralId,
      purchaseAmount,
      baseCommission,
      multiplier
    } = await c.req.json();

    if (!creatorId || !purchaseAmount || !baseCommission) {
      return c.json({
        success: false,
        error: 'Invalid parameters'
      }, 400);
    }

    // Calculate final commission with multiplier
    const finalCommission = baseCommission * (multiplier || 1.0);

    // Add to wallet
    const addResult = await fetch(`http://localhost:8000/make-server-e55aa214/origins/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: creatorId,
        amount: finalCommission,
        type: 'commission',
        description: `Referral commission (${multiplier ? `${multiplier}x multiplier` : 'base rate'})`,
        metadata: {
          referralId,
          purchaseAmount,
          multiplier
        }
      })
    }).then(r => r.json()).catch(() => null);

    if (!addResult?.success) {
      // Fallback: Add directly
      let wallet = await kv.get(`origins:wallet:${creatorId}`);
      
      if (!wallet) {
        wallet = {
          userId: creatorId,
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          pendingCommissions: 0,
          lastUpdated: new Date().toISOString()
        };
      }

      wallet.balance += finalCommission;
      wallet.totalEarned += finalCommission;
      wallet.lastUpdated = new Date().toISOString();
      
      await kv.set(`origins:wallet:${creatorId}`, wallet);
    }

    console.log(`💎 Credited ${finalCommission} Origins to ${creatorId} (multiplier: ${multiplier || 1.0}x)`);

    return c.json({
      success: true,
      amount: finalCommission,
      baseCommission,
      multiplier: multiplier || 1.0
    });
  } catch (error) {
    console.error('❌ Credit commission error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to credit commission'
    }, 500);
  }
});

// ============================================================================
// CONVERT ORIGINS TO USD
// ============================================================================

/**
 * GET /origins/convert?amount=100
 * Convert Origins to USD (1 Origin = $1 USD)
 */
app.get('/convert', async (c) => {
  try {
    const amount = parseFloat(c.req.query('amount') || '0');

    if (amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid amount'
      }, 400);
    }

    // 1 Origin = $1 USD (fixed rate)
    const usd = amount * 1.0;

    return c.json({
      success: true,
      origins: amount,
      usd,
      rate: 1.0
    });
  } catch (error) {
    console.error('❌ Convert error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert'
    }, 500);
  }
});

// ============================================================================
// GLOBAL ORIGINS STATS
// ============================================================================

/**
 * GET /origins/global-stats
 * Get global Origins stats
 */
app.get('/global-stats', async (c) => {
  try {
    const globalStats = await kv.get('origins:global:stats') || {
      totalEarned: 0,
      totalWithdrawn: 0,
      totalCreators: 0,
      averageBalance: 0
    };

    return c.json({
      success: true,
      stats: globalStats
    });
  } catch (error) {
    console.error('❌ Get global stats error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }, 500);
  }
});

export default app;
