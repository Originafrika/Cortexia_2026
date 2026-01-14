/**
 * REFERRAL ROUTES - Referral System & Commission Tracking
 * 10% lifetime commission on all purchases
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface ReferralTransaction {
  id: string;
  referrerId: string;        // Parrain qui reçoit la commission
  fromUserId: string;        // Filleul qui a acheté
  amount: number;            // Montant de la commission (10%)
  purchaseAmount: number;    // Montant de l'achat original
  purchaseType: 'credits' | 'subscription';
  creditsAmount?: number;    // Nombre de crédits achetés
  date: string;
  status: 'pending' | 'paid';
}

interface ReferralStats {
  userId: string;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  referralCount: number;
  activeReferrals: number;   // Filleuls qui ont fait au moins 1 achat
  totalPurchases: number;    // Total des achats des filleuls
  lifetimeValue: number;     // Valeur totale générée
}

// ============================================================================
// VALIDATE REFERRAL CODE
// ============================================================================

/**
 * POST /referral/validate-code
 * Validate referral code exists
 */
app.post('/validate-code', async (c) => {
  try {
    const { referralCode } = await c.req.json();

    if (!referralCode) {
      return c.json({
        success: false,
        error: 'Referral code required'
      }, 400);
    }

    const code = referralCode.toUpperCase();
    const userId = await kv.get(`referral:code:${code}`);

    if (!userId) {
      return c.json({
        success: false,
        valid: false,
        error: 'Invalid referral code'
      }, 404);
    }

    // Get referrer profile
    const profile = await kv.get(`user:profile:${userId}`);

    if (!profile) {
      return c.json({
        success: false,
        valid: false,
        error: 'Referrer profile not found'
      }, 404);
    }

    console.log(`✅ Referral code validated: ${code} → ${userId}`);

    return c.json({
      success: true,
      valid: true,
      referrer: {
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar
      }
    });
  } catch (error) {
    console.error('❌ Validate code error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate code'
    }, 500);
  }
});

// ============================================================================
// TRACK PURCHASE → COMMISSION
// ============================================================================

/**
 * POST /referral/track-purchase
 * Track purchase and calculate commission for referrer
 */
app.post('/track-purchase', async (c) => {
  try {
    const {
      userId,
      purchaseAmount,
      purchaseType,
      creditsAmount
    } = await c.req.json();

    if (!userId || !purchaseAmount) {
      return c.json({
        success: false,
        error: 'userId and purchaseAmount required'
      }, 400);
    }

    console.log('💰 Tracking purchase:', { userId, purchaseAmount, purchaseType });

    // Get user profile
    const userProfile = await kv.get(`user:profile:${userId}`);

    if (!userProfile) {
      return c.json({
        success: false,
        error: 'User profile not found'
      }, 404);
    }

    // Check if user was referred
    if (!userProfile.referredBy) {
      console.log('ℹ️ User not referred by anyone, no commission to track');
      return c.json({
        success: true,
        commission: 0,
        message: 'No referrer'
      });
    }

    // Calculate 10% commission
    const commission = purchaseAmount * 0.10;

    // Get referrer profile
    const referrerProfile = await kv.get(`user:profile:${userProfile.referredBy}`);

    if (!referrerProfile) {
      console.error(`❌ Referrer profile not found: ${userProfile.referredBy}`);
      return c.json({
        success: false,
        error: 'Referrer profile not found'
      }, 404);
    }

    // Create transaction
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction: ReferralTransaction = {
      id: transactionId,
      referrerId: userProfile.referredBy,
      fromUserId: userId,
      amount: commission,
      purchaseAmount,
      purchaseType: purchaseType || 'credits',
      creditsAmount,
      date: new Date().toISOString(),
      status: 'pending' // Auto-pay later or manual approval
    };

    // Save transaction
    const transactionsKey = `referral:transactions:${userProfile.referredBy}`;
    const transactions = await kv.get(transactionsKey) || [];
    transactions.push(transaction);
    await kv.set(transactionsKey, transactions);

    // Update referrer earnings (add to pending)
    referrerProfile.referralEarnings += commission;
    referrerProfile.updatedAt = new Date().toISOString();
    await kv.set(`user:profile:${userProfile.referredBy}`, referrerProfile);

    // Track global stats
    await trackGlobalReferralStats(userProfile.referredBy, commission, purchaseAmount);

    console.log(`✅ Commission tracked: $${commission.toFixed(2)} for referrer ${userProfile.referredBy}`);

    return c.json({
      success: true,
      commission,
      transaction
    });
  } catch (error) {
    console.error('❌ Track purchase error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track purchase'
    }, 500);
  }
});

// ============================================================================
// GET REFERRAL STATS
// ============================================================================

/**
 * GET /referral/stats/:userId
 * Get detailed referral stats for user
 */
app.get('/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Get all transactions
    const transactions = await kv.get(`referral:transactions:${userId}`) || [];

    // Calculate stats
    const pendingEarnings = transactions
      .filter((tx: ReferralTransaction) => tx.status === 'pending')
      .reduce((sum: number, tx: ReferralTransaction) => sum + tx.amount, 0);

    const paidEarnings = transactions
      .filter((tx: ReferralTransaction) => tx.status === 'paid')
      .reduce((sum: number, tx: ReferralTransaction) => sum + tx.amount, 0);

    const totalPurchases = transactions.reduce(
      (sum: number, tx: ReferralTransaction) => sum + tx.purchaseAmount,
      0
    );

    // Get referrals list
    const referralIds = await kv.get(`user:referrals:${userId}`) || [];

    // Count active referrals (who made at least 1 purchase)
    const uniqueBuyers = new Set(
      transactions.map((tx: ReferralTransaction) => tx.fromUserId)
    );
    const activeReferrals = uniqueBuyers.size;

    const stats: ReferralStats = {
      userId,
      totalEarnings: profile.referralEarnings,
      pendingEarnings,
      paidEarnings,
      referralCount: referralIds.length,
      activeReferrals,
      totalPurchases,
      lifetimeValue: totalPurchases
    };

    return c.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Get referral stats error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }, 500);
  }
});

// ============================================================================
// GET TRANSACTIONS
// ============================================================================

/**
 * GET /referral/transactions/:userId?limit=50&offset=0
 * Get user's referral transactions
 */
app.get('/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const transactions = await kv.get(`referral:transactions:${userId}`) || [];

    // Sort by date (newest first)
    const sortedTransactions = transactions.sort((a: ReferralTransaction, b: ReferralTransaction) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Paginate
    const paginatedTransactions = sortedTransactions.slice(offset, offset + limit);

    // Get buyer info for each transaction
    const enrichedTransactions = [];
    for (const tx of paginatedTransactions) {
      const buyerProfile = await kv.get(`user:profile:${tx.fromUserId}`);
      enrichedTransactions.push({
        ...tx,
        buyer: buyerProfile ? {
          username: buyerProfile.username,
          displayName: buyerProfile.displayName,
          avatar: buyerProfile.avatar
        } : null
      });
    }

    return c.json({
      success: true,
      transactions: enrichedTransactions,
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
// LEADERBOARD
// ============================================================================

/**
 * GET /referral/leaderboard?period=all&limit=50
 * Get top referrers
 */
app.get('/leaderboard', async (c) => {
  try {
    const period = c.req.query('period') || 'all'; // all | month | week
    const limit = parseInt(c.req.query('limit') || '50');

    // Get all user profiles
    const allProfiles = await kv.getByPrefix('user:profile:') || [];

    // Sort by referral earnings
    const sortedProfiles = allProfiles
      .filter((profile: any) => profile.referralEarnings > 0)
      .sort((a: any, b: any) => b.referralEarnings - a.referralEarnings)
      .slice(0, limit);

    // Build leaderboard
    const leaderboard = sortedProfiles.map((profile: any, index: number) => ({
      rank: index + 1,
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.avatar,
      totalEarnings: profile.referralEarnings,
      referralCount: profile.referralCount
    }));

    return c.json({
      success: true,
      leaderboard,
      period
    });
  } catch (error) {
    console.error('❌ Get leaderboard error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get leaderboard'
    }, 500);
  }
});

// ============================================================================
// GET REFERRAL LINK
// ============================================================================

/**
 * GET /referral/:userId/link
 * Get user's referral link
 */
app.get('/:userId/link', async (c) => {
  try {
    const userId = c.req.param('userId');

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    const referralLink = `https://cortexia.app?ref=${profile.referralCode}`;

    return c.json({
      success: true,
      referralCode: profile.referralCode,
      referralLink,
      referralCount: profile.referralCount,
      totalEarnings: profile.referralEarnings
    });
  } catch (error) {
    console.error('❌ Get referral link error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get referral link'
    }, 500);
  }
});

// ============================================================================
// PAYOUT COMMISSION (Admin only)
// ============================================================================

/**
 * POST /referral/payout/:transactionId
 * Mark commission as paid (admin only)
 */
app.post('/payout/:transactionId', async (c) => {
  try {
    const transactionId = c.req.param('transactionId');

    // Get all transactions (need to find which user)
    const allProfiles = await kv.getByPrefix('user:profile:') || [];
    
    for (const profile of allProfiles) {
      const transactionsKey = `referral:transactions:${profile.userId}`;
      const transactions = await kv.get(transactionsKey) || [];
      
      const txIndex = transactions.findIndex((tx: ReferralTransaction) => tx.id === transactionId);
      
      if (txIndex !== -1) {
        // Mark as paid
        transactions[txIndex].status = 'paid';
        await kv.set(transactionsKey, transactions);
        
        console.log(`✅ Transaction ${transactionId} marked as paid`);
        
        return c.json({
          success: true,
          transaction: transactions[txIndex]
        });
      }
    }

    return c.json({
      success: false,
      error: 'Transaction not found'
    }, 404);
  } catch (error) {
    console.error('❌ Payout error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payout'
    }, 500);
  }
});

// ============================================================================
// GLOBAL STATS
// ============================================================================

/**
 * GET /referral/global-stats
 * Get global referral program stats
 */
app.get('/global-stats', async (c) => {
  try {
    const globalStats = await kv.get('referral:global:stats') || {
      totalReferrals: 0,
      totalEarnings: 0,
      totalPurchases: 0,
      activeReferrers: 0
    };

    return c.json({
      success: true,
      stats: globalStats
    });
  } catch (error) {
    console.error('❌ Get global stats error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get global stats'
    }, 500);
  }
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Track global referral stats
 */
async function trackGlobalReferralStats(
  referrerId: string,
  commission: number,
  purchaseAmount: number
) {
  try {
    const globalStats = await kv.get('referral:global:stats') || {
      totalReferrals: 0,
      totalEarnings: 0,
      totalPurchases: 0,
      activeReferrers: 0
    };

    globalStats.totalEarnings += commission;
    globalStats.totalPurchases += purchaseAmount;

    // Count unique referrers
    const allProfiles = await kv.getByPrefix('user:profile:') || [];
    const activeReferrers = allProfiles.filter((p: any) => p.referralCount > 0).length;
    globalStats.activeReferrers = activeReferrers;

    const totalReferrals = allProfiles.reduce((sum: number, p: any) => sum + (p.referralCount || 0), 0);
    globalStats.totalReferrals = totalReferrals;

    await kv.set('referral:global:stats', globalStats);
  } catch (error) {
    console.error('❌ Track global stats error:', error);
  }
}

export default app;
