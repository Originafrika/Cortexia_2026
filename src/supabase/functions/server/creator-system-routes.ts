/**
 * CREATOR SYSTEM ROUTES
 * 
 * API endpoints for creator-specific features
 * 
 * Routes:
 * - GET /creator-system/watermarks - Get user watermarks
 * - POST /creator-system/watermarks - Create watermark
 * - PATCH /creator-system/watermarks/:id - Update watermark
 * - DELETE /creator-system/watermarks/:id - Delete watermark
 * - GET /creator-system/tracking - Get tracking data
 * - GET /creator-system/analytics - Get creator analytics
 * - POST /creator-system/track-impression - Track content impression
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { nanoid } from 'npm:nanoid';

const app = new Hono();

console.log('🎨 Creator System routes module loaded');

// ============================================
// WATERMARKS MANAGEMENT
// ============================================

// Get all watermarks for user
app.get('/watermarks', async (c) => {
  console.log('🎨 [CreatorSystem] GET /creator-system/watermarks');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get watermarks from KV store
    const watermarks = await kv.get(`creator:watermarks:${userId}`) || [];
    
    console.log(`✅ [CreatorSystem] Found ${watermarks.length} watermarks for user ${userId}`);
    
    return c.json({
      success: true,
      data: { watermarks }
    });
    
  } catch (error) {
    console.error('❌ [CreatorSystem] Error fetching watermarks:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create watermark
app.post('/watermarks', async (c) => {
  console.log('🎨 [CreatorSystem] POST /creator-system/watermarks');
  
  try {
    const body = await c.req.json();
    const { userId, name, type, text, imageUrl, position, opacity, size } = body;
    
    if (!userId || !name || !type) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId, name, type'
      }, 400);
    }
    
    const watermarkId = nanoid(16);
    
    // Get existing watermarks
    const existingWatermarks = await kv.get(`creator:watermarks:${userId}`) || [];
    
    // Create new watermark
    const newWatermark = {
      id: watermarkId,
      name,
      type,
      text: text || '',
      imageUrl: imageUrl || '',
      position: position || 'bottom-right',
      opacity: opacity || 0.7,
      size: size || 'medium',
      isDefault: existingWatermarks.length === 0, // First one is default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add watermark
    existingWatermarks.push(newWatermark);
    
    // Save to KV store
    await kv.set(`creator:watermarks:${userId}`, existingWatermarks);
    
    console.log(`✅ [CreatorSystem] Watermark created: ${watermarkId}`);
    
    return c.json({
      success: true,
      data: { watermark: newWatermark }
    });
    
  } catch (error) {
    console.error('❌ [CreatorSystem] Error creating watermark:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update watermark
app.patch('/watermarks/:id', async (c) => {
  const watermarkId = c.req.param('id');
  console.log(`🎨 [CreatorSystem] PATCH /creator-system/watermarks/${watermarkId}`);
  
  try {
    const body = await c.req.json();
    const { userId, name, text, imageUrl, position, opacity, size, isDefault } = body;
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing required field: userId'
      }, 400);
    }
    
    // Get existing watermarks
    const existingWatermarks = await kv.get(`creator:watermarks:${userId}`) || [];
    
    // If setting as default, unset all others
    let updatedWatermarks = existingWatermarks;
    if (isDefault) {
      updatedWatermarks = updatedWatermarks.map((w: any) => ({
        ...w,
        isDefault: false
      }));
    }
    
    // Update watermark
    updatedWatermarks = updatedWatermarks.map((w: any) => {
      if (w.id === watermarkId) {
        return {
          ...w,
          name: name || w.name,
          text: text !== undefined ? text : w.text,
          imageUrl: imageUrl !== undefined ? imageUrl : w.imageUrl,
          position: position || w.position,
          opacity: opacity !== undefined ? opacity : w.opacity,
          size: size || w.size,
          isDefault: isDefault !== undefined ? isDefault : w.isDefault,
          updatedAt: new Date().toISOString()
        };
      }
      return w;
    });
    
    // Save to KV store
    await kv.set(`creator:watermarks:${userId}`, updatedWatermarks);
    
    console.log(`✅ [CreatorSystem] Watermark updated: ${watermarkId}`);
    
    const updatedWatermark = updatedWatermarks.find((w: any) => w.id === watermarkId);
    
    return c.json({
      success: true,
      data: { watermark: updatedWatermark }
    });
    
  } catch (error) {
    console.error('❌ [CreatorSystem] Error updating watermark:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete watermark
app.delete('/watermarks/:id', async (c) => {
  const watermarkId = c.req.param('id');
  console.log(`🎨 [CreatorSystem] DELETE /creator-system/watermarks/${watermarkId}`);
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get existing watermarks
    const existingWatermarks = await kv.get(`creator:watermarks:${userId}`) || [];
    
    // Remove watermark
    const updatedWatermarks = existingWatermarks.filter((w: any) => w.id !== watermarkId);
    
    // Save to KV store
    await kv.set(`creator:watermarks:${userId}`, updatedWatermarks);
    
    console.log(`✅ [CreatorSystem] Watermark deleted: ${watermarkId}`);
    
    return c.json({
      success: true,
      data: { message: 'Watermark deleted successfully' }
    });
    
  } catch (error) {
    console.error('❌ [CreatorSystem] Error deleting watermark:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// TRACKING & ANALYTICS
// ============================================

// Get tracking data
app.get('/tracking', async (c) => {
  console.log('🎨 [CreatorSystem] GET /creator-system/tracking');
  
  try {
    const userId = c.req.query('userId');
    const period = c.req.query('period') || '7d'; // 7d, 30d, 90d
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get tracking data from KV store
    const trackingData = await kv.get(`creator:tracking:${userId}`) || {
      totalImpressions: 0,
      totalClicks: 0,
      totalShares: 0,
      byPlatform: {},
      byContent: {},
      timeline: []
    };
    
    console.log(`✅ [CreatorSystem] Tracking data retrieved for ${userId}`);
    
    return c.json({
      success: true,
      data: { tracking: trackingData }
    });
    
  } catch (error) {
    console.error('❌ [CreatorSystem] Error fetching tracking:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get creator analytics
app.get('/analytics', async (c) => {
  console.log('🎨 [CreatorSystem] GET /creator-system/analytics');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get analytics from KV store
    const analytics = await kv.get(`creator:analytics:${userId}`) || {
      totalRevenue: 0,
      totalGenerations: 0,
      totalLikes: 0,
      totalFollowers: 0,
      revenueByMonth: [],
      topContent: [],
      engagement: {
        averageLikes: 0,
        averageShares: 0,
        engagementRate: 0
      }
    };
    
    console.log(`✅ [CreatorSystem] Analytics retrieved for ${userId}`);
    
    return c.json({
      success: true,
      data: { analytics }
    });
    
  } catch (error) {
    console.error('❌ [CreatorSystem] Error fetching analytics:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Track impression
app.post('/track-impression', async (c) => {
  console.log('🎨 [CreatorSystem] POST /creator-system/track-impression');
  
  try {
    const body = await c.req.json();
    const { userId, contentId, platform, type } = body;
    
    if (!userId || !contentId) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId, contentId'
      }, 400);
    }
    
    // Get existing tracking data
    const trackingData = await kv.get(`creator:tracking:${userId}`) || {
      totalImpressions: 0,
      totalClicks: 0,
      totalShares: 0,
      byPlatform: {},
      byContent: {},
      timeline: []
    };
    
    // Update tracking data
    trackingData.totalImpressions++;
    
    if (type === 'click') {
      trackingData.totalClicks++;
    } else if (type === 'share') {
      trackingData.totalShares++;
    }
    
    // Update platform stats
    if (platform) {
      if (!trackingData.byPlatform[platform]) {
        trackingData.byPlatform[platform] = { impressions: 0, clicks: 0, shares: 0 };
      }
      trackingData.byPlatform[platform].impressions++;
      if (type === 'click') trackingData.byPlatform[platform].clicks++;
      if (type === 'share') trackingData.byPlatform[platform].shares++;
    }
    
    // Update content stats
    if (!trackingData.byContent[contentId]) {
      trackingData.byContent[contentId] = { impressions: 0, clicks: 0, shares: 0 };
    }
    trackingData.byContent[contentId].impressions++;
    if (type === 'click') trackingData.byContent[contentId].clicks++;
    if (type === 'share') trackingData.byContent[contentId].shares++;
    
    // Add to timeline
    trackingData.timeline.unshift({
      timestamp: new Date().toISOString(),
      contentId,
      platform,
      type: type || 'impression'
    });
    
    // Keep only last 1000 timeline entries
    if (trackingData.timeline.length > 1000) {
      trackingData.timeline = trackingData.timeline.slice(0, 1000);
    }
    
    // Save to KV store
    await kv.set(`creator:tracking:${userId}`, trackingData);
    
    console.log(`✅ [CreatorSystem] Impression tracked for ${userId}:${contentId}`);
    
    return c.json({
      success: true,
      data: { message: 'Impression tracked successfully' }
    });
    
  } catch (error) {
    console.error('❌ [CreatorSystem] Error tracking impression:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
