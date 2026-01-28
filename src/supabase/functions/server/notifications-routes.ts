/**
 * NOTIFICATIONS ROUTES
 * 
 * API endpoints for notifications management
 * 
 * Routes:
 * - GET /notifications - Get all notifications
 * - POST /notifications/:id/read - Mark notification as read
 * - POST /notifications/read-all - Mark all as read
 * - DELETE /notifications/:id - Delete notification
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { nanoid } from 'npm:nanoid';

const app = new Hono();

console.log('🔔 Notifications routes module loaded');

// ============================================
// NOTIFICATIONS MANAGEMENT
// ============================================

// Get all notifications for user
app.get('/', async (c) => {
  console.log('🔔 [Notifications] GET /notifications');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get notifications from KV store
    const notifications = await kv.get(`notifications:${userId}`) || [];
    
    console.log(`✅ [Notifications] Found ${notifications.length} notifications for user ${userId}`);
    
    return c.json({
      success: true,
      data: { notifications }
    });
    
  } catch (error) {
    console.error('❌ [Notifications] Error fetching notifications:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Mark notification as read
app.post('/:id/read', async (c) => {
  const notificationId = c.req.param('id');
  console.log(`🔔 [Notifications] POST /notifications/${notificationId}/read`);
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get notifications
    const notifications = await kv.get(`notifications:${userId}`) || [];
    
    // Mark as read
    const updatedNotifications = notifications.map((n: any) => {
      if (n.id === notificationId) {
        return { ...n, read: true };
      }
      return n;
    });
    
    // Save
    await kv.set(`notifications:${userId}`, updatedNotifications);
    
    console.log(`✅ [Notifications] Marked as read: ${notificationId}`);
    
    return c.json({
      success: true,
      data: { message: 'Notification marked as read' }
    });
    
  } catch (error) {
    console.error('❌ [Notifications] Error marking as read:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Mark all notifications as read
app.post('/read-all', async (c) => {
  console.log('🔔 [Notifications] POST /notifications/read-all');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get notifications
    const notifications = await kv.get(`notifications:${userId}`) || [];
    
    // Mark all as read
    const updatedNotifications = notifications.map((n: any) => ({
      ...n,
      read: true
    }));
    
    // Save
    await kv.set(`notifications:${userId}`, updatedNotifications);
    
    console.log(`✅ [Notifications] Marked all as read for ${userId}`);
    
    return c.json({
      success: true,
      data: { message: 'All notifications marked as read' }
    });
    
  } catch (error) {
    console.error('❌ [Notifications] Error marking all as read:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete notification
app.delete('/:id', async (c) => {
  const notificationId = c.req.param('id');
  console.log(`🔔 [Notifications] DELETE /notifications/${notificationId}`);
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get notifications
    const notifications = await kv.get(`notifications:${userId}`) || [];
    
    // Remove notification
    const updatedNotifications = notifications.filter((n: any) => n.id !== notificationId);
    
    // Save
    await kv.set(`notifications:${userId}`, updatedNotifications);
    
    console.log(`✅ [Notifications] Deleted: ${notificationId}`);
    
    return c.json({
      success: true,
      data: { message: 'Notification deleted' }
    });
    
  } catch (error) {
    console.error('❌ [Notifications] Error deleting notification:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// UTILITY: CREATE NOTIFICATION
// ============================================

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionLabel?: string
) {
  try {
    const notifications = await kv.get(`notifications:${userId}`) || [];
    
    const newNotification = {
      id: nanoid(16),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
      actionLabel
    };
    
    notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.length = 100;
    }
    
    await kv.set(`notifications:${userId}`, notifications);
    
    console.log(`✅ [Notifications] Created notification for ${userId}: ${title}`);
    
    return newNotification;
  } catch (error) {
    console.error('❌ [Notifications] Error creating notification:', error);
    throw error;
  }
}

export default app;
