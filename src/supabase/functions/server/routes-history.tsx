/**
 * COCONUT V14 - HISTORY ROUTES
 * Phase 3 - Jour 7: API routes for history management
 */

import { Hono } from 'npm:hono@4.6.14';
import * as kv from './kv_store.tsx';

const app = new Hono();

console.log('📜 History routes module loaded - v2 (no manual prefix)');

/**
 * GET /coconut/history/list
 * Get all generations for a user (NEW ENDPOINT FOR FRONTEND)
 */
app.get('/coconut/history/list', async (c) => {
  try {
    const userId = c.req.query('userId');
    const projectId = c.req.query('projectId');

    console.log('📥 [History API] Request:', { userId, projectId });

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    // ✅ FIX: Get user's generation IDs first
    const userGenIds = await kv.get(`user:${userId}:generations`) || [];
    console.log('🔍 [History API] User generation IDs:', userGenIds.length);

    if (userGenIds.length === 0) {
      console.log('✅ [History API] No generations found for user');
      return c.json({
        success: true,
        data: { generations: [] }
      });
    }

    // ✅ FIX: Fetch each generation by ID
    const generationsPromises = userGenIds.map((genId: string) => kv.get(`generation:${genId}`));
    const allGenerations = (await Promise.all(generationsPromises)).filter(Boolean);
    
    console.log('📊 [History API] Found generations:', allGenerations.length);

    // Filter and sort
    const generations = allGenerations
      .filter((gen: any) => gen.status === 'complete' || gen.status === 'completed' || gen.status === 'error')
      .sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || a.startTime || 0).getTime();
        const bTime = new Date(b.createdAt || b.startTime || 0).getTime();
        return bTime - aTime;
      })
      .map((gen: any) => ({
        id: gen.id,
        imageUrl: gen.result?.imageUrl || gen.imageUrl || gen.videoUrl || '',
        prompt: gen.prompt?.description || gen.prompt?.text || gen.prompt || '',
        specs: gen.specs,
        cost: gen.result?.cost || gen.credits || 0,
        duration: gen.endTime ? gen.endTime - gen.startTime : 0,
        createdAt: gen.createdAt || gen.startTime,
        isFavorite: gen.isFavorite || false,
        status: gen.status,
        cocoBoardId: gen.cocoBoardId,
        type: gen.type || 'image' // image or video
      }));

    console.log('✅ [History API] Returning generations:', generations.length);

    return c.json({
      success: true,
      data: { generations }
    });

  } catch (error) {
    console.error('❌ [History API] Error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get history'
    }, 500);
  }
});

/**
 * GET /api/coconut-v14/history
 * Get all generations for a user
 */
app.get('/api/coconut-v14/history', async (c) => {
  try {
    const { userId, projectId } = c.req.query();

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    // Get all generations for user
    const keyPrefix = projectId 
      ? `generation:${userId}:${projectId}:`
      : `generation:${userId}:`;

    const allGenerations = await kv.getByPrefix(keyPrefix);

    // Filter and sort
    const generations = allGenerations
      .filter((gen: any) => gen.status === 'complete' || gen.status === 'error')
      .sort((a: any, b: any) => b.startTime - a.startTime)
      .map((gen: any) => ({
        id: gen.id,
        imageUrl: gen.result?.imageUrl || '',
        prompt: gen.prompt,
        specs: gen.specs,
        cost: gen.result?.cost || 0,
        duration: gen.endTime - gen.startTime,
        createdAt: gen.startTime,
        isFavorite: gen.isFavorite || false,
        status: gen.status,
        cocoBoardId: gen.cocoBoardId
      }));

    return c.json({
      success: true,
      data: { generations }
    });

  } catch (error) {
    console.error('Get history error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get history'
    }, 500);
  }
});

/**
 * GET /api/coconut-v14/history/:id
 * Get single generation details
 */
app.get('/api/coconut-v14/history/:id', async (c) => {
  try {
    const generationId = c.req.param('id');

    const generation = await kv.get(`generation:${generationId}`);
    if (!generation) {
      return c.json({ success: false, error: 'Generation not found' }, 404);
    }

    return c.json({
      success: true,
      data: { generation }
    });

  } catch (error) {
    console.error('Get generation error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get generation'
    }, 500);
  }
});

/**
 * POST /api/coconut-v14/history/:id/favorite
 * Toggle favorite status
 */
app.post('/api/coconut-v14/history/:id/favorite', async (c) => {
  try {
    const generationId = c.req.param('id');
    const { isFavorite } = await c.req.json();

    const generation = await kv.get(`generation:${generationId}`);
    if (!generation) {
      return c.json({ success: false, error: 'Generation not found' }, 404);
    }

    generation.isFavorite = isFavorite;
    await kv.set(`generation:${generationId}`, generation);

    return c.json({ success: true });

  } catch (error) {
    console.error('Update favorite error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update favorite'
    }, 500);
  }
});

/**
 * DELETE /api/coconut-v14/history/:id
 * Delete generation
 */
app.delete('/api/coconut-v14/history/:id', async (c) => {
  try {
    const generationId = c.req.param('id');

    const generation = await kv.get(`generation:${generationId}`);
    if (!generation) {
      return c.json({ success: false, error: 'Generation not found' }, 404);
    }

    // Delete from KV store
    await kv.del(`generation:${generationId}`);

    // TODO: Also delete from Supabase Storage if stored there

    return c.json({ success: true });

  } catch (error) {
    console.error('Delete generation error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete generation'
    }, 500);
  }
});

/**
 * POST /api/coconut-v14/history/bulk-delete
 * Delete multiple generations
 */
app.post('/api/coconut-v14/history/bulk-delete', async (c) => {
  try {
    const { ids } = await c.req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ success: false, error: 'ids array is required' }, 400);
    }

    // Delete all
    await Promise.all(ids.map(id => kv.del(`generation:${id}`)));

    return c.json({ 
      success: true,
      data: { deleted: ids.length }
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to bulk delete'
    }, 500);
  }
});

/**
 * GET /api/coconut-v14/history/stats
 * Get statistics for user's generations
 */
app.get('/api/coconut-v14/history/stats', async (c) => {
  try {
    const { userId, projectId } = c.req.query();

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    // Get all generations for user
    const keyPrefix = projectId 
      ? `generation:${userId}:${projectId}:`
      : `generation:${userId}:`;

    const allGenerations = await kv.getByPrefix(keyPrefix);

    // Calculate stats
    const complete = allGenerations.filter((g: any) => g.status === 'complete');
    const totalCost = complete.reduce((sum: number, g: any) => sum + (g.result?.cost || 0), 0);
    const totalDuration = complete.reduce((sum: number, g: any) => sum + (g.endTime - g.startTime), 0);
    
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const stats = {
      total: allGenerations.length,
      complete: complete.length,
      processing: allGenerations.filter((g: any) => g.status === 'preparing' || g.status === 'generating').length,
      error: allGenerations.filter((g: any) => g.status === 'error').length,
      favorites: allGenerations.filter((g: any) => g.isFavorite).length,
      totalCost,
      avgCost: complete.length > 0 ? totalCost / complete.length : 0,
      totalDuration: totalDuration / 1000, // seconds
      avgDuration: complete.length > 0 ? (totalDuration / complete.length) / 1000 : 0,
      thisWeek: allGenerations.filter((g: any) => g.startTime >= weekAgo).length,
      thisMonth: allGenerations.filter((g: any) => g.startTime >= monthAgo).length,
    };

    return c.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }, 500);
  }
});

/**
 * GET /api/coconut-v14/cocoboard/:id/generations
 * Get all generations for a specific CocoBoard
 */
app.get('/api/coconut-v14/cocoboard/:id/generations', async (c) => {
  try {
    const cocoBoardId = c.req.param('id');

    // Get all generations for this CocoBoard
    const allGenerations = await kv.getByPrefix(`generation:`);
    const boardGenerations = allGenerations.filter((gen: any) => gen.cocoBoardId === cocoBoardId);

    // Sort by date
    const generations = boardGenerations
      .sort((a: any, b: any) => b.startTime - a.startTime)
      .map((gen: any) => ({
        id: gen.id,
        imageUrl: gen.result?.imageUrl || '',
        prompt: gen.prompt,
        specs: gen.specs,
        cost: gen.result?.cost || 0,
        duration: gen.endTime - gen.startTime,
        createdAt: gen.startTime,
        isFavorite: gen.isFavorite || false,
        status: gen.status,
        cocoBoardId: gen.cocoBoardId
      }));

    return c.json({
      success: true,
      data: { generations }
    });

  } catch (error) {
    console.error('Get CocoBoard generations error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get generations'
    }, 500);
  }
});

// ============================================
// COCONUT V14 ROUTES (NO /api PREFIX)
// ============================================

/**
 * GET /coconut-v14/history
 * Get all generations for a user (Enterprise frontend compatible)
 */
app.get('/coconut-v14/history', async (c) => {
  try {
    const userId = c.req.header('x-user-id');

    console.log('📥 [History V14] Request for userId:', userId);

    if (!userId) {
      return c.json({ success: false, error: 'x-user-id header is required' }, 400);
    }

    // Get user's generation IDs
    const userGenIds = await kv.get(`user:${userId}:generations`) || [];
    console.log('🔍 [History V14] User generation IDs:', userGenIds.length);

    if (userGenIds.length === 0) {
      console.log('✅ [History V14] No generations found');
      return c.json({
        success: true,
        data: { generations: [] }
      });
    }

    // Fetch each generation
    const generationsPromises = userGenIds.map((genId: string) => kv.get(`generation:${genId}`));
    const allGenerations = (await Promise.all(generationsPromises)).filter(Boolean);
    
    console.log('📊 [History V14] Found generations:', allGenerations.length);

    // Transform for frontend
    const generations = allGenerations
      .filter((gen: any) => gen.status === 'complete' || gen.status === 'completed' || gen.status === 'error')
      .sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || a.startTime || 0).getTime();
        const bTime = new Date(b.createdAt || b.startTime || 0).getTime();
        return bTime - aTime;
      })
      .map((gen: any) => ({
        id: gen.id,
        type: gen.type || 'image',
        title: gen.prompt?.description || gen.prompt?.text || gen.prompt || 'Untitled',
        timestamp: new Date(gen.createdAt || gen.startTime).toISOString(),
        thumbnailUrl: gen.result?.imageUrl || gen.imageUrl || gen.videoUrl,
        status: gen.status === 'complete' ? 'completed' : gen.status,
      }));

    console.log('✅ [History V14] Returning generations:', generations.length);

    return c.json({
      success: true,
      items: generations
    });

  } catch (error) {
    console.error('❌ [History V14] Error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get history'
    }, 500);
  }
});

/**
 * DELETE /coconut-v14/history/:id
 * Delete a generation (Enterprise frontend compatible)
 */
app.delete('/coconut-v14/history/:id', async (c) => {
  try {
    const generationId = c.req.param('id');
    const userId = c.req.header('x-user-id');

    console.log('🗑️ [History V14] Delete request:', { generationId, userId });

    if (!userId) {
      return c.json({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const generation = await kv.get(`generation:${generationId}`);
    if (!generation) {
      return c.json({ success: false, error: 'Generation not found' }, 404);
    }

    // Verify ownership
    if (generation.userId !== userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    // Delete from KV store
    await kv.del(`generation:${generationId}`);

    // Remove from user's generation list
    const userGenIds = await kv.get(`user:${userId}:generations`) || [];
    const updatedIds = userGenIds.filter((id: string) => id !== generationId);
    await kv.set(`user:${userId}:generations`, updatedIds);

    console.log('✅ [History V14] Generation deleted:', generationId);

    return c.json({ success: true });

  } catch (error) {
    console.error('❌ [History V14] Delete error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete generation'
    }, 500);
  }
});

/**
 * GET /coconut-v14/dashboard/stats
 * Get dashboard statistics (Enterprise frontend compatible)
 */
app.get('/coconut-v14/dashboard/stats', async (c) => {
  try {
    const userId = c.req.header('x-user-id');

    console.log('📊 [Dashboard Stats] Request for userId:', userId);

    if (!userId) {
      return c.json({ success: false, error: 'x-user-id header is required' }, 400);
    }

    // Get user's generation IDs
    const userGenIds = await kv.get(`user:${userId}:generations`) || [];
    
    if (userGenIds.length === 0) {
      console.log('✅ [Dashboard Stats] No generations found');
      return c.json({
        success: true,
        stats: {
          totalGenerations: 0,
          thisWeek: 0,
          weekChange: 0,
          creditsUsed: 0,
          creditsRemaining: 10000, // Default for enterprise
        }
      });
    }

    // Fetch each generation
    const generationsPromises = userGenIds.map((genId: string) => kv.get(`generation:${genId}`));
    const allGenerations = (await Promise.all(generationsPromises)).filter(Boolean);

    // Calculate stats
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const thisWeek = allGenerations.filter((g: any) => {
      const genTime = new Date(g.createdAt || g.startTime).getTime();
      return genTime >= weekAgo;
    }).length;

    const lastWeek = allGenerations.filter((g: any) => {
      const genTime = new Date(g.createdAt || g.startTime).getTime();
      return genTime >= twoWeeksAgo && genTime < weekAgo;
    }).length;

    const weekChange = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    const creditsUsed = allGenerations.reduce((sum: number, g: any) => {
      return sum + (g.result?.cost || g.credits || 0);
    }, 0);

    console.log('✅ [Dashboard Stats] Calculated:', { 
      total: allGenerations.length, 
      thisWeek, 
      lastWeek, 
      weekChange,
      creditsUsed 
    });

    return c.json({
      success: true,
      stats: {
        totalGenerations: allGenerations.length,
        thisWeek,
        weekChange: Math.round(weekChange),
        creditsUsed,
        creditsRemaining: 10000 - creditsUsed, // Enterprise gets 10k credits
      }
    });

  } catch (error) {
    console.error('❌ [Dashboard Stats] Error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }, 500);
  }
});

export default app;