/**
 * Kie AI Avatar Routes (InfiniteTalk)
 * Endpoints for AI lip-sync talking avatar generation
 */

import { Hono } from 'npm:hono';
import * as credits from './credits.tsx';
import * as kv from './kv_store.tsx';
import {
  createInfiniteTalkTask,
  pollInfiniteTalkTask,
  calculateInfiniteTalkCost,
  type InfiniteTalkInput
} from './kie-ai-infinitalk.ts';

const app = new Hono();

// Get the callback URL for this deployment
function getCallbackUrl(): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable not set');
  }
  return `${supabaseUrl}/functions/v1/make-server-e55aa214/avatar/kie-ai/infinitalk/callback`;
}

/**
 * POST /infinitalk/start
 * Start async talking avatar generation (returns taskId immediately)
 */
app.post('/infinitalk/start', async (c) => {
  try {
    console.log('[InfiniteTalk API] Received start request');

    // Parse request body
    const body = await c.req.json();
    const {
      userId = 'anonymous',
      image_url,
      audio_url,
      prompt,
      resolution = '480p',
      seed
    } = body;

    console.log('[InfiniteTalk API] Request from user:', userId);

    // Validate required fields
    if (!image_url || !audio_url || !prompt) {
      return c.json({
        error: 'Missing required fields: image_url, audio_url, prompt'
      }, 400);
    }

    // Validate resolution
    if (resolution !== '480p' && resolution !== '720p') {
      return c.json({
        error: 'Invalid resolution. Must be 480p or 720p'
      }, 400);
    }

    // Calculate cost
    const cost = calculateInfiniteTalkCost(resolution);

    // Get user credits
    const userCredits = await credits.getUserCredits(userId);
    
    console.log('[InfiniteTalk API] User credits:', {
      userId,
      paidCredits: userCredits.paid,
      required: cost
    });

    // Check if user has enough credits
    if (userCredits.paid < cost) {
      return c.json({
        error: `Insufficient paid credits. Required: ${cost}, Available: ${userCredits.paid}`,
        requiredCredits: cost,
        availableCredits: userCredits.paid,
        breakdown: {
          baseGeneration: cost,
          total: cost
        }
      }, 402);
    }

    // Deduct credits BEFORE generation
    const deductResult = await credits.deductCredits(userId, cost, 'paid');
    if (!deductResult.success) {
      return c.json({
        error: deductResult.error || 'Failed to deduct credits'
      }, 500);
    }

    console.log('[InfiniteTalk API] Credits deducted:', {
      userId,
      deducted: cost,
      remaining: deductResult.remaining.paid
    });

    // Create Kie AI task immediately
    const input: InfiniteTalkInput = {
      image_url,
      audio_url,
      prompt,
      resolution,
      ...(seed && { seed })
    };

    // Get callback URL
    const callbackUrl = getCallbackUrl();
    console.log('[InfiniteTalk API] Using callback URL:', callbackUrl);

    const taskResponse = await createInfiniteTalkTask(input, callbackUrl);
    const kieAiTaskId = taskResponse.data.taskId;

    console.log('[InfiniteTalk API] ✅ Kie AI task created:', kieAiTaskId);

    // Store task metadata with Kie AI taskId
    await kv.set(`infinitalk_task:${kieAiTaskId}`, {
      userId,
      status: 'processing',
      resolution,
      cost,
      createdAt: Date.now(),
      image_url,
      audio_url,
      prompt,
      seed,
      kieAiTaskId // Store the real Kie AI task ID
    });

    console.log('[InfiniteTalk API] 💾 Task metadata stored in KV, waiting for callback from Kie AI');

    // Return Kie AI taskId immediately
    return c.json({
      success: true,
      taskId: kieAiTaskId, // Return Kie AI's taskId
      status: 'processing',
      estimatedTime: '2-10 minutes',
      creditsUsed: cost,
      creditsRemaining: deductResult.remaining.paid
    });

  } catch (error) {
    console.error('[InfiniteTalk API] Start error:', error);
    return c.json({
      error: 'Failed to start generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /infinitalk/status/:taskId
 * Check status of async generation
 * This endpoint checks KV store first, then falls back to direct Kie AI polling if needed
 */
app.get('/infinitalk/status/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    console.log('[InfiniteTalk API] Status check for:', taskId);

    const task = await kv.get(`infinitalk_task:${taskId}`);
    
    if (!task) {
      return c.json({
        error: 'Task not found'
      }, 404);
    }

    // If already completed or failed, return immediately
    if (task.status === 'completed') {
      return c.json({
        success: true,
        status: 'completed',
        videoUrls: task.videoUrls,
        creditsUsed: task.cost,
        processingTime: task.completedAt - task.createdAt
      });
    } else if (task.status === 'failed') {
      return c.json({
        success: false,
        status: 'failed',
        error: task.error || 'Generation failed'
      });
    }

    // Task is still processing - check Kie AI API directly (fallback if callback didn't work)
    console.log('[InfiniteTalk API] Task still processing, checking Kie AI API directly...');
    
    try {
      const kieAiStatus = await import('./kie-ai-infinitalk.ts').then(m => m.queryInfiniteTalkStatus(taskId));
      
      console.log('[InfiniteTalk API] Kie AI status:', kieAiStatus.data.state);

      // Handle success from direct check
      if (kieAiStatus.data.state === 'success') {
        console.log('[InfiniteTalk API] ✅ Task completed (detected via direct check)');
        
        let videoUrls: string[] = [];
        if (kieAiStatus.data.resultJson) {
          try {
            const result = JSON.parse(kieAiStatus.data.resultJson);
            videoUrls = result.resultUrls || [];
          } catch (parseError) {
            console.error('[InfiniteTalk API] Failed to parse resultJson:', parseError);
          }
        }

        // Update KV store
        await kv.set(`infinitalk_task:${taskId}`, {
          ...task,
          status: 'completed',
          videoUrls,
          completedAt: Date.now(),
          costTime: kieAiStatus.data.costTime,
          completeTime: kieAiStatus.data.completeTime
        });

        return c.json({
          success: true,
          status: 'completed',
          videoUrls,
          creditsUsed: task.cost,
          processingTime: Date.now() - task.createdAt
        });
      }

      // Handle failure from direct check
      if (kieAiStatus.data.state === 'fail') {
        console.error('[InfiniteTalk API] ❌ Task failed (detected via direct check)');
        
        // Refund credits
        await import('./credits.tsx').then(m => m.refundCredits(task.userId, task.cost, 'paid'));

        // Update KV store
        await kv.set(`infinitalk_task:${taskId}`, {
          ...task,
          status: 'failed',
          error: kieAiStatus.data.failMsg || 'Generation failed',
          failCode: kieAiStatus.data.failCode,
          failedAt: Date.now()
        });

        return c.json({
          success: false,
          status: 'failed',
          error: kieAiStatus.data.failMsg || 'Generation failed'
        });
      }

      // Still processing
      return c.json({
        success: true,
        status: 'processing',
        kieAiState: kieAiStatus.data.state,
        estimatedTime: '2-10 minutes'
      });

    } catch (kieAiError) {
      console.error('[InfiniteTalk API] Error checking Kie AI API:', kieAiError);
      // If Kie AI check fails, just return processing status
      return c.json({
        success: true,
        status: 'processing',
        estimatedTime: '2-10 minutes'
      });
    }

  } catch (error) {
    console.error('[InfiniteTalk API] Status check error:', error);
    return c.json({
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /infinitalk/callback
 * Webhook endpoint to receive InfiniteTalk completion notifications from Kie AI
 */
app.post('/infinitalk/callback', async (c) => {
  try {
    console.log('[InfiniteTalk Callback] 📨 Received callback from Kie AI');
    
    const body = await c.req.json();
    console.log('[InfiniteTalk Callback] Payload:', JSON.stringify(body, null, 2));

    // According to Kie AI docs, callback structure is identical to Query Task API response
    const { code, data, msg } = body;

    if (!data || !data.taskId) {
      console.error('[InfiniteTalk Callback] Invalid callback payload - missing taskId');
      return c.json({ error: 'Invalid callback payload' }, 400);
    }

    const taskId = data.taskId;
    console.log('[InfiniteTalk Callback] Processing callback for task:', taskId);

    // Get existing task metadata
    const task = await kv.get(`infinitalk_task:${taskId}`);
    if (!task) {
      console.error('[InfiniteTalk Callback] Task not found in KV store:', taskId);
      return c.json({ error: 'Task not found' }, 404);
    }

    // Handle success
    if (code === 200 && data.state === 'success') {
      console.log('[InfiniteTalk Callback] ✅ Task completed successfully:', taskId);
      
      let videoUrls: string[] = [];
      if (data.resultJson) {
        try {
          const result = JSON.parse(data.resultJson);
          videoUrls = result.resultUrls || [];
          console.log('[InfiniteTalk Callback] Video URLs:', videoUrls);
        } catch (parseError) {
          console.error('[InfiniteTalk Callback] Failed to parse resultJson:', parseError);
        }
      }

      // Update task status
      await kv.set(`infinitalk_task:${taskId}`, {
        ...task,
        status: 'completed',
        videoUrls,
        completedAt: Date.now(),
        costTime: data.costTime,
        completeTime: data.completeTime
      });

      console.log('[InfiniteTalk Callback] 💾 Task marked as completed in KV store');
      return c.json({ success: true, message: 'Callback processed successfully' });
    }

    // Handle failure
    if (code === 501 || data.state === 'fail') {
      console.error('[InfiniteTalk Callback] ❌ Task failed:', taskId, 'Error:', data.failMsg);
      
      // Refund credits
      console.log('[InfiniteTalk Callback] 💰 Refunding', task.cost, 'credits to user:', task.userId);
      await credits.refundCredits(task.userId, task.cost, 'paid');

      // Update task status
      await kv.set(`infinitalk_task:${taskId}`, {
        ...task,
        status: 'failed',
        error: data.failMsg || 'Generation failed',
        failCode: data.failCode,
        failedAt: Date.now()
      });

      console.log('[InfiniteTalk Callback] 💾 Task marked as failed in KV store');
      return c.json({ success: true, message: 'Failure callback processed' });
    }

    // Unknown state
    console.warn('[InfiniteTalk Callback] ⚠️ Unknown callback state:', data.state);
    return c.json({ success: true, message: 'Callback received but state not final' });

  } catch (error) {
    console.error('[InfiniteTalk Callback] Error processing callback:', error);
    return c.json({
      error: 'Failed to process callback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;