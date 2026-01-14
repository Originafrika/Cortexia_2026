/**
 * WITHDRAWAL ROUTES - Origins Withdrawal System
 * 
 * Features:
 * - Max 2 withdrawals per month
 * - Minimum withdrawal amount
 * - Stripe integration
 * - Account verification required
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;                   // Origins amount
  usdAmount: number;                // USD amount (1:1)
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Payment details
  paymentMethod: 'stripe';
  stripeAccountId?: string;
  stripeTransferId?: string;
  
  // Metadata
  month: string;                    // '2026-01'
  requestDate: string;
  processedDate?: string;
  failureReason?: string;
  
  // Verification
  accountVerified: boolean;
}

interface WithdrawalLimits {
  maxPerMonth: number;              // 2
  minAmount: number;                // 50 Origins ($50)
  remainingThisMonth: number;
  currentMonth: string;
}

// Constants
const WITHDRAWAL_LIMITS = {
  maxPerMonth: 2,
  minAmount: 50,                    // $50 minimum
  verificationRequired: true
};

// ============================================================================
// GET WITHDRAWAL LIMITS
// ============================================================================

/**
 * GET /withdrawal/:userId/limits
 * Get user's withdrawal limits and availability
 */
app.get('/:userId/limits', async (c) => {
  try {
    const userId = c.req.param('userId');
    const currentMonth = getCurrentMonth();

    // Count withdrawals this month
    const withdrawalsKey = `withdrawals:${userId}`;
    const allWithdrawals = await kv.get(withdrawalsKey) || [];
    
    const thisMonthWithdrawals = allWithdrawals.filter(
      (w: WithdrawalRequest) => w.month === currentMonth && 
      w.status !== 'cancelled' &&
      w.status !== 'failed'
    );

    const remainingThisMonth = Math.max(
      0,
      WITHDRAWAL_LIMITS.maxPerMonth - thisMonthWithdrawals.length
    );

    const limits: WithdrawalLimits = {
      maxPerMonth: WITHDRAWAL_LIMITS.maxPerMonth,
      minAmount: WITHDRAWAL_LIMITS.minAmount,
      remainingThisMonth,
      currentMonth
    };

    return c.json({
      success: true,
      limits,
      withdrawalsThisMonth: thisMonthWithdrawals.length
    });
  } catch (error) {
    console.error('❌ Get limits error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get limits'
    }, 500);
  }
});

// ============================================================================
// REQUEST WITHDRAWAL
// ============================================================================

/**
 * POST /withdrawal/request
 * Request withdrawal from Origins wallet
 */
app.post('/request', async (c) => {
  try {
    const {
      userId,
      amount,
      stripeAccountId
    } = await c.req.json();

    if (!userId || !amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid parameters'
      }, 400);
    }

    // Check minimum amount
    if (amount < WITHDRAWAL_LIMITS.minAmount) {
      return c.json({
        success: false,
        error: `Minimum withdrawal amount is ${WITHDRAWAL_LIMITS.minAmount} Origins ($${WITHDRAWAL_LIMITS.minAmount})`
      }, 400);
    }

    // Check monthly limit
    const currentMonth = getCurrentMonth();
    const withdrawalsKey = `withdrawals:${userId}`;
    const allWithdrawals = await kv.get(withdrawalsKey) || [];
    
    const thisMonthWithdrawals = allWithdrawals.filter(
      (w: WithdrawalRequest) => w.month === currentMonth &&
      w.status !== 'cancelled' &&
      w.status !== 'failed'
    );

    if (thisMonthWithdrawals.length >= WITHDRAWAL_LIMITS.maxPerMonth) {
      return c.json({
        success: false,
        error: `Maximum ${WITHDRAWAL_LIMITS.maxPerMonth} withdrawals per month. Next reset: ${getNextMonthStart()}`
      }, 400);
    }

    // Check Origins balance
    const wallet = await kv.get(`origins:wallet:${userId}`);
    
    if (!wallet || wallet.balance < amount) {
      return c.json({
        success: false,
        error: `Insufficient balance. Available: ${wallet?.balance || 0} Origins`
      }, 400);
    }

    // Check account verification (stub - implement later)
    const accountVerified = await checkAccountVerification(userId);
    
    if (WITHDRAWAL_LIMITS.verificationRequired && !accountVerified) {
      return c.json({
        success: false,
        error: 'Account verification required before withdrawal',
        verificationRequired: true
      }, 403);
    }

    // Create withdrawal request
    const withdrawalId = `wdr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const withdrawal: WithdrawalRequest = {
      id: withdrawalId,
      userId,
      amount,
      usdAmount: amount * 1.0, // 1 Origin = $1 USD
      status: 'pending',
      paymentMethod: 'stripe',
      stripeAccountId,
      month: currentMonth,
      requestDate: new Date().toISOString(),
      accountVerified
    };

    // Save withdrawal
    allWithdrawals.unshift(withdrawal);
    await kv.set(withdrawalsKey, allWithdrawals);

    // Deduct from wallet (reserve)
    const deductResult = await fetch(`http://localhost:8000/make-server-e55aa214/origins/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        amount,
        description: `Withdrawal request ${withdrawalId}`,
        metadata: { withdrawalId }
      })
    }).then(r => r.json()).catch(() => null);

    if (!deductResult?.success) {
      // Fallback: deduct directly
      wallet.balance -= amount;
      wallet.totalWithdrawn += amount;
      wallet.lastUpdated = new Date().toISOString();
      await kv.set(`origins:wallet:${userId}`, wallet);
    }

    console.log(`💸 Withdrawal requested: ${amount} Origins ($${withdrawal.usdAmount}) for ${userId}`);

    // Auto-process if Stripe account connected
    if (stripeAccountId) {
      // Queue for processing (in real app, this would trigger Stripe transfer)
      setTimeout(async () => {
        await processWithdrawal(withdrawalId, userId);
      }, 1000);
    }

    return c.json({
      success: true,
      withdrawal
    });
  } catch (error) {
    console.error('❌ Request withdrawal error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request withdrawal'
    }, 500);
  }
});

// ============================================================================
// GET WITHDRAWAL HISTORY
// ============================================================================

/**
 * GET /withdrawal/:userId/history?limit=50&offset=0
 * Get user's withdrawal history
 */
app.get('/:userId/history', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const withdrawalsKey = `withdrawals:${userId}`;
    const allWithdrawals = await kv.get(withdrawalsKey) || [];

    // Paginate
    const paginatedWithdrawals = allWithdrawals.slice(offset, offset + limit);

    return c.json({
      success: true,
      withdrawals: paginatedWithdrawals,
      pagination: {
        offset,
        limit,
        total: allWithdrawals.length,
        hasMore: offset + limit < allWithdrawals.length
      }
    });
  } catch (error) {
    console.error('❌ Get history error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get history'
    }, 500);
  }
});

// ============================================================================
// GET WITHDRAWAL STATUS
// ============================================================================

/**
 * GET /withdrawal/:withdrawalId/status
 * Get withdrawal status
 */
app.get('/:withdrawalId/status', async (c) => {
  try {
    const withdrawalId = c.req.param('withdrawalId');

    // Find withdrawal (search all users - not optimal, but works for now)
    const allWithdrawals = await kv.getByPrefix('withdrawals:') || [];
    
    let foundWithdrawal = null;
    for (const withdrawals of allWithdrawals) {
      if (Array.isArray(withdrawals)) {
        const found = withdrawals.find((w: WithdrawalRequest) => w.id === withdrawalId);
        if (found) {
          foundWithdrawal = found;
          break;
        }
      }
    }

    if (!foundWithdrawal) {
      return c.json({
        success: false,
        error: 'Withdrawal not found'
      }, 404);
    }

    return c.json({
      success: true,
      withdrawal: foundWithdrawal
    });
  } catch (error) {
    console.error('❌ Get status error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status'
    }, 500);
  }
});

// ============================================================================
// CANCEL WITHDRAWAL
// ============================================================================

/**
 * POST /withdrawal/:withdrawalId/cancel
 * Cancel pending withdrawal
 */
app.post('/:withdrawalId/cancel', async (c) => {
  try {
    const withdrawalId = c.req.param('withdrawalId');

    // Find and update withdrawal
    const allUsers = await kv.getByPrefix('withdrawals:') || [];
    
    for (const entry of allUsers) {
      if (Array.isArray(entry)) {
        const withdrawalIndex = entry.findIndex((w: WithdrawalRequest) => w.id === withdrawalId);
        
        if (withdrawalIndex !== -1) {
          const withdrawal = entry[withdrawalIndex];
          
          if (withdrawal.status !== 'pending') {
            return c.json({
              success: false,
              error: `Cannot cancel ${withdrawal.status} withdrawal`
            }, 400);
          }

          // Update status
          withdrawal.status = 'cancelled';
          withdrawal.processedDate = new Date().toISOString();
          
          // Save
          const userId = withdrawal.userId;
          await kv.set(`withdrawals:${userId}`, entry);

          // Refund to wallet
          await fetch(`http://localhost:8000/make-server-e55aa214/origins/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              amount: withdrawal.amount,
              type: 'refund',
              description: `Withdrawal cancelled: ${withdrawalId}`,
              metadata: { withdrawalId }
            })
          }).catch(() => null);

          console.log(`❌ Withdrawal cancelled: ${withdrawalId}`);

          return c.json({
            success: true,
            withdrawal
          });
        }
      }
    }

    return c.json({
      success: false,
      error: 'Withdrawal not found'
    }, 404);
  } catch (error) {
    console.error('❌ Cancel withdrawal error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel withdrawal'
    }, 500);
  }
});

// ============================================================================
// PROCESS WITHDRAWAL (Internal/Admin)
// ============================================================================

/**
 * POST /withdrawal/:withdrawalId/process
 * Process withdrawal (Stripe transfer)
 */
app.post('/:withdrawalId/process', async (c) => {
  try {
    const withdrawalId = c.req.param('withdrawalId');

    // Find withdrawal
    const allUsers = await kv.getByPrefix('withdrawals:') || [];
    
    for (const entry of allUsers) {
      if (Array.isArray(entry)) {
        const withdrawalIndex = entry.findIndex((w: WithdrawalRequest) => w.id === withdrawalId);
        
        if (withdrawalIndex !== -1) {
          const withdrawal = entry[withdrawalIndex];
          const userId = withdrawal.userId;

          if (withdrawal.status !== 'pending') {
            return c.json({
              success: false,
              error: `Cannot process ${withdrawal.status} withdrawal`
            }, 400);
          }

          // Update to processing
          withdrawal.status = 'processing';
          await kv.set(`withdrawals:${userId}`, entry);

          try {
            // TODO: Integrate with Stripe
            // const transfer = await stripe.transfers.create({
            //   amount: withdrawal.usdAmount * 100,
            //   currency: 'usd',
            //   destination: withdrawal.stripeAccountId,
            //   transfer_group: withdrawalId
            // });

            // Simulate success
            withdrawal.status = 'completed';
            withdrawal.processedDate = new Date().toISOString();
            // withdrawal.stripeTransferId = transfer.id;

            console.log(`✅ Withdrawal processed: ${withdrawalId} - $${withdrawal.usdAmount}`);
          } catch (stripeError) {
            // Failure
            withdrawal.status = 'failed';
            withdrawal.processedDate = new Date().toISOString();
            withdrawal.failureReason = stripeError instanceof Error ? stripeError.message : 'Unknown error';

            // Refund to wallet
            await fetch(`http://localhost:8000/make-server-e55aa214/origins/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                amount: withdrawal.amount,
                type: 'refund',
                description: `Withdrawal failed: ${withdrawalId}`,
                metadata: { withdrawalId }
              })
            }).catch(() => null);

            console.error(`❌ Withdrawal failed: ${withdrawalId} - ${withdrawal.failureReason}`);
          }

          await kv.set(`withdrawals:${userId}`, entry);

          return c.json({
            success: withdrawal.status === 'completed',
            withdrawal
          });
        }
      }
    }

    return c.json({
      success: false,
      error: 'Withdrawal not found'
    }, 404);
  } catch (error) {
    console.error('❌ Process withdrawal error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process withdrawal'
    }, 500);
  }
});

// ============================================================================
// HELPERS
// ============================================================================

async function checkAccountVerification(userId: string): Promise<boolean> {
  // TODO: Implement real verification check
  // - Email verified
  // - Identity verified
  // - Stripe account connected
  
  const profile = await kv.get(`user:profile:${userId}`);
  return !!profile; // Stub: return true if profile exists
}

async function processWithdrawal(withdrawalId: string, userId: string): Promise<void> {
  // Auto-process withdrawal
  await fetch(`http://localhost:8000/make-server-e55aa214/withdrawal/${withdrawalId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).catch((error) => {
    console.error('❌ Auto-process failed:', error);
  });
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getNextMonthStart(): string {
  const now = new Date();
  const nextMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return nextMonth.toISOString().split('T')[0];
}

export default app;
