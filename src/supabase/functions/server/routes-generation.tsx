/**
 * COCONUT V14 - GENERATION ROUTES
 * Phase 3 - Jour 6: API routes for generation
 */

import { Hono } from 'npm:hono@4.6.14';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

// ✅ FIXED: Don't use basePath when mounting with app.route()
const app = new Hono();

console.log('🎨 Generation routes module loaded - v2 (no basePath)');

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

/**
 * POST /api/coconut-v14/generate
 * Start a new generation
 */
app.post('/api/coconut-v14/generate', async (c) => {
  try {
    const { cocoBoardId, overridePrompt } = await c.req.json();

    if (!cocoBoardId) {
      return c.json({ success: false, error: 'cocoBoardId is required' }, 400);
    }

    // Load CocoBoard
    const board = await kv.get(`cocoboard:${cocoBoardId}`);
    if (!board) {
      return c.json({ success: false, error: 'CocoBoard not found' }, 404);
    }

    // ✅ Use overridePrompt if provided (clean prompt from frontend), otherwise use board.finalPrompt
    const promptToUse = overridePrompt || board.finalPrompt;
    
    console.log('🎨 Using prompt:', {
      source: overridePrompt ? 'overridePrompt (clean from frontend)' : 'board.finalPrompt (from DB)',
      type: typeof promptToUse,
      length: typeof promptToUse === 'string' ? promptToUse.length : JSON.stringify(promptToUse).length,
      preview: typeof promptToUse === 'string' ? promptToUse.substring(0, 100) + '...' : 'Object',
    });

    // Generate unique ID
    const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create generation record
    const generation = {
      id: generationId,
      cocoBoardId,
      userId: board.userId,
      projectId: board.projectId,
      status: 'preparing',
      currentStep: 'prepare',
      progress: 0,
      type: 'image', // ✅ FIX: Add type for statistics filtering
      prompt: promptToUse, // ✅ Use the clean prompt
      specs: board.specs,
      references: board.references,
      startTime: Date.now(),
      createdAt: new Date().toISOString(), // ✅ FIX: Add createdAt for date filtering
      endTime: null,
      result: null,
      error: null
    };

    // Save generation
    await kv.set(`generation:${generationId}`, generation);

    // ✅ FIX: Add generation to user's index for statistics tracking
    const userGenKey = `user:${board.userId}:generations`;
    const userGenerations = await kv.get(userGenKey) || [];
    userGenerations.unshift(generationId); // Add to beginning (newest first)
    await kv.set(userGenKey, userGenerations);
    
    console.log(`✅ Added generation ${generationId} to user ${board.userId} index`);

    // Start generation process (async)
    processGeneration(generationId).catch(err => {
      console.error('Generation process error:', err);
    });

    return c.json({
      success: true,
      data: { generationId }
    });

  } catch (error) {
    console.error('Start generation error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to start generation'
    }, 500);
  }
});

/**
 * GET /api/coconut-v14/generate/:id/status
 * Get generation status
 */
app.get('/api/coconut-v14/generate/:id/status', async (c) => {
  try {
    const generationId = c.req.param('id');

    const generation = await kv.get(`generation:${generationId}`);
    if (!generation) {
      return c.json({ success: false, error: 'Generation not found' }, 404);
    }

    return c.json({
      success: true,
      data: {
        status: generation.status,
        currentStep: generation.currentStep,
        progress: generation.progress,
        result: generation.result,
        error: generation.error
      }
    });

  } catch (error) {
    console.error('Get generation status error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get status'
    }, 500);
  }
});

/**
 * POST /api/coconut-v14/generate/:id/cancel
 * Cancel generation
 */
app.post('/api/coconut-v14/generate/:id/cancel', async (c) => {
  try {
    const generationId = c.req.param('id');

    const generation = await kv.get(`generation:${generationId}`);
    if (!generation) {
      return c.json({ success: false, error: 'Generation not found' }, 404);
    }

    // Update status to cancelled
    generation.status = 'cancelled';
    generation.endTime = Date.now();
    await kv.set(`generation:${generationId}`, generation);

    return c.json({ success: true });

  } catch (error) {
    console.error('Cancel generation error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel'
    }, 500);
  }
});

/**
 * Process generation (async)
 */
async function processGeneration(generationId: string) {
  try {
    // Load generation
    const generation = await kv.get(`generation:${generationId}`);
    if (!generation) {
      throw new Error('Generation not found');
    }

    // Check if cancelled
    if (generation.status === 'cancelled') {
      return;
    }

    // Step 1: Prepare (10%)
    await updateGenerationProgress(generationId, 'prepare', 10);
    await sleep(1000);

    // Step 2: Analyze (30%)
    await updateGenerationProgress(generationId, 'analyze', 30);
    await sleep(2000);

    // Step 3: Generate (70%)
    await updateGenerationProgress(generationId, 'generate', 50);
    
    // Call Flux API
    const imageUrl = await generateWithFlux(generation.prompt, generation.specs);
    
    await updateGenerationProgress(generationId, 'generate', 100);

    // Step 4: Finalize (100%)
    await updateGenerationProgress(generationId, 'finalize', 100);

    // Mark as complete
    const updatedGeneration = await kv.get(`generation:${generationId}`);
    updatedGeneration.status = 'complete';
    updatedGeneration.endTime = Date.now();
    updatedGeneration.result = {
      imageUrl,
      prompt: generation.prompt,
      specs: generation.specs,
      cost: 115 // TODO: Calculate actual cost
    };
    await kv.set(`generation:${generationId}`, updatedGeneration);

  } catch (error) {
    console.error('Process generation error:', error);
    
    // Mark as error
    const generation = await kv.get(`generation:${generationId}`);
    if (generation) {
      generation.status = 'error';
      generation.endTime = Date.now();
      generation.error = error instanceof Error ? error.message : 'Generation failed';
      await kv.set(`generation:${generationId}`, generation);
    }
  }
}

/**
 * Update generation progress
 */
async function updateGenerationProgress(
  generationId: string,
  step: string,
  progress: number
) {
  const generation = await kv.get(`generation:${generationId}`);
  if (!generation) return;

  generation.currentStep = step;
  generation.progress = progress;
  await kv.set(`generation:${generationId}`, generation);
}

/**
 * Generate with Flux 2 Pro
 */
async function generateWithFlux(prompt: any, specs: any): Promise<string> {
  // Get Kie AI API key
  const kieApiKey = Deno.env.get('KIE_AI_API_KEY');
  if (!kieApiKey) {
    throw new Error('KIE_AI_API_KEY not configured');
  }

  // Build prompt string
  const promptText = buildPromptText(prompt);

  // Call Kie AI Flux 2 Pro endpoint
  const response = await fetch('https://api.kie.ai/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${kieApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'flux-2-pro',
      prompt: promptText,
      width: getWidth(specs.format, specs.resolution),
      height: getHeight(specs.format, specs.resolution),
      num_inference_steps: specs.mode === 'multi-pass' ? (specs.passes || 2) * 25 : 25,
      guidance_scale: 7.5
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Flux API error: ${error}`);
  }

  const data = await response.json();
  
  if (!data.image_url) {
    throw new Error('No image URL returned from Flux API');
  }

  return data.image_url;
}

/**
 * Build prompt text from JSON
 */
function buildPromptText(prompt: any): string {
  if (typeof prompt === 'string') return prompt;

  let text = prompt.scene || '';

  if (prompt.style) {
    text += `, ${prompt.style.primary} style`;
    if (prompt.style.mood) text += `, ${prompt.style.mood} mood`;
  }

  if (prompt.subjects && prompt.subjects.length > 0) {
    prompt.subjects.forEach((subject: any) => {
      text += `, ${subject.description}`;
    });
  }

  if (prompt.lighting) {
    text += `, ${prompt.lighting.type} lighting`;
  }

  if (prompt.camera) {
    text += `, ${prompt.camera.shot} shot`;
  }

  return text;
}

/**
 * Get width from specs
 */
function getWidth(format: string, resolution: string): number {
  const baseSize = resolution === '4K' ? 4096 : resolution === '2K' ? 2048 : 1024;
  
  if (format === '1:1') return baseSize;
  if (format === '16:9') return Math.round(baseSize * 1.77);
  if (format === '9:16') return Math.round(baseSize / 1.77);
  if (format === '4:3') return Math.round(baseSize * 1.33);
  if (format === '3:4') return Math.round(baseSize / 1.33);
  if (format === '21:9') return Math.round(baseSize * 2.33);
  
  return baseSize;
}

/**
 * Get height from specs
 */
function getHeight(format: string, resolution: string): number {
  const baseSize = resolution === '4K' ? 4096 : resolution === '2K' ? 2048 : 1024;
  
  if (format === '1:1') return baseSize;
  if (format === '16:9') return Math.round(baseSize / 1.77);
  if (format === '9:16') return Math.round(baseSize * 1.77);
  if (format === '4:3') return Math.round(baseSize / 1.33);
  if (format === '3:4') return Math.round(baseSize * 1.33);
  if (format === '21:9') return Math.round(baseSize / 2.33);
  
  return baseSize;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default app;