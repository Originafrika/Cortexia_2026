/**
 * Kie AI Z-Image Routes
 * Endpoints for NSFW-capable image generation
 */

import { Hono } from 'npm:hono';
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system
import * as kv from './kv_store.tsx';
import {
  createZImageTask,
  queryZImageStatus,
  calculateZImageCost,
  type ZImageInput
} from './kie-ai-z-image.ts';

const app = new Hono();

// Get the callback URL for this deployment
function getCallbackUrl(): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable not set');
  }
  return `${supabaseUrl}/functions/v1/make-server-e55aa214/z-image/kie-ai/callback`;
}

/**
 * POST /start
 * Start Z-Image generation
 */
app.post('/start', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, prompt, aspect_ratio = '1:1' } = body;

    console.log('[Z-Image API] Received generation request:', {
      userId,
      promptLength: prompt?.length,
      aspect_ratio
    });

    // Validate required parameters
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return c.json({ error: 'Valid prompt is required' }, 400);
    }

    if (prompt.length > 1000) {
      return c.json({ error: 'Prompt must be 1000 characters or less' }, 400);
    }

    // Validate aspect ratio
    const validRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
    if (!validRatios.includes(aspect_ratio)) {
      return c.json({ error: `Invalid aspect_ratio. Must be one of: ${validRatios.join(', ')}` }, 400);
    }

    // Check user credits
    const userCredits = await CreditsSystem.getUserCredits(userId);
    const cost = calculateZImageCost(aspect_ratio);

    console.log('[Z-Image API] Credit check:', {
      userId,
      available: userCredits.paid,
      required: cost
    });

    // Z-Image is premium only - requires paid credits
    if (userCredits.paid < cost) {
      return c.json({
        error: 'Insufficient paid credits for Z-Image generation',
        required: cost,
        available: userCredits.paid,
        message: 'Z-Image requires paid credits. Please purchase credits to continue.'
      }, 402);
    }

    // Deduct credits immediately
    console.log('[Z-Image API] 💰 Deducting', cost, 'paid credits from user:', userId);
    const deductResult = await CreditsSystem.deductCredits(userId, cost, 'paid');

    if (!deductResult.success) {
      return c.json({
        error: 'Failed to deduct credits',
        details: deductResult.error
      }, 500);
    }

    // Create Kie AI task immediately
    const input: ZImageInput = {
      prompt: prompt.trim(),
      aspect_ratio
    };

    // Get callback URL
    const callbackUrl = getCallbackUrl();
    console.log('[Z-Image API] Using callback URL:', callbackUrl);

    const taskResponse = await createZImageTask(input, callbackUrl);
    const kieAiTaskId = taskResponse.data.taskId;

    console.log('[Z-Image API] ✅ Kie AI task created:', kieAiTaskId);

    // Store task metadata with Kie AI taskId
    await kv.set(`z_image_task:${kieAiTaskId}`, {
      userId,
      status: 'processing',
      aspect_ratio,
      cost,
      createdAt: Date.now(),
      prompt,
      kieAiTaskId
    });

    console.log('[Z-Image API] 💾 Task metadata stored in KV, waiting for callback from Kie AI');

    // Return Kie AI taskId immediately
    return c.json({
      success: true,
      taskId: kieAiTaskId,
      status: 'processing',
      estimatedTime: '30-60 seconds',
      creditsUsed: cost,
      creditsRemaining: deductResult.remaining.paid
    });

  } catch (error) {
    console.error('[Z-Image API] Error starting generation:', error);
    return c.json({
      error: 'Failed to start generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /status/:taskId
 * Check status of async generation
 * This endpoint checks KV store first, then falls back to direct Kie AI polling if needed
 */
app.get('/status/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    console.log('[Z-Image API] Status check for:', taskId);

    const task = await kv.get(`z_image_task:${taskId}`);
    
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
        imageUrls: task.imageUrls,
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
    console.log('[Z-Image API] Task still processing, checking Kie AI API directly...');
    
    try {
      const kieAiStatus = await queryZImageStatus(taskId);
      
      console.log('[Z-Image API] Kie AI status:', kieAiStatus.data.state);

      // Handle success from direct check
      if (kieAiStatus.data.state === 'success') {
        console.log('[Z-Image API] ✅ Task completed (detected via direct check)');
        
        let imageUrls: string[] = [];
        if (kieAiStatus.data.resultJson) {
          try {
            const result = JSON.parse(kieAiStatus.data.resultJson);
            imageUrls = result.resultUrls || [];
          } catch (parseError) {
            console.error('[Z-Image API] Failed to parse resultJson:', parseError);
          }
        }

        // Update KV store
        await kv.set(`z_image_task:${taskId}`, {
          ...task,
          status: 'completed',
          imageUrls,
          completedAt: Date.now(),
          costTime: kieAiStatus.data.costTime,
          completeTime: kieAiStatus.data.completeTime
        });

        return c.json({
          success: true,
          status: 'completed',
          imageUrls,
          creditsUsed: task.cost,
          processingTime: Date.now() - task.createdAt
        });
      }

      // Handle failure from direct check
      if (kieAiStatus.data.state === 'fail') {
        console.error('[Z-Image API] ❌ Task failed (detected via direct check)');
        
        // Refund credits
        await CreditsSystem.refundCredits(task.userId, task.cost, 'paid');

        // Update KV store
        await kv.set(`z_image_task:${taskId}`, {
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
        estimatedTime: '30-60 seconds'
      });

    } catch (kieAiError) {
      console.error('[Z-Image API] Error checking Kie AI API:', kieAiError);
      // If Kie AI check fails, just return processing status
      return c.json({
        success: true,
        status: 'processing',
        estimatedTime: '30-60 seconds'
      });
    }

  } catch (error) {
    console.error('[Z-Image API] Status check error:', error);
    return c.json({
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /callback
 * Webhook endpoint to receive Z-Image completion notifications from Kie AI
 */
app.post('/callback', async (c) => {
  try {
    console.log('[Z-Image Callback] 📨 Received callback from Kie AI');
    
    const body = await c.req.json();
    console.log('[Z-Image Callback] Payload:', JSON.stringify(body, null, 2));

    const { code, data, msg } = body;

    if (!data || !data.taskId) {
      console.error('[Z-Image Callback] Invalid callback payload - missing taskId');
      return c.json({ error: 'Invalid callback payload' }, 400);
    }

    const taskId = data.taskId;
    console.log('[Z-Image Callback] Processing callback for task:', taskId);

    // Get existing task metadata
    const task = await kv.get(`z_image_task:${taskId}`);
    if (!task) {
      console.error('[Z-Image Callback] Task not found in KV store:', taskId);
      return c.json({ error: 'Task not found' }, 404);
    }

    // Handle success
    if (code === 200 && data.state === 'success') {
      console.log('[Z-Image Callback] ✅ Task completed successfully:', taskId);
      
      let imageUrls: string[] = [];
      if (data.resultJson) {
        try {
          const result = JSON.parse(data.resultJson);
          imageUrls = result.resultUrls || [];
          console.log('[Z-Image Callback] Image URLs:', imageUrls);
        } catch (parseError) {
          console.error('[Z-Image Callback] Failed to parse resultJson:', parseError);
        }
      }

      // Update task status
      await kv.set(`z_image_task:${taskId}`, {
        ...task,
        status: 'completed',
        imageUrls,
        completedAt: Date.now(),
        costTime: data.costTime,
        completeTime: data.completeTime
      });

      console.log('[Z-Image Callback] 💾 Task marked as completed in KV store');
      return c.json({ success: true, message: 'Callback processed successfully' });
    }

    // Handle failure
    if (code === 501 || data.state === 'fail') {
      console.error('[Z-Image Callback] ❌ Task failed:', taskId, 'Error:', data.failMsg);
      
      // Refund credits
      console.log('[Z-Image Callback] 💰 Refunding', task.cost, 'credits to user:', task.userId);
      await CreditsSystem.refundCredits(task.userId, task.cost, 'paid');

      // Update task status
      await kv.set(`z_image_task:${taskId}`, {
        ...task,
        status: 'failed',
        error: data.failMsg || 'Generation failed',
        failCode: data.failCode,
        failedAt: Date.now()
      });

      console.log('[Z-Image Callback] 💾 Task marked as failed in KV store');
      return c.json({ success: true, message: 'Failure callback processed' });
    }

    // Unknown state
    console.warn('[Z-Image Callback] ⚠️ Unknown callback state:', data.state);
    return c.json({ success: true, message: 'Callback received but state not final' });

  } catch (error) {
    console.error('[Z-Image Callback] Error processing callback:', error);
    return c.json({
      error: 'Failed to process callback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;