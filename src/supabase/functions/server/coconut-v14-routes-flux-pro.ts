/**
 * COCONUT V14 ROUTES - FLUX PRO OPTIMIZED
 * Main routing file that connects the Flux Pro optimized analyzer
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as projectsUnified from './projects.tsx'; // ✅ MIGRATED: Use unified projects system
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system
import { handleAnalyzeIntent } from './coconut-v14-analyzer-flux-pro.ts'; // ✅ NEW: Flux Pro analyzer
import { analyzeMissingAssets, calculateAssetGenerationCost } from './coconut-v14-assets.ts';
import * as storage from './coconut-v14-storage.ts';
import * as cocoboard from './coconut-v14-cocoboard.ts';
import * as flux from './coconut-v14-flux.ts';
import { initDemoUserCredits, getUserCredits, addCredits } from './coconut-v14-init-credits.ts';
import type { 
  CreateProjectPayload,
  AnalyzeIntentPayload,
  SaveCocoBoardPayload,
  GeneratePayload,
  ApiResponse
} from '../../../lib/types/coconut-v14.ts';

const app = new Hono().basePath('/make-server-e55aa214');

// ============================================
// STARTUP: INITIALIZE DEMO USER CREDITS
// ============================================
console.log('🚀 Coconut V14 Routes (FLUX PRO OPTIMIZED) initializing...');
(async () => {
  try {
    // ✅ FIX: Demo user should have 0 credits (no initialization)
    // Users must sign up with Auth0 to get free credits
    console.log('✅ Demo user will have 0 credits (users must sign up)');
  } catch (error) {
    console.error('⚠️ Error during initialization:', error);
  }
})();

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// ============================================
// HELPER: CHECK ENTERPRISE ACCOUNT
// ============================================

async function checkEnterpriseAccount(userId: string): Promise<boolean> {
  // Simplified: treat all users as standard for now
  // Enterprise features can be added later
  return false;
}

// ============================================
// ROUTES
// ============================================

/**
 * POST /coconut-v14/projects
 * Create new project
 * ⚠️ DEPRECATED: Use /projects/create instead
 */
app.post('/coconut-v14/projects', async (c) => {
  console.warn('⚠️ DEPRECATED: /coconut-v14/projects - Use /projects/create instead');
  try {
    const payload: CreateProjectPayload = await c.req.json();
    const project = await projectsUnified.createProject(payload);
    
    return c.json({
      success: true,
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error: any) {
    console.error('❌ Create project error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /coconut-v14/projects/create
 * Alias route for backward compatibility
 * ⚠️ DEPRECATED: Use /projects/create instead
 */
app.post('/coconut-v14/projects/create', async (c) => {
  console.warn('⚠️ DEPRECATED: /coconut-v14/projects/create - Use /projects/create instead');
  try {
    const payload: CreateProjectPayload = await c.req.json();
    const project = await projectsUnified.createProject(payload);
    
    return c.json({
      success: true,
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error: any) {
    console.error('❌ Create project error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /coconut-v14/analyze
 * Analyze user intent with Gemini (FLUX PRO OPTIMIZED)
 */
app.post('/coconut-v14/analyze', async (c) => {
  try {
    console.log('🧠 Starting Flux Pro optimized analysis...');
    
    // Use new Flux Pro analyzer
    return await handleAnalyzeIntent(c);
    
  } catch (error: any) {
    console.error('❌ Analysis error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /coconut-v14/analyze-intent
 * Alias route for backward compatibility
 */
app.post('/coconut-v14/analyze-intent', async (c) => {
  try {
    console.log('🧠 Starting Flux Pro optimized analysis (via alias route)...');
    
    // Use new Flux Pro analyzer
    return await handleAnalyzeIntent(c);
    
  } catch (error: any) {
    console.error('❌ Analysis error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /coconut-v14/cocoboard/save
 * Save CocoBoard edits
 */
app.post('/coconut-v14/cocoboard/save', async (c) => {
  try {
    const payload: SaveCocoBoardPayload = await c.req.json();
    const result = await cocoboard.saveCocoBoardEdits(payload);
    
    return c.json({
      success: true,
      data: result,
    } as ApiResponse<typeof result>);
  } catch (error: any) {
    console.error('❌ Save CocoBoard error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /coconut-v14/generate
 * Generate final creative asset with Flux 2 Pro
 */
app.post('/coconut-v14/generate', async (c) => {
  try {
    const payload: GeneratePayload = await c.req.json();
    
    console.log('🎨 Starting Flux 2 Pro generation...');
    console.log(`📝 Prompt length: ${payload.finalPrompt.length} chars`);
    console.log(`📐 Format: ${payload.format}, Resolution: ${payload.resolution}`);
    
    const result = await flux.generateWithFlux(payload);
    
    return c.json({
      success: true,
      data: result,
    } as ApiResponse<typeof result>);
  } catch (error: any) {
    console.error('❌ Generation error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /coconut-v14/credits/:userId/add
 * Add credits to user
 */
app.post('/coconut-v14/credits/:userId/add', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { amount } = await c.req.json();
    
    await addCredits(userId, amount);
    const newCredits = await getUserCredits(userId);
    
    return c.json({
      success: true,
      data: { credits: newCredits },
    } as ApiResponse<{ credits: number }>);
  } catch (error: any) {
    console.error('❌ Add credits error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /credits/add-paid
 * Alias route for backward compatibility - Add paid credits
 */
app.post('/credits/add-paid', async (c) => {
  try {
    const { userId, amount } = await c.req.json();
    
    if (!userId || !amount) {
      return c.json({ 
        success: false,
        error: 'Missing required fields: userId, amount'
      }, 400);
    }
    
    await addCredits(userId, amount);
    
    const creditsData = await getUserCredits(userId);
    
    return c.json({ 
      success: true, 
      credits: {
        free: creditsData.free,
        paid: creditsData.paid
      },
      daysUntilReset: 30,
      balance: creditsData.total,
      formatted: `${creditsData.total} credits`
    });
    
  } catch (error: any) {
    console.error('❌ Error adding credits:', error);
    return c.json({ 
      success: false,
      error: 'Failed to add credits',
      message: error.message 
    }, 500);
  }
});

/**
 * POST /credits/deduct
 * Alias route for backward compatibility - Deduct credits
 */
app.post('/credits/deduct', async (c) => {
  try {
    const { userId, amount, type = 'paid' } = await c.req.json();
    
    if (!userId || !amount) {
      return c.json({ 
        success: false,
        error: 'Missing required fields: userId, amount'
      }, 400);
    }
    
    await CreditsSystem.deductCredits(userId, amount, `Credits deducted (${type})`);
    
    const creditsData = await getUserCredits(userId);
    
    return c.json({ 
      success: true,
      newBalance: creditsData.total,
      balance: creditsData.total,
      formatted: `${creditsData.total} credits`
    });
    
  } catch (error: any) {
    console.error('❌ Error deducting credits:', error);
    return c.json({ 
      success: false,
      error: 'Failed to deduct credits',
      message: error.message 
    }, 500);
  }
});

/**
 * POST /coconut-v14/credits/add
 * Add credits (new route format)
 */
app.post('/coconut-v14/credits/add', async (c) => {
  try {
    const { userId, amount, reason } = await c.req.json();
    
    await CreditsSystem.addCredits(userId, amount, reason);
    
    const newBalance = await getUserCredits(userId);
    
    return c.json({ 
      success: true,
      data: {
        added: amount,
        newBalance
      }
    } as ApiResponse);
    
  } catch (error: any) {
    console.error('❌ Error adding credits:', error);
    return c.json({ 
      success: false,
      error: 'Failed to add credits',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/credits/:userId/transactions
 * Get credit transaction history
 */
app.get('/coconut-v14/credits/:userId/transactions', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10;
    
    const transactions = await CreditsSystem.getRecentTransactions(userId, limit);
    
    return c.json({ 
      success: true, 
      data: {
        transactions,
        total: transactions.length
      }
    } as ApiResponse);
    
  } catch (error: any) {
    console.error('❌ Error fetching transactions:', error);
    return c.json({ 
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/credits/:userId/summary
 * Get spending summary
 */
app.get('/coconut-v14/credits/:userId/summary', async (c) => {
  try {
    const userId = c.req.param('userId');
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : undefined;
    
    const summary = await CreditsSystem.getSpendingSummary(userId, days);
    
    return c.json({ 
      success: true, 
      data: summary
    } as ApiResponse);
    
  } catch (error: any) {
    console.error('❌ Error fetching summary:', error);
    return c.json({ 
      success: false,
      error: 'Failed to fetch summary',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/credits/:userId
 * Get user credits
 */
app.get('/coconut-v14/credits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const credits = await getUserCredits(userId);
    
    return c.json({
      success: true,
      data: { credits },
    } as ApiResponse<{ credits: number }>);
  } catch (error: any) {
    console.error('❌ Get credits error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

// ✅ REMOVED: /credits/:userId route - handled by coconut-v14-credits-routes.ts

/**
 * GET /coconut-v14/projects/:projectId
 * Get project by ID
 */
app.get('/coconut-v14/projects/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const project = await projectsUnified.getProject(projectId);
    
    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found',
      }, 404);
    }
    
    return c.json({
      success: true,
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error: any) {
    console.error('❌ Get project error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * GET /coconut-v14/projects/user/:userId
 * Get all projects for user
 */
app.get('/coconut-v14/projects/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userProjects = await projectsUnified.getUserProjects(userId);
    
    return c.json({
      success: true,
      data: userProjects,
    } as ApiResponse<typeof userProjects>);
  } catch (error: any) {
    console.error('❌ Get user projects error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * PATCH /coconut-v14/projects/:projectId
 * Update project
 */
app.patch('/coconut-v14/projects/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const updates = await c.req.json();
    
    const updatedProject = await projectsUnified.updateProject(projectId, updates);
    
    return c.json({
      success: true,
      data: updatedProject,
    } as ApiResponse<typeof updatedProject>);
  } catch (error: any) {
    console.error('❌ Update project error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * DELETE /coconut-v14/projects/:projectId
 * Delete project
 */
app.delete('/coconut-v14/projects/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    await projectsUnified.deleteProject(projectId);
    
    return c.json({
      success: true,
      data: { deleted: true },
    } as ApiResponse<{ deleted: boolean }>);
  } catch (error: any) {
    console.error('❌ Delete project error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * GET /coconut-v14/health
 * Health check
 */
app.get('/coconut-v14/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      version: 'v14-flux-pro-optimized',
      timestamp: new Date().toISOString(),
      features: {
        fluxProOptimized: true,
        creativityMinimum: 8.5,
        promptLength: '30-150 words',
        archetypesApplied: true,
        cameraReferences: true,
        typographyIntelligence: true,
      },
    },
  });
});

export default app;