/**
 * COCONUT V14 - ORCHESTRATOR ROUTES
 * Phase 3 - Jour 2: Routes pour orchestration de génération
 */

import { Hono } from 'npm:hono';
import * as orchestrator from './coconut-v14-orchestrator.ts';
import type { ApiResponse } from '../../../lib/types/coconut-v14.ts';

const app = new Hono();

// ============================================
// ORCHESTRATOR ROUTES
// ============================================

/**
 * POST /coconut-v14/generate
 * Générer depuis CocoBoard (auto-detect single/multi-pass)
 * 
 * Body:
 * {
 *   userId: string;
 *   projectId: string;
 *   cocoBoardId: string;
 * }
 */
app.post('/coconut-v14/generate', async (c) => {
  const startTime = Date.now();
  
  try {
    const { userId, projectId, cocoBoardId } = await c.req.json();
    
    console.log('🎬 Generation request:', {
      userId,
      projectId,
      cocoBoardId
    });
    
    // Validate inputs
    if (!userId || !projectId || !cocoBoardId) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: userId, projectId, cocoBoardId'
      }, 400);
    }
    
    // Start generation orchestration
    console.log('🚀 Starting generation orchestration...');
    const job = await orchestrator.generateFromCocoBoard(
      userId,
      projectId,
      cocoBoardId
    );
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Generation completed in ${duration}ms`);
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        job: {
          id: job.id,
          mode: job.mode,
          status: job.status,
          progress: job.progress,
          finalImage: job.finalImage,
          assetsGenerated: job.assets.length,
          logs: job.logs,
          metadata: {
            ...job.metadata,
            duration: `${duration}ms`
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in generation:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Generation failed',
      message: error.message,
      details: error.stack
    }, 500);
  }
});

/**
 * POST /coconut-v14/generate/single-pass
 * Force single-pass generation
 * 
 * Body:
 * {
 *   userId: string;
 *   projectId: string;
 *   cocoBoardId: string;
 * }
 */
app.post('/coconut-v14/generate/single-pass', async (c) => {
  const startTime = Date.now();
  
  try {
    const { userId, projectId, cocoBoardId } = await c.req.json();
    
    console.log('🎨 Single-pass generation request:', {
      userId,
      projectId,
      cocoBoardId
    });
    
    // Validate inputs
    if (!userId || !projectId || !cocoBoardId) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: userId, projectId, cocoBoardId'
      }, 400);
    }
    
    // Get CocoBoard
    const { getCocoBoard } = await import('./coconut-v14-cocoboard.ts');
    const board = await getCocoBoard(cocoBoardId);
    
    if (!board) {
      return c.json<ApiResponse>({ 
        success: false,
        error: `CocoBoard not found: ${cocoBoardId}`
      }, 404);
    }
    
    // Start single-pass generation
    console.log('🚀 Starting single-pass generation...');
    const job = await orchestrator.singlePassGeneration(
      userId,
      projectId,
      board
    );
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Single-pass generation completed in ${duration}ms`);
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        job: {
          id: job.id,
          mode: job.mode,
          status: job.status,
          progress: job.progress,
          finalImage: job.finalImage,
          logs: job.logs,
          metadata: {
            ...job.metadata,
            duration: `${duration}ms`
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in single-pass generation:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Single-pass generation failed',
      message: error.message,
      details: error.stack
    }, 500);
  }
});

/**
 * POST /coconut-v14/generate/multi-pass
 * Force multi-pass generation
 * 
 * Body:
 * {
 *   userId: string;
 *   projectId: string;
 *   cocoBoardId: string;
 * }
 */
app.post('/coconut-v14/generate/multi-pass', async (c) => {
  const startTime = Date.now();
  
  try {
    const { userId, projectId, cocoBoardId } = await c.req.json();
    
    console.log('🎨 Multi-pass generation request:', {
      userId,
      projectId,
      cocoBoardId
    });
    
    // Validate inputs
    if (!userId || !projectId || !cocoBoardId) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: userId, projectId, cocoBoardId'
      }, 400);
    }
    
    // Get CocoBoard
    const { getCocoBoard } = await import('./coconut-v14-cocoboard.ts');
    const board = await getCocoBoard(cocoBoardId);
    
    if (!board) {
      return c.json<ApiResponse>({ 
        success: false,
        error: `CocoBoard not found: ${cocoBoardId}`
      }, 404);
    }
    
    // Start multi-pass generation
    console.log('🚀 Starting multi-pass generation...');
    const job = await orchestrator.multiPassGeneration(
      userId,
      projectId,
      board
    );
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Multi-pass generation completed in ${duration}ms`);
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        job: {
          id: job.id,
          mode: job.mode,
          status: job.status,
          progress: job.progress,
          finalImage: job.finalImage,
          assetsGenerated: job.assets.length,
          logs: job.logs,
          metadata: {
            ...job.metadata,
            duration: `${duration}ms`
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in multi-pass generation:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Multi-pass generation failed',
      message: error.message,
      details: error.stack
    }, 500);
  }
});

/**
 * GET /coconut-v14/job/:jobId
 * Récupérer le statut d'un job de génération
 */
app.get('/coconut-v14/job/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    
    console.log(`📊 Fetching job status: ${jobId}`);
    
    const job = await orchestrator.getGenerationJob(jobId);
    
    if (!job) {
      return c.json<ApiResponse>({ 
        success: false,
        error: `Job not found: ${jobId}`
      }, 404);
    }
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        id: job.id,
        mode: job.mode,
        status: job.status,
        progress: job.progress,
        currentAsset: job.currentAsset,
        currentTask: job.currentTask,
        totalAssets: job.totalAssets,
        assetsGenerated: job.assets.length,
        finalImage: job.finalImage,
        error: job.error,
        logs: job.logs,
        estimatedCost: job.estimatedCost,
        metadata: job.metadata,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching job status:', error);
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch job status',
      message: error.message
    }, 500);
  }
});

/**
 * GET /coconut-v14/orchestrator/info
 * Récupérer les informations sur l'orchestrateur
 */
app.get('/coconut-v14/orchestrator/info', (c) => {
  return c.json<ApiResponse>({ 
    success: true,
    data: orchestrator.ORCHESTRATOR_INFO
  });
});

export default app;
