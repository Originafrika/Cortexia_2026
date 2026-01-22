import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as projectsUnified from './projects.tsx'; // ✅ MIGRATED: Use unified projects system
import * as credits from './coconut-v14-credits.ts';
import { analyzeWithRetry } from './coconut-v14-analyzer.ts';
import { analyzeMissingAssets, calculateAssetGenerationCost } from './coconut-v14-assets.ts';
import * as storage from './coconut-v14-storage.ts';
import * as cocoboard from './coconut-v14-cocoboard.ts';
import * as flux from './coconut-v14-flux.ts';
import { initDemoUserCredits, getUserCredits, addCredits } from './coconut-v14-init-credits.ts';
import * as kv from './kv_store.tsx'; // ✅ NEW: Import KV store for user profiles
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
console.log('🚀 Coconut V14 Routes initializing...');
(async () => {
  try {
    await initDemoUserCredits('demo-user', 1000); // Give 1000 credits to start
  } catch (error) {
    console.error('⚠️ Failed to initialize demo user credits:', error);
  }
})();

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ Added PATCH
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// ============================================
// HELPER: CHECK ENTERPRISE ACCOUNT
// ============================================

async function checkEnterpriseAccount(userId: string): Promise<boolean> {
  // TODO: Implémenter la vraie vérification du compte entreprise
  // Pour l'instant, on accepte tous les utilisateurs
  // En production, vérifier dans la base de données users
  
  // Exemple de logique future:
  // const user = await supabase.from('users').select('account_type').eq('id', userId).single();
  // return user.data?.account_type === 'enterprise';
  
  return true; // Temporaire pour Phase 1
}

// ============================================
// HELPER: GET USER PROFILE
// ============================================

async function getUserProfile(userId: string): Promise<any | null> {
  try {
    // Try user:profile:userId first (most common)
    let profile = await kv.get(`user:profile:${userId}`);
    
    // Fallback to user:userId
    if (!profile) {
      profile = await kv.get(`user:${userId}`);
    }
    
    return profile;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return null;
  }
}

// ============================================
// PROJECTS ROUTES
// ============================================

/**
 * POST /coconut-v14/projects/create
 * Créer un nouveau projet
 */
app.post('/coconut-v14/projects/create', async (c) => {
  try {
    const payload = await c.req.json() as CreateProjectPayload;
    
    // Vérifier account type
    const isEnterprise = await checkEnterpriseAccount(payload.userId);
    if (!isEnterprise) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Coconut is reserved for enterprise accounts only' 
      }, 403);
    }
    
    // Créer projet
    const project = await projectsUnified.createProject(payload);
    
    return c.json<ApiResponse>({ 
      success: true, 
      data: project 
    });
    
  } catch (error) {
    console.error('❌ Error creating project:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to create project',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/projects/:userId
 * Récupérer tous les projets d'un utilisateur
 */
app.get('/coconut-v14/projects/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Query params optionnels
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined;
    const status = c.req.query('status') as any;
    
    const projectsList = await projectsUnified.getUserProjects(userId, {
      limit,
      offset,
      status
    });
    
    return c.json<ApiResponse>({ 
      success: true, 
      data: {
        projects: projectsList,
        total: projectsList.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch projects',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/project/:projectId
 * Récupérer un projet spécifique
 */
app.get('/coconut-v14/project/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    
    const project = await projectsUnified.getProject(projectId);
    
    if (!project) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Project not found' 
      }, 404);
    }
    
    return c.json<ApiResponse>({ 
      success: true, 
      data: project 
    });
    
  } catch (error) {
    console.error('❌ Error fetching project:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch project',
      message: error.message 
    }, 500);
  }
});

/**
 * DELETE /coconut-v14/project/:projectId
 * Supprimer un projet
 */
app.delete('/coconut-v14/project/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    
    await projectsUnified.deleteProject(projectId);
    
    return c.json<ApiResponse>({ 
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to delete project',
      message: error.message 
    }, 500);
  }
});

// ============================================
// ANALYSIS ROUTE (Phase 2 - COMPLETE)
// ============================================

/**
 * POST /coconut-v14/analyze-intent
 * Analyser une intention avec Gemini 2.5 Flash
 * 
 * Flow:
 * 1. Vérifier crédits (100 pour analyse)
 * 2. Appeler Gemini avec retry logic
 * 3. Analyser assets manquants
 * 4. Calculer coût total (analyse + assets + génération)
 * 5. Débiter crédits analyse (100)
 * 6. Sauvegarder résultats dans projet
 * 7. Retourner analysis + metadata
 */
app.post('/coconut-v14/analyze-intent', async (c) => {
  const startTime = Date.now();
  
  try {
    const payload = await c.req.json() as AnalyzeIntentPayload;
    
    console.log('🚀 Starting intent analysis:', {
      userId: payload.userId,
      projectId: payload.projectId,
      imagesCount: payload.references.images.length,
      videosCount: payload.references.videos.length
    });
    
    // ✅ NEW: Get user profile for brand guidelines
    const userProfile = await getUserProfile(payload.userId);
    console.log('👤 User profile loaded:', {
      hasCompanyName: !!userProfile?.companyName,
      hasBrandColors: !!userProfile?.brandColors,
      hasLogo: !!userProfile?.companyLogo
    });
    
    // 1. Vérifier crédits AVANT l'analyse
    const analysisCost = 100;
    const hasCredits = await credits.checkCredits(payload.userId, analysisCost);
    
    if (!hasCredits) {
      const balance = await credits.getCreditBalance(payload.userId);
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Insufficient credits',
        message: `Analysis requires ${analysisCost} credits. Available: ${balance} credits`
      }, 402);
    }
    
    // 2. Appeler Gemini avec retry logic (max 3 attempts)
    console.log('🧠 Calling Gemini analysis...');
    const analysisResult = await analyzeWithRetry(payload, 2, userProfile); // ✅ PASS USER PROFILE
    console.log('✅ Gemini analysis completed');
    
    // 3. Analyser assets manquants
    const assetAnalysis = analyzeMissingAssets(analysisResult.assetsRequired.missing);
    console.log(`📦 Asset analysis: ${assetAnalysis.generationCount} to generate, ${assetAnalysis.requestCount} to request`);
    
    // 4. Calculer coût TOTAL du projet complet
    const assetsCost = calculateAssetGenerationCost(
      analysisResult.assetsRequired.missing,
      payload.resolution
    );
    
    const finalGenerationCost = analysisResult.estimatedCost.finalGeneration;
    const totalProjectCost = analysisCost + assetsCost + finalGenerationCost;
    
    console.log('💰 Cost breakdown:', {
      analysis: analysisCost,
      assets: assetsCost,
      finalGeneration: finalGenerationCost,
      total: totalProjectCost
    });
    
    // 5. Débiter crédits pour l'analyse (maintenant)
    // Assets et génération finale seront débitées plus tard
    await credits.deductCredits(
      payload.userId,
      analysisCost,
      'Gemini analysis',
      payload.projectId
    );
    console.log(`✅ Debited ${analysisCost} credits for analysis`);
    
    // 6. Update project status et sauvegarder analysis
    await projectsUnified.updateProjectStatus(payload.projectId, 'analyzed', {
      analysis: analysisResult,
      assetAnalysis,
      costBreakdown: {
        analysis: analysisCost,
        assets: assetsCost,
        finalGeneration: finalGenerationCost,
        total: totalProjectCost,
        debited: analysisCost,
        remaining: assetsCost + finalGenerationCost
      },
      analyzedAt: new Date().toISOString()
    });
    console.log('✅ Project updated with analysis results');
    
    // 7. Retourner résultats complets
    const duration = Date.now() - startTime;
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        projectId: payload.projectId,
        analysis: analysisResult,
        assets: {
          total: analysisResult.assetsRequired.missing.length,
          toGenerate: assetAnalysis.generationCount,
          toRequest: assetAnalysis.requestCount,
          canGenerateAll: assetAnalysis.canGenerateAll
        },
        cost: {
          analysis: analysisCost,
          assetsGeneration: assetsCost,
          finalGeneration: finalGenerationCost,
          total: totalProjectCost,
          debited: analysisCost,
          remaining: assetsCost + finalGenerationCost
        },
        nextSteps: assetAnalysis.requiresUserInput 
          ? ['review-assets', 'provide-missing-assets', 'proceed-to-cocoboard']
          : ['proceed-to-cocoboard'],
        metadata: {
          duration: `${duration}ms`,
          geminiModel: 'gemini-2.5-flash',
          timestamp: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error analyzing intent:', error);
    
    // En cas d'erreur, essayer de rembourser si des crédits ont été débités
    // (Note: à implémenter si nécessaire - pour l'instant on log juste)
    console.error('⚠️ Analysis failed - credits may need manual refund');
    
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Analysis failed',
      message: error.message,
      details: error.stack
    }, 500);
  }
});

// ============================================
// COCOBOARD ROUTE (Placeholder pour Phase 3)
// ============================================

/**
 * POST /coconut-v14/save-cocoboard
 * Sauvegarder un CocoBoard (Phase 3)
 */
app.post('/coconut-v14/save-cocoboard', async (c) => {
  try {
    const payload = await c.req.json() as SaveCocoBoardPayload;
    
    // TODO Phase 3: Implémenter sauvegarde CocoBoard
    await cocoboard.saveCocoBoard(payload);
    
    return c.json<ApiResponse>({ 
      success: true,
      message: 'CocoBoard saved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error saving cocoboard:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to save cocoboard',
      message: error.message 
    }, 500);
  }
});

// ============================================
// GENERATION ROUTE (Placeholder pour Phase 3)
// ============================================

/**
 * POST /coconut-v14/generate
 * Lancer la génération (Phase 3)
 */
app.post('/coconut-v14/generate', async (c) => {
  try {
    const payload = await c.req.json() as GeneratePayload;
    
    // TODO Phase 3: Implémenter génération
    
    return c.json<ApiResponse>({ 
      success: true,
      message: 'Generation endpoint ready - implementation in Phase 3',
      data: {
        projectId: payload.projectId,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to generate',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/generation/:taskId
 * Récupérer le statut d'une génération
 */
app.get('/coconut-v14/generation/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    
    // TODO Phase 3: Implémenter status checking
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        taskId,
        status: 'pending',
        message: 'Status endpoint ready - implementation in Phase 3'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching generation status:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch generation status',
      message: error.message 
    }, 500);
  }
});

// ============================================
// CREDITS ROUTES
// ============================================

/**
 * GET /credits/:userId
 * Alias route for backward compatibility
 */
app.get('/credits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const balance = await credits.getCreditBalance(userId);
    
    return c.json({ 
      success: true, 
      credits: {
        free: balance,
        paid: 0
      },
      daysUntilReset: 30,
      balance,
      formatted: credits.formatCredits(balance)
    });
    
  } catch (error) {
    console.error('❌ Error fetching credits:', error);
    return c.json({ 
      success: false,
      error: 'Failed to fetch credits',
      message: error.message 
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
    
    await credits.addCredits(userId, amount, 'Paid credits added');
    
    const balance = await credits.getCreditBalance(userId);
    
    return c.json({ 
      success: true, 
      credits: {
        free: balance,
        paid: 0
      },
      daysUntilReset: 30,
      balance,
      formatted: credits.formatCredits(balance)
    });
    
  } catch (error) {
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
    
    await credits.deductCredits(userId, amount, `Credits deducted (${type})`);
    
    const newBalance = await credits.getCreditBalance(userId);
    
    return c.json({ 
      success: true,
      newBalance,
      balance: newBalance,
      formatted: credits.formatCredits(newBalance)
    });
    
  } catch (error) {
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
 * Ajouter des crédits
 */
app.post('/coconut-v14/credits/add', async (c) => {
  try {
    const { userId, amount, reason } = await c.req.json();
    
    await credits.addCredits(userId, amount, reason);
    
    const newBalance = await credits.getCreditBalance(userId);
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        added: amount,
        newBalance
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding credits:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to add credits',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/credits/:userId/transactions
 * Récupérer l'historique des transactions
 */
app.get('/coconut-v14/credits/:userId/transactions', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10;
    
    const transactions = await credits.getRecentTransactions(userId, limit);
    
    return c.json<ApiResponse>({ 
      success: true, 
      data: {
        transactions,
        total: transactions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/credits/:userId/summary
 * Récupérer le résumé des dépenses
 */
app.get('/coconut-v14/credits/:userId/summary', async (c) => {
  try {
    const userId = c.req.param('userId');
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : undefined;
    
    const summary = await credits.getSpendingSummary(userId, days);
    
    return c.json<ApiResponse>({ 
      success: true, 
      data: summary
    });
    
  } catch (error) {
    console.error('❌ Error fetching summary:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch summary',
      message: error.message 
    }, 500);
  }
});

// ============================================
// STORAGE ROUTES (Phase 2 Day 3 - NEW)
// ============================================

/**
 * POST /coconut-v14/storage/upload-reference
 * Upload une référence (image ou vidéo)
 */
app.post('/coconut-v14/storage/upload-reference', async (c) => {
  try {
    const formData = await c.req.formData();
    
    const userId = formData.get('userId') as string;
    const projectId = formData.get('projectId') as string;
    const category = formData.get('category') as 'image' | 'video';
    const file = formData.get('file') as File;
    
    if (!userId || !projectId || !category || !file) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: userId, projectId, category, file'
      }, 400);
    }
    
    const result = await storage.uploadReference({
      userId,
      projectId,
      file,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category
    });
    
    if (!result.success) {
      return c.json<ApiResponse>({ 
        success: false,
        error: result.error
      }, 400);
    }
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        url: result.url,
        signedUrl: result.signedUrl,
        path: result.path
      }
    });
    
  } catch (error) {
    console.error('❌ Error uploading reference:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to upload reference',
      message: error.message 
    }, 500);
  }
});

/**
 * POST /coconut-v14/storage/signed-url
 * Générer une signed URL pour un fichier
 */
app.post('/coconut-v14/storage/signed-url', async (c) => {
  try {
    const { bucket, path, expiresIn } = await c.req.json();
    
    if (!bucket || !path) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: bucket, path'
      }, 400);
    }
    
    const signedUrl = await storage.getSignedUrl(bucket, path, expiresIn);
    
    if (!signedUrl) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Failed to generate signed URL'
      }, 500);
    }
    
    return c.json<ApiResponse>({ 
      success: true,
      data: { signedUrl }
    });
    
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to generate signed URL',
      message: error.message 
    }, 500);
  }
});

/**
 * POST /coconut-v14/storage/signed-urls-batch
 * Générer plusieurs signed URLs
 */
app.post('/coconut-v14/storage/signed-urls-batch', async (c) => {
  try {
    const { bucket, paths, expiresIn } = await c.req.json();
    
    if (!bucket || !paths || !Array.isArray(paths)) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: bucket, paths (array)'
      }, 400);
    }
    
    const urls = await storage.getSignedUrls(bucket, paths, expiresIn);
    
    return c.json<ApiResponse>({ 
      success: true,
      data: { urls }
    });
    
  } catch (error) {
    console.error('❌ Error generating signed URLs:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to generate signed URLs',
      message: error.message 
    }, 500);
  }
});

/**
 * DELETE /coconut-v14/storage/file
 * Supprimer un fichier
 */
app.delete('/coconut-v14/storage/file', async (c) => {
  try {
    const { bucket, path } = await c.req.json();
    
    if (!bucket || !path) {
      return c.json<ApiResponse>({ 
        success: false,
        error: 'Missing required fields: bucket, path'
      }, 400);
    }
    
    const result = await storage.deleteFile(bucket, path);
    
    if (!result.success) {
      return c.json<ApiResponse>({ 
        success: false,
        error: result.error
      }, 500);
    }
    
    return c.json<ApiResponse>({ 
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to delete file',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /coconut-v14/storage/project/:projectId/usage
 * Récupérer l'usage storage d'un projet
 */
app.get('/coconut-v14/storage/project/:projectId/usage', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    
    const usage = await storage.getProjectStorageUsage(projectId);
    
    return c.json<ApiResponse>({ 
      success: true,
      data: {
        projectId,
        totalSize: usage.totalSize,
        totalSizeFormatted: storage.formatFileSize(usage.totalSize),
        fileCount: usage.fileCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching storage usage:', error);
    return c.json<ApiResponse>({ 
      success: false,
      error: 'Failed to fetch storage usage',
      message: error.message 
    }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /coconut-v14/health
 * Health check endpoint
 */
app.get('/coconut-v14/health', (c) => {
  return c.json<ApiResponse>({ 
    success: true,
    data: {
      status: 'healthy',
      version: '14.0.0',
      phase: 1,
      timestamp: new Date().toISOString()
    }
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.notFound((c) => {
  return c.json<ApiResponse>({ 
    success: false,
    error: 'Not Found',
    message: `Route ${c.req.path} not found`
  }, 404);
});

// ============================================
// ERROR HANDLER
// ============================================

app.onError((err, c) => {
  console.error('❌ Unhandled error:', err);
  return c.json<ApiResponse>({ 
    success: false,
    error: 'Internal Server Error',
    message: err.message 
  }, 500);
});

export default app;