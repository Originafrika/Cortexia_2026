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
      coconutAccessActive: false
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
      coconutAccessActive: false
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
          coconutAccessActive: false
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
      coconutAccessActive: false
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
      coconutAccessActive: false
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
      coconutAccessActive: false
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