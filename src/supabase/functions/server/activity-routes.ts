/**
 * ACTIVITY ROUTES - User Activity Feed
 * Aggregates likes, comments, remixes, and follows received by the user
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'remix' | 'follow';
  userId: string;
  username: string;
  avatarUrl: string;
  timestamp: string;
  postId?: string;
  postThumbnail?: string;
  message?: string;
  read: boolean;
}

/**
 * GET /activity/:userId
 * Get activity feed for a user (likes, comments, remixes, follows received)
 */
app.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');

    console.log(`📢 Fetching activity for user: ${userId}`);

    // Get all activities for this user
    const activityKey = `activity:${userId}`;
    const activities = await kv.get<Activity[]>(activityKey) || [];

    // Sort by timestamp (most recent first)
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    console.log(`✅ Found ${sortedActivities.length} activities`);

    return c.json({
      success: true,
      activities: sortedActivities,
      unreadCount: sortedActivities.filter(a => !a.read).length,
    });
  } catch (error) {
    console.error('❌ Error fetching activity:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activity'
    }, 500);
  }
});

/**
 * POST /activity/:userId/mark-read
 * Mark activities as read
 */
app.post('/:userId/mark-read', async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const activityIds = body.activityIds as string[];

    console.log(`📢 Marking ${activityIds.length} activities as read for user: ${userId}`);

    const activityKey = `activity:${userId}`;
    const activities = await kv.get<Activity[]>(activityKey) || [];

    // Mark specified activities as read
    const updatedActivities = activities.map(activity => {
      if (activityIds.includes(activity.id)) {
        return { ...activity, read: true };
      }
      return activity;
    });

    await kv.set(activityKey, updatedActivities);

    console.log(`✅ Marked activities as read`);

    return c.json({
      success: true,
      message: 'Activities marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking activities as read:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark activities as read'
    }, 500);
  }
});

/**
 * POST /activity/create
 * Create a new activity (called internally when users interact)
 * Body: { targetUserId, type, actorUserId, actorUsername, actorAvatar, postId?, postThumbnail?, message? }
 */
app.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const {
      targetUserId,
      type,
      actorUserId,
      actorUsername,
      actorAvatar,
      postId,
      postThumbnail,
      message
    } = body;

    console.log(`📢 Creating activity: ${type} from ${actorUsername} to ${targetUserId}`);

    // Don't create activity if user is interacting with their own content
    if (targetUserId === actorUserId && type !== 'follow') {
      console.log(`⏭️ Skipping self-activity`);
      return c.json({
        success: true,
        message: 'Skipped self-activity'
      });
    }

    const activityKey = `activity:${targetUserId}`;
    const activities = await kv.get<Activity[]>(activityKey) || [];

    const newActivity: Activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      userId: actorUserId,
      username: actorUsername,
      avatarUrl: actorAvatar || 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?w=100',
      timestamp: new Date().toISOString(),
      postId,
      postThumbnail,
      message,
      read: false,
    };

    // Add new activity to the beginning of the array
    activities.unshift(newActivity);

    // Keep only last 200 activities per user
    const trimmedActivities = activities.slice(0, 200);

    await kv.set(activityKey, trimmedActivities);

    console.log(`✅ Activity created: ${newActivity.id}`);

    return c.json({
      success: true,
      activity: newActivity
    });
  } catch (error) {
    console.error('❌ Error creating activity:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create activity'
    }, 500);
  }
});

/**
 * DELETE /activity/:userId/clear
 * Clear all activities for a user
 */
app.delete('/:userId/clear', async (c) => {
  try {
    const userId = c.req.param('userId');

    console.log(`🗑️ Clearing all activities for user: ${userId}`);

    const activityKey = `activity:${userId}`;
    await kv.del(activityKey);

    console.log(`✅ Activities cleared`);

    return c.json({
      success: true,
      message: 'All activities cleared'
    });
  } catch (error) {
    console.error('❌ Error clearing activities:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear activities'
    }, 500);
  }
});

export default app;
