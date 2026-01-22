/**
 * COCONUT V14 - COCOBOARD ROUTES
 * Fix Critical Issues #1, #3, #4, #5
 * 
 * Routes:
 * - POST /coconut/cocoboard/create - Create CocoBoard from project
 * - GET /coconut/cocoboard/:id - Get CocoBoard by ID
 * - PATCH /coconut/cocoboard/update - Update CocoBoard
 * - POST /coconut/generate - Generate image/video
 * - POST /coconut/generate/:id/cancel - Cancel generation
 * - POST /coconut/history/:id/favorite - Toggle favorite
 * - DELETE /coconut/history/:id - Delete generation
 * - GET /coconut/generate/:generationId/status - Poll generation status
 * - GET /coconut/history/list - Get user's generation history
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kieAIImage from './kie-ai-image.ts';
import { buildJSONPromptForFlux, buildTextPromptForFlux } from './prompt-utils.ts';
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ Use unified credits system

// ✅ CRITICAL FIX: Don't use basePath here - parent app already has it
// When mounted with app.route('/', cocoBoardRoutes), the basePath is inherited
const app = new Hono();

console.log('📋 CocoBoard routes module loaded - v5 (no middleware, inherited from parent)');

// ============================================
// NO MIDDLEWARE HERE - Inherited from parent app in index.tsx
// Parent already has CORS and logger configured
// ============================================

// ============================================
// TYPES
// ============================================

interface CocoBoard {
  id: string;
  projectId: string;
  userId: string;
  analysis: any;
  finalPrompt: string | any; // ✅ Can be string (new format) or object (legacy)
  references: any[];
  specs: {
    model: string;
    mode: string;
    ratio: string;
    resolution: string;
    referenceUrls?: Array<{ id: string; url: string; filename: string }>;
  };
  cost: {
    analysis: number;
    backgroundGeneration: number;
    assetGeneration: number;
    finalGeneration: number;
    total: number;
  };
  status: string;
  createdAt: string | Date; // ✅ Can be ISO string or Date
  updatedAt: string | Date; // ✅ Can be ISO string or Date
}

interface Generation {
  id: string;
  cocoBoardId: string;
  userId: string;
  type: 'image' | 'video';
  prompt: any;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  credits: number;
  progress: number;
  resultUrl?: string;
  thumbnail?: string;
  error?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COCOBOARD ROUTES
// ============================================

/**
 * POST /coconut/cocoboard/create
 * Create a new CocoBoard
 */
app.post('/coconut/cocoboard/create', async (c) => {
  try {
    const body = await c.req.json();
    const { projectId, userId, analysis, finalPrompt, references, specs, cost } = body;

    const cocoBoardId = `cocoboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const cocoBoard: CocoBoard = {
      id: cocoBoardId,
      projectId,
      userId,
      analysis,
      finalPrompt,
      references: references || [],
      specs: specs || {
        model: 'flux-2-pro',
        mode: 'image-to-image',
        ratio: '1:1',
        resolution: '1K'
      },
      cost: cost || {
        analysis: 0,
        backgroundGeneration: 0,
        assetGeneration: 0,
        finalGeneration: 0,
        total: 0
      },
      status: 'ready',
      createdAt: new Date().toISOString(), // ✅ FIX: Use ISO string
      updatedAt: new Date().toISOString()  // ✅ FIX: Use ISO string
    };

    await kv.set(`cocoboard:${cocoBoardId}`, cocoBoard);

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
    const cocoBoardId = c.req.param('id');
    
    const cocoBoard = await kv.get(`cocoboard:${cocoBoardId}`);
    
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
      error: 'Failed to fetch CocoBoard'
    }, 500);
  }
});

/**
 * PATCH /coconut/cocoboard/update
 * Update CocoBoard (partial update)
 * ✅ NEW: Create if not exists (upsert behavior for local saves)
 */
app.patch('/coconut/cocoboard/update', async (c) => {
  try {
    const body = await c.req.json();
    const { cocoBoardId, ...updates } = body;

    if (!cocoBoardId) {
      return c.json({
        success: false,
        error: 'cocoBoardId is required'
      }, 400);
    }

    const existing = await kv.get(`cocoboard:${cocoBoardId}`) as CocoBoard;
    
    // ✅ NEW: If doesn't exist and we have all required fields, create it (upsert)
    if (!existing) {
      console.log('⚠️ CocoBoard not found, checking if we can create it...');
      
      // Check if we have enough data to create a new CocoBoard
      if (updates.projectId && updates.userId && updates.finalPrompt) {
        console.log('✅ Creating new CocoBoard from update request (upsert)');
        
        const newCocoBoard: CocoBoard = {
          id: cocoBoardId,
          projectId: updates.projectId,
          userId: updates.userId,
          analysis: updates.analysis || {},
          finalPrompt: updates.finalPrompt,
          references: updates.references || [],
          specs: updates.specs || {
            model: 'flux-2-pro',
            mode: 'text-to-image',
            ratio: '1:1',
            resolution: '1K'
          },
          cost: updates.cost || {
            analysis: 0,
            backgroundGeneration: 0,
            assetGeneration: 0,
            finalGeneration: 0,
            total: 0
          },
          status: updates.status || 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await kv.set(`cocoboard:${cocoBoardId}`, newCocoBoard);
        
        return c.json({
          success: true,
          data: newCocoBoard,
          created: true
        });
      }
      
      // Not enough data to create, return 404
      return c.json({
        success: false,
        error: 'CocoBoard not found and insufficient data to create'
      }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString() // ✅ FIX: Use ISO string instead of Date object
    };
    
    // ✅ VALIDATE: Ensure finalPrompt is FluxPrompt object (not string or corrupted)
    if (updated.finalPrompt) {
      // Reject corrupted array-like object
      if (typeof updated.finalPrompt === 'object' && '0' in updated.finalPrompt && '1' in updated.finalPrompt) {
        console.error('❌ Detected corrupted finalPrompt (array-like object with numeric keys)');
        throw new Error('finalPrompt is corrupted - please regenerate from analysis');
      }
      
      // Reject string format
      if (typeof updated.finalPrompt === 'string') {
        console.error('❌ finalPrompt is string - must be FluxPrompt object');
        throw new Error('finalPrompt must be FluxPrompt object, not string');
      }
      
      // Validate it's a proper FluxPrompt object
      if (typeof updated.finalPrompt !== 'object' || 
          !updated.finalPrompt.scene || 
          !Array.isArray(updated.finalPrompt.subjects)) {
        console.error('❌ Invalid finalPrompt structure:', updated.finalPrompt);
        throw new Error('finalPrompt must be FluxPrompt object with scene and subjects');
      }
      
      console.log('✅ finalPrompt validated as FluxPrompt object:', {
        scene: updated.finalPrompt.scene?.substring(0, 50) + '...',
        subjectsCount: updated.finalPrompt.subjects?.length,
      });
    }

    await kv.set(`cocoboard:${cocoBoardId}`, updated);

    return c.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('❌ Error partially updating CocoBoard:', error);
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
 * Generate image from CocoBoard using Kie AI Flux 2 Pro
 */
app.post('/coconut/generate', async (c) => {
  try {
    console.log('🎯 /coconut/generate endpoint hit');
    console.log('📥 Headers:', JSON.stringify(c.req.header(), null, 2));
    
    const bodyText = await c.req.text();
    console.log('📦 Raw body text:', bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log('✅ Body parsed successfully:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse body:', parseError);
      return c.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, 400);
    }
    
    const { cocoBoardId } = body;
    console.log('🆔 Extracted cocoBoardId:', cocoBoardId);
    console.log('🆔 Type of cocoBoardId:', typeof cocoBoardId);

    if (!cocoBoardId) {
      console.error('❌ cocoBoardId is missing or falsy:', {
        cocoBoardId,
        bodyKeys: Object.keys(body),
        fullBody: body
      });
      return c.json({
        success: false,
        error: 'Missing cocoBoardId'
      }, 400);
    }

    // Fetch CocoBoard
    const cocoBoard = await kv.get(`cocoboard:${cocoBoardId}`) as CocoBoard;
    
    if (!cocoBoard) {
      return c.json({
        success: false,
        error: 'CocoBoard not found'
      }, 404);
    }

    const userId = cocoBoard.userId;
    const type = 'image';
    
    // ✅ VALIDATE & CONVERT: finalPrompt must be FluxPrompt object, convert to text for Kie AI
    console.log('📝 Validating finalPrompt...');
    
    if (!cocoBoard.finalPrompt || typeof cocoBoard.finalPrompt !== 'object') {
      console.error('❌ Invalid finalPrompt type:', typeof cocoBoard.finalPrompt);
      return c.json({
        success: false,
        error: 'Invalid or missing finalPrompt (expected FluxPrompt object)'
      }, 400);
    }
    
    if (!cocoBoard.finalPrompt.scene || !Array.isArray(cocoBoard.finalPrompt.subjects)) {
      console.error('❌ Invalid finalPrompt structure:', cocoBoard.finalPrompt);
      return c.json({
        success: false,
        error: 'finalPrompt missing required fields (scene, subjects)'
      }, 400);
    }
    
    console.log('✅ finalPrompt validated as FluxPrompt object:', {
      scene: cocoBoard.finalPrompt.scene?.substring(0, 50) + '...',
      subjectsCount: cocoBoard.finalPrompt.subjects?.length,
    });
    
    // ✅ NEW APPROACH: Convert FluxPrompt object to NATURAL TEXT for Flux 2 Pro
    // According to official Flux 2 Pro guide, both JSON and text work, but text is cleaner
    // Text follows proper priority order: Main subject → Action → Style → Context
    const promptForFlux = buildTextPromptForFlux(cocoBoard.finalPrompt);
    console.log(`📝 Built text prompt for Flux (${promptForFlux.length} chars):`, promptForFlux.substring(0, 300) + '...');
    
    // Extract specs
    const model = cocoBoard.specs?.model || 'flux-2-pro';
    const resolution = cocoBoard.specs?.resolution || '1K';
    const ratio = cocoBoard.specs?.ratio || '1:1';
    
    // Extract reference URLs from specs and convert to PUBLIC URLs
    // Kie AI cannot access signed URLs, so we need public URLs
    const referenceUrls = cocoBoard.specs?.referenceUrls?.map((ref: any) => {
      // Extract the file path from the signed URL
      // Format: .../storage/v1/object/sign/BUCKET/PATH?token=...
      const urlObj = new URL(ref.url);
      const pathParts = urlObj.pathname.split('/');
      const signIndex = pathParts.indexOf('sign');
      if (signIndex >= 0 && signIndex < pathParts.length - 1) {
        const bucketAndPath = pathParts.slice(signIndex + 1).join('/');
        // Create public URL: .../storage/v1/object/public/BUCKET/PATH
        const publicUrl = `${urlObj.origin}/storage/v1/object/public/${bucketAndPath}`;
        console.log(`🔓 Converted signed URL to public URL: ${ref.filename}`);
        return publicUrl;
      }
      return ref.url; // Fallback to original if parsing fails
    }) || [];
    console.log(`📸 Using ${referenceUrls.length} reference images (public URLs)`);
    
    // Calculate real credits cost using Kie AI pricing
    const credits = kieAIImage.calculateKieAIImageCost(
      model as 'flux-2-pro' | 'flux-2-flex',
      resolution as '1K' | '2K',
      referenceUrls.length
    );
    
    console.log(`💰 Generation cost: ${credits} credits (${model} ${resolution} + ${referenceUrls.length} refs)`);

    // Check user credits - USE CREDITS MANAGER
    const userCreditsData = await CreditsSystem.getUserCredits(userId);
    const totalCredits = userCreditsData.free + userCreditsData.paid;

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
      prompt: promptForFlux,
      model,
      status: 'pending',
      credits,
      progress: 0,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store generation
    await kv.set(`generation:${generation.id}`, generation);

    // Add to user's generations list
    const userGens = await kv.get(`user:${userId}:generations`) || [];
    userGens.unshift(generation.id);
    await kv.set(`user:${userId}:generations`, userGens);

    // Deduct credits immediately using credits-manager
    const deductResult = await CreditsSystem.deductCredits(userId, credits, 'Coconut CocoBoard generation', {
      generationId: generation.id,
      cocoBoardId,
      model,
      resolution
    });
    
    if (!deductResult.success) {
      console.error('❌ Failed to deduct credits:', deductResult.error);
      // Delete generation since we couldn't deduct credits
      await kv.del(`generation:${generation.id}`);
      return c.json({
        success: false,
        error: deductResult.error || 'Failed to deduct credits'
      }, 402);
    }

    console.log(`✅ Generation started: ${generation.id}`);
    
    // ✅ START REAL GENERATION WITH KIE AI (async, don't block response)
    (async () => {
      try {
        console.log('🚀 Starting Kie AI generation task...');
        
        // Update status to processing
        generation.status = 'processing';
        generation.progress = 10;
        await kv.set(`generation:${generation.id}`, generation);
        
        // Create Kie AI task with TEXT prompt
        const taskId = await kieAIImage.createKieAIImageTask({
          prompt: promptForFlux,
          model: model as 'flux-2-pro' | 'flux-2-flex',
          aspectRatio: ratio as any,
          resolution: resolution as '1K' | '2K',
          referenceImages: referenceUrls.length > 0 ? referenceUrls : undefined,
        });
        
        console.log(`✅ Kie AI task created: ${taskId}`);
        generation.progress = 30;
        await kv.set(`generation:${generation.id}`, generation);
        
        // Poll task status
        let attempts = 0;
        const maxAttempts = 120; // 2 minutes max (1s interval)
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
          
          const statusData = await kieAIImage.queryKieAIImageStatus(taskId);
          console.log(`📊 Kie AI task status: ${statusData.state} (attempt ${attempts}/${maxAttempts})`);
          
          // Update progress based on state
          if (statusData.state === 'queuing') {
            generation.progress = 40;
          } else if (statusData.state === 'generating') {
            generation.progress = 60 + (attempts % 20); // 60-80%
          }
          await kv.set(`generation:${generation.id}`, generation);
          
          if (statusData.state === 'success') {
            // Parse result
            const result = JSON.parse(statusData.resultJson || '{}');
            const imageUrl = result.resultUrls?.[0];
            
            if (!imageUrl) {
              console.error('❌ No image URL in Kie AI result:', JSON.stringify(result, null, 2));
              throw new Error('No image URL in Kie AI result');
            }
            
            console.log(`✅ Generation completed: ${imageUrl}`);
            
            // Update generation with result
            generation.status = 'completed';
            generation.progress = 100;
            generation.resultUrl = imageUrl;
            generation.thumbnail = imageUrl;
            generation.updatedAt = new Date().toISOString();
            await kv.set(`generation:${generation.id}`, generation);
            
            break;
          } else if (statusData.state === 'fail') {
            throw new Error(`Kie AI generation failed: ${statusData.failMsg || 'Unknown error'}`);
          }
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('Generation timeout after 2 minutes');
        }
        
      } catch (error) {
        console.error('❌ Generation failed:', error);
        
        // Update generation with error
        const gen = await kv.get(`generation:${generation.id}`) as Generation;
        if (gen) {
          gen.status = 'failed';
          gen.error = error instanceof Error ? error.message : 'Unknown error';
          gen.updatedAt = new Date().toISOString();
          await kv.set(`generation:${generation.id}`, gen);
          
          // Refund credits on failure using unified system
          await CreditsSystem.refundCredits(userId, credits, 'Generation failed', {
            generationId: generation.id,
            error: gen.error
          });
          console.log(`💰 Refunded ${credits} credits to user ${userId}`);
        }
      }
    })();

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
 * GET /coconut/generate/:generationId/status
 * Poll generation status
 */
app.get('/coconut/generate/:generationId/status', async (c) => {
  try {
    const generationId = c.req.param('generationId');
    
    console.log(`📊 Polling generation status: ${generationId}`);
    
    // Get generation from KV
    const generation = await kv.get(`generation:${generationId}`) as Generation;
    
    if (!generation) {
      console.error(`❌ Generation not found: ${generationId}`);
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }
    
    console.log(`✅ Generation status: ${generation.status} (${generation.progress}%)`);
    
    return c.json({
      success: true,
      data: {
        id: generation.id,
        status: generation.status,
        progress: generation.progress,
        resultUrl: generation.resultUrl,
        thumbnail: generation.thumbnail,
        error: generation.error,
        createdAt: generation.createdAt,
        updatedAt: generation.updatedAt,
      }
    });

  } catch (error) {
    console.error('❌ Error polling generation status:', error);
    return c.json({
      success: false,
      error: 'Failed to get generation status',
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
    const generationId = c.req.param('id');
    
    const generation = await kv.get(`generation:${generationId}`) as Generation;
    
    if (!generation) {
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }

    generation.isFavorite = !generation.isFavorite;
    generation.updatedAt = new Date().toISOString(); // ✅ FIX: Use ISO string
    
    await kv.set(`generation:${generationId}`, generation);

    return c.json({
      success: true,
      data: generation
    });

  } catch (error) {
    console.error('❌ Error toggling favorite:', error);
    return c.json({
      success: false,
      error: 'Failed to toggle favorite'
    }, 500);
  }
});

/**
 * DELETE /coconut/history/:id
 * Delete a generation
 */
app.delete('/coconut/history/:id', async (c) => {
  try {
    const generationId = c.req.param('id');
    
    const generation = await kv.get(`generation:${generationId}`) as Generation;
    
    if (!generation) {
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }

    // Remove from user's generations list
    const userId = generation.userId;
    const userGens = await kv.get(`user:${userId}:generations`) || [];
    const filtered = userGens.filter((id: string) => id !== generationId);
    await kv.set(`user:${userId}:generations`, filtered);

    // Delete generation
    await kv.del(`generation:${generationId}`);

    return c.json({
      success: true
    });

  } catch (error) {
    console.error('❌ Error deleting generation:', error);
    return c.json({
      success: false,
      error: 'Failed to delete generation'
    }, 500);
  }
});

/**
 * GET /coconut/history/list
 * Get user's generation history
 */
app.get('/coconut/history/list', async (c) => {
  try {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'userId is required'
      }, 400);
    }
    
    console.log(`📥 [History] Fetching generations for user: ${userId}`);
    
    // Get user's generation IDs list
    const userGenIds = await kv.get(`user:${userId}:generations`) || [];
    console.log(`📦 [History] Found ${userGenIds.length} generations for user`);
    
    // Paginate IDs
    const paginatedIds = userGenIds.slice(offset, offset + limit);
    
    // Fetch full generation objects
    const generations: Generation[] = [];
    for (const genId of paginatedIds) {
      const gen = await kv.get(`generation:${genId}`) as Generation;
      if (gen) {
        generations.push(gen);
      }
    }
    
    console.log(`✅ [History] Returning ${generations.length} generations`);
    
    return c.json({
      success: true,
      data: {
        generations,
        total: userGenIds.length,
        hasMore: offset + limit < userGenIds.length
      }
    });
    
  } catch (error) {
    console.error('❌ [History] Error fetching generations:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch generation history'
    }, 500);
  }
});

export default app;