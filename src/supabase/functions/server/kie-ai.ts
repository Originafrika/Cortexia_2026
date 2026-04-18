/**
 * KIE AI VIDEO GENERATION INTEGRATION
 * Veo 3.1 Fast & Quality models
 */

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system
import * as kv from './kv_store.tsx'; // ✅ FIX: Import KV store for tracking

const app = new Hono();

const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
const KIE_AI_BASE_URL = 'https://api.kie.ai';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

/**
 * Generate video with Veo 3.1
 */
app.post('/video/generate', async (c) => {
  try {
    const body = await c.req.json();
    const {
      prompt,
      model = 'veo3_fast', // veo3_fast or veo3
      generationType = 'TEXT_2_VIDEO', // TEXT_2_VIDEO, FIRST_AND_LAST_FRAMES_2_VIDEO, REFERENCE_2_VIDEO
      imageUrls = [],
      aspectRatio = '16:9', // '16:9', '9:16', 'Auto'
      seeds,
      watermark,
      userId = 'anonymous'
    } = body;

    console.log('🎬 Generating video with Kie AI:', {
      model,
      generationType,
      aspectRatio,
      imageCount: imageUrls.length
    });

    // Validate
    if (!prompt) {
      return c.json({
        success: false,
        error: 'Prompt is required'
      }, 400);
    }

    // Call Kie AI API
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/veo/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        model,
        generationType,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        aspectRatio,
        seeds,
        watermark,
        enableTranslation: true,
        callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-e55aa214/video/callback`
      })
    });

    const result = await response.json();

    console.log('Kie AI response:', result);

    if (result.code === 200 && result.data?.taskId) {
      // Store task in KV for tracking
      const taskData = {
        taskId: result.data.taskId,
        userId,
        prompt,
        model,
        generationType,
        aspectRatio,
        imageCount: imageUrls.length,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await kv.set(`video_task:${result.data.taskId}`, taskData);

      return c.json({
        success: true,
        taskId: result.data.taskId,
        message: 'Video generation started'
      });
    } else {
      console.error('Kie AI error:', result);
      return c.json({
        success: false,
        error: result.msg || 'Video generation failed',
        code: result.code
      }, 400);
    }

  } catch (error) {
    console.error('Error generating video:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get video generation status
 */
app.get('/video/status/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');

    console.log('📊 Checking video status:', taskId);

    // Call Kie AI API
    const response = await fetch(
      `${KIE_AI_BASE_URL}/api/v1/veo/record-info?taskId=${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`
        }
      }
    );

    const result = await response.json();

    if (result.code !== 200) {
      return c.json({
        success: false,
        error: result.msg || 'Failed to get video status'
      }, 400);
    }

    const data = result.data;

    // Map status
    let status = 'pending';
    if (data.successFlag === 1) {
      status = 'completed';
    } else if (data.successFlag === 2 || data.successFlag === 3) {
      status = 'failed';
    }

    const response_data: any = {
      success: true,
      taskId: data.taskId,
      status,
      createdAt: data.createTime,
      completedAt: data.completeTime
    };

    // If completed, include video URLs
    if (status === 'completed' && data.response) {
      response_data.resultUrls = data.response.resultUrls || [];
      response_data.originUrls = data.response.originUrls || [];
      response_data.resolution = data.response.resolution || '720p';

      // Download and store in Supabase Storage
      if (data.response.resultUrls && data.response.resultUrls.length > 0) {
        const videoUrl = data.response.resultUrls[0];
        
        try {
          // Download video
          const videoResponse = await fetch(videoUrl);
          const videoBlob = await videoResponse.arrayBuffer();

          // Upload to Supabase Storage
          const filename = `${taskId}_${Date.now()}.mp4`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('make-e55aa214-videos')
            .upload(filename, videoBlob, {
              contentType: 'video/mp4',
              upsert: true
            });

          if (uploadError) {
            console.error('Storage upload error:', uploadError);
          } else {
            // Get signed URL (valid for 24h)
            const { data: signedData } = await supabase.storage
              .from('make-e55aa214-videos')
              .createSignedUrl(filename, 86400); // 24h

            if (signedData) {
              response_data.storedUrl = signedData.signedUrl;
            }
          }
        } catch (storageError) {
          console.error('Error storing video:', storageError);
          // Continue without stored URL
        }
      }

      // Update KV with result
      await kv.set(`video_result:${taskId}`, response_data);

      // ✅ FIX: Track video generation for Creator Dashboard stats
      // Get userId from original task
      const taskKey = await kv.get(`video_task:${taskId}`);
      if (taskKey && typeof taskKey === 'string') {
        try {
          const taskInfo = JSON.parse(taskKey);
          const userId = taskInfo.userId || 'anonymous';
          
          const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const generation = {
            id: generationId,
            userId,
            type: 'video',
            model: taskInfo.model,
            prompt: taskInfo.prompt,
            aspectRatio: taskInfo.aspectRatio,
            generationType: taskInfo.generationType,
            status: 'complete',
            result: {
              url: response_data.resultUrls?.[0],
              storedUrl: response_data.storedUrl,
              resolution: response_data.resolution
            },
            cost: taskInfo.model === 'veo3' ? 8 : 4, // veo3 = 8 credits, veo3_fast = 4 credits
            createdAt: response_data.createdAt,
            completedAt: response_data.completedAt,
            startTime: new Date(response_data.createdAt).getTime(),
            endTime: new Date(response_data.completedAt).getTime()
          };

          // Save generation record
          await kv.set(`generation:${generationId}`, generation);

          // Add to user's generation index
          const userGenKey = `user:${userId}:generations`;
          const userGenerations = await kv.get(userGenKey) || [];
          userGenerations.unshift(generationId); // Add to beginning (newest first)
          await kv.set(userGenKey, userGenerations);

          console.log(`✅ Tracked video generation ${generationId} for user ${userId}`);
        } catch (parseError) {
          console.error('Failed to parse task info for tracking:', parseError);
        }
      }
    }

    // If failed, include error
    if (status === 'failed') {
      response_data.errorCode = data.errorCode;
      response_data.errorMessage = data.errorMessage;
    }

    return c.json(response_data);

  } catch (error) {
    console.error('Error checking video status:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Callback endpoint for Kie AI
 */
app.post('/video/callback', async (c) => {
  try {
    const body = await c.req.json();
    const { code, msg, data } = body;

    console.log('📞 Received callback from Kie AI:', {
      taskId: data?.taskId,
      code,
      msg
    });

    if (code === 200 && data?.taskId) {
      // Store callback result
      await kv.set(`video_callback:${data.taskId}`, body);

      // Download and store video if available
      if (data.info?.resultUrls && data.info.resultUrls.length > 0) {
        const videoUrl = data.info.resultUrls[0];
        
        try {
          const videoResponse = await fetch(videoUrl);
          const videoBlob = await videoResponse.arrayBuffer();

          const filename = `${data.taskId}_${Date.now()}.mp4`;
          await supabase.storage
            .from('make-e55aa214-videos')
            .upload(filename, videoBlob, {
              contentType: 'video/mp4',
              upsert: true
            });

          console.log('✅ Video stored in Supabase Storage:', filename);
        } catch (storageError) {
          console.error('Error storing video:', storageError);
        }
      }
    }

    return c.json({ code: 200, msg: 'success' });

  } catch (error) {
    console.error('Error processing callback:', error);
    return c.json({ code: 500, msg: 'error' }, 500);
  }
});

/**
 * Get 1080P video
 */
app.get('/video/1080p/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const index = c.req.query('index') || '0';

    console.log('📹 Getting 1080P video:', taskId);

    const response = await fetch(
      `${KIE_AI_BASE_URL}/api/v1/veo/get-1080p-video?taskId=${taskId}&index=${index}`,
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`
        }
      }
    );

    const result = await response.json();

    if (result.code === 200 && result.data?.resultUrl) {
      // Download and store
      try {
        const videoResponse = await fetch(result.data.resultUrl);
        const videoBlob = await videoResponse.arrayBuffer();

        const filename = `${taskId}_1080p_${Date.now()}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('make-e55aa214-videos')
          .upload(filename, videoBlob, {
            contentType: 'video/mp4',
            upsert: true
          });

        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('make-e55aa214-videos')
            .createSignedUrl(filename, 86400);

          return c.json({
            success: true,
            url: signedData?.signedUrl || result.data.resultUrl,
            resolution: '1080p'
          });
        }
      } catch (storageError) {
        console.error('Error storing 1080p video:', storageError);
      }

      return c.json({
        success: true,
        url: result.data.resultUrl,
        resolution: '1080p'
      });
    }

    return c.json({
      success: false,
      error: result.msg || 'Failed to get 1080P video'
    }, 400);

  } catch (error) {
    console.error('Error getting 1080P video:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Extend video
 */
app.post('/video/extend', async (c) => {
  try {
    const body = await c.req.json();
    const {
      taskId,
      prompt,
      seeds,
      watermark,
      userId = 'anonymous'
    } = body;

    console.log('➕ Extending video:', taskId);

    if (!taskId || !prompt) {
      return c.json({
        success: false,
        error: 'taskId and prompt are required'
      }, 400);
    }

    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/veo/extend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`
      },
      body: JSON.stringify({
        taskId,
        prompt,
        seeds,
        watermark,
        callBackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-e55aa214/video/callback`
      })
    });

    const result = await response.json();

    if (result.code === 200 && result.data?.taskId) {
      // Store extend task
      await kv.set(`video_extend:${result.data.taskId}`, {
        extendTaskId: result.data.taskId,
        originalTaskId: taskId,
        userId,
        prompt,
        createdAt: new Date().toISOString()
      });

      return c.json({
        success: true,
        taskId: result.data.taskId,
        message: 'Video extension started'
      });
    }

    return c.json({
      success: false,
      error: result.msg || 'Video extension failed'
    }, 400);

  } catch (error) {
    console.error('Error extending video:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;