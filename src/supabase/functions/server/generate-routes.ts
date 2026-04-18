/**
 * GENERATE ROUTES
 * Universal /generate endpoint that handles both free and paid models
 * 
 * - Free models (Pollinations: zimage, flux, flux-pro, flux-realism, flux-anime, flux-3d, turbo) 
 *   → deduct FREE credits → Pollinations API
 * 
 * - Paid models (Kie AI: flux-2-pro, flux-2-flex) 
 *   → deduct PAID credits → Kie AI Flux 2
 */

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js';
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system
import * as kieAIImage from './kie-ai-image.ts'; // ✅ Kie AI image generation
import * as pollinations from './pollinations.tsx'; // ✅ NEW: Pollinations Enterprise API
import * as kv from './kv_store.tsx'; // ✅ FIX: Import KV store for tracking generations

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Free models that use Pollinations (FREE credits)
const FREE_MODELS = [
  'zimage',
  'seedream',      // ✅ ADDED
  'kontext',       // ✅ ADDED
  'nanobanana',    // ✅ ADDED
  'pollinations', 
  'flux',
  'flux-pro',
  'flux-realism',
  'flux-anime',
  'flux-3d',
  'turbo'
];

// Paid models that use Kie AI (PAID credits)
const PAID_MODELS = [
  'flux-2-pro',    // Kie AI exclusive
  'flux-2-flex'    // Kie AI exclusive
];

/**
 * POST /generate
 * Universal generation endpoint
 * 
 * Request format:
 * {
 *   prompt: string,
 *   options: {
 *     model: string,
 *     width: number,
 *     height: number,
 *     seed: number,
 *     referenceImages: string[],
 *     userId: string
 *   }
 * }
 */
app.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, options = {} } = body;

    console.log('🎨 /generate endpoint hit');
    console.log('📥 Payload:', { prompt: prompt?.substring(0, 50), model: options.model });

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.length < 3) {
      return c.json({
        success: false,
        error: 'Invalid prompt - must be at least 3 characters'
      }, 400);
    }

    const userId = options.userId || 'anonymous';
    const model = (options.model || 'zimage').toLowerCase();
    const seed = options.seed || Math.floor(Math.random() * 1000000);

    // Determine if free or paid model
    const isFreeModel = FREE_MODELS.includes(model);
    const isPaidModel = PAID_MODELS.includes(model);

    if (!isFreeModel && !isPaidModel) {
      return c.json({
        success: false,
        error: `Unknown model: ${model}`
      }, 400);
    }

    // ============================================
    // FREE MODELS - Use Pollinations + FREE credits
    // ============================================
    if (isFreeModel) {
      // ✅ FIX: Calculate cost based on reference images and enhance setting
      const referenceImageCount = options.referenceImages?.length || 0;
      // ✅ CRITICAL FIX: Accept both 'enhance' and 'enhancePrompt' (frontend sends enhancePrompt)
      const isEnhanceEnabled = options.enhance === true || options.enhancePrompt === true;
      const enhanceCost = isEnhanceEnabled ? 1 : 0; // +1 credit if enhance is enabled
      const refImageCost = Math.min(referenceImageCount, 8); // +1 credit per reference image (max 8)
      const cost = 1 + refImageCost + enhanceCost; // Base 1 + references + enhance

      console.log(`🆓 Free model detected: ${model}`);
      console.log(`💰 Cost breakdown:`, {
        base: 1,
        referenceImages: refImageCost,
        enhance: enhanceCost,
        total: cost
      });

      // Check free credits
      const userCredits = await CreditsSystem.getUserCredits(userId);

      if (userCredits.free < cost) {
        return c.json({
          success: false,
          error: `Not enough free credits. Need ${cost}, have ${userCredits.free}`
        }, 402);
      }

      // Deduct FREE credits
      const deductResult = await CreditsSystem.deductFreeCredits(userId, cost, `${model} image generation`);
      if (!deductResult.success) {
        return c.json({
          success: false,
          error: deductResult.error || 'Failed to deduct free credits'
        }, 500);
      }

      // ✅ Generate with Pollinations Enterprise API
      try {
        const result = await pollinations.generateImage({
          prompt,
          model,
          width: options.width || 1024,
          height: options.height || 1024,
          seed: seed,
          quality: options.quality || 'high',
          enhance: isEnhanceEnabled, // ✅ Use unified enhance flag
          referenceImages: options.referenceImages || [],
          negativePrompt: options.negativePrompt || '',
          userId
        });

        if (!result.success || !result.url) {
          // Refund FREE credits on failure
          console.error('❌ Pollinations generation failed:', result.error);
          await CreditsSystem.addFreeCredits(userId, cost, `Refund: Failed ${model} generation`);
          
          return c.json({
            success: false,
            error: result.error || 'Generation failed'
          }, 500);
        }

        console.log('✅ Free model generation successful');
        console.log('🔗 Image URL:', result.url);

        // ✅ FIX: Track generation for Creator Dashboard stats
        const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const generation = {
          id: generationId,
          userId,
          type: 'image',
          model,
          prompt,
          width: options.width || 1024,
          height: options.height || 1024,
          status: 'complete',
          result: {
            url: result.url,
            seed: result.seed || seed
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
          url: result.url,
          seed: result.seed || seed
        });
      } catch (genError: any) {
        // Refund FREE credits on failure
        console.error('❌ Pollinations generation error:', genError);
        await CreditsSystem.addFreeCredits(userId, cost, `Refund: Failed ${model} generation`);
        
        return c.json({
          success: false,
          error: genError.message || 'Generation failed'
        }, 500);
      }
    }

    // ============================================
    // PAID MODELS - Use Kie AI + PAID credits
    // ============================================
    if (isPaidModel) {
      console.log(`💎 Paid model detected: ${model}`);

      // Map model names to Kie AI models
      const modelMap: Record<string, 'flux-2-pro' | 'flux-2-flex'> = {
        'flux': 'flux-2-pro',
        'flux-pro': 'flux-2-pro',
        'flux-2-pro': 'flux-2-pro',
        'flux-realism': 'flux-2-pro',
        'flux-anime': 'flux-2-flex',
        'flux-3d': 'flux-2-flex',
        'flux-2-flex': 'flux-2-flex'
      };

      const kieAIModel = modelMap[model] || 'flux-2-pro';

      // Determine resolution from dimensions
      const width = options.width || 1024;
      const height = options.height || 1024;
      const totalPixels = width * height;
      
      let resolution: '1K' | '2K';
      if (totalPixels > 1048576) { // > 1024×1024
        resolution = '2K';
      } else {
        resolution = '1K';
      }

      // Calculate aspect ratio
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(width, height);
      const aspectW = width / divisor;
      const aspectH = height / divisor;
      const aspectRatio = `${aspectW}:${aspectH}` as '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'auto';

      const referenceImages = options.referenceImages || [];

      // ✅ FIX: Calculate cost (PAID credits) including enhance setting
      // ✅ CRITICAL FIX: Accept both 'enhance' and 'enhancePrompt' (frontend sends enhancePrompt)
      const isEnhanceEnabled = options.enhance === true || options.enhancePrompt === true;
      const enhanceCost = isEnhanceEnabled ? 1 : 0; // +1 credit if enhance is enabled
      const baseCost = kieAIImage.calculateKieAIImageCost(
        kieAIModel,
        resolution,
        referenceImages.length
      );
      const cost = baseCost + enhanceCost;

      console.log(`💰 Cost breakdown:`, {
        base: baseCost,
        enhance: enhanceCost,
        total: cost
      });

      // Check PAID credits
      const userCredits = await CreditsSystem.getUserCredits(userId);

      if (userCredits.paid < cost) {
        return c.json({
          success: false,
          error: `Not enough paid credits. Need ${cost}, have ${userCredits.paid}`
        }, 402);
      }

      // Deduct PAID credits
      const deductResult = await CreditsSystem.deductPaidCredits(userId, cost, `Kie AI ${kieAIModel} generation`);
      if (!deductResult.success) {
        return c.json({
          success: false,
          error: deductResult.error || 'Failed to deduct paid credits'
        }, 500);
      }

      // Generate with Kie AI
      try {
        const result = await kieAIImage.generateKieAIImage({
          prompt,
          model: kieAIModel,
          aspectRatio,
          resolution,
          referenceImages
        });

        console.log('✅ Paid model generation successful');

        return c.json({
          success: true,
          url: result.url,
          seed: result.taskId
        });
      } catch (genError: any) {
        // Refund PAID credits on failure
        console.error('❌ Kie AI generation failed:', genError);
        await CreditsSystem.addPaidCredits(userId, cost, `Refund: Failed ${kieAIModel} generation`);
        
        return c.json({
          success: false,
          error: genError.message || 'Generation failed'
        }, 500);
      }
    }

    // Should never reach here
    return c.json({
      success: false,
      error: 'Invalid model type'
    }, 400);

  } catch (error: any) {
    console.error('❌ /generate error:', error);
    return c.json({
      success: false,
      error: error.message || 'Internal server error'
    }, 500);
  }
});

export default app;