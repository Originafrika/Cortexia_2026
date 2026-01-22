/**
 * USER STATS ROUTES - Real Statistics & Analytics
 * Provides real generation counts, activity stats, and usage analytics
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// GET USER STATS
// ============================================================================

/**
 * GET /users/:userId/stats
 * Get comprehensive user statistics
 */
app.get('/:userId/stats', async (c) => {
  try {
    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    console.log(`📊 [Stats] Loading stats for user: ${userId}`);

    // Get user's generation history
    const userGenIds = await kv.get(`user:${userId}:generations`) || [];
    
    // Fetch all generations
    const generationsPromises = userGenIds.map((genId: string) => kv.get(`generation:${genId}`));
    const allGenerations = (await Promise.all(generationsPromises)).filter(Boolean);

    // Calculate stats
    const totalGenerations = allGenerations.length;
    
    const imagesGenerated = allGenerations.filter((gen: any) => 
      gen.type === 'image' || !gen.type
    ).length;
    
    const videosGenerated = allGenerations.filter((gen: any) => 
      gen.type === 'video'
    ).length;

    const completedGenerations = allGenerations.filter((gen: any) => 
      gen.status === 'complete' || gen.status === 'completed'
    ).length;

    const failedGenerations = allGenerations.filter((gen: any) => 
      gen.status === 'error' || gen.status === 'failed'
    ).length;

    // Calculate total credits used
    const totalCreditsUsed = allGenerations.reduce((sum: number, gen: any) => {
      const cost = gen.result?.cost || gen.credits || gen.cost || 0;
      return sum + cost;
    }, 0);

    // Get user profile for additional stats
    const profile = await kv.get(`user:${userId}`) || {};
    
    // ✅ ADMIN OVERRIDE: Check if admin has manually set Creator Stats
    const userProfile = await kv.get(`user:profile:${userId}`) as any;
    const hasAdminOverride = userProfile && (
      userProfile.generationsThisMonth !== undefined ||
      userProfile.publishedThisMonth !== undefined ||
      userProfile.publishedWithLikesThisMonth !== undefined
    );

    // ✅ FIX: Get feed posts count using correct key
    const userCreationsKey = `user:creations:${userId}`;
    const userCreationIds = await kv.get(userCreationsKey) || [];
    
    // Fetch all user creations
    const creationsPromises = userCreationIds.map((creationId: string) => kv.get(`creation:${creationId}`));
    const feedPosts = (await Promise.all(creationsPromises)).filter(Boolean);
    const postsPublished = feedPosts.length;

    // Calculate posts with likes
    const postsWithLikes = feedPosts.filter((post: any) => 
      (post.likes || 0) > 0
    ).length;

    // ✅ NEW: Calculate posts with 5+ likes (for Défi 60+)
    const postsWithEnoughLikes = feedPosts.filter((post: any) => 
      (post.likes || 0) >= 5
    ).length;

    // Get total likes across all posts
    const totalLikes = feedPosts.reduce((sum: number, post: any) => 
      sum + (post.likes || 0), 0
    );

    // Get total remixes
    const totalRemixes = feedPosts.reduce((sum: number, post: any) => 
      sum + (post.remixes || 0), 0
    );

    // Calculate success rate
    const successRate = totalGenerations > 0 
      ? Math.round((completedGenerations / totalGenerations) * 100)
      : 0;

    // Get recent generation (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentGenerations = allGenerations.filter((gen: any) => {
      const createdAt = new Date(gen.createdAt || gen.startTime).getTime();
      return createdAt >= thirtyDaysAgo;
    });

    const recentImages = recentGenerations.filter((gen: any) => 
      gen.type === 'image' || !gen.type
    ).length;

    const recentVideos = recentGenerations.filter((gen: any) => 
      gen.type === 'video'
    ).length;

    // ✅ NEW: Get monthly stats (current month) for Défi 60+
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const currentMonthGenerations = allGenerations.filter((gen: any) => {
      const createdAt = new Date(gen.createdAt || gen.startTime).getTime();
      return createdAt >= currentMonthStart;
    });

    const calculatedMonthlyImages = currentMonthGenerations.filter((gen: any) => 
      gen.type === 'image' || !gen.type
    ).length;

    const monthlyVideos = currentMonthGenerations.filter((gen: any) => 
      gen.type === 'video'
    ).length;

    // ✅ NEW: Get monthly posts (current month) for Défi 60+
    const calculatedMonthlyPosts = feedPosts.filter((post: any) => {
      const createdAt = new Date(post.createdAt).getTime();
      return createdAt >= currentMonthStart;
    }).length;

    const calculatedMonthlyPostsWithEnoughLikes = feedPosts.filter((post: any) => {
      const createdAt = new Date(post.createdAt).getTime();
      return createdAt >= currentMonthStart && (post.likes || 0) >= 5;
    }).length;
    
    // ✅ ADMIN OVERRIDE: Use admin stats if they exist, otherwise use calculated stats
    const monthlyImages = hasAdminOverride && userProfile.generationsThisMonth !== undefined
      ? userProfile.generationsThisMonth
      : calculatedMonthlyImages;
      
    const monthlyPosts = hasAdminOverride && userProfile.publishedThisMonth !== undefined
      ? userProfile.publishedThisMonth
      : calculatedMonthlyPosts;
      
    const monthlyPostsWithEnoughLikes = hasAdminOverride && userProfile.publishedWithLikesThisMonth !== undefined
      ? userProfile.publishedWithLikesThisMonth
      : calculatedMonthlyPostsWithEnoughLikes;
    
    if (hasAdminOverride) {
      console.log(`👑 [Stats] Using ADMIN OVERRIDE stats for ${userId}:`, {
        monthlyImages,
        monthlyPosts,
        monthlyPostsWithEnoughLikes
      });
    }

    // Build stats response
    const stats = {
      // Generation stats
      totalGenerations,
      imagesGenerated,
      videosGenerated,
      completedGenerations,
      failedGenerations,
      successRate,

      // Recent activity (last 30 days)
      recentGenerations: recentGenerations.length,
      recentImages,
      recentVideos,

      // ✅ NEW: Monthly stats (current month) for Défi 60+
      monthlyImages,
      monthlyVideos,
      monthlyPosts,
      monthlyPostsWithEnoughLikes,

      // Credits
      totalCreditsUsed,
      
      // Feed/Social stats
      postsPublished,
      postsWithLikes,
      postsWithEnoughLikes,
      totalLikes,
      totalRemixes,
      
      // From profile
      followersCount: profile.followersCount || 0,
      followingCount: profile.followingCount || 0,
      
      // Referral stats
      referralCount: profile.referralCount || 0,
      referralEarnings: profile.referralEarnings || 0,

      // Timestamps
      lastGeneration: allGenerations.length > 0 
        ? allGenerations.sort((a: any, b: any) => {
            const aTime = new Date(a.createdAt || a.startTime).getTime();
            const bTime = new Date(b.createdAt || b.startTime).getTime();
            return bTime - aTime;
          })[0].createdAt || allGenerations[0].startTime
        : null
    };

    console.log(`✅ [Stats] Loaded stats for ${userId}:`, stats);

    return c.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ [Stats] Error loading stats:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load stats'
    }, 500);
  }
});

// ============================================================================
// GET USER POSTS WITH LIKES DETAILS
// ============================================================================

/**
 * GET /users/:userId/posts-with-likes
 * Get user's posts with detailed like information
 */
app.get('/:userId/posts-with-likes', async (c) => {
  try {
    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    console.log(`📝 [Stats] Loading posts with likes for user: ${userId}`);

    // Get user's creation IDs
    const userCreationsKey = `user:creations:${userId}`;
    const userCreationIds = await kv.get(userCreationsKey) || [];
    
    // Fetch all user creations
    const creationsPromises = userCreationIds.map((creationId: string) => kv.get(`creation:${creationId}`));
    const allPosts = (await Promise.all(creationsPromises)).filter(Boolean);

    // Get current month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Separate posts by month
    const postsThisMonth = allPosts.filter((post: any) => {
      const createdAt = new Date(post.createdAt).getTime();
      return createdAt >= currentMonthStart;
    });

    // Sort posts by likes (highest first)
    const sortedAllPosts = [...allPosts].sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
    const sortedMonthlyPosts = [...postsThisMonth].sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));

    // Build detailed response
    const postsWithDetails = {
      allTime: sortedAllPosts.map((post: any) => ({
        id: post.id,
        prompt: post.prompt,
        imageUrl: post.imageUrl,
        likes: post.likes || 0,
        remixes: post.remixes || 0,
        createdAt: post.createdAt,
        parentCreationId: post.parentCreationId,
        isRemix: !!post.parentCreationId,
        meetsDefi60Requirement: (post.likes || 0) >= 5 // ✅ Shows if post qualifies for Défi 60+
      })),
      
      thisMonth: sortedMonthlyPosts.map((post: any) => ({
        id: post.id,
        prompt: post.prompt,
        imageUrl: post.imageUrl,
        likes: post.likes || 0,
        remixes: post.remixes || 0,
        createdAt: post.createdAt,
        parentCreationId: post.parentCreationId,
        isRemix: !!post.parentCreationId,
        meetsDefi60Requirement: (post.likes || 0) >= 5 // ✅ Shows if post qualifies for Défi 60+
      })),
      
      summary: {
        totalPosts: allPosts.length,
        postsThisMonth: postsThisMonth.length,
        
        // All time
        totalLikesAllTime: allPosts.reduce((sum: number, p: any) => sum + (p.likes || 0), 0),
        postsWithLikesAllTime: allPosts.filter((p: any) => (p.likes || 0) > 0).length,
        postsWithEnoughLikesAllTime: allPosts.filter((p: any) => (p.likes || 0) >= 5).length,
        
        // This month
        totalLikesThisMonth: postsThisMonth.reduce((sum: number, p: any) => sum + (p.likes || 0), 0),
        postsWithLikesThisMonth: postsThisMonth.filter((p: any) => (p.likes || 0) > 0).length,
        postsWithEnoughLikesThisMonth: postsThisMonth.filter((p: any) => (p.likes || 0) >= 5).length,
        
        // Défi 60+ progress
        defi60PostsRequirement: 5,
        defi60PostsProgress: postsThisMonth.filter((p: any) => (p.likes || 0) >= 5).length,
        defi60PostsMet: postsThisMonth.filter((p: any) => (p.likes || 0) >= 5).length >= 5
      }
    };

    console.log(`✅ [Stats] Loaded ${allPosts.length} posts for ${userId}`);

    return c.json({
      success: true,
      posts: postsWithDetails
    });

  } catch (error) {
    console.error('❌ [Stats] Error loading posts with likes:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load posts'
    }, 500);
  }
});

export default app;