/**
 * ACTIVITY HELPERS - Create activity notifications
 */

import * as kv from './kv_store.tsx';

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
 * Create an activity notification
 */
export async function createActivity(params: {
  targetUserId: string;
  type: 'like' | 'comment' | 'remix' | 'follow';
  actorUserId: string;
  actorUsername: string;
  actorAvatar?: string;
  postId?: string;
  postThumbnail?: string;
  message?: string;
}): Promise<void> {
  const {
    targetUserId,
    type,
    actorUserId,
    actorUsername,
    actorAvatar,
    postId,
    postThumbnail,
    message
  } = params;

  // Don't create activity if user is interacting with their own content
  if (targetUserId === actorUserId && type !== 'follow') {
    console.log(`⏭️ Skipping self-activity for user ${actorUserId}`);
    return;
  }

  try {
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

    console.log(`✅ Activity created: ${type} from ${actorUsername} to ${targetUserId}`);
  } catch (error) {
    console.error('❌ Error creating activity:', error);
    // Don't throw - activity creation shouldn't break the main flow
  }
}
