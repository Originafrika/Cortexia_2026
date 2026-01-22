/**
 * FEED POST LIKES TRACKER - For Creator Conditions
 * 
 * Tracks posts with 5+ likes for Creator eligibility
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface PostLikesData {
  postId: string;
  userId: string;
  likesCount: number;
  hasMinLikes: boolean;      // >= 5 likes
  createdAt: string;
  month: string;             // "2026-01" format
}

// ============================================================================
// TRACK POST LIKES
// ============================================================================

/**
 * POST /feed-likes/track-post
 * Track a post and its likes count
 */
app.post('/track-post', async (c) => {
  try {
    const { postId, userId, likesCount } = await c.req.json();
    
    if (!postId || !userId || likesCount === undefined) {
      return c.json({
        success: false,
        error: 'postId, userId, and likesCount required'
      }, 400);
    }
    
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const postData: PostLikesData = {
      postId,
      userId,
      likesCount,
      hasMinLikes: likesCount >= 5,
      createdAt: now.toISOString(),
      month
    };
    
    // Save post data
    await kv.set(`feed:post:likes:${postId}`, postData);
    
    // Add to user's monthly posts
    const monthlyPostsKey = `feed:user:posts:${userId}:${month}`;
    const monthlyPosts = await kv.get(monthlyPostsKey) || [];
    
    // Check if post already tracked
    const existingIndex = monthlyPosts.findIndex((p: PostLikesData) => p.postId === postId);
    if (existingIndex >= 0) {
      monthlyPosts[existingIndex] = postData;
    } else {
      monthlyPosts.push(postData);
    }
    
    await kv.set(monthlyPostsKey, monthlyPosts);
    
    // Count posts with 5+ likes
    const postsWithMinLikes = monthlyPosts.filter((p: PostLikesData) => p.hasMinLikes).length;
    
    console.log(`✅ Tracked post ${postId} for ${userId}: ${likesCount} likes (${postsWithMinLikes}/5 posts with 5+ likes)`);
    
    return c.json({
      success: true,
      post: postData,
      postsWithMinLikes,
      meetsCreatorCondition: postsWithMinLikes >= 5
    });
  } catch (error) {
    console.error('❌ Track post error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track post'
    }, 500);
  }
});

/**
 * POST /feed-likes/update-likes
 * Update likes count for a post
 */
app.post('/update-likes', async (c) => {
  try {
    const { postId, likesCount } = await c.req.json();
    
    if (!postId || likesCount === undefined) {
      return c.json({
        success: false,
        error: 'postId and likesCount required'
      }, 400);
    }
    
    // Get existing post data
    const postData = await kv.get(`feed:post:likes:${postId}`);
    
    if (!postData) {
      return c.json({
        success: false,
        error: 'Post not found'
      }, 404);
    }
    
    const wasMinLikes = postData.hasMinLikes;
    
    // Update likes
    postData.likesCount = likesCount;
    postData.hasMinLikes = likesCount >= 5;
    
    // Save updated data
    await kv.set(`feed:post:likes:${postId}`, postData);
    
    // Update in monthly posts list
    const monthlyPostsKey = `feed:user:posts:${postData.userId}:${postData.month}`;
    const monthlyPosts = await kv.get(monthlyPostsKey) || [];
    
    const postIndex = monthlyPosts.findIndex((p: PostLikesData) => p.postId === postId);
    if (postIndex >= 0) {
      monthlyPosts[postIndex] = postData;
      await kv.set(monthlyPostsKey, monthlyPosts);
    }
    
    // Count posts with 5+ likes
    const postsWithMinLikes = monthlyPosts.filter((p: PostLikesData) => p.hasMinLikes).length;
    
    // Log if threshold crossed
    if (!wasMinLikes && postData.hasMinLikes) {
      console.log(`🎉 Post ${postId} reached 5+ likes! (${postsWithMinLikes}/5 total)`);
    } else if (wasMinLikes && !postData.hasMinLikes) {
      console.log(`📉 Post ${postId} dropped below 5 likes (${postsWithMinLikes}/5 total)`);
    }
    
    return c.json({
      success: true,
      post: postData,
      postsWithMinLikes,
      meetsCreatorCondition: postsWithMinLikes >= 5
    });
  } catch (error) {
    console.error('❌ Update likes error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update likes'
    }, 500);
  }
});

/**
 * GET /feed-likes/:userId/stats
 * Get user's posts with likes stats for current month
 */
app.get('/:userId/stats', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyPostsKey = `feed:user:posts:${userId}:${month}`;
    const monthlyPosts = await kv.get(monthlyPostsKey) || [];
    
    const postsWithMinLikes = monthlyPosts.filter((p: PostLikesData) => p.hasMinLikes);
    
    return c.json({
      success: true,
      userId,
      month,
      stats: {
        totalPosts: monthlyPosts.length,
        postsWithMinLikes: postsWithMinLikes.length,
        meetsCreatorCondition: postsWithMinLikes.length >= 5,
        required: 5
      },
      posts: monthlyPosts.map((p: PostLikesData) => ({
        postId: p.postId,
        likesCount: p.likesCount,
        hasMinLikes: p.hasMinLikes,
        createdAt: p.createdAt
      }))
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
 * POST /feed-likes/monthly-reset
 * Reset monthly posts data (called by cron on 1st of month)
 */
app.post('/monthly-reset', async (c) => {
  try {
    console.log('🔄 Starting Feed Likes monthly reset...');
    
    // Get all users
    const allProfiles = await kv.getByPrefix('user:profile:') || [];
    let resetCount = 0;
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    
    for (const profile of allProfiles) {
      // Archive last month's data (optional)
      const lastMonthKey = `feed:user:posts:${profile.userId}:${lastMonthStr}`;
      const lastMonthPosts = await kv.get(lastMonthKey);
      
      if (lastMonthPosts && lastMonthPosts.length > 0) {
        await kv.set(`feed:user:posts:${profile.userId}:${lastMonthStr}:archived`, lastMonthPosts);
        // Note: Don't delete last month's data, keep it for history
      }
      
      resetCount++;
    }
    
    console.log(`✅ Feed Likes reset complete: ${resetCount} users processed`);\n    
    return c.json({
      success: true,
      resetCount,
      date: now.toISOString()
    });
  } catch (error) {
    console.error('❌ Monthly reset error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset'
    }, 500);
  }
});

export default app;
