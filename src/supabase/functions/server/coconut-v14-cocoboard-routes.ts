/**
 * COCONUT V14 - COCOBOARD ROUTES
 * Fix Critical Issues #1, #3, #4, #5
 * 
 * Routes:
 * - POST /coconut/cocoboard/create - Create CocoBoard from project
 * - GET /coconut/cocoboard/:id - Get CocoBoard by ID
 * - POST /coconut/generate - Generate image/video
 * - POST /coconut/generate/:id/cancel - Cancel generation
 * - POST /coconut/history/:id/favorite - Toggle favorite
 * - DELETE /coconut/history/:id - Delete generation
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono().basePath('/make-server-e55aa214');

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// ============================================
// SUPABASE CLIENT
// ============================================

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================
// TYPES
// ============================================

interface CocoBoardAnalysis {
  projectTitle: string;
  concept: {
    mainConcept: string;
    visualStyle: string;
    targetEmotion: string;
    keyMessage: string;
  };
  referenceAnalysis: {
    patterns: string[];
    styleNotes: string;
    colorInsights: string[];
  };
  composition: {
    layout: string;
    hierarchy: string[];
    zones: any[];
  };
  colorPalette: {
    primary: string[];
    accent: string[];
    background: string[];
    text: string[];
    rationale: string;
  };
  assetsRequired: {
    missing: string[];
    canGenerate: boolean;
    multiPassNeeded: boolean;
  };
  finalPrompt: {
    scene: string;
    subjects: string[];
    style: string;
    color_palette: string[];
    lighting: string;
    composition: string;
    mood: string;
  };
  technicalSpecs: {
    model: 'flux-2-pro' | 'veo-3.1-fast';
    mode: 'text-to-image' | 'text-to-video';
    ratio: string;
    resolution: '1K' | '2K' | '4K';
    references: string[];
  };
  estimatedCost: {
    analysis: number;
    finalGeneration: number;
    total: number;
  };
  recommendations: {
    generationApproach: 'single-pass' | 'multi-pass';
    rationale: string;
  };
}

interface CocoBoard {
  id: string;
  projectId: string;
  userId: string;
  analysis: CocoBoardAnalysis;
  finalPrompt: any;
  references: string[];
  specs: {
    model: 'flux-2-pro' | 'veo-3.1-fast';
    mode: 'text-to-image' | 'text-to-video';
    ratio: string;
    resolution: '1K' | '2K' | '4K';
    references: string[];
  };
  cost: {
    analysis: number;
    finalGeneration: number;
    total: number;
  };
  status: 'draft' | 'ready' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface Generation {
  id: string;
  cocoBoardId?: string;
  userId: string;
  type: 'image' | 'video';
  prompt: any;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  credits: number;
  resultUrl?: string;
  thumbnail?: string;
  progress?: number;
  error?: string;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COCOBOARD ROUTES
// ============================================

/**
 * POST /coconut/cocoboard/create
 * Create CocoBoard from project analysis
 */
app.post('/coconut/cocoboard/create', async (c) => {
  try {
    const { projectId, userId, analysis } = await c.req.json();

    if (!projectId || !userId || !analysis) {
      return c.json({
        success: false,
        error: 'Missing required fields: projectId, userId, analysis'
      }, 400);
    }

    // Create CocoBoard
    const cocoBoard: CocoBoard = {
      id: `cocoboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      userId,
      analysis,
      finalPrompt: analysis.finalPrompt,
      references: [],
      specs: analysis.technicalSpecs,
      cost: analysis.estimatedCost,
      status: 'ready',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in KV
    await kv.set(`cocoboard:${cocoBoard.id}`, cocoBoard);
    
    // Store user's CocoBoards list
    const userBoards = await kv.get(`user:${userId}:cocoboards`) || [];
    userBoards.unshift(cocoBoard.id);
    await kv.set(`user:${userId}:cocoboards`, userBoards);

    console.log(`✅ CocoBoard created: ${cocoBoard.id}`);

    return c.json({
      success: true,
      data: cocoBoard
    });

  } catch (error) {
    console.error('❌ Error creating CocoBoard:', error);
    return c.json({
      success: false,
      error: 'Failed to create CocoBoard',
      message: error.message
    }, 500);
  }
});

/**
 * GET /coconut/cocoboard/:id
 * Get CocoBoard by ID
 */
app.get('/coconut/cocoboard/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const cocoBoard = await kv.get(`cocoboard:${id}`);

    if (!cocoBoard) {
      return c.json({
        success: false,
        error: 'CocoBoard not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: cocoBoard
    });

  } catch (error) {
    console.error('❌ Error fetching CocoBoard:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch CocoBoard',
      message: error.message
    }, 500);
  }
});

/**
 * PUT /coconut/cocoboard/:id
 * Update CocoBoard
 */
app.put('/coconut/cocoboard/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const cocoBoard = await kv.get(`cocoboard:${id}`) as CocoBoard;

    if (!cocoBoard) {
      return c.json({
        success: false,
        error: 'CocoBoard not found'
      }, 404);
    }

    // Update fields
    const updated = {
      ...cocoBoard,
      ...updates,
      updatedAt: new Date()
    };

    await kv.set(`cocoboard:${id}`, updated);

    return c.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('❌ Error updating CocoBoard:', error);
    return c.json({
      success: false,
      error: 'Failed to update CocoBoard',
      message: error.message
    }, 500);
  }
});

// ============================================
// GENERATION ROUTES
// ============================================

/**
 * POST /coconut/generate
 * Generate image/video from CocoBoard
 */
app.post('/coconut/generate', async (c) => {
  try {
    const { cocoBoardId, userId, type, prompt, model, specs } = await c.req.json();

    if (!userId || !type || !prompt || !model) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    // Calculate credits cost
    const credits = type === 'image' ? 5 : 15; // Simplified pricing

    // Check user credits
    const userCredits = await kv.get(`user:${userId}:credits`) || { free: 0, paid: 0 };
    const totalCredits = userCredits.free + userCredits.paid;

    if (totalCredits < credits) {
      return c.json({
        success: false,
        error: 'Insufficient credits',
        required: credits,
        available: totalCredits
      }, 402);
    }

    // Create generation record
    const generation: Generation = {
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cocoBoardId,
      userId,
      type,
      prompt,
      model,
      status: 'pending',
      credits,
      progress: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store generation
    await kv.set(`generation:${generation.id}`, generation);

    // Add to user's generations list
    const userGens = await kv.get(`user:${userId}:generations`) || [];
    userGens.unshift(generation.id);
    await kv.set(`user:${userId}:generations`, userGens);

    // Deduct credits
    if (userCredits.free >= credits) {
      userCredits.free -= credits;
    } else {
      const remaining = credits - userCredits.free;
      userCredits.free = 0;
      userCredits.paid -= remaining;
    }
    await kv.set(`user:${userId}:credits`, userCredits);

    // TODO: Start actual generation process with Flux/Veo
    // For now, simulate with timeout
    setTimeout(async () => {
      try {
        const gen = await kv.get(`generation:${generation.id}`) as Generation;
        if (gen && gen.status === 'pending') {
          gen.status = 'completed';
          gen.progress = 100;
          gen.resultUrl = `https://picsum.photos/seed/${generation.id}/1920/1080`;
          gen.thumbnail = `https://picsum.photos/seed/${generation.id}/400/300`;
          gen.updatedAt = new Date();
          await kv.set(`generation:${generation.id}`, gen);
        }
      } catch (err) {
        console.error('Error completing mock generation:', err);
      }
    }, 5000);

    console.log(`✅ Generation started: ${generation.id}`);

    return c.json({
      success: true,
      data: generation
    });

  } catch (error) {
    console.error('❌ Error starting generation:', error);
    return c.json({
      success: false,
      error: 'Failed to start generation',
      message: error.message
    }, 500);
  }
});

/**
 * GET /coconut/generate/:id
 * Get generation status
 */
app.get('/coconut/generate/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const generation = await kv.get(`generation:${id}`);

    if (!generation) {
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: generation
    });

  } catch (error) {
    console.error('❌ Error fetching generation:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch generation',
      message: error.message
    }, 500);
  }
});

/**
 * POST /coconut/generate/:id/cancel
 * Cancel generation
 */
app.post('/coconut/generate/:id/cancel', async (c) => {
  try {
    const id = c.req.param('id');

    const generation = await kv.get(`generation:${id}`) as Generation;

    if (!generation) {
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }

    if (generation.status === 'completed' || generation.status === 'failed') {
      return c.json({
        success: false,
        error: 'Cannot cancel completed or failed generation'
      }, 400);
    }

    // Update status
    generation.status = 'cancelled';
    generation.updatedAt = new Date();
    await kv.set(`generation:${id}`, generation);

    // Refund credits
    const userCredits = await kv.get(`user:${generation.userId}:credits`) || { free: 0, paid: 0 };
    userCredits.free += generation.credits;
    await kv.set(`user:${generation.userId}:credits`, userCredits);

    console.log(`✅ Generation cancelled: ${id}`);

    return c.json({
      success: true,
      data: generation,
      message: 'Generation cancelled and credits refunded'
    });

  } catch (error) {
    console.error('❌ Error cancelling generation:', error);
    return c.json({
      success: false,
      error: 'Failed to cancel generation',
      message: error.message
    }, 500);
  }
});

// ============================================
// HISTORY ROUTES
// ============================================

/**
 * POST /coconut/history/:id/favorite
 * Toggle favorite status
 */
app.post('/coconut/history/:id/favorite', async (c) => {
  try {
    const id = c.req.param('id');

    const generation = await kv.get(`generation:${id}`) as Generation;

    if (!generation) {
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }

    // Toggle favorite
    generation.isFavorite = !generation.isFavorite;
    generation.updatedAt = new Date();
    await kv.set(`generation:${id}`, generation);

    console.log(`✅ Favorite toggled: ${id} -> ${generation.isFavorite}`);

    return c.json({
      success: true,
      data: generation
    });

  } catch (error) {
    console.error('❌ Error toggling favorite:', error);
    return c.json({
      success: false,
      error: 'Failed to toggle favorite',
      message: error.message
    }, 500);
  }
});

/**
 * DELETE /coconut/history/:id
 * Delete generation
 */
app.delete('/coconut/history/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const generation = await kv.get(`generation:${id}`) as Generation;

    if (!generation) {
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }

    // Remove from user's list
    const userGens = await kv.get(`user:${generation.userId}:generations`) || [];
    const filtered = userGens.filter((genId: string) => genId !== id);
    await kv.set(`user:${generation.userId}:generations`, filtered);

    // Delete generation
    await kv.del(`generation:${id}`);

    console.log(`✅ Generation deleted: ${id}`);

    return c.json({
      success: true,
      message: 'Generation deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting generation:', error);
    return c.json({
      success: false,
      error: 'Failed to delete generation',
      message: error.message
    }, 500);
  }
});

/**
 * GET /coconut/pricing
 * Get current pricing configuration
 */
app.get('/coconut/pricing', async (c) => {
  try {
    const pricing = {
      analysis: 100,
      image: {
        'flux-2-pro': {
          '1K': 5,
          '2K': 10,
          '4K': 20
        }
      },
      video: {
        'veo-3.1-fast': {
          '1K': 15,
          '2K': 30,
          '4K': 60
        }
      }
    };

    return c.json({
      success: true,
      data: pricing
    });

  } catch (error) {
    console.error('❌ Error fetching pricing:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch pricing',
      message: error.message
    }, 500);
  }
});

export default app;
