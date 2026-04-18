// Templates Backend Endpoint - Template execution and management
// Handles template-specific generation logic

import { Hono } from 'npm:hono';
import type { Context } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js';

const templates = new Hono();

// ============================================================================
// EXECUTE TEMPLATE
// ============================================================================

templates.post('/execute', async (c: Context) => {
  try {
    const body = await c.req.json();
    const {
      templateId,
      userId,
      inputs,
      template
    } = body;

    console.log('Template execution request:', {
      templateId,
      userId,
      hasInputs: !!inputs,
      hasTemplate: !!template
    });

    // Validate required fields
    if (!templateId || !userId || !template) {
      return c.json({
        success: false,
        error: 'Missing required fields: templateId, userId, template'
      }, 400);
    }

    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ========================================================================
    // TEMPLATE-SPECIFIC LOGIC
    // ========================================================================

    // Face Swap Pro - Requires special handling for multi-image
    if (templateId === 'face-swap-pro') {
      console.log('🎭 Face Swap Pro template execution');
      
      if (!inputs.images || inputs.images.length !== 2) {
        return c.json({
          success: false,
          error: 'Face Swap requires exactly 2 images'
        }, 400);
      }

      // Image order: [0] = target face, [1] = source body
      // This is guaranteed by templateExecutionService upload order
    }

    // Logo Variations - Multi-output with different seeds
    if (templateId === 'logo-variations') {
      console.log('🎨 Logo Variations template execution (4 outputs)');
      
      if (!inputs.mainText) {
        return c.json({
          success: false,
          error: 'Company name is required for logo generation'
        }, 400);
      }

      // Will generate 4 variations with different seeds
      // Backend will handle seed variation automatically
    }

    // AI Headshot Generator - 4 distinct styles
    if (templateId === 'ai-headshot-generator') {
      console.log('📸 AI Headshot Generator template execution (4 styles)');
      
      if (!inputs.images || inputs.images.length !== 1) {
        return c.json({
          success: false,
          error: 'Headshot generator requires exactly 1 image'
        }, 400);
      }

      // Will generate 4 different headshot styles
      // Each with unique prompt modifier
    }

    // Instagram Campaign Bundle - Premium quality multi-output
    if (templateId === 'instagram-campaign-bundle') {
      console.log('📱 Instagram Campaign Bundle (9 posts)');
      
      if (!inputs.mainText || !inputs.subText) {
        return c.json({
          success: false,
          error: 'Brand name and campaign theme are required'
        }, 400);
      }

      // 9 variations for Instagram grid
      // Uses premium quality (paid credits)
    }

    // ========================================================================
    // SUCCESS - Template validated and ready for execution
    // ========================================================================
    
    // The actual generation is handled by the main /generate endpoint
    // This endpoint just validates and enriches template-specific logic
    
    return c.json({
      success: true,
      templateId,
      validated: true,
      message: 'Template ready for execution'
    });

  } catch (error) {
    console.error('Template execution error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Template execution failed'
    }, 500);
  }
});

// ============================================================================
// GET TEMPLATE STATS
// ============================================================================

templates.get('/stats/:templateId', async (c: Context) => {
  try {
    const templateId = c.req.param('templateId');

    if (!templateId) {
      return c.json({
        success: false,
        error: 'Template ID required'
      }, 400);
    }

    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Query KV store for template stats
    const { get } = await import('./kv_store.tsx');
    
    const statsKey = `template_stats:${templateId}`;
    const stats = await get(statsKey);

    if (!stats) {
      // Return default stats if not found
      return c.json({
        success: true,
        stats: {
          templateId,
          uses: 0,
          likes: 0,
          avgRating: 0,
          trending: false
        }
      });
    }

    return c.json({
      success: true,
      stats: JSON.parse(stats)
    });

  } catch (error) {
    console.error('Get template stats error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }, 500);
  }
});

// ============================================================================
// INCREMENT TEMPLATE USAGE
// ============================================================================

templates.post('/increment/:templateId', async (c: Context) => {
  try {
    const templateId = c.req.param('templateId');

    if (!templateId) {
      return c.json({
        success: false,
        error: 'Template ID required'
      }, 400);
    }

    const { get, set } = await import('./kv_store.tsx');
    
    const statsKey = `template_stats:${templateId}`;
    const currentStats = await get(statsKey);

    let stats: any = {
      templateId,
      uses: 0,
      likes: 0,
      avgRating: 0,
      trending: false,
      lastUsed: new Date().toISOString()
    };

    if (currentStats) {
      stats = JSON.parse(currentStats);
    }

    // Increment usage
    stats.uses += 1;
    stats.lastUsed = new Date().toISOString();

    // Update trending status (> 1000 uses in last 7 days)
    // Simplified: mark as trending if uses > 1000
    stats.trending = stats.uses > 1000;

    // Save updated stats
    await set(statsKey, JSON.stringify(stats));

    return c.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Increment template usage error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to increment usage'
    }, 500);
  }
});

// ============================================================================
// LIKE TEMPLATE
// ============================================================================

templates.post('/like/:templateId', async (c: Context) => {
  try {
    const templateId = c.req.param('templateId');
    const body = await c.req.json();
    const { userId } = body;

    if (!templateId || !userId) {
      return c.json({
        success: false,
        error: 'Template ID and User ID required'
      }, 400);
    }

    const { get, set } = await import('./kv_store.tsx');
    
    // Check if user already liked this template
    const userLikeKey = `template_like:${userId}:${templateId}`;
    const alreadyLiked = await get(userLikeKey);

    if (alreadyLiked) {
      return c.json({
        success: false,
        error: 'Already liked this template'
      }, 400);
    }

    // Get current stats
    const statsKey = `template_stats:${templateId}`;
    const currentStats = await get(statsKey);

    let stats: any = {
      templateId,
      uses: 0,
      likes: 0,
      avgRating: 0,
      trending: false
    };

    if (currentStats) {
      stats = JSON.parse(currentStats);
    }

    // Increment likes
    stats.likes += 1;

    // Save updated stats
    await set(statsKey, JSON.stringify(stats));

    // Mark as liked by user
    await set(userLikeKey, 'true');

    return c.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Like template error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to like template'
    }, 500);
  }
});

export default templates;
