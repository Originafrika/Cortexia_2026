/**
 * FEED ROUTES - Community Feed Backend
 * Social features: publish, like, comment, follow
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { uploadFeedAsset } from './feed-storage.ts';
import { createActivity } from './activity-helpers.ts'; // ✅ NEW: Activity helpers

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface Creation {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'image' | 'video' | 'avatar';
  assetUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  caption?: string;
  model: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  comments: number;
  shares: number;
  downloads: number;
  remixes: number;
  
  // ✅ NEW: Remix chain support
  parentCreationId?: string; // ID of the original creation this was remixed from
  remixChain: string[]; // Array of creation IDs in the remix chain (from oldest to newest)
  
  metadata: {
    aspectRatio?: string;
    resolution?: string;
    duration?: number;
    [key: string]: any;
  };
  createdAt: string;
}

interface Comment {
  id: string;
  creationId: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface Like {
  userId: string;
  creationId: string;
  createdAt: string;
}

interface Follow {
  followerId: string;
  followedId: string;
  createdAt: string;
}

// ============================================================================
// PUBLISH TO FEED
// ============================================================================

/**
 * POST /feed/publish
 * Publish a creation to community feed
 */
app.post('/publish', async (c) => {
  try {
    const body = await c.req.json();
    const {
      userId,
      username,
      userAvatar = '',
      type,
      assetUrl,
      thumbnailUrl,
      prompt,
      caption,
      model,
      tags = [],
      isPublic = true,
      metadata = {},
      parentCreationId // ✅ NEW: Optional parent creation ID for remixes
    } = body;

    console.log('📤 Publishing to feed:', { userId, type, model, parentCreationId });

    // Validate
    if (!userId || !type || !assetUrl || !prompt) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId, type, assetUrl, prompt'
      }, 400);
    }
    
    // ✅ FIX: Fetch real username from user profile
    const userProfile = await kv.get(`user:profile:${userId}`) as any;
    const realUsername = userProfile?.username || userProfile?.displayName || username || email?.split('@')[0] || `user_${userId.slice(0, 8)}`;
    const realUserAvatar = userProfile?.avatar || userAvatar;

    // Generate creation ID
    const creationId = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Upload asset to community feed storage
    console.log('📦 Uploading asset to storage...');
    const uploadResult = await uploadFeedAsset(userId, creationId, assetUrl, type);
    
    const finalAssetUrl = uploadResult.success ? uploadResult.url! : assetUrl;

    // ✅ NEW: Handle remix chain
    let remixChain: string[] = [creationId];
    let finalParentCreationId: string | undefined = undefined;
    
    if (parentCreationId) {
      // This is a remix - fetch parent to get its remix chain
      const parentCreation = await kv.get(`creation:${parentCreationId}`) as any;
      if (parentCreation) {
        console.log(`🔍 Parent creation found:`, {
          id: parentCreation.id,
          hasRemixChain: !!parentCreation.remixChain,
          remixChainType: typeof parentCreation.remixChain,
          remixChainValue: parentCreation.remixChain
        });
        
        // Inherit the parent's remix chain and add this creation
        // ✅ FIX: Parse remixChain if it's stored as JSON string
        let parentChain: string[] = [];
        
        if (parentCreation.remixChain) {
          if (Array.isArray(parentCreation.remixChain)) {
            parentChain = parentCreation.remixChain;
          } else if (typeof parentCreation.remixChain === 'string') {
            try {
              parentChain = JSON.parse(parentCreation.remixChain);
            } catch {
              console.warn('⚠️ Failed to parse remixChain, using parent ID');
              parentChain = [parentCreationId];
            }
          }
        } else {
          // Parent has no remixChain, initialize with parent's ID
          console.log('📝 Parent has no remixChain, initializing with parent ID');
          parentChain = [parentCreationId];
        }
        
        remixChain = [...parentChain, creationId];
        finalParentCreationId = parentCreationId;
        
        // Track remix on parent creation
        await trackRemix(parentCreationId);
        
        console.log(`🔗 Remix detected: ${creationId} → parent ${parentCreationId}, chain: [${remixChain.join(' → ')}]`);
      } else {
        console.warn(`⚠️ Parent creation ${parentCreationId} not found, creating independent post`);
      }
    }

    // Create creation object
    const creation: Creation = {
      id: creationId,
      userId,
      username: realUsername,
      userAvatar: realUserAvatar,
      type,
      assetUrl: finalAssetUrl,
      thumbnailUrl,
      prompt,
      caption: caption || prompt,
      model,
      tags,
      isPublic,
      likes: 0,
      comments: 0,
      shares: 0,
      downloads: 0,
      remixes: 0,
      
      // ✅ NEW: Remix chain support
      parentCreationId: finalParentCreationId,
      remixChain,
      
      metadata,
      createdAt: new Date().toISOString()
    };

    // Save creation
    await kv.set(`creation:${creationId}`, creation);

    // Add to user's creations index
    const userCreationsKey = `user:creations:${userId}`;
    const userCreations = await kv.get(userCreationsKey) || [];
    userCreations.unshift(creationId); // Add to beginning (newest first)
    await kv.set(userCreationsKey, userCreations);

    // ✅ NEW: Only add root posts (not remixes) to community feed index
    // Remixes will be discovered via remix chains
    if (!finalParentCreationId) {
      const feedKey = 'feed:community:latest';
      const communityFeed = await kv.get(feedKey) || [];
      communityFeed.unshift(creationId);
      
      // Keep only last 10000 posts in index (for performance)
      if (communityFeed.length > 10000) {
        communityFeed.splice(10000);
      }
      
      await kv.set(feedKey, communityFeed);
      console.log(`✅ Added to community feed (root post)`);
    } else {
      console.log(`✅ Skipped community feed (remix, will appear with parent)`);
    }

    // Track creator stats (for Top Creator program)
    await trackCreatorPublish(userId);

    console.log(`✅ Published creation ${creationId} to feed`);

    return c.json({
      success: true,
      creationId,
      creation
    });
  } catch (error) {
    console.error('❌ Publish error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish'
    }, 500);
  }
});

// ============================================================================
// FETCH COMMUNITY FEED
// ============================================================================

/**
 * GET /feed/community?offset=0&limit=20
 * Fetch community feed with pagination
 */
app.get('/community', async (c) => {
  try {
    const offset = parseInt(c.req.query('offset') || '0');
    const limit = parseInt(c.req.query('limit') || '20');

    console.log(`📥 Fetching community feed: offset=${offset}, limit=${limit}`);

    // Get community feed index
    const feedKey = 'feed:community:latest';
    const creationIds = await kv.get(feedKey) || [];

    // Paginate
    const paginatedIds = creationIds.slice(offset, offset + limit);

    // Fetch creations
    const creations: Creation[] = [];
    for (const id of paginatedIds) {
      const creation = await kv.get(`creation:${id}`);
      if (creation && creation.isPublic) {
        creations.push(creation);
      }
    }

    console.log(`✅ Fetched ${creations.length} creations`);

    return c.json({
      success: true,
      creations,
      pagination: {
        offset,
        limit,
        total: creationIds.length,
        hasMore: offset + limit < creationIds.length
      }
    });
  } catch (error) {
    console.error('❌ Fetch community feed error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch feed'
    }, 500);
  }
});

// ============================================================================
// LIKE / UNLIKE
// ============================================================================

/**
 * POST /feed/:creationId/like
 * Toggle like on a creation
 */
app.post('/:creationId/like', async (c) => {
  try {
    const creationId = c.req.param('creationId');
    const { userId, username, userAvatar } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId required' }, 400);
    }

    console.log(`❤️ Toggle like: ${userId} → ${creationId}`);

    // Check if already liked
    const likeKey = `like:${userId}:${creationId}`;
    const existingLike = await kv.get(likeKey);

    const creation = await kv.get(`creation:${creationId}`);
    if (!creation) {
      return c.json({ success: false, error: 'Creation not found' }, 404);
    }

    let isLiked = false;

    if (existingLike) {
      // Unlike
      await kv.del(likeKey);
      creation.likes = Math.max(0, creation.likes - 1);
      isLiked = false;
      console.log('💔 Unliked');
    } else {
      // Like
      const like: Like = {
        userId,
        creationId,
        createdAt: new Date().toISOString()
      };
      await kv.set(likeKey, like);
      creation.likes = (creation.likes || 0) + 1;
      isLiked = true;
      console.log('❤️ Liked');

      // ✅ NEW: Create activity notification for post owner
      await createActivity({
        targetUserId: creation.userId,
        type: 'like',
        actorUserId: userId,
        actorUsername: username || `user_${userId.slice(0, 8)}`,
        actorAvatar: userAvatar || '',
        postId: creationId,
        postThumbnail: creation.assetUrl,
      });

      // Track creator stats (check if post reaches 5+ likes)
      if (creation.likes === 5) {
        await trackCreatorPostLikes(creation.userId, creationId);
      }
    }

    // Update creation
    await kv.set(`creation:${creationId}`, creation);

    return c.json({
      success: true,
      isLiked,
      likes: creation.likes
    });
  } catch (error) {
    console.error('❌ Like error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to like'
    }, 500);
  }
});

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * POST /feed/:creationId/comment
 * Add comment to a creation
 */
app.post('/:creationId/comment', async (c) => {
  try {
    const creationId = c.req.param('creationId');
    const { userId, username, userAvatar, text } = await c.req.json();

    if (!userId || !text) {
      return c.json({ success: false, error: 'userId and text required' }, 400);
    }

    console.log(`💬 Adding comment: ${userId} → ${creationId}`);

    // Generate comment ID
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create comment
    const comment: Comment = {
      id: commentId,
      creationId,
      userId,
      username: username || `user_${userId.slice(0, 8)}`,
      userAvatar: userAvatar || '',
      text,
      createdAt: new Date().toISOString()
    };

    // Save comment
    await kv.set(`comment:${commentId}`, comment);

    // Add to creation's comments index
    const commentsKey = `creation:comments:${creationId}`;
    const comments = await kv.get(commentsKey) || [];
    comments.push(commentId);
    await kv.set(commentsKey, comments);

    // Update creation comment count
    const creation = await kv.get(`creation:${creationId}`);
    if (creation) {
      creation.comments = (creation.comments || 0) + 1;
      await kv.set(`creation:${creationId}`, creation);

      // ✅ NEW: Create activity notification for post owner
      await createActivity({
        targetUserId: creation.userId,
        type: 'comment',
        actorUserId: userId,
        actorUsername: username || `user_${userId.slice(0, 8)}`,
        actorAvatar: userAvatar || '',
        postId: creationId,
        postThumbnail: creation.assetUrl,
        message: text,
      });
    }

    console.log(`✅ Comment ${commentId} added`);

    return c.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('❌ Comment error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to comment'
    }, 500);
  }
});

/**
 * GET /feed/:creationId/comments?offset=0&limit=50
 * Get comments for a creation
 */
app.get('/:creationId/comments', async (c) => {
  try {
    const creationId = c.req.param('creationId');
    const offset = parseInt(c.req.query('offset') || '0');
    const limit = parseInt(c.req.query('limit') || '50');

    console.log(`💬 Fetching comments for ${creationId}`);

    // Get comments index
    const commentsKey = `creation:comments:${creationId}`;
    const commentIds = await kv.get(commentsKey) || [];

    // Paginate
    const paginatedIds = commentIds.slice(offset, offset + limit);

    // Fetch comments
    const comments: Comment[] = [];
    for (const id of paginatedIds) {
      const comment = await kv.get(`comment:${id}`);
      if (comment) {
        comments.push(comment);
      }
    }

    console.log(`✅ Fetched ${comments.length} comments`);

    return c.json({
      success: true,
      comments,
      pagination: {
        offset,
        limit,
        total: commentIds.length,
        hasMore: offset + limit < commentIds.length
      }
    });
  } catch (error) {
    console.error('❌ Fetch comments error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch comments'
    }, 500);
  }
});

// ============================================================================
// USER CREATIONS
// ============================================================================

/**
 * GET /feed/user/:userId?offset=0&limit=20
 * Get user's published creations
 */
app.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const offset = parseInt(c.req.query('offset') || '0');
    const limit = parseInt(c.req.query('limit') || '20');

    console.log(`👤 Fetching creations for user ${userId}`);

    // Get user's creations index
    const userCreationsKey = `user:creations:${userId}`;
    const creationIds = await kv.get(userCreationsKey) || [];

    // Paginate
    const paginatedIds = creationIds.slice(offset, offset + limit);

    // Fetch creations
    const creations: Creation[] = [];
    for (const id of paginatedIds) {
      const creation = await kv.get(`creation:${id}`);
      if (creation) {
        creations.push(creation);
      }
    }

    console.log(`✅ Fetched ${creations.length} creations for user ${userId}`);

    return c.json({
      success: true,
      creations,
      pagination: {
        offset,
        limit,
        total: creationIds.length,
        hasMore: offset + limit < creationIds.length
      }
    });
  } catch (error) {
    console.error('❌ Fetch user creations error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user creations'
    }, 500);
  }
});

// ============================================================================
// FOLLOW / UNFOLLOW
// ============================================================================

/**
 * POST /feed/user/:userId/follow
 * Follow a user
 */
app.post('/user/:userId/follow', async (c) => {
  try {
    const followedId = c.req.param('userId');
    const { followerId } = await c.req.json();

    if (!followerId) {
      return c.json({ success: false, error: 'followerId required' }, 400);
    }

    console.log(`👥 Follow: ${followerId} → ${followedId}`);

    const followKey = `follow:${followerId}:${followedId}`;
    const follow: Follow = {
      followerId,
      followedId,
      createdAt: new Date().toISOString()
    };

    await kv.set(followKey, follow);

    // Update follower/following counts
    const followerCountKey = `user:followers:${followedId}`;
    const followingCountKey = `user:following:${followerId}`;

    const followers = await kv.get(followerCountKey) || [];
    if (!followers.includes(followerId)) {
      followers.push(followerId);
      await kv.set(followerCountKey, followers);
    }

    const following = await kv.get(followingCountKey) || [];
    if (!following.includes(followedId)) {
      following.push(followedId);
      await kv.set(followingCountKey, following);
    }

    console.log(`✅ Followed ${followedId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Follow error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to follow'
    }, 500);
  }
});

/**
 * DELETE /feed/user/:userId/unfollow
 * Unfollow a user
 */
app.delete('/user/:userId/unfollow', async (c) => {
  try {
    const followedId = c.req.param('userId');
    const { followerId } = await c.req.json();

    if (!followerId) {
      return c.json({ success: false, error: 'followerId required' }, 400);
    }

    console.log(`👥 Unfollow: ${followerId} ✗ ${followedId}`);

    const followKey = `follow:${followerId}:${followedId}`;
    await kv.del(followKey);

    // Update follower/following counts
    const followerCountKey = `user:followers:${followedId}`;
    const followingCountKey = `user:following:${followerId}`;

    const followers = await kv.get(followerCountKey) || [];
    const updatedFollowers = followers.filter((id: string) => id !== followerId);
    await kv.set(followerCountKey, updatedFollowers);

    const following = await kv.get(followingCountKey) || [];
    const updatedFollowing = following.filter((id: string) => id !== followedId);
    await kv.set(followingCountKey, updatedFollowing);

    console.log(`✅ Unfollowed ${followedId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Unfollow error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unfollow'
    }, 500);
  }
});

// ============================================================================
// STATS TRACKING
// ============================================================================

/**
 * GET /feed/:creationId/remix-chain
 * Get the full remix chain for a creation (all related remixes)
 */
app.get('/:creationId/remix-chain', async (c) => {
  try {
    const creationId = c.req.param('creationId');
    
    console.log(`🔗 Fetching remix chain for ${creationId}`);
    
    const creation = await kv.get(`creation:${creationId}`)  as any;
    if (!creation) {
      return c.json({ success: false, error: 'Creation not found' }, 404);
    }
    
    // ✅ STEP 1: Get the root creation ID from remixChain
    let remixChain: string[] = [];
    if (creation.remixChain) {
      if (Array.isArray(creation.remixChain)) {
        remixChain = creation.remixChain;
      } else if (typeof creation.remixChain === 'string') {
        try {
          remixChain = JSON.parse(creation.remixChain);
        } catch {
          remixChain = [creationId]; // Fallback to just current creation
        }
      }
    } else {
      remixChain = [creationId];
    }
    
    const rootCreationId = remixChain[0]; // First ID is always the root
    
    console.log(`🌳 Root creation: ${rootCreationId}, current chain length: ${remixChain.length}`);
    
    // ✅ STEP 2: Find ALL creations that belong to this remix tree
    // This includes the root and all its descendants
    const allCreations = await kv.getByPrefix('creation:');
    const fullChainMap = new Map<string, any>();
    
    // Build a complete chain by finding all creations that share the same root
    for (const item of allCreations) {
      const c = item as any;
      if (!c || !c.id || !c.isPublic) continue;
      
      // Parse this creation's remixChain
      let thisChain: string[] = [];
      if (c.remixChain) {
        if (Array.isArray(c.remixChain)) {
          thisChain = c.remixChain;
        } else if (typeof c.remixChain === 'string') {
          try {
            thisChain = JSON.parse(c.remixChain);
          } catch {
            thisChain = [c.id];
          }
        }
      } else {
        thisChain = [c.id];
      }
      
      // If this creation's root matches our root, it's part of the same chain
      if (thisChain[0] === rootCreationId) {
        fullChainMap.set(c.id, c);
      }
    }
    
    console.log(`🔍 Found ${fullChainMap.size} creations in the remix tree`);
    
    // ✅ STEP 3: Sort creations by their position in the chain
    // We'll use the length of remixChain to determine order (shorter = earlier)
    const sortedCreations = Array.from(fullChainMap.values()).sort((a, b) => {
      const getChainLength = (creation: any) => {
        if (Array.isArray(creation.remixChain)) return creation.remixChain.length;
        if (typeof creation.remixChain === 'string') {
          try {
            return JSON.parse(creation.remixChain).length;
          } catch {
            return 1;
          }
        }
        return 1;
      };
      
      return getChainLength(a) - getChainLength(b);
    });
    
    console.log(`✅ Returning ${sortedCreations.length} creations in remix chain, ordered chronologically`);
    
    return c.json({
      success: true,
      chain: sortedCreations,
      rootCreationId: rootCreationId
    });
  } catch (error) {
    console.error('❌ Fetch remix chain error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch remix chain'
    }, 500);
  }
});

/**
 * POST /feed/:creationId/track-download
 * Track download
 */
app.post('/:creationId/track-download', async (c) => {
  try {
    const creationId = c.req.param('creationId');

    const creation = await kv.get(`creation:${creationId}`);
    if (creation) {
      creation.downloads = (creation.downloads || 0) + 1;
      await kv.set(`creation:${creationId}`, creation);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Track download error:', error);
    return c.json({ success: false }, 500);
  }
});

/**
 * POST /feed/:creationId/track-remix
 * Track remix
 */
app.post('/:creationId/track-remix', async (c) => {
  try {
    const creationId = c.req.param('creationId');

    const creation = await kv.get(`creation:${creationId}`);
    if (creation) {
      creation.remixes = (creation.remixes || 0) + 1;
      await kv.set(`creation:${creationId}`, creation);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Track remix error:', error);
    return c.json({ success: false }, 500);
  }
});

// ============================================================================
// CREATOR SYSTEM TRACKING
// ============================================================================

/**
 * Track creator publish (for Top Creator program)
 */
async function trackCreatorPublish(userId: string) {
  try {
    const month = getCurrentMonth();
    const statsKey = `creator:stats:${userId}:${month}`;
    
    const stats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false
    };
    
    stats.postsPublished++;
    await kv.set(statsKey, stats);
    
    // Check Top Creator status
    await checkTopCreatorStatus(userId, month);
    
    console.log(`📊 Creator stats updated: ${userId} - ${stats.postsPublished} posts published`);
  } catch (error) {
    console.error('❌ Track creator publish error:', error);
  }
}

/**
 * Track creator post reaching 5+ likes
 */
async function trackCreatorPostLikes(userId: string, creationId: string) {
  try {
    const month = getCurrentMonth();
    const statsKey = `creator:stats:${userId}:${month}`;
    
    const stats = await kv.get(statsKey) || {
      userId,
      month,
      creationsCount: 0,
      postsPublished: 0,
      postsWithEnoughLikes: 0,
      isTopCreator: false
    };
    
    // Track which posts have 5+ likes
    const likedPostsKey = `creator:liked-posts:${userId}:${month}`;
    const likedPosts = await kv.get(likedPostsKey) || [];
    
    if (!likedPosts.includes(creationId)) {
      likedPosts.push(creationId);
      await kv.set(likedPostsKey, likedPosts);
      
      stats.postsWithEnoughLikes = likedPosts.length;
      await kv.set(statsKey, stats);
      
      // Check Top Creator status
      await checkTopCreatorStatus(userId, month);
      
      console.log(`📊 Post reached 5+ likes: ${creationId} - ${stats.postsWithEnoughLikes}/5 qualified`);
    }
  } catch (error) {
    console.error('❌ Track creator post likes error:', error);
  }
}

/**
 * Check if user qualifies as Top Creator
 */
async function checkTopCreatorStatus(userId: string, month: string) {
  try {
    const statsKey = `creator:stats:${userId}:${month}`;
    const stats = await kv.get(statsKey);
    
    if (!stats) return;
    
    // Top Creator requirements:
    // - 60+ creations in month
    // - 5+ posts published to feed
    // - 5+ posts with 5+ likes each
    const isTopCreator = (
      stats.creationsCount >= 60 &&
      stats.postsPublished >= 5 &&
      stats.postsWithEnoughLikes >= 5
    );
    
    if (isTopCreator && !stats.isTopCreator) {
      stats.isTopCreator = true;
      await kv.set(statsKey, stats);
      
      // Update user Coconut access
      const userKey = `user:profile:${userId}`;
      const user = await kv.get(userKey) || {};
      user.hasCoconutAccess = true;
      user.topCreatorMonth = month;
      await kv.set(userKey, user);
      
      console.log(`🌟 ${userId} is now a Top Creator! Coconut access granted.`);
    }
  } catch (error) {
    console.error('❌ Check Top Creator status error:', error);
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
 * Track remix on a creation
 */
async function trackRemix(creationId: string) {
  try {
    const creation = await kv.get(`creation:${creationId}`);
    if (creation) {
      creation.remixes = (creation.remixes || 0) + 1;
      await kv.set(`creation:${creationId}`, creation);
    }
  } catch (error) {
    console.error('❌ Track remix error:', error);
  }
}

export default app;