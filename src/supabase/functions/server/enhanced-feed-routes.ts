/**
 * ENHANCED FEED ROUTES
 * 
 * API endpoints for enhanced feed features
 * 
 * Routes:
 * - GET /enhanced-feed - Get paginated feed with filters
 * - POST /enhanced-feed/bulk-action - Perform bulk actions
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

console.log('📰 Enhanced Feed routes module loaded');

// ============================================
// FEED RETRIEVAL
// ============================================

// Get paginated feed with filters
app.get('/', async (c) => {
  console.log('📰 [EnhancedFeed] GET /enhanced-feed');
  
  try {
    const userId = c.req.query('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const type = c.req.query('type'); // image, video, text, design
    const status = c.req.query('status'); // draft, published, archived
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get user's generations from history
    const history = await kv.get(`history:${userId}`) || [];
    
    // Convert history to feed items
    let feedItems = history.map((item: any, index: number) => ({
      id: item.id || `item-${index}`,
      type: item.type || 'image',
      title: item.prompt?.substring(0, 50) || `Generation ${index + 1}`,
      imageUrl: item.imageUrl || item.outputs?.[0]?.url || '',
      createdAt: item.timestamp || item.createdAt || new Date().toISOString(),
      status: item.status || 'published',
      likes: item.likes || Math.floor(Math.random() * 100),
      views: item.views || Math.floor(Math.random() * 500),
      tags: item.tags || [],
      isLiked: item.isLiked || false
    }));
    
    // Apply filters
    if (type && type !== 'all') {
      feedItems = feedItems.filter((item: any) => item.type === type);
    }
    
    if (status && status !== 'all') {
      feedItems = feedItems.filter((item: any) => item.status === status);
    }
    
    // Sort by newest first
    feedItems.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = feedItems.slice(startIndex, endIndex);
    const hasMore = endIndex < feedItems.length;
    
    console.log(`✅ [EnhancedFeed] Retrieved ${paginatedItems.length} items (page ${page})`);
    
    return c.json({
      success: true,
      data: {
        items: paginatedItems,
        hasMore,
        total: feedItems.length,
        page,
        limit
      }
    });
    
  } catch (error) {
    console.error('❌ [EnhancedFeed] Error fetching feed:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// BULK ACTIONS
// ============================================

// Perform bulk action
app.post('/bulk-action', async (c) => {
  console.log('📰 [EnhancedFeed] POST /enhanced-feed/bulk-action');
  
  try {
    const body = await c.req.json();
    const { action, itemIds, userId } = body;
    
    if (!action || !itemIds || !userId) {
      return c.json({
        success: false,
        error: 'Missing required fields: action, itemIds, userId'
      }, 400);
    }
    
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return c.json({
        success: false,
        error: 'itemIds must be a non-empty array'
      }, 400);
    }
    
    console.log(`📰 [EnhancedFeed] Bulk ${action} for ${itemIds.length} items`);
    
    // Get user's history
    const history = await kv.get(`history:${userId}`) || [];
    
    let updatedHistory = [...history];
    
    switch (action) {
      case 'delete':
        // Remove items
        updatedHistory = updatedHistory.filter((item: any) => 
          !itemIds.includes(item.id)
        );
        console.log(`✅ [EnhancedFeed] Deleted ${itemIds.length} items`);
        break;
        
      case 'archive':
        // Mark items as archived
        updatedHistory = updatedHistory.map((item: any) => {
          if (itemIds.includes(item.id)) {
            return { ...item, status: 'archived' };
          }
          return item;
        });
        console.log(`✅ [EnhancedFeed] Archived ${itemIds.length} items`);
        break;
        
      case 'download':
        // For download, we just log it (actual download happens client-side)
        console.log(`✅ [EnhancedFeed] Download requested for ${itemIds.length} items`);
        break;
        
      default:
        return c.json({
          success: false,
          error: `Unknown action: ${action}`
        }, 400);
    }
    
    // Save updated history
    if (action === 'delete' || action === 'archive') {
      await kv.set(`history:${userId}`, updatedHistory);
    }
    
    return c.json({
      success: true,
      data: {
        message: `Bulk ${action} completed successfully`,
        count: itemIds.length
      }
    });
    
  } catch (error) {
    console.error('❌ [EnhancedFeed] Error performing bulk action:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
