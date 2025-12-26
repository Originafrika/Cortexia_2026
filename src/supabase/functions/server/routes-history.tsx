/**
 * COCONUT V14 - HISTORY ROUTES
 * Phase 3 - Jour 7: API routes for history management
 */

import { Hono } from 'npm:hono@4.6.14';
import * as kv from './kv_store.tsx';

const app = new Hono();

/**
 * GET /make-server-e55aa214/api/coconut-v14/history
 * Get all generations for a user
 */
app.get('/make-server-e55aa214/api/coconut-v14/history', async (c) => {
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
 * GET /make-server-e55aa214/api/coconut-v14/history/:id
 * Get single generation details
 */
app.get('/make-server-e55aa214/api/coconut-v14/history/:id', async (c) => {
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
 * POST /make-server-e55aa214/api/coconut-v14/history/:id/favorite
 * Toggle favorite status
 */
app.post('/make-server-e55aa214/api/coconut-v14/history/:id/favorite', async (c) => {
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
 * DELETE /make-server-e55aa214/api/coconut-v14/history/:id
 * Delete generation
 */
app.delete('/make-server-e55aa214/api/coconut-v14/history/:id', async (c) => {
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
 * POST /make-server-e55aa214/api/coconut-v14/history/bulk-delete
 * Delete multiple generations
 */
app.post('/make-server-e55aa214/api/coconut-v14/history/bulk-delete', async (c) => {
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
 * GET /make-server-e55aa214/api/coconut-v14/history/stats
 * Get statistics for user's generations
 */
app.get('/make-server-e55aa214/api/coconut-v14/history/stats', async (c) => {
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
 * GET /make-server-e55aa214/api/coconut-v14/cocoboard/:id/generations
 * Get all generations for a specific CocoBoard
 */
app.get('/make-server-e55aa214/api/coconut-v14/cocoboard/:id/generations', async (c) => {
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

export default app;
