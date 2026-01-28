/**
 * COCONUT V14 - VIDEO ROUTES
 * Complete video generation orchestration with multi-shot workflow
 */

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import type { VideoShot, VideoAnalysisResponse } from './coconut-v14-video-analyzer.ts';
import { handleAnalyzeVideoIntent } from './coconut-v14-video-analyzer.ts';
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system
import { sanitizePrompt, detectProblematicPatterns } from './coconut-v14-prompt-sanitizer.ts'; // ✅ Import sanitizer

const app = new Hono().basePath('/coconut-v14/video'); // ✅ FIX: Add basePath

// ============================================================================
// TYPES
// ============================================================================

interface VideoCocoBoardData {
  id: string;
  userId: string;
  projectId?: string;
  analysis: VideoAnalysisResponse;
  editedShots?: VideoShot[]; // User can edit shots in CocoBoard
  createdAt: string;
  updatedAt: string;
}

interface VideoGenerationJob {
  id: string;
  cocoBoardId: string;
  userId: string;
  status: 'queued' | 'analyzing' | 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  currentShot?: number;
  totalShots: number;
  shots: {
    shotId: string;
    order: number;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
  }[];
  finalVideoUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  estimatedCost: number;
  actualCost?: number;
}

// ============================================================================
// ANALYZE VIDEO INTENT
// ============================================================================

/**
 * POST /coconut-v14/video/analyze
 * Analyze video brief and generate production plan
 */
app.post('/analyze', async (c) => {
  return handleAnalyzeVideoIntent(c);
});

// ============================================================================
// CREATE VIDEO COCOBOARD
// ============================================================================

/**
 * POST /coconut-v14/video/cocoboard/create
 * Save video CocoBoard from analysis
 */
app.post('/cocoboard/create', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, projectId, analysis } = body;

    if (!userId || !analysis) {
      return c.json({ error: 'Missing userId or analysis' }, 400);
    }

    const cocoBoardId = `video-cocoboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const cocoBoardData: VideoCocoBoardData = {
      id: cocoBoardId,
      userId,
      projectId,
      analysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`coconut:video:cocoboard:${cocoBoardId}`, cocoBoardData);

    console.log(`✅ Video CocoBoard created: ${cocoBoardId}`);

    return c.json({
      success: true,
      cocoBoardId,
      data: cocoBoardData
    });

  } catch (error) {
    console.error('❌ Create video CocoBoard error:', error);
    return c.json({
      error: 'Failed to create video CocoBoard',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================================================
// UPDATE VIDEO COCOBOARD
// ============================================================================

/**
 * PUT /coconut-v14/video/cocoboard/:id
 * Update CocoBoard (edit shots, reorder, etc.)
 */
app.put('/cocoboard/:id', async (c) => {
  try {
    const cocoBoardId = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`coconut:video:cocoboard:${cocoBoardId}`) as VideoCocoBoardData;
    
    if (!existing) {
      return c.json({ error: 'CocoBoard not found' }, 404);
    }

    const updated: VideoCocoBoardData = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`coconut:video:cocoboard:${cocoBoardId}`, updated);

    console.log(`✅ Video CocoBoard updated: ${cocoBoardId}`);

    return c.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('❌ Update video CocoBoard error:', error);
    return c.json({
      error: 'Failed to update video CocoBoard',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================================================
// GET VIDEO COCOBOARD
// ============================================================================

/**
 * GET /coconut-v14/video/cocoboard/:id
 * Retrieve CocoBoard data
 */
app.get('/cocoboard/:id', async (c) => {
  try {
    const cocoBoardId = c.req.param('id');
    const cocoBoard = await kv.get(`coconut:video:cocoboard:${cocoBoardId}`) as VideoCocoBoardData;

    if (!cocoBoard) {
      return c.json({ error: 'CocoBoard not found' }, 404);
    }

    return c.json({
      success: true,
      data: cocoBoard
    });

  } catch (error) {
    console.error('❌ Get video CocoBoard error:', error);
    return c.json({
      error: 'Failed to get video CocoBoard',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================================================
// GENERATE SINGLE SHOT (INTERNAL WORKER ENDPOINT)
// ============================================================================

/**
 * POST /coconut-v14/video/generate-single-shot
 * Generate a single video shot (called by orchestration worker)
 * This endpoint has a shorter execution time to avoid timeouts
 */
app.post('/generate-single-shot', async (c) => {
  try {
    const { jobId, shotIndex, shot, cocoBoardId } = await c.req.json();

    if (!jobId || shotIndex === undefined || !shot || !cocoBoardId) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎥 SINGLE SHOT GENERATION: ${shot.id} (Shot ${shotIndex + 1})`);
    console.log(`   Job: ${jobId}`);
    console.log(`   Prompt: ${shot.veoPrompt.substring(0, 100)}...`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Get job and cocoboard
    const job = await kv.get(`coconut:video:job:${jobId}`) as VideoGenerationJob;
    const cocoBoard = await kv.get(`coconut:video:cocoboard:${cocoBoardId}`) as VideoCocoBoardData;
    
    if (!job || !cocoBoard) {
      return c.json({ error: 'Job or CocoBoard not found' }, 404);
    }

    // Update job status
    job.shots[shotIndex].status = 'generating';
    job.currentShot = shotIndex + 1;
    job.progress = 5 + Math.floor((shotIndex / job.totalShots) * 85);
    await kv.set(`coconut:video:job:${jobId}`, job);

    // ✅ NEW: Check if we should use FIRST_AND_LAST_FRAMES for inter-shot consistency
    let shotToGenerate = shot;
    if (shotIndex > 0 && shot.generationType === 'TEXT_2_VIDEO') {
      const previousShotJob = job.shots[shotIndex - 1];
      if (previousShotJob && previousShotJob.status === 'completed' && previousShotJob.videoUrl) {
        console.log(`   🔗 INTER-SHOT CONSISTENCY: Using previous shot's last frame`);
        console.log(`   📹 Previous shot URL: ${previousShotJob.videoUrl.substring(0, 60)}...`);
        
        shotToGenerate = {
          ...shot,
          generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
          sourceVideoUrl: previousShotJob.videoUrl
        };
      }
    }

    // Generate the shot
    const videoResult = await generateShotWithKieAI(shotToGenerate, cocoBoard);

    if (!videoResult.success || !videoResult.url) {
      const errorMsg = videoResult.error || 'Video generation failed';
      console.error(`   ❌ Shot ${shotIndex + 1} failed: ${errorMsg}`);
      
      // Mark shot as failed
      job.shots[shotIndex].status = 'failed';
      job.shots[shotIndex].error = errorMsg;
      await kv.set(`coconut:video:job:${jobId}`, job);
      
      // ⚠️ CRITICAL: Continue to next shot even if this one failed
      console.log(`   ⚠️ Continuing to next shot despite failure...`);
      await triggerNextShot(jobId, shotIndex + 1, cocoBoard);
      
      return c.json({
        success: false,
        error: errorMsg
      }, 500);
    }

    // Update job with success
    job.shots[shotIndex].status = 'completed';
    job.shots[shotIndex].videoUrl = videoResult.url;
    await kv.set(`coconut:video:job:${jobId}`, job);

    console.log(`   ✅ Shot ${shotIndex + 1} completed successfully`);
    console.log(`   📹 Video URL: ${videoResult.url.substring(0, 60)}...\n`);

    // ✅ CHAIN OF RESPONSIBILITY: Trigger next shot automatically
    const hasMoreShots = shotIndex + 1 < job.totalShots;
    
    if (hasMoreShots) {
      console.log(`   🔗 Triggering next shot (${shotIndex + 2}/${job.totalShots})...`);
      await triggerNextShot(jobId, shotIndex + 1, cocoBoard);
    } else {
      console.log(`   🎉 All shots completed! Finalizing job...`);
      await finalizeJob(jobId, cocoBoard);
    }

    return c.json({
      success: true,
      videoUrl: videoResult.url
    });

  } catch (error) {
    console.error('❌ Single shot generation error:', error);
    return c.json({
      error: 'Failed to generate shot',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================================================
// GENERATE VIDEO (ORCHESTRATION)
// ============================================================================

/**
 * POST /coconut-v14/video/generate
 * Start multi-shot video generation orchestration
 */
app.post('/generate', async (c) => {
  try {
    const { cocoBoardId, userId } = await c.req.json();

    if (!cocoBoardId || !userId) {
      return c.json({ error: 'Missing cocoBoardId or userId' }, 400);
    }

    // Get CocoBoard
    const cocoBoard = await kv.get(`coconut:video:cocoboard:${cocoBoardId}`) as VideoCocoBoardData;
    
    if (!cocoBoard) {
      return c.json({ error: 'CocoBoard not found' }, 404);
    }

    // Use edited shots if available, otherwise use original analysis
    const shots = cocoBoard.editedShots || cocoBoard.analysis.shots;

    // Calculate total cost
    const totalCost = 100 + shots.reduce((sum, shot) => sum + shot.estimatedCost, 0);
    
    console.log(`💰 Total cost for video generation: ${totalCost} credits`);
    
    // ✅ USE CREDITS MANAGER instead of direct KV access
    console.log(`💳 Getting user credits for userId: ${userId}...`);
    const userCredits = await CreditsSystem.getUserCredits(userId);
    
    console.log(`💳 User credits retrieved:`, userCredits);
    const availableBalance = userCredits.free + userCredits.paid;
    console.log(`💰 Total available: ${availableBalance} credits (free: ${userCredits.free}, paid: ${userCredits.paid})`);
    console.log(`💰 Required: ${totalCost} credits`);
    
    // Check if user has enough credits (prioritize paid for Coconut)
    if (userCredits.paid < totalCost) {
      console.error(`❌ Insufficient credits: ${userCredits.paid} paid credits < ${totalCost} required`);
      return c.json({ 
        error: 'Insufficient credits',
        required: totalCost,
        available: userCredits.paid,
        message: `Coconut V14 requires ${totalCost} paid credits. You have ${userCredits.paid} paid credits available.`
      }, 400);
    }
    
    // ✅ DEDUCT CREDITS using credits manager
    const deductResult = await CreditsSystem.deductCredits(userId, totalCost);
    
    if (!deductResult.success) {
      console.error(`❌ Failed to deduct credits:`, deductResult.error);
      return c.json({ 
        error: 'Failed to deduct credits',
        message: deductResult.error || 'Unknown error'
      }, 500);
    }
    
    console.log(`✅ Deducted ${totalCost} credits from user ${userId}`);
    console.log(`   Remaining: ${deductResult.remaining?.paid || 0} paid credits`);

    // Create generation job
    const jobId = `video-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: VideoGenerationJob = {
      id: jobId,
      cocoBoardId,
      userId,
      status: 'queued',
      progress: 0,
      currentShot: 0,
      totalShots: shots.length,
      shots: shots.map(shot => ({
        shotId: shot.id,
        order: shot.order,
        status: 'pending'
      })),
      estimatedCost: totalCost,
      createdAt: new Date().toISOString()
    };

    await kv.set(`coconut:video:job:${jobId}`, job);

    console.log(`✅ Video generation job created: ${jobId} (${shots.length} shots)`);
    console.log(`🚀🚀🚀 ABOUT TO START ORCHESTRATION - job ${jobId} 🚀🚀🚀`);
    
    // Start orchestration (non-blocking)
    orchestrateVideoGeneration(jobId, cocoBoard, shots).catch(err => {
      console.error(`❌ Video orchestration failed for job ${jobId}:`, err);
      console.error(`❌ Stack:`, err.stack);
    });

    console.log(`🔄 Orchestration promise created for job ${jobId}`);
    
    return c.json({
      success: true,
      jobId,
      status: 'queued',
      totalShots: shots.length,
      estimatedCost: totalCost
    });

  } catch (error) {
    console.error('❌ Generate video error:', error);
    return c.json({
      error: 'Failed to start video generation',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================================================
// ORCHESTRATE VIDEO GENERATION (BACKGROUND)
// ============================================================================

/**
 * HELPER: Generate single shot with Kie AI Veo 3.1
 * ✅ FIXED: Actually calls Kie AI instead of using mock
 */
async function generateShotWithKieAI(shot: VideoShot, cocoBoard: VideoCocoBoardData): Promise<{ success: boolean; url?: string; error?: string }> {
  // ✅ CHECK MOCK MODE - Skip actual generation if in mock mode
  const USE_MOCK_GENERATION = Deno.env.get('USE_MOCK_VIDEO_GENERATION') !== 'false'; // Default true
  
  if (USE_MOCK_GENERATION) {
    console.log(`📦 MOCK MODE - Simulating video generation (no API calls)`);
    console.log(`   Shot: ${shot.id}`);
    console.log(`   Type: ${shot.generationType}`);
    console.log(`   Duration: ${shot.duration}s`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock video URL (placeholder)
    const mockVideoUrl = `https://mock-video-storage.example.com/videos/mock-shot-${shot.id}-${Date.now()}.mp4`;
    
    console.log(`   ✅ Mock video generated: ${mockVideoUrl}`);
    
    return {
      success: true,
      url: mockVideoUrl
    };
  }
  
  // Original real generation code continues below
  const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
  const KIE_AI_BASE_URL = 'https://api.kie.ai';
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  try {
    // ✅ SANITIZE PROMPT to avoid content policy violations
    const sanitizationResult = sanitizePrompt(shot.veoPrompt);
    const promptToUse = sanitizationResult.sanitized;
    
    if (sanitizationResult.modified) {
      console.log(`   🛡️ Prompt sanitized (${sanitizationResult.appliedRules.length} rules applied):`);
      sanitizationResult.appliedRules.forEach(rule => {
        console.log(`      - ${rule}`);
      });
      console.log(`   📝 Original: ${shot.veoPrompt.substring(0, 80)}...`);
      console.log(`   ✅ Sanitized: ${promptToUse.substring(0, 80)}...`);
    }
    
    // ✅ Detect remaining problematic patterns
    const issues = detectProblematicPatterns(promptToUse);
    if (issues.length > 0) {
      console.log(`   ⚠️ Potential content policy issues detected:`);
      issues.forEach(issue => {
        console.log(`      - ${issue}`);
      });
    }
    
    // ✅ SENIOR-LEVEL: Support both models and resolutions
    const videoModel = (shot as any).videoModel || 'veo3_fast'; // veo3_fast (10cr) or veo3 (40cr)
    const videoResolution = (shot as any).videoResolution || '1080p'; // 720p or 1080p
    
    // Prepare request
    const requestBody: any = {
      prompt: promptToUse, // ✅ Use sanitized prompt
      model: videoModel, // ✅ Dynamic model selection
      generationType: shot.generationType,
      aspectRatio: shot.aspectRatio,
      resolution: videoResolution, // ✅ 1080p for senior-level quality
      enableTranslation: true
    };
    
    // Add images if present
    if (shot.imageUrls && shot.imageUrls.length > 0) {
      requestBody.imageUrls = shot.imageUrls;
    }
    
    // ✅ NEW: Support EXTEND_VIDEO (prolonger une vidéo existante)
    if (shot.generationType === 'EXTEND_VIDEO' && shot.extendFromVideoUrl) {
      requestBody.videoUrl = shot.extendFromVideoUrl;
      requestBody.generationType = 'EXTEND_VIDEO';
      console.log(`   🎬 EXTEND VIDEO mode: extending from ${shot.extendFromVideoUrl.substring(0, 60)}...`);
    }
    
    // ✅ NEW: Support VIDEO_2_VIDEO (transformer une vidéo)
    if (shot.generationType === 'VIDEO_2_VIDEO' && shot.sourceVideoUrl) {
      requestBody.videoUrl = shot.sourceVideoUrl;
      requestBody.generationType = 'VIDEO_2_VIDEO';
      console.log(`   🎬 VIDEO-TO-VIDEO mode: transforming ${shot.sourceVideoUrl.substring(0, 60)}...`);
    }
    
    // ✅ Add seeds for deterministic reproduction if provided
    if ((shot as any).videoSeeds) {
      requestBody.seeds = (shot as any).videoSeeds;
    }
    
    // ✅ Add watermark if provided
    if ((shot as any).videoWatermark) {
      requestBody.watermark = (shot as any).videoWatermark;
    }
    
    console.log(`   📡 Calling Kie AI Veo 3.1...`);
    console.log(`   Model: ${videoModel} (${videoModel === 'veo3' ? 'QUALITY' : 'FAST'})`);
    console.log(`   Resolution: ${videoResolution}`);
    console.log(`   Type: ${shot.generationType}`);
    console.log(`   Aspect: ${shot.aspectRatio}`);
    
    // Call Kie AI
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/veo/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    if (result.code !== 200 || !result.data?.taskId) {
      throw new Error(result.msg || 'Kie AI generation failed');
    }
    
    const taskId = result.data.taskId;
    console.log(`   ⏳ Task created: ${taskId}`);
    console.log(`   ⏳ Polling for completion...`);
    
    // Poll for result (max 10 minutes for image-to-video)
    const maxAttempts = 120; // 120 × 5s = 10 minutes
    const pollInterval = 5000; // 5 seconds
    
    console.log(`   ⏳ Starting polling (max ${maxAttempts} attempts = ${(maxAttempts * pollInterval) / 60000} minutes, ${pollInterval}ms interval)...`);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(
        `${KIE_AI_BASE_URL}/api/v1/veo/record-info?taskId=${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`
          }
        }
      );
      
      const statusResult = await statusResponse.json();
      
      if (statusResult.code !== 200) {
        console.log(`   ⏳ Polling (${attempt + 1}/${maxAttempts})...`);
        continue;
      }
      
      const data = statusResult.data;
      
      // Check status
      if (data.successFlag === 1) {
        // Success
        const videoUrl = data.response?.resultUrls?.[0] || data.response?.originUrls?.[0];
        
        if (!videoUrl) {
          throw new Error('No video URL returned');
        }
        
        console.log(`   ✅ Video generated successfully`);
        console.log(`   URL: ${videoUrl.substring(0, 60)}...`);
        
        return {
          success: true,
          url: videoUrl
        };
      } else if (data.successFlag === 2 || data.successFlag === 3) {
        // Failed
        throw new Error(data.errorMsg || 'Generation failed');
      }
      
      // Still pending, continue polling
      if (attempt % 6 === 0) {
        console.log(`   ⏳ Still generating... (${attempt * 5}s elapsed)`);
      }
    }
    
    throw new Error('Generation timeout (10 minutes)');
    
  } catch (error) {
    console.error(`   ❌ Kie AI error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function orchestrateVideoGeneration(
  jobId: string,
  cocoBoard: VideoCocoBoardData,
  shots: VideoShot[]
) {
  console.log(`🔥🔥🔥 ORCHESTRATION STARTED - job ${jobId} 🔥🔥🔥`);
  console.log(`   📊 Total shots: ${shots.length}`);
  console.log(`   📋 CocoBoard ID: ${cocoBoard.id}`);
  console.log(`   🏗️ Using CHAIN OF RESPONSIBILITY pattern (each shot triggers the next)`);
  
  try {
    const job = await kv.get(`coconut:video:job:${jobId}`) as VideoGenerationJob;
    if (!job) {
      throw new Error('Job not found');
    }

    job.status = 'generating';
    job.progress = 5;
    await kv.set(`coconut:video:job:${jobId}`, job);

    // ✅ PRODUCTION SOLUTION: Only trigger the FIRST shot
    // Each shot will auto-trigger the next one when it completes
    // This avoids timeout issues and scales infinitely
    console.log(`🚀 Triggering first shot (1/${shots.length})...`);
    await triggerNextShot(jobId, 0, cocoBoard);
    
    console.log(`✅ Orchestration complete! Chain started.`);
    console.log(`   Shots will process sequentially in background.`);
    console.log(`   Monitor via GET /generate/${jobId}/status`);

  } catch (error) {
    console.error(`❌ WORKER: Video orchestration error:`, error);
    
    const job = await kv.get(`coconut:video:job:${jobId}`) as VideoGenerationJob;
    if (job) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      await kv.set(`coconut:video:job:${jobId}`, job);
    }
  }
}

// ============================================================================
// GET VIDEO GENERATION STATUS
// ============================================================================

/**
 * GET /coconut-v14/video/generate/:jobId/status
 * Get generation job status
 */
app.get('/generate/:jobId/status', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    const job = await kv.get(`coconut:video:job:${jobId}`) as VideoGenerationJob;

    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    return c.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('❌ Get video job status error:', error);
    return c.json({
      error: 'Failed to get job status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Trigger the next shot in the job
 */
async function triggerNextShot(jobId: string, nextShotIndex: number, cocoBoard: VideoCocoBoardData) {
  const job = await kv.get(`coconut:video:job:${jobId}`) as VideoGenerationJob;
  
  if (!job) {
    console.error(`❌ Job not found: ${jobId}`);
    return;
  }
  
  // ✅ Get the actual shot data from cocoBoard
  const shots = cocoBoard.editedShots || cocoBoard.analysis.shots;
  const nextShot = shots[nextShotIndex];
  
  if (!nextShot) {
    console.error(`❌ Next shot not found: ${nextShotIndex}`);
    return;
  }
  
  console.log(`   🔗 Triggering next shot (${nextShotIndex + 1}/${job.totalShots})...`);
  
  // ✅ Get Supabase URL from environment
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return;
  }
  
  // ✅ NON-BLOCKING: Fire and forget (don't wait for completion)
  // The shot will auto-trigger the next one when it's done
  fetch(`${SUPABASE_URL}/functions/v1/make-server-e55aa214/coconut-v14/video/generate-single-shot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      jobId,
      shotIndex: nextShotIndex,
      shot: nextShot,
      cocoBoardId: cocoBoard.id
    })
  }).catch(err => {
    console.error(`❌ Failed to trigger shot ${nextShotIndex + 1}:`, err);
  });
  
  console.log(`   ✅ Shot ${nextShotIndex + 1} dispatched (processing in background)`);
}

/**
 * Finalize the job when all shots are completed
 */
async function finalizeJob(jobId: string, cocoBoard: VideoCocoBoardData) {
  const job = await kv.get(`coconut:video:job:${jobId}`) as VideoGenerationJob;
  
  if (!job) {
    console.error(`❌ Job not found: ${jobId}`);
    return;
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎉 WORKER: VIDEO ORCHESTRATION COMPLETE`);
  console.log(`   Total shots: ${job.totalShots}`);
  console.log(`   Successful: ${job.shots.filter(s => s.status === 'completed').length}`);
  console.log(`   Failed: ${job.shots.filter(s => s.status === 'failed').length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  job.status = 'completed';
  job.progress = 100;
  job.actualCost = job.estimatedCost;
  job.completedAt = new Date().toISOString();

  await kv.set(`coconut:video:job:${jobId}`, job);

  // ✅ Add video to user's generation history
  const successfulShots = job.shots.filter(s => s.status === 'completed' && s.videoUrl);
  
  const generationRecord = {
    id: jobId,
    userId: job.userId,
    type: 'video' as const,
    cocoBoardId: job.cocoBoardId,
    status: 'completed' as const,
    resultUrl: successfulShots[0]?.videoUrl, // First shot as thumbnail/preview
    thumbnail: successfulShots[0]?.videoUrl,
    shots: successfulShots.map(s => ({ shotId: s.shotId, videoUrl: s.videoUrl! })),
    totalShots: job.totalShots,
    successfulShots: successfulShots.length,
    credits: job.estimatedCost,
    cost: job.estimatedCost,
    prompt: {
      description: cocoBoard.analysis.storyboard || 'Video generation',
      videoType: cocoBoard.analysis.videoType || 'commercial',
      duration: cocoBoard.analysis.videoLength || 30
    },
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    isFavorite: false
  };

  // Store generation
  await kv.set(`generation:${jobId}`, generationRecord);

  // Add to user's generations list
  const userGens = await kv.get(`user:${job.userId}:generations`) || [];
  userGens.unshift(jobId);
  await kv.set(`user:${job.userId}:generations`, userGens);

  console.log(`✅ Video added to user history: ${jobId}`);
  console.log(`✅ WORKER: Video orchestration complete: ${jobId}`);
  console.log(`   Shots: ${successfulShots.length}/${job.totalShots} successful`);
  console.log(`   Cost: ${job.estimatedCost} credits`);
}

export default app;