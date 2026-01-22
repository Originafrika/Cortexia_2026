/**
 * CREATOR COMPENSATION ROUTES - Advanced Commission System
 * 
 * Features:
 * - Streak Multipliers (x1.2 → x1.5)
 * - Défi 60+ (monthly eligibility)
 * - Origins currency integration
 * - Monthly reset system
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface CreatorCompensation {
  userId: string;
  
  // Eligibility
  isEligible: boolean;              // Current month eligible?
  eligibilityHistory: string[];     // ['2026-01', '2026-02', ...]
  
  // Streak
  currentStreak: number;            // Consecutive eligible months
  longestStreak: number;            // All-time longest streak
  
  // Multiplier
  currentMultiplier: number;        // 1.0 → 1.5
  baseRate: number;                 // 0.10 (10%)
  
  // Monthly stats (Défi 60+)
  currentMonth: string;             // '2026-01'
  monthlyStats: {
    imagesGenerated: number;        // Min: 60
    postsPublished: number;         // Min: 5
    postsWithEnoughLikes: number;   // Min: 5 (posts avec 5+ likes)
    meetsRequirements: boolean;
  };
  
  // Earnings
  monthlyEarnings: number;          // This month
  lifetimeEarnings: number;         // All time
  
  // Timestamps
  lastUpdated: string;
  nextReset: string;                // Next month end UTC
}

interface MonthlyRequirements {
  minImages: number;                // 60
  minPosts: number;                 // 5
  minPostsWithLikes: number;        // 5
  minLikesPerPost: number;          // 5
}

// Constants
const REQUIREMENTS: MonthlyRequirements = {
  minImages: 60,
  minPosts: 5,
  minPostsWithLikes: 5,
  minLikesPerPost: 5
};

const MULTIPLIERS = {
  base: 1.0,
  twoMonths: 1.2,
  max: 1.5
};

// ============================================================================
// GET COMPENSATION STATUS
// ============================================================================

/**
 * GET /compensation/:userId
 * Get creator's compensation status
 */
app.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    let compensation = await kv.get(`creator:compensation:${userId}`);
    
    if (!compensation) {
      // Initialize
      compensation = await initializeCompensation(userId);
    }

    // Check if month changed → reset if needed
    const currentMonth = getCurrentMonth();
    if (compensation.currentMonth !== currentMonth) {
      compensation = await monthlyReset(userId, compensation);
    }
    
    // ✅ ADMIN OVERRIDE: Check if admin has manually set Creator Stats
    const userProfile = await kv.get(`user:profile:${userId}`) as any;
    const hasAdminOverride = userProfile && (
      userProfile.generationsThisMonth !== undefined ||
      userProfile.publishedThisMonth !== undefined ||
      userProfile.publishedWithLikesThisMonth !== undefined
    );
    
    // ✅ Apply admin override if it exists
    if (hasAdminOverride) {
      console.log(`👑 [Compensation] Using ADMIN OVERRIDE stats for ${userId}`);
      
      if (userProfile.generationsThisMonth !== undefined) {
        compensation.monthlyStats.imagesGenerated = userProfile.generationsThisMonth;
      }
      if (userProfile.publishedThisMonth !== undefined) {
        compensation.monthlyStats.postsPublished = userProfile.publishedThisMonth;
      }
      if (userProfile.publishedWithLikesThisMonth !== undefined) {
        compensation.monthlyStats.postsWithEnoughLikes = userProfile.publishedWithLikesThisMonth;
      }
      
      // Recalculate eligibility with admin stats
      const meetsRequirements = checkEligibility(compensation.monthlyStats);
      compensation.monthlyStats.meetsRequirements = meetsRequirements;
      compensation.isEligible = meetsRequirements;
      
      console.log(`✅ [Compensation] Admin override applied:`, {
        imagesGenerated: compensation.monthlyStats.imagesGenerated,
        postsPublished: compensation.monthlyStats.postsPublished,
        postsWithEnoughLikes: compensation.monthlyStats.postsWithEnoughLikes,
        isEligible: compensation.isEligible
      });
    }

    return c.json({
      success: true,
      compensation,
      requirements: REQUIREMENTS
    });
  } catch (error) {
    console.error('❌ Get compensation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get compensation'
    }, 500);
  }
});

// ============================================================================
// UPDATE MONTHLY STATS
// ============================================================================

/**
 * POST /compensation/:userId/update-stats
 * Update monthly stats (called internally)
 */
app.post('/:userId/update-stats', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { type, increment = 1 } = await c.req.json();

    if (!type || !['images', 'posts', 'postsWithLikes'].includes(type)) {
      return c.json({
        success: false,
        error: 'Invalid type. Must be: images, posts, or postsWithLikes'
      }, 400);
    }

    let compensation = await kv.get(`creator:compensation:${userId}`);
    
    if (!compensation) {
      compensation = await initializeCompensation(userId);
    }

    // Check month reset
    const currentMonth = getCurrentMonth();
    if (compensation.currentMonth !== currentMonth) {
      compensation = await monthlyReset(userId, compensation);
    }

    // Update stats
    if (type === 'images') {
      compensation.monthlyStats.imagesGenerated += increment;
    } else if (type === 'posts') {
      compensation.monthlyStats.postsPublished += increment;
    } else if (type === 'postsWithLikes') {
      compensation.monthlyStats.postsWithEnoughLikes += increment;
    }

    // Check eligibility
    compensation.monthlyStats.meetsRequirements = checkEligibility(compensation.monthlyStats);
    compensation.isEligible = compensation.monthlyStats.meetsRequirements;

    // Recalculate multiplier
    compensation.currentMultiplier = calculateMultiplier(compensation.currentStreak);

    compensation.lastUpdated = new Date().toISOString();
    await kv.set(`creator:compensation:${userId}`, compensation);

    console.log(`📊 Updated ${type} for ${userId}: ${JSON.stringify(compensation.monthlyStats)}`);

    return c.json({
      success: true,
      compensation
    });
  } catch (error) {
    console.error('❌ Update stats error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update stats'
    }, 500);
  }
});

// ============================================================================
// CHECK ELIGIBILITY STATUS
// ============================================================================

/**
 * GET /compensation/:userId/check-eligibility
 * Check if user meets Défi 60+ requirements
 */
app.get('/:userId/check-eligibility', async (c) => {
  try {
    const userId = c.req.param('userId');

    let compensation = await kv.get(`creator:compensation:${userId}`);
    
    if (!compensation) {
      return c.json({
        success: true,
        eligible: false,
        message: 'No compensation record found'
      });
    }

    const meetsRequirements = checkEligibility(compensation.monthlyStats);
    const requirements = {
      images: {
        current: compensation.monthlyStats.imagesGenerated,
        required: REQUIREMENTS.minImages,
        met: compensation.monthlyStats.imagesGenerated >= REQUIREMENTS.minImages
      },
      posts: {
        current: compensation.monthlyStats.postsPublished,
        required: REQUIREMENTS.minPosts,
        met: compensation.monthlyStats.postsPublished >= REQUIREMENTS.minPosts
      },
      postsWithLikes: {
        current: compensation.monthlyStats.postsWithEnoughLikes,
        required: REQUIREMENTS.minPostsWithLikes,
        met: compensation.monthlyStats.postsWithEnoughLikes >= REQUIREMENTS.minPostsWithLikes
      }
    };

    return c.json({
      success: true,
      eligible: meetsRequirements,
      requirements,
      currentStreak: compensation.currentStreak,
      currentMultiplier: compensation.currentMultiplier
    });
  } catch (error) {
    console.error('❌ Check eligibility error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check eligibility'
    }, 500);
  }
});

// ============================================================================
// CALCULATE COMMISSION WITH MULTIPLIER
// ============================================================================

/**
 * POST /compensation/calculate-commission
 * Calculate commission with streak multiplier
 */
app.post('/calculate-commission', async (c) => {
  try {
    const {
      userId,
      purchaseAmount
    } = await c.req.json();

    if (!userId || !purchaseAmount) {
      return c.json({
        success: false,
        error: 'userId and purchaseAmount required'
      }, 400);
    }

    let compensation = await kv.get(`creator:compensation:${userId}`);
    
    if (!compensation) {
      compensation = await initializeCompensation(userId);
    }

    // Check if eligible
    if (!compensation.isEligible) {
      return c.json({
        success: false,
        error: 'Creator not eligible (Défi 60+ not met)',
        eligible: false
      }, 403);
    }

    // Calculate base commission
    const baseCommission = purchaseAmount * compensation.baseRate;

    // Apply multiplier
    const finalCommission = baseCommission * compensation.currentMultiplier;

    return c.json({
      success: true,
      baseCommission,
      multiplier: compensation.currentMultiplier,
      finalCommission,
      streak: compensation.currentStreak
    });
  } catch (error) {
    console.error('❌ Calculate commission error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate commission'
    }, 500);
  }
});

// ============================================================================
// PROCESS COMMISSION (with Origins)
// ============================================================================

/**
 * POST /compensation/process-commission
 * Process commission and credit Origins wallet
 */
app.post('/process-commission', async (c) => {
  try {
    const {
      creatorId,
      referralId,
      purchaseAmount
    } = await c.req.json();

    if (!creatorId || !purchaseAmount) {
      return c.json({
        success: false,
        error: 'creatorId and purchaseAmount required'
      }, 400);
    }

    // Get compensation status
    let compensation = await kv.get(`creator:compensation:${creatorId}`);
    
    if (!compensation) {
      compensation = await initializeCompensation(creatorId);
    }

    // Check eligibility
    if (!compensation.isEligible) {
      console.warn(`⚠️ Creator ${creatorId} not eligible, commission not paid`);
      return c.json({
        success: false,
        error: 'Creator not eligible this month',
        eligible: false
      }, 403);
    }

    // Calculate commission
    const baseCommission = purchaseAmount * compensation.baseRate;
    const finalCommission = baseCommission * compensation.currentMultiplier;

    // Credit Origins wallet
    const creditResult = await fetch(`http://localhost:8000/make-server-e55aa214/origins/credit-commission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorId,
        referralId,
        purchaseAmount,
        baseCommission,
        multiplier: compensation.currentMultiplier
      })
    }).then(r => r.json()).catch(() => null);

    // Update compensation earnings
    compensation.monthlyEarnings += finalCommission;
    compensation.lifetimeEarnings += finalCommission;
    compensation.lastUpdated = new Date().toISOString();
    
    await kv.set(`creator:compensation:${creatorId}`, compensation);

    console.log(`💎 Processed commission: ${finalCommission} Origins (${compensation.currentMultiplier}x) for ${creatorId}`);

    return c.json({
      success: true,
      commission: finalCommission,
      baseCommission,
      multiplier: compensation.currentMultiplier,
      streak: compensation.currentStreak
    });
  } catch (error) {
    console.error('❌ Process commission error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process commission'
    }, 500);
  }
});

// ============================================================================
// MONTHLY RESET (End of Month)
// ============================================================================

/**
 * POST /compensation/monthly-reset
 * Reset monthly stats and update streak (called by cron)
 */
app.post('/monthly-reset', async (c) => {
  try {
    // Get all creators
    const allCompensations = await kv.getByPrefix('creator:compensation:') || [];

    let resetCount = 0;
    const currentMonth = getCurrentMonth();

    for (const compensation of allCompensations) {
      if (compensation.currentMonth !== currentMonth) {
        await monthlyReset(compensation.userId, compensation);
        resetCount++;
      }
    }

    console.log(`🔄 Monthly reset completed: ${resetCount} creators reset`);

    return c.json({
      success: true,
      resetCount,
      month: currentMonth
    });
  } catch (error) {
    console.error('❌ Monthly reset error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset'
    }, 500);
  }
});

// ============================================================================
// LEADERBOARD (Top Earners)
// ============================================================================

/**
 * GET /compensation/leaderboard?limit=50
 * Get top earners
 */
app.get('/leaderboard', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');

    const allCompensations = await kv.getByPrefix('creator:compensation:') || [];

    // Sort by lifetime earnings
    const sortedCompensations = allCompensations
      .filter((comp: CreatorCompensation) => comp.lifetimeEarnings > 0)
      .sort((a: CreatorCompensation, b: CreatorCompensation) => 
        b.lifetimeEarnings - a.lifetimeEarnings
      )
      .slice(0, limit);

    // Get user profiles
    const leaderboard = [];
    for (const comp of sortedCompensations) {
      const profile = await kv.get(`user:profile:${comp.userId}`);
      if (profile) {
        leaderboard.push({
          userId: comp.userId,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          lifetimeEarnings: comp.lifetimeEarnings,
          monthlyEarnings: comp.monthlyEarnings,
          currentStreak: comp.currentStreak,
          currentMultiplier: comp.currentMultiplier,
          isEligible: comp.isEligible
        });
      }
    }

    return c.json({
      success: true,
      leaderboard
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
// HELPERS
// ============================================================================

async function initializeCompensation(userId: string): Promise<CreatorCompensation> {
  const currentMonth = getCurrentMonth();
  const nextReset = getNextMonthEnd();

  const compensation: CreatorCompensation = {
    userId,
    isEligible: false,
    eligibilityHistory: [],
    currentStreak: 0,
    longestStreak: 0,
    currentMultiplier: 1.0,
    baseRate: 0.10,
    currentMonth,
    monthlyStats: {
      imagesGenerated: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      meetsRequirements: false
    },
    monthlyEarnings: 0,
    lifetimeEarnings: 0,
    lastUpdated: new Date().toISOString(),
    nextReset
  };

  await kv.set(`creator:compensation:${userId}`, compensation);
  return compensation;
}

async function monthlyReset(
  userId: string,
  oldCompensation: CreatorCompensation
): Promise<CreatorCompensation> {
  const currentMonth = getCurrentMonth();
  const wasEligible = oldCompensation.isEligible;

  // Update streak
  let newStreak = oldCompensation.currentStreak;
  let longestStreak = oldCompensation.longestStreak;

  if (wasEligible) {
    // Maintain streak
    newStreak++;
    // Add to history
    oldCompensation.eligibilityHistory.push(oldCompensation.currentMonth);
  } else {
    // Break streak
    newStreak = 0;
  }

  // Update longest streak
  if (newStreak > longestStreak) {
    longestStreak = newStreak;
  }

  const newCompensation: CreatorCompensation = {
    userId,
    isEligible: false, // Reset eligibility
    eligibilityHistory: oldCompensation.eligibilityHistory,
    currentStreak: newStreak,
    longestStreak,
    currentMultiplier: calculateMultiplier(newStreak),
    baseRate: 0.10,
    currentMonth,
    monthlyStats: {
      imagesGenerated: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      meetsRequirements: false
    },
    monthlyEarnings: 0, // Reset monthly earnings
    lifetimeEarnings: oldCompensation.lifetimeEarnings, // Keep lifetime
    lastUpdated: new Date().toISOString(),
    nextReset: getNextMonthEnd()
  };

  await kv.set(`creator:compensation:${userId}`, newCompensation);

  console.log(`🔄 Monthly reset for ${userId}: streak = ${newStreak}, multiplier = ${newCompensation.currentMultiplier}x`);

  return newCompensation;
}

function checkEligibility(stats: CreatorCompensation['monthlyStats']): boolean {
  return (
    stats.imagesGenerated >= REQUIREMENTS.minImages &&
    stats.postsPublished >= REQUIREMENTS.minPosts &&
    stats.postsWithEnoughLikes >= REQUIREMENTS.minPostsWithLikes
  );
}

function calculateMultiplier(streak: number): number {
  if (streak >= 2) {
    // Progressive multiplier
    const multiplier = 1.0 + (streak * 0.1);
    return Math.min(multiplier, MULTIPLIERS.max); // Cap at 1.5
  }
  return MULTIPLIERS.base; // 1.0
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getNextMonthEnd(): string {
  const now = new Date();
  const nextMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  nextMonth.setUTCHours(23, 59, 59, 999);
  return nextMonth.toISOString();
}

export default app;