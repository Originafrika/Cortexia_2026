/**
 * CREATOR ROUTES - Creator System & Top Creator Program
 * Track stats, auto-unlock Coconut access
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface CreatorStats {
  userId: string;
  month: string; // "2026-01"
  creationsCount: number;      // Target: 60
  postsPublished: number;      // Target: 5
  postsWithEnoughLikes: number; // Target: 5 (each >= 5 likes)
  isTopCreator: boolean;
  coconutAccessActive: boolean;
  // ✅ NEW: Coconut generation tracking
  coconutGenerationsUsed: number; // Max 3/month for creators
  // ✅ NEW: Commission streak tracking
  commissionStreakMonths: number; // Consecutive months as creator (10% + 1%/month up to 15%)
  currentCommissionRate: number; // 10-15%
  // ✅ NEW: Fast-track via 1000 credits purchase
  boughtCreatorAccess: boolean; // True if paid 1000 credits this month
  creatorAccessExpiresAt: string | null; // End of current month
}

// ============================================================================
// TRACK CREATION
// ============================================================================

/**
 * POST /creators/track/creation
 * Track creation generated (for Top Creator program)
 */
app.post('/track/creation', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId required' }, 400);
    }

    const month = getCurrentMonth();
    const statsKey = `creator:stats:${userId}:${month}`;
    
    let stats: CreatorStats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };
    
    stats.creationsCount++;
    await kv.set(statsKey, stats);
    
    // ✅ NEW: Update Compensation stats (Défi 60+)
    await updateCompensationStats(userId, 'images', 1);
    
    // Check if user qualifies as Top Creator
    await checkTopCreatorStatus(userId, month);
    
    console.log(`📊 Creation tracked: ${userId} - ${stats.creationsCount} creations`);

    return c.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Track creation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track creation'
    }, 500);
  }
});

// ============================================================================
// TRACK POST PUBLISH
// ============================================================================

/**
 * POST /creators/track/post
 * Track post published to feed (for Top Creator program)
 */
app.post('/track/post', async (c) => {
  try {
    const { userId, postId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId required' }, 400);
    }

    const month = getCurrentMonth();
    const statsKey = `creator:stats:${userId}:${month}`;
    
    let stats: CreatorStats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };
    
    stats.postsPublished++;
    await kv.set(statsKey, stats);
    
    // Track post ID for this month
    const postsKey = `creator:posts:${userId}:${month}`;
    const posts = await kv.get(postsKey) || [];
    if (!posts.includes(postId)) {
      posts.push(postId);
      await kv.set(postsKey, posts);
    }
    
    // Check if user qualifies as Top Creator
    await checkTopCreatorStatus(userId, month);
    
    console.log(`📊 Post published tracked: ${userId} - ${stats.postsPublished} posts`);

    return c.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Track post error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track post'
    }, 500);
  }
});

// ============================================================================
// TRACK LIKE (Check if post reaches 5+ likes)
// ============================================================================

/**
 * POST /creators/track/like
 * Track like on post (check if reaches 5+ likes)
 */
app.post('/track/like', async (c) => {
  try {
    const { userId, postId, likes } = await c.req.json();

    if (!userId || !postId) {
      return c.json({ success: false, error: 'userId and postId required' }, 400);
    }

    // Check if post has 5+ likes
    if (likes >= 5) {
      const month = getCurrentMonth();
      const likedPostsKey = `creator:liked-posts:${userId}:${month}`;
      const likedPosts = await kv.get(likedPostsKey) || [];
      
      if (!likedPosts.includes(postId)) {
        likedPosts.push(postId);
        await kv.set(likedPostsKey, likedPosts);
        
        // Update stats
        const statsKey = `creator:stats:${userId}:${month}`;
        let stats: CreatorStats = await kv.get(statsKey) || {
          userId,
          month,
          creationsCount: 0,
          postsPublished: 0,
          postsWithEnoughLikes: 0,
          isTopCreator: false,
          coconutAccessActive: false,
          coconutGenerationsUsed: 0,
          commissionStreakMonths: 0,
          currentCommissionRate: 10,
          boughtCreatorAccess: false,
          creatorAccessExpiresAt: null
        };
        
        stats.postsWithEnoughLikes = likedPosts.length;
        await kv.set(statsKey, stats);
        
        // Check if user qualifies as Top Creator
        await checkTopCreatorStatus(userId, month);
        
        console.log(`📊 Post reached 5+ likes: ${postId} - ${stats.postsWithEnoughLikes}/5 qualified`);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Track like error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track like'
    }, 500);
  }
});

// ============================================================================
// GET CREATOR STATS
// ============================================================================

/**
 * GET /creators/stats/:userId/:month
 * Get creator stats for a specific month
 */
app.get('/stats/:userId/:month', async (c) => {
  try {
    const userId = c.req.param('userId');
    const month = c.req.param('month');

    const statsKey = `creator:stats:${userId}:${month}`;
    const stats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };

    return c.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }, 500);
  }
});

/**
 * GET /creators/stats/:userId/current
 * Get creator stats for current month
 */
app.get('/stats/:userId/current', async (c) => {
  try {
    const userId = c.req.param('userId');
    const month = getCurrentMonth();

    const statsKey = `creator:stats:${userId}:${month}`;
    const stats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };

    return c.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Get current stats error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get current stats'
    }, 500);
  }
});

// ============================================================================
// CHECK TOP CREATOR STATUS
// ============================================================================

/**
 * GET /creators/:userId/status
 * Check if user is Top Creator
 */
app.get('/:userId/status', async (c) => {
  try {
    const userId = c.req.param('userId');
    const month = getCurrentMonth();

    const statsKey = `creator:stats:${userId}:${month}`;
    const stats: CreatorStats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };

    const isTopCreator = (
      stats.creationsCount >= 60 &&
      stats.postsPublished >= 5 &&
      stats.postsWithEnoughLikes >= 5
    );

    return c.json({
      success: true,
      isTopCreator,
      hasCoconutAccess: stats.coconutAccessActive,
      stats
    });
  } catch (error) {
    console.error('❌ Check status error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check status'
    }, 500);
  }
});

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * GET /creators/leaderboard?month=2026-01&limit=50
 * Get top creators leaderboard
 */
app.get('/leaderboard', async (c) => {
  try {
    const month = c.req.query('month') || getCurrentMonth();
    const limit = parseInt(c.req.query('limit') || '50');

    // Get all creator stats for this month
    const allStats = await kv.getByPrefix(`creator:stats:`) || [];
    
    // Filter by month and sort by creations count
    const monthStats = allStats
      .filter((stats: CreatorStats) => stats.month === month)
      .sort((a: CreatorStats, b: CreatorStats) => b.creationsCount - a.creationsCount)
      .slice(0, limit);

    return c.json({
      success: true,
      leaderboard: monthStats,
      month
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
// ✅ NEW: BUY CREATOR ACCESS (1000 CREDITS)
// ============================================================================

/**
 * POST /creators/buy-access
 * Buy Creator access for current month with 1000 credits
 * This gives:
 * - 3 Coconut generations for the current month
 * - 10% commission on referrals
 * - Watermark-free downloads
 * Expires at end of current month
 */
app.post('/buy-access', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId required' }, 400);
    }

    // Get user profile
    const userKey = `user:profile:${userId}`;
    const user = await kv.get(userKey);
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Check if user has 1000 credits
    const totalCredits = (user.freeCredits || 0) + (user.paidCredits || 0);
    
    if (totalCredits < 1000) {
      return c.json({ 
        success: false, 
        error: 'Insufficient credits. Need 1000 credits to unlock Creator access.' 
      }, 400);
    }

    // Deduct 1000 credits (prioritize paid credits first)
    if (user.paidCredits >= 1000) {
      user.paidCredits -= 1000;
    } else {
      const remaining = 1000 - user.paidCredits;
      user.paidCredits = 0;
      user.freeCredits -= remaining;
    }

    // Update user profile
    user.hasCoconutAccess = true;
    await kv.set(userKey, user);

    // Update creator stats
    const month = getCurrentMonth();
    const statsKey = `creator:stats:${userId}:${month}`;
    let stats: CreatorStats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };

    stats.boughtCreatorAccess = true;
    stats.coconutAccessActive = true;
    stats.creatorAccessExpiresAt = getEndOfMonth();
    await kv.set(statsKey, stats);

    console.log(`💎 ${userId} bought Creator access for ${month} with 1000 credits`);

    return c.json({
      success: true,
      message: 'Creator access unlocked for this month!',
      expiresAt: stats.creatorAccessExpiresAt,
      remainingCredits: (user.freeCredits || 0) + (user.paidCredits || 0)
    });
  } catch (error) {
    console.error('❌ Buy creator access error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to buy creator access'
    }, 500);
  }
});

// ============================================================================
// ✅ NEW: TRACK COCONUT GENERATION
// ============================================================================

/**
 * POST /creators/track/coconut-generation
 * Track Coconut generation usage (max 3/month for creators)
 */
app.post('/track/coconut-generation', async (c) => {
  try {
    const { userId, mode } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId required' }, 400);
    }

    const month = getCurrentMonth();
    const statsKey = `creator:stats:${userId}:${month}`;
    
    let stats: CreatorStats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };

    // Increment Coconut generation count
    stats.coconutGenerationsUsed++;
    await kv.set(statsKey, stats);

    console.log(`🥥 ${userId} used Coconut generation ${stats.coconutGenerationsUsed}/3 (${mode})`);

    return c.json({
      success: true,
      coconutGenerationsUsed: stats.coconutGenerationsUsed,
      coconutGenerationsRemaining: Math.max(0, 3 - stats.coconutGenerationsUsed)
    });
  } catch (error) {
    console.error('❌ Track Coconut generation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track Coconut generation'
    }, 500);
  }
});

// ============================================================================
// ✅ NEW: CHECK COCONUT ACCESS
// ============================================================================

/**
 * GET /creators/:userId/coconut-access
 * Check if user has Coconut access and how many generations remaining
 */
app.get('/:userId/coconut-access', async (c) => {
  try {
    const userId = c.req.param('userId');
    const month = getCurrentMonth();

    // Get user profile
    const userKey = `user:profile:${userId}`;
    const user = await kv.get(userKey);
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Check account type
    if (user.accountType === 'enterprise') {
      return c.json({
        success: true,
        hasCoconutAccess: true,
        isEnterprise: true,
        coconutGenerationsUsed: 0,
        coconutGenerationsRemaining: -1, // Unlimited for enterprise
        reason: 'Enterprise account'
      });
    }

    // Get creator stats
    const statsKey = `creator:stats:${userId}:${month}`;
    const stats: CreatorStats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false,
      coconutAccessActive: false,
      coconutGenerationsUsed: 0,
      commissionStreakMonths: 0,
      currentCommissionRate: 10,
      boughtCreatorAccess: false,
      creatorAccessExpiresAt: null
    };
    
    // ✅ ADMIN OVERRIDE: Check if admin has manually set isCreator = true
    const isCreatorByAdmin = user.isCreator === true;
    
    // ✅ AUTO-ACTIVATE: If admin set isCreator = true, automatically activate Coconut access
    if (isCreatorByAdmin && !stats.coconutAccessActive) {
      stats.coconutAccessActive = true;
      stats.creatorAccessExpiresAt = getEndOfMonth();
      await kv.set(statsKey, stats);
      console.log(`👑 [CoconutAccess] Auto-activated Coconut access for admin-set Creator ${userId}`);
    }
    
    // User is Creator if:
    // 1. They earned it (isTopCreator from stats)
    // 2. Admin manually set isCreator = true
    // 3. They bought Creator access
    const isCreator = stats.isTopCreator || isCreatorByAdmin || stats.boughtCreatorAccess;

    // Check if creator access is active
    const hasAccess = stats.coconutAccessActive && isCreator;
    const generationsRemaining = hasAccess ? Math.max(0, 3 - stats.coconutGenerationsUsed) : 0;
    
    if (isCreatorByAdmin) {
      console.log(`👑 [CoconutAccess] Admin set isCreator=true for ${userId} - hasAccess: ${hasAccess}`);
    }

    const responseData = {
      success: true,
      hasCoconutAccess: hasAccess,
      isCreator: isCreator,
      isEnterprise: user.accountType === 'enterprise',
      accountType: user.accountType,
      boughtAccess: stats.boughtCreatorAccess,
      coconutGenerationsUsed: stats.coconutGenerationsUsed,
      coconutGenerationsRemaining: generationsRemaining,
      expiresAt: stats.creatorAccessExpiresAt,
      commissionRate: stats.currentCommissionRate
    };
    
    console.log(`🥥 [CoconutAccess] Response for ${userId}:`, JSON.stringify(responseData, null, 2));

    return c.json(responseData);
  } catch (error) {
    console.error('❌ Check Coconut access error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check Coconut access'
    }, 500);
  }
});

// ============================================================================
// ✅ NEW: MONTHLY RESET (Called by cron on 1st of each month)
// ============================================================================

/**
 * GET /creators/monthly-reset
 * Reset monthly creator stats and recalculate commission streaks
 * Called automatically on the 1st of each month
 */
app.get('/monthly-reset', async (c) => {
  try {
    console.log('🔄 Starting monthly Creator reset...');

    const prevMonth = getPreviousMonth();
    const currentMonth = getCurrentMonth();

    // Get all creator stats from previous month
    const allStats = await kv.getByPrefix(`creator:stats:`) || [];
    const prevMonthStats = allStats.filter((stats: CreatorStats) => stats.month === prevMonth);

    let resetCount = 0;

    for (const prevStats of prevMonthStats) {
      const userId = prevStats.userId;
      
      // Get or create new month stats
      const newStatsKey = `creator:stats:${userId}:${currentMonth}`;
      let newStats: CreatorStats = {
        userId,
        month: currentMonth,
        creationsCount: 0,
        postsPublished: 0,
        postsWithEnoughLikes: 0,
        isTopCreator: false,
        coconutAccessActive: false,
        coconutGenerationsUsed: 0,
        commissionStreakMonths: prevStats.commissionStreakMonths || 0, // ✅ Keep streak from last month
        currentCommissionRate: prevStats.currentCommissionRate || 10,  // ✅ Keep rate
        boughtCreatorAccess: false,
        creatorAccessExpiresAt: null
      };

      // ✅ Reset Coconut access if bought (not earned)
      if (prevStats.boughtCreatorAccess && !prevStats.isTopCreator) {
        const userKey = `user:profile:${userId}`;
        const user = await kv.get(userKey);
        if (user) {
          user.hasCoconutAccess = false;
          await kv.set(userKey, user);
        }
      }

      await kv.set(newStatsKey, newStats);
      resetCount++;
      
      console.log(`🔄 ${userId}: Reset for ${currentMonth} (streak preserved: ${newStats.commissionStreakMonths} months)`);
    }

    console.log(`✅ Monthly reset complete: ${resetCount} creators processed`);

    return c.json({
      success: true,
      message: 'Monthly Creator reset complete',
      stats: {
        totalProcessed: resetCount
      }
    });
  } catch (error) {
    console.error('❌ Monthly reset error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset monthly stats'
    }, 500);
  }
});

// ============================================================================
// ✅ NEW: END OF MONTH STREAK CALCULATION (Called on last day of month)
// ============================================================================

/**
 * GET /creators/end-of-month-streak-check
 * Check and update commission streaks at the END of each month
 * This evaluates if users maintained Creator status for 2 consecutive months
 * Called on the last day of each month (e.g., 31st, 30th, 28/29th)
 */
app.get('/end-of-month-streak-check', async (c) => {
  try {
    console.log('📊 Starting end-of-month streak check...');

    const currentMonth = getCurrentMonth();
    const prevMonth = getPreviousMonth();

    // Get all creator stats for current month
    const allStats = await kv.getByPrefix(`creator:stats:`) || [];
    const currentMonthStats = allStats.filter((stats: CreatorStats) => stats.month === currentMonth);

    let streakIncrementedCount = 0;
    let streakResetCount = 0;

    for (const currentStats of currentMonthStats) {
      const userId = currentStats.userId;
      
      // Check if user was Creator this month
      const isCreatorThisMonth = currentStats.isTopCreator || currentStats.boughtCreatorAccess;
      
      // Get previous month stats
      const prevStatsKey = `creator:stats:${userId}:${prevMonth}`;
      const prevStats: CreatorStats = await kv.get(prevStatsKey);
      
      const wasCreatorLastMonth = prevStats ? (prevStats.isTopCreator || prevStats.boughtCreatorAccess) : false;
      
      // Update streak based on consecutive Creator months
      if (isCreatorThisMonth && wasCreatorLastMonth) {
        // ✅ Maintained Creator status for 2 consecutive months → Increment streak
        currentStats.commissionStreakMonths = Math.min(6, currentStats.commissionStreakMonths + 1);
        currentStats.currentCommissionRate = 10 + currentStats.commissionStreakMonths; // 10-15%
        streakIncrementedCount++;
        
        console.log(`📈 ${userId}: Streak +1 (${currentStats.commissionStreakMonths} months, ${currentStats.currentCommissionRate}%)`);
      } else if (!isCreatorThisMonth && wasCreatorLastMonth) {
        // ❌ Was Creator last month but NOT this month → Reset streak to 0
        currentStats.commissionStreakMonths = 0;
        currentStats.currentCommissionRate = 10;
        streakResetCount++;
        
        console.log(`📉 ${userId}: Streak reset (not Creator this month)`);
      } else if (isCreatorThisMonth && !wasCreatorLastMonth) {
        // 🆕 New Creator (wasn't Creator last month) → Start at 10%
        currentStats.commissionStreakMonths = 0;
        currentStats.currentCommissionRate = 10;
        
        console.log(`🆕 ${userId}: New Creator (10%)`);
      }
      
      // Save updated stats
      const statsKey = `creator:stats:${userId}:${currentMonth}`;
      await kv.set(statsKey, currentStats);
    }

    console.log(`✅ End-of-month streak check complete`);
    console.log(`   - Streaks incremented: ${streakIncrementedCount}`);
    console.log(`   - Streaks reset: ${streakResetCount}`);

    return c.json({
      success: true,
      message: 'End-of-month streak check complete',
      stats: {
        streaksIncremented: streakIncrementedCount,
        streaksReset: streakResetCount
      }
    });
  } catch (error) {
    console.error('❌ End-of-month streak check error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check streaks'
    }, 500);
  }
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if user qualifies as Top Creator and update access
 */
async function checkTopCreatorStatus(userId: string, month: string): Promise<boolean> {
  try {
    const statsKey = `creator:stats:${userId}:${month}`;
    const stats: CreatorStats = await kv.get(statsKey);
    
    if (!stats) return false;
    
    // Top Creator requirements:
    // - 60+ creations in month
    // - 5+ posts published to feed
    // - 5+ posts with 5+ likes each
    const isTopCreator = (
      stats.creationsCount >= 60 &&
      stats.postsPublished >= 5 &&
      stats.postsWithEnoughLikes >= 5
    );
    
    // Update stats if status changed
    if (isTopCreator && !stats.isTopCreator) {
      stats.isTopCreator = true;
      stats.coconutAccessActive = true;
      await kv.set(statsKey, stats);
      
      // Update user profile
      const userKey = `user:profile:${userId}`;
      const user = await kv.get(userKey) || {};
      user.hasCoconutAccess = true;
      user.topCreatorMonth = month;
      user.topCreatorSince = new Date().toISOString();
      await kv.set(userKey, user);
      
      console.log(`🌟 ${userId} is now a Top Creator! Coconut access granted.`);
      
      return true;
    }
    
    return isTopCreator;
  } catch (error) {
    console.error('❌ Check Top Creator status error:', error);
    return false;
  }
}

/**
 * Get current month in format YYYY-MM
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get previous month in format YYYY-MM
 */
function getPreviousMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (month === 0) {
    return `${year - 1}-12`;
  } else {
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}

/**
 * Get end of current month in ISO format
 */
function getEndOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  return endOfMonth.toISOString();
}

/**
 * Update Compensation stats (Défi 60+)
 */
async function updateCompensationStats(userId: string, type: string, amount: number): Promise<void> {
  try {
    const month = getCurrentMonth();
    const compensationKey = `creator:compensation:${userId}:${month}`;
    
    let compensation = await kv.get(compensationKey) || {
      userId,
      month,
      images: 0,
      videos: 0,
      total: 0
    };
    
    compensation[type] += amount;
    compensation.total += amount;
    await kv.set(compensationKey, compensation);
    
    console.log(`📊 Compensation updated: ${userId} - ${type}: ${amount}, total: ${compensation.total}`);
  } catch (error) {
    console.error('❌ Update Compensation stats error:', error);
  }
}

export default app;