/**
 * COCONUT V14 - VIDEO ROUTES
 * Complete video generation orchestration with multi-shot workflow
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { handleAnalyzeVideoIntent } from './coconut-v14-video-analyzer.ts';
import type { VideoAnalysisResponse, VideoShot } from './coconut-v14-video-analyzer.ts';

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
    
    // ✅ DEDUCT CREDITS BEFORE GENERATION
    const creditsKey = `user:${userId}:credits`;
    const creditsData = await kv.get(creditsKey);
    
    if (!creditsData) {
      return c.json({ error: 'User credits not found' }, 404);
    }
    
    const credits = typeof creditsData === 'string' ? JSON.parse(creditsData) : creditsData;
    
    // Check if user has enough paid credits
    if (credits.paid < totalCost) {
      return c.json({ 
        error: 'Insufficient credits',
        required: totalCost,
        available: credits.paid
      }, 400);
    }
    
    // Deduct credits
    credits.paid -= totalCost;
    await kv.set(creditsKey, credits);
    
    console.log(`✅ Deducted ${totalCost} credits from user ${userId}`);
    console.log(`   Remaining: ${credits.paid} paid credits`);

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

    // Start orchestration (non-blocking)
    orchestrateVideoGeneration(jobId, cocoBoard, shots).catch(err => {
      console.error(`❌ Video orchestration failed for job ${jobId}:`, err);
    });

    return c.json({
      success: true,
      jobId,
      estimatedCost: job.estimatedCost,
      totalShots: shots.length
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
  const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
  const KIE_AI_BASE_URL = 'https://api.kie.ai';
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  try {
    // ✅ SENIOR-LEVEL: Support both models and resolutions
    const videoModel = (shot as any).videoModel || 'veo3_fast'; // veo3_fast (10cr) or veo3 (40cr)
    const videoResolution = (shot as any).videoResolution || '1080p'; // 720p or 1080p
    
    // Prepare request
    const requestBody: any = {
      prompt: shot.veoPrompt,
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
    
    // Poll for result (max 5 minutes)
    const maxAttempts = 60; // 60 × 5s = 5 minutes
    const pollInterval = 5000; // 5 seconds
    
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
    
    throw new Error('Generation timeout (5 minutes)');
    
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
  try {
    console.log(`🎬 Starting video orchestration for job: ${jobId}`);
    console.log(`📊 Total shots to generate: ${shots.length}`);
    
    const job = await kv.get(`coconut:video:job:${jobId}`) as VideoGenerationJob;
    if (!job) {
      throw new Error('Job not found');
    }

    job.status = 'generating';
    job.progress = 5;
    await kv.set(`coconut:video:job:${jobId}`, job);

    const generatedShots: { shotId: string; videoUrl: string }[] = [];
    let totalCost = 100; // Analysis cost

    // Generate each shot sequentially
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎥 Shot ${i + 1}/${shots.length}: ${shot.id}`);
      console.log(`   Prompt: ${shot.veoPrompt.substring(0, 100)}...`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      // Update job progress
      job.currentShot = i + 1;
      job.progress = 5 + Math.floor((i / shots.length) * 85);
      job.shots[i].status = 'generating';
      await kv.set(`coconut:video:job:${jobId}`, job);

      try {
        console.log(`   🔄 Calling Kie AI for shot ${i + 1}...`);
        const videoResult = await generateShotWithKieAI(shot, cocoBoard);

        // Check if generation succeeded
        if (!videoResult.success || !videoResult.url) {
          const errorMsg = videoResult.error || 'Video generation failed';
          console.error(`   ❌ Shot ${i + 1} failed: ${errorMsg}`);
          throw new Error(errorMsg);
        }

        // Save result
        generatedShots.push({
          shotId: shot.id,
          videoUrl: videoResult.url
        });

        job.shots[i].status = 'completed';
        job.shots[i].videoUrl = videoResult.url;
        
        totalCost += shot.estimatedCost;

        console.log(`   ✅ Shot ${i + 1}/${shots.length} completed successfully`);
        console.log(`   📹 Video URL: ${videoResult.url.substring(0, 60)}...`);
        console.log(`   📊 Progress: ${generatedShots.length}/${shots.length} shots done\n`);

      } catch (error) {
        console.error(`\n❌❌❌ CRITICAL ERROR on shot ${i + 1}/${shots.length} ❌❌❌`);
        console.error(`Shot ID: ${shot.id}`);
        console.error(`Error:`, error);
        console.error(`Stack:`, error instanceof Error ? error.stack : 'No stack');
        console.error(`❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n`);
        
        job.shots[i].status = 'failed';
        job.shots[i].error = error instanceof Error ? error.message : 'Unknown error';
        
        // ✅ CONTINUE generating remaining shots even if one fails
        console.log(`⚠️ Continuing with remaining ${shots.length - i - 1} shots...\n`);
      }

      await kv.set(`coconut:video:job:${jobId}`, job);
    }

    // All shots complete
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎉 VIDEO ORCHESTRATION COMPLETE`);
    console.log(`   Total shots: ${shots.length}`);
    console.log(`   Successful: ${generatedShots.length}`);
    console.log(`   Failed: ${shots.length - generatedShots.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    job.status = 'completed';
    job.progress = 100;
    job.actualCost = totalCost;
    job.completedAt = new Date().toISOString();

    // Note: For MVP, we return individual shots
    // In production, you could use ffmpeg to assemble into final video
    // For now, frontend will display shots individually

    await kv.set(`coconut:video:job:${jobId}`, job);

    // ✅ NEW: Add video to user's generation history
    const generationRecord = {
      id: jobId,
      userId: job.userId,
      type: 'video' as const,
      cocoBoardId: job.cocoBoardId,
      status: 'completed' as const,
      resultUrl: generatedShots[0]?.videoUrl, // First shot as thumbnail/preview
      thumbnail: generatedShots[0]?.videoUrl,
      shots: generatedShots,
      totalShots: shots.length,
      successfulShots: generatedShots.length,
      credits: totalCost,
      cost: totalCost,
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

    console.log(`✅ Video orchestration complete: ${jobId}`);
    console.log(`   Shots: ${generatedShots.length}/${shots.length} successful`);
    console.log(`   Cost: ${totalCost} credits`);

  } catch (error) {
    console.error(`❌ Video orchestration error:`, error);
    
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

export default app;