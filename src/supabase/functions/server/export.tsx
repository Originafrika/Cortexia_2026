import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

/**
 * Export Routes
 * 
 * Handles:
 * - Image composite export (merge layers)
 * - Video timeline export (compile shots)
 * - Download management
 * - Format conversion
 */

const app = new Hono();

// ============================================
// IMAGE COMPOSITE EXPORT
// ============================================

/**
 * POST /export/image
 * 
 * Creates a composite image from multiple layers
 * Uses Replicate API for image composition
 */
app.post('/image', async (c) => {
  try {
    const body = await c.req.json();
    const { campaignId, layers, format = 'png', quality = 'hd' } = body;

    // Validate
    if (!campaignId || !layers || !Array.isArray(layers)) {
      return c.json({ error: 'Invalid request: campaignId and layers required' }, 400);
    }

    if (layers.length === 0) {
      return c.json({ error: 'No layers to export' }, 400);
    }

    // Get Replicate API key
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      return c.json({ error: 'REPLICATE_API_KEY not configured' }, 500);
    }

    // For now, we'll use a simple approach:
    // 1. If only one layer with output → return that URL
    // 2. If multiple layers → use image composition API
    
    if (layers.length === 1 && layers[0].output?.url) {
      // Single layer - direct export
      return c.json({
        success: true,
        exportUrl: layers[0].output.url,
        format,
        message: 'Single layer export ready',
      });
    }

    // Multiple layers - need composition
    // For MVP, we'll return layer URLs and let frontend handle download
    // In production, you'd use a composition API or server-side image processing
    
    const layerUrls = layers
      .filter((layer: any) => layer.output?.url)
      .map((layer: any) => ({
        id: layer.id,
        name: layer.name,
        url: layer.output.url,
        order: layer.metadata?.zIndex || 0,
      }))
      .sort((a: any, b: any) => a.order - b.order);

    if (layerUrls.length === 0) {
      return c.json({ error: 'No layers have generated content to export' }, 400);
    }

    // Store export metadata
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`export:${exportId}`, {
      id: exportId,
      type: 'image',
      campaignId,
      layers: layerUrls,
      format,
      quality,
      status: 'ready',
      createdAt: Date.now(),
    });

    return c.json({
      success: true,
      exportId,
      layers: layerUrls,
      format,
      quality,
      message: `Ready to export ${layerUrls.length} layers`,
    });

  } catch (error) {
    console.error('Error exporting image:', error);
    return c.json({
      error: 'Failed to export image',
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// ============================================
// VIDEO TIMELINE EXPORT
// ============================================

/**
 * POST /export/video
 * 
 * Compiles video shots into final timeline
 * Uses FFmpeg or Replicate for video editing
 */
app.post('/video', async (c) => {
  try {
    const body = await c.req.json();
    const { campaignId, shots, format = 'mp4', resolution = '1080p' } = body;

    // Validate
    if (!campaignId || !shots || !Array.isArray(shots)) {
      return c.json({ error: 'Invalid request: campaignId and shots required' }, 400);
    }

    if (shots.length === 0) {
      return c.json({ error: 'No shots to export' }, 400);
    }

    // Filter shots that have generated content
    const validShots = shots
      .filter((shot: any) => shot.output?.url)
      .map((shot: any) => ({
        id: shot.id,
        name: shot.name,
        url: shot.output.url,
        duration: shot.metadata?.duration || '6s',
        order: shot.metadata?.order || 0,
      }))
      .sort((a: any, b: any) => a.order - b.order);

    if (validShots.length === 0) {
      return c.json({ error: 'No shots have generated content to export' }, 400);
    }

    // Single shot - direct export
    if (validShots.length === 1) {
      return c.json({
        success: true,
        exportUrl: validShots[0].url,
        format,
        resolution,
        message: 'Single shot export ready',
      });
    }

    // Multiple shots - need concatenation
    // For MVP, return shot URLs
    // In production, use FFmpeg or video editing API
    
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`export:${exportId}`, {
      id: exportId,
      type: 'video',
      campaignId,
      shots: validShots,
      format,
      resolution,
      status: 'ready',
      createdAt: Date.now(),
    });

    return c.json({
      success: true,
      exportId,
      shots: validShots,
      format,
      resolution,
      totalDuration: validShots.reduce((sum: number, shot: any) => {
        const duration = parseInt(shot.duration);
        return sum + (isNaN(duration) ? 6 : duration);
      }, 0),
      message: `Ready to export ${validShots.length} shots`,
    });

  } catch (error) {
    console.error('Error exporting video:', error);
    return c.json({
      error: 'Failed to export video',
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// ============================================
// EXPORT STATUS
// ============================================

/**
 * GET /export/status/:exportId
 * 
 * Check export status
 */
app.get('/status/:exportId', async (c) => {
  try {
    const exportId = c.req.param('exportId');
    const exportData = await kv.get(`export:${exportId}`);

    if (!exportData) {
      return c.json({ error: 'Export not found' }, 404);
    }

    return c.json({
      success: true,
      export: exportData,
    });

  } catch (error) {
    console.error('Error checking export status:', error);
    return c.json({
      error: 'Failed to check export status',
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// ============================================
// DOWNLOAD HELPERS
// ============================================

/**
 * POST /export/download
 * 
 * Creates a downloadable URL for export
 * (For future: handle Supabase Storage uploads)
 */
app.post('/download', async (c) => {
  try {
    const body = await c.req.json();
    const { exportId } = body;

    if (!exportId) {
      return c.json({ error: 'exportId required' }, 400);
    }

    const exportData = await kv.get(`export:${exportId}`);
    
    if (!exportData) {
      return c.json({ error: 'Export not found' }, 404);
    }

    // For MVP, return the URLs directly
    // In production, upload to Supabase Storage and return signed URL
    
    return c.json({
      success: true,
      downloadReady: true,
      export: exportData,
    });

  } catch (error) {
    console.error('Error preparing download:', error);
    return c.json({
      error: 'Failed to prepare download',
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// ============================================
// EXPORT HISTORY
// ============================================

/**
 * GET /export/history/:campaignId
 * 
 * Get all exports for a campaign
 */
app.get('/history/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId');
    
    // Get all exports for this campaign
    const allExports = await kv.getByPrefix('export:');
    const campaignExports = allExports
      .filter((exp: any) => exp.campaignId === campaignId)
      .sort((a: any, b: any) => b.createdAt - a.createdAt);

    return c.json({
      success: true,
      exports: campaignExports,
      count: campaignExports.length,
    });

  } catch (error) {
    console.error('Error fetching export history:', error);
    return c.json({
      error: 'Failed to fetch export history',
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

export default app;
