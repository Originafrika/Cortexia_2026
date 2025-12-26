/**
 * COCONUT V14 - FLUX GENERATION ROUTES
 * Phase 3 - Jour 1: Routes pour génération Flux 2 Pro
 */

import { Hono } from 'npm:hono';
import * as flux from './coconut-v14-flux.ts';
import * as credits from './coconut-v14-credits.ts';
import * as projects from './coconut-v14-projects.ts';
import * as cocoboard from './coconut-v14-cocoboard.ts';
import type { ApiResponse } from '../../../lib/types/coconut-v14.ts';

const app = new Hono();

// ============================================
// FLUX GENERATION ROUTES
// ============================================

/**
 * POST /coconut-v14/flux/text-to-image
 * Générer une image avec Flux 2 Pro (text-to-image)
 * 
 * Body:
 * {
 *   userId: string;
 *   projectId: string;
 *   prompt: FluxPrompt;
 *   specs: TechnicalSpecs;
 * }
 */
app.post('/coconut-v14/flux/text-to-image', async (c) => {
  const startTime = Date.now();
  
  try {
    const { userId, projectId, prompt, specs } = await c.req.json();
    
    console.log('🎨 Text-to-Image generation request:', {
      userId,
      projectId,
      format: specs.format,
      resolution: specs.resolution
    });
    
    // Validate inputs
    if (!userId || !projectId || !prompt || !specs) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: userId, projectId, prompt, specs'
      }, 400);
    }
    
    // Check credits (15 crédits pour text-to-image)
    const generationCost = flux.FLUX_SERVICE_INFO.pricing.textToImage;
    const hasCredits = await credits.checkCredits(userId, generationCost);
    
    if (!hasCredits) {
      const balance = await credits.getCreditBalance(userId);
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Insufficient credits',
        message: `Generation requires ${generationCost} credits. Available: ${balance} credits`
      }, 402);
    }
    
    // Create Flux task
    console.log('🚀 Creating Flux text-to-image task...');
    const taskId = await flux.createTextToImageTask(prompt, specs);
    
    // Deduct credits
    await credits.deductCredits(
      userId,
      generationCost,
      'Flux 2 Pro text-to-image generation',
      projectId
    );
    console.log(`✅ Debited ${generationCost} credits`);
    
    // Update project status
    await projects.updateProjectStatus(projectId, 'generating', {
      generationType: 'text-to-image',
      taskId,
      startedAt: new Date().toISOString()
    });
    
    const duration = Date.now() - startTime;
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        taskId,
        projectId,
        status: 'pending',
        cost: generationCost,
        metadata: {
          duration: `${duration}ms`,
          model: flux.FLUX_SERVICE_INFO.model,
          generationType: 'text-to-image',
          timestamp: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in text-to-image generation:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Generation failed',
      message: error.message,
      details: error.stack
    }, 500);
  }
});

/**
 * POST /coconut-v14/flux/image-to-image
 * Générer une image avec Flux 2 Pro (image-to-image)
 * 
 * Body:
 * {
 *   userId: string;
 *   projectId: string;
 *   prompt: FluxPrompt;
 *   references: string[]; // 1-8 image URLs
 *   specs: TechnicalSpecs;
 * }
 */
app.post('/coconut-v14/flux/image-to-image', async (c) => {
  const startTime = Date.now();
  
  try {
    const { userId, projectId, prompt, references, specs } = await c.req.json();
    
    console.log('🎨 Image-to-Image generation request:', {
      userId,
      projectId,
      referencesCount: references?.length || 0,
      format: specs.format,
      resolution: specs.resolution
    });
    
    // Validate inputs
    if (!userId || !projectId || !prompt || !references || !specs) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: userId, projectId, prompt, references, specs'
      }, 400);
    }
    
    if (!Array.isArray(references) || references.length === 0) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'At least 1 reference image required'
      }, 400);
    }
    
    // Check credits (20 crédits pour image-to-image)
    const generationCost = flux.FLUX_SERVICE_INFO.pricing.imageToImage;
    const hasCredits = await credits.checkCredits(userId, generationCost);
    
    if (!hasCredits) {
      const balance = await credits.getCreditBalance(userId);
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Insufficient credits',
        message: `Generation requires ${generationCost} credits. Available: ${balance} credits`
      }, 402);
    }
    
    // Create Flux task
    console.log('🚀 Creating Flux image-to-image task...');
    const taskId = await flux.createImageToImageTask(prompt, references, specs);
    
    // Deduct credits
    await credits.deductCredits(
      userId,
      generationCost,
      `Flux 2 Pro image-to-image (${references.length} refs)`,
      projectId
    );
    console.log(`✅ Debited ${generationCost} credits`);
    
    // Update project status
    await projects.updateProjectStatus(projectId, 'generating', {
      generationType: 'image-to-image',
      taskId,
      referencesCount: references.length,
      startedAt: new Date().toISOString()
    });
    
    const duration = Date.now() - startTime;
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        taskId,
        projectId,
        status: 'pending',
        cost: generationCost,
        metadata: {
          duration: `${duration}ms`,
          model: flux.FLUX_SERVICE_INFO.model,
          generationType: 'image-to-image',
          referencesCount: references.length,
          timestamp: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in image-to-image generation:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Generation failed',
      message: error.message,
      details: error.stack
    }, 500);
  }
});

/**
 * GET /coconut-v14/flux/task/:taskId
 * Récupérer le statut d'une tâche Flux
 */
app.get('/coconut-v14/flux/task/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    
    console.log(`📊 Fetching Flux task status: ${taskId}`);
    
    const status = await flux.getFluxTaskStatus(taskId);
    
    return c.json<ApiResponse>({ 
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('❌ Error fetching task status:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch task status',
      message: error.message
    }, 500);
  }
});

/**
 * POST /coconut-v14/flux/task/:taskId/poll
 * Poll une tâche Flux jusqu'à completion
 * 
 * Body (optional):
 * {
 *   userId: string; // For updating project status
 *   projectId: string;
 * }
 */
app.post('/coconut-v14/flux/task/:taskId/poll', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const body = await c.req.json().catch(() => ({}));
    const { userId, projectId } = body;
    
    console.log(`⏳ Starting to poll Flux task: ${taskId}`);
    
    // Poll with retry
    const imageUrl = await flux.pollFluxTaskWithRetry(
      taskId,
      2, // Max 2 retries
      (progress, status) => {
        console.log(`Progress: ${progress}% (${status})`);
      }
    );
    
    console.log(`✅ Generation completed: ${imageUrl}`);
    
    // Update project status if provided
    if (userId && projectId) {
      await projects.updateProjectStatus(projectId, 'completed', {
        taskId,
        imageUrl,
        completedAt: new Date().toISOString()
      });
    }
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        taskId,
        imageUrl,
        status: 'completed'
      }
    });
    
  } catch (error) {
    console.error('❌ Error polling task:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Polling failed',
      message: error.message
    }, 500);
  }
});

/**
 * POST /coconut-v14/flux/task/:taskId/cancel
 * Annuler une tâche Flux
 */
app.post('/coconut-v14/flux/task/:taskId/cancel', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    
    console.log(`❌ Cancelling Flux task: ${taskId}`);
    
    await flux.cancelFluxTask(taskId);
    
    return c.json<ApiResponse>({ 
      success: true,
      message: 'Task cancelled successfully'
    });
    
  } catch (error) {
    console.error('❌ Error cancelling task:', error);
    
    // Don't throw - cancellation is best-effort
    return c.json<ApiResponse>({ 
      success: true,
      message: 'Cancellation request sent (best-effort)'
    });
  }
});

/**
 * GET /coconut-v14/flux/info
 * Récupérer les informations sur le service Flux
 */
app.get('/coconut-v14/flux/info', (c) => {
  return c.json<ApiResponse>({ 
    success: true,
    data: flux.FLUX_SERVICE_INFO
  });
});

export default app;
