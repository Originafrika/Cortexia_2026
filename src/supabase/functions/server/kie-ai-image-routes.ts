/**
 * KIE AI IMAGE GENERATION ROUTES
 * Flux 2 Pro & Flex + Nano Banana Pro text-to-image with reference images
 */

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kieAIImage from './kie-ai-image.ts';
import * as nanoBanana from './kie-ai-nanobanana.ts';
import * as credits from './credits.tsx';
import * as kv from './kv_store.tsx'; // ✅ FIX: Import KV store for tracking generations

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

/**
 * Generate image with Flux 2 Pro/Flex
 * POST /image/kie-ai/generate
 */
app.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const {
      prompt,
      model = 'flux-2-pro', // 'flux-2-pro' or 'flux-2-flex'
      aspectRatio = '1:1',
      resolution = '1K', // '1K' or '2K'
      referenceImages = [],
      userId = 'anonymous'
    } = body;

    console.log('🎨 Generating Kie AI image:', {
      model,
      resolution,
      aspectRatio,
      referenceImageCount: referenceImages.length,
      userId
    });

    // Validate
    if (!prompt || prompt.length < 3 || prompt.length > 5000) {
      return c.json({
        success: false,
        error: 'Prompt must be between 3 and 5000 characters'
      }, 400);
    }

    if (!['flux-2-pro', 'flux-2-flex'].includes(model)) {
      return c.json({
        success: false,
        error: 'Invalid model. Must be flux-2-pro or flux-2-flex'
      }, 400);
    }

    if (!['1K', '2K'].includes(resolution)) {
      return c.json({
        success: false,
        error: 'Invalid resolution. Must be 1K or 2K'
      }, 400);
    }

    // Calculate cost
    const cost = kieAIImage.calculateKieAIImageCost(
      model as 'flux-2-pro' | 'flux-2-flex',
      resolution as '1K' | '2K',
      referenceImages.length
    );

    console.log(`💰 Cost: ${cost} paid credits (${referenceImages.length} ref images)`);

    // Check credits (PAID credits only)
    const userCredits = await credits.getUserCredits(userId);
    
    if (userCredits.paidCredits < cost) {
      return c.json({
        success: false,
        error: `Insufficient paid credits. Required: ${cost}, Available: ${userCredits.paidCredits}`,
        requiredCredits: cost,
        availableCredits: userCredits.paidCredits,
        breakdown: {
          baseGeneration: resolution === '1K' ? 1 : 2,
          referenceImages: referenceImages.length,
          total: cost
        }
      }, 402); // Payment Required
    }

    // Deduct credits BEFORE generation
    const deductResult = await credits.deductCredits(userId, cost, 'paid');
    if (!deductResult.success) {
      return c.json({
        success: false,
        error: deductResult.error || 'Failed to deduct credits'
      }, 500);
    }

    console.log(`✅ Deducted ${cost} paid credits from ${userId}`);

    try {
      // Generate image
      const result = await kieAIImage.generateKieAIImage({
        prompt,
        model: model as 'flux-2-pro' | 'flux-2-flex',
        aspectRatio: aspectRatio as any,
        resolution: resolution as '1K' | '2K',
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined
      });

      console.log('✅ Kie AI image generated:', result.url);

      // ✅ FIX: Track generation for Creator Dashboard stats
      const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const generation = {
        id: generationId,
        userId,
        type: 'image',
        model,
        prompt,
        resolution,
        aspectRatio,
        status: 'complete',
        result: {
          url: result.url,
          taskId: result.taskId
        },
        cost,
        createdAt: new Date().toISOString(),
        startTime: Date.now(),
        endTime: Date.now()
      };

      // Save generation record
      await kv.set(`generation:${generationId}`, generation);

      // Add to user's generation index
      const userGenKey = `user:${userId}:generations`;
      const userGenerations = await kv.get(userGenKey) || [];
      userGenerations.unshift(generationId); // Add to beginning (newest first)
      await kv.set(userGenKey, userGenerations);

      console.log(`✅ Tracked generation ${generationId} for user ${userId}`);

      // Store in Supabase Storage (optional - for persistence)
      // TODO: Implement if needed

      return c.json({
        success: true,
        url: result.url,
        taskId: result.taskId,
        cost,
        model,
        resolution,
        aspectRatio,
        referenceImageCount: referenceImages.length,
        remainingCredits: userCredits.paidCredits - cost
      });

    } catch (genError) {
      // Generation failed - refund credits
      console.error('❌ Generation failed, refunding credits:', genError);
      
      await credits.refundCredits(userId, cost, 'paid');
      
      throw genError; // Re-throw to outer catch
    }

  } catch (error) {
    console.error('❌ Kie AI image generation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500);
  }
});

/**
 * Query task status
 * GET /image/kie-ai/status/:taskId
 */
app.get('/status/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');

    if (!taskId) {
      return c.json({
        success: false,
        error: 'Task ID is required'
      }, 400);
    }

    console.log('📊 Querying Kie AI image task status:', taskId);

    const status = await kieAIImage.queryKieAIImageStatus(taskId);

    return c.json({
      success: true,
      taskId: status.taskId,
      state: status.state,
      model: status.model,
      result: status.resultJson ? JSON.parse(status.resultJson) : null,
      error: status.failMsg,
      costTime: status.costTime,
      completeTime: status.completeTime,
      createTime: status.createTime
    });

  } catch (error) {
    console.error('❌ Kie AI status query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500);
  }
});

/**
 * Generate image with Nano Banana Pro
 * POST /image/kie-ai/nano-banana
 */
app.post('/nano-banana', async (c) => {
  try {
    const body = await c.req.json();
    const {
      prompt,
      imageInput = [],
      aspectRatio = '1:1',
      resolution = '1K', // '1K', '2K', or '4K'
      outputFormat = 'png',
      userId = 'anonymous'
    } = body;

    console.log('🍌 Generating Nano Banana Pro image:', {
      resolution,
      aspectRatio,
      outputFormat,
      imageInputCount: imageInput.length,
      userId
    });

    // Validate
    if (!prompt || prompt.length < 3 || prompt.length > 10000) {
      return c.json({
        success: false,
        error: 'Prompt must be between 3 and 10000 characters'
      }, 400);
    }

    if (!['1K', '2K', '4K'].includes(resolution)) {
      return c.json({
        success: false,
        error: 'Invalid resolution. Must be 1K, 2K, or 4K'
      }, 400);
    }

    if (imageInput.length > 8) {
      return c.json({
        success: false,
        error: 'Maximum 8 input images allowed'
      }, 400);
    }

    // Calculate cost
    const cost = nanoBanana.calculateNanoBananaCost(
      resolution as '1K' | '2K' | '4K',
      imageInput.length
    );

    console.log(`💰 Cost: ${cost} paid credits (${imageInput.length} input images)`);

    // Check credits (PAID credits only)
    const userCredits = await credits.getUserCredits(userId);
    
    if (userCredits.paidCredits < cost) {
      return c.json({
        success: false,
        error: `Insufficient paid credits. Required: ${cost}, Available: ${userCredits.paidCredits}`,
        requiredCredits: cost,
        availableCredits: userCredits.paidCredits,
        breakdown: {
          baseGeneration: resolution === '4K' ? 10 : (resolution === '2K' ? 6 : 3),
          inputImages: imageInput.length,
          total: cost
        }
      }, 402); // Payment Required
    }

    // Deduct credits BEFORE generation
    const deductResult = await credits.deductCredits(userId, cost, 'paid');
    if (!deductResult.success) {
      return c.json({
        success: false,
        error: deductResult.error || 'Failed to deduct credits'
      }, 500);
    }

    console.log(`✅ Deducted ${cost} paid credits from ${userId}`);

    try {
      // Generate image
      const imageUrl = await nanoBanana.generateWithNanoBananaPro({
        prompt,
        imageInput: imageInput.length > 0 ? imageInput : undefined,
        aspectRatio: aspectRatio as any,
        resolution: resolution as '1K' | '2K' | '4K',
        outputFormat: outputFormat as 'png' | 'jpg'
      });

      console.log('✅ Nano Banana Pro image generated:', imageUrl);

      // ✅ FIX: Track generation for Creator Dashboard stats
      const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const generation = {
        id: generationId,
        userId,
        type: 'image',
        model: 'nano-banana-pro',
        prompt,
        resolution,
        aspectRatio,
        outputFormat,
        status: 'complete',
        result: {
          url: imageUrl
        },
        cost,
        createdAt: new Date().toISOString(),
        startTime: Date.now(),
        endTime: Date.now()
      };

      // Save generation record
      await kv.set(`generation:${generationId}`, generation);

      // Add to user's generation index
      const userGenKey = `user:${userId}:generations`;
      const userGenerations = await kv.get(userGenKey) || [];
      userGenerations.unshift(generationId); // Add to beginning (newest first)
      await kv.set(userGenKey, userGenerations);

      console.log(`✅ Tracked generation ${generationId} for user ${userId}`);

      return c.json({
        success: true,
        url: imageUrl,
        cost,
        model: 'nano-banana-pro',
        resolution,
        aspectRatio,
        outputFormat,
        inputImageCount: imageInput.length,
        remainingCredits: userCredits.paidCredits - cost
      });

    } catch (genError) {
      // Generation failed - refund credits
      console.error('❌ Generation failed, refunding credits:', genError);
      
      await credits.refundCredits(userId, cost, 'paid');
      
      throw genError; // Re-throw to outer catch
    }

  } catch (error) {
    console.error('❌ Nano Banana Pro generation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500);
  }
});

export default app;