/**
 * UNIFIED AI SERVICE
 * Routes between Pollinations (free tier) and Kie AI (premium tier)
 * based on user status, credits, and generation requirements
 */

import * as Pollinations from './pollinations';
import * as Kie from './kie';
import * as Cloudflare from './cloudflare';
import * as Credits from '../credits/service';
import * as RuleOf60 from '../creator/rule-of-60';

export type GenerationTier = 'free' | 'premium';

export interface GenerationRequest {
  userId: string;
  prompt: string;
  type: 'image' | 'video' | 'text';
  model?: string;
  options?: {
    aspectRatio?: string;
    resolution?: string;
    referenceImages?: string[];
    negativePrompt?: string;
    enhance?: boolean;
  };
}

export interface GenerationResponse {
  success: boolean;
  tier: GenerationTier;
  result?: {
    url: string;
    taskId?: string;
    model: string;
    seed?: number;
    watermark?: boolean;
  };
  error?: string;
  creditsDeducted?: number;
  remainingCredits?: number;
  freeGenerationsRemaining?: number;
}

export interface TierInfo {
  tier: GenerationTier;
  reason: string;
  availableCredits: number;
  freeGenerationsRemaining: number;
  hasCoconutAccess: boolean;
}

/**
 * Determine which tier to use for a generation
 * 
 * STRATEGY:
 * - Pollinations FREE models (flux, zimage, klein) → free tier
 * - Pollinations PAID models (seedream, wan, etc.) → premium tier (Kie AI)
 * - Top Creators → premium tier (unlimited)
 * - Users with credits → premium tier
 */
export async function determineTier(
  userId: string,
  requestedModel?: string,
  redis?: { get: (key: string) => Promise<string | null> }
): Promise<TierInfo> {
  // Check if user has Coconut access (Top Creator benefit)
  const creatorStatus = await RuleOf60.getRuleOf60Status(userId);
  const streakInfo = await RuleOf60.getStreakInfo(userId);
  
  // If user is Top Creator, they get free premium access
  if (creatorStatus.isEligible) {
    return {
      tier: 'premium',
      reason: 'Top Creator - free premium access',
      availableCredits: 999999, // Unlimited for Top Creators
      freeGenerationsRemaining: 999999,
      hasCoconutAccess: true,
    };
  }
  
  // Check credit balance
  const creditBalance = await Credits.getCreditBalance(userId);
  const availableCredits = creditBalance.premium + creditBalance.free;
  
  // Check free generations remaining
  let freeRemaining = 0;
  if (redis) {
    const freeStatus = await Pollinations.checkFreeGenerationsRemaining(userId, redis);
    freeRemaining = freeStatus.remaining;
  }
  
  // Check if requesting a Pollinations PAID model → route to premium (Kie AI)
  if (requestedModel && Pollinations.isPaidModel(requestedModel)) {
    const creditBalance = await Credits.getCreditBalance(userId);
    const availableCredits = creditBalance.premium + creditBalance.free;
    
    if (availableCredits > 0) {
      return {
        tier: 'premium',
        reason: `Premium model requested (${requestedModel}) - using Kie AI`,
        availableCredits,
        freeGenerationsRemaining: 0,
        hasCoconutAccess: false,
      };
    } else {
      return {
        tier: 'free',
        reason: `Model ${requestedModel} requires credits. Available free models: flux, zimage, klein`,
        availableCredits: 0,
        freeGenerationsRemaining: 0,
        hasCoconutAccess: false,
      };
    }
  }
  
  // Check if requesting a Pollinations FREE model → free tier
  if (requestedModel && Pollinations.isFreeTierModel(requestedModel)) {
    // Continue to free tier logic below
  }
  
  // If requesting a premium model explicitly, require credits
  if (requestedModel && isPremiumModel(requestedModel)) {
    const cost = Kie.calculateGenerationCost(requestedModel as Kie.KieAIModel);
    
    if (availableCredits >= cost) {
      return {
        tier: 'premium',
        reason: `Premium model requested (${cost} credits)`,
        availableCredits,
        freeGenerationsRemaining: freeRemaining,
        hasCoconutAccess: false,
      };
    } else {
      return {
        tier: 'free',
        reason: `Insufficient credits for premium model (need ${cost}, have ${availableCredits})`,
        availableCredits,
        freeGenerationsRemaining: freeRemaining,
        hasCoconutAccess: false,
      };
    }
  }
  
  // Default logic: use free tier if available, otherwise premium if has credits
  if (freeRemaining > 0) {
    return {
      tier: 'free',
      reason: 'Free tier available',
      availableCredits,
      freeGenerationsRemaining: freeRemaining,
      hasCoconutAccess: false,
    };
  }
  
  if (availableCredits > 0) {
    return {
      tier: 'premium',
      reason: 'Free tier exhausted, using credits',
      availableCredits,
      freeGenerationsRemaining: 0,
      hasCoconutAccess: false,
    };
  }
  
  // No credits and no free generations
  return {
    tier: 'free',
    reason: 'No credits available - free tier only (limited)',
    availableCredits: 0,
    freeGenerationsRemaining: 0,
    hasCoconutAccess: false,
  };
}

/**
 * Check if a model is premium-only
 */
function isPremiumModel(model: string): boolean {
  const premiumModels = [
    'flux-2-pro', 'flux-2-flex', 'nanobanana',
    'veo-3', 'veo-3-fast', 'kling', 'wan',
    'gemini-3-flash'
  ];
  return premiumModels.some(pm => model.toLowerCase().includes(pm));
}

/**
 * Generate content using appropriate tier
 */
export async function generate(
  request: GenerationRequest,
  redis: { get: (key: string) => Promise<string | null>; set: (key: string, value: string, options?: { ex: number }) => Promise<void> }
): Promise<GenerationResponse> {
  const { userId, type, prompt, model, options } = request;
  
  // Determine tier
  const tierInfo = await determineTier(userId, model, redis);
  
  // Generate based on tier
  if (tierInfo.tier === 'free') {
    return generateFreeTier(request, redis, tierInfo);
  } else {
    return generatePremiumTier(request, tierInfo);
  }
}

/**
 * Generate using free tier (5/day limit)
 * PRIMARY: Cloudflare AI (cheaper backend)
 * FALLBACK: Pollinations (if Cloudflare fails)
 */
async function generateFreeTier(
  request: GenerationRequest,
  redis: { get: (key: string) => Promise<string | null>; set: (key: string, value: string, options?: { ex: number }) => Promise<void> },
  tierInfo: TierInfo
): Promise<GenerationResponse> {
  const { userId, type, prompt, options } = request;

  // Check 5/day limit first
  const freeStatus = await Pollinations.checkFreeGenerationsRemaining(userId, redis);
  
  if (freeStatus.remaining <= 0) {
    return {
      success: false,
      tier: 'free',
      error: 'Daily free generation limit reached (5/day). Please upgrade or wait until tomorrow.',
      freeGenerationsRemaining: 0,
    };
  }

  // PRIMARY: Try Cloudflare AI for images (cheaper backend)
  if (type === 'image' && Cloudflare.isCloudflareConfigured()) {
    try {
      const result = await Cloudflare.generateCloudflareImage({
        prompt,
        model: 'flux-1-schnell',
        width: 512,
        height: 512,
        steps: 4,
      });

      if (result.success && result.imageUrl) {
        await RuleOf60.recordGeneration(userId, { type: 'image', model: 'flux-1-schnell' });

        return {
          success: true,
          tier: 'free',
          result: {
            url: result.imageUrl,
            model: 'flux-1-schnell',
            watermark: true,
          },
          freeGenerationsRemaining: freeStatus.remaining - 1,
        };
      }

      // If Cloudflare failed with budget error, fall through to Pollinations
      if (result.error?.includes('Platform budget')) {
        console.log('Cloudflare budget exhausted, falling back to Pollinations');
      }
    } catch (error) {
      console.error('Cloudflare generation failed:', error);
      // Fall through to Pollinations
    }
  }

  // FALLBACK: Use Pollinations
  return generatePollinationsFreeTier(request, redis, tierInfo);
}

/**
 * Generate using Pollinations free tier (FALLBACK)
 */
async function generatePollinationsFreeTier(
  request: GenerationRequest,
  redis: { get: (key: string) => Promise<string | null>; set: (key: string, value: string, options?: { ex: number }) => Promise<void> },
  tierInfo: TierInfo
): Promise<GenerationResponse> {
  const { userId, type, prompt, options } = request;
  
  // Check free generations remaining
  const freeStatus = await Pollinations.checkFreeGenerationsRemaining(userId, redis);
  
  if (freeStatus.remaining <= 0) {
    return {
      success: false,
      tier: 'free',
      error: 'Daily free generation limit reached (5/day). Please upgrade or wait until tomorrow.',
      freeGenerationsRemaining: 0,
    };
  }
  
  try {
    if (type === 'image') {
      const result = await Pollinations.generateFreeImage({
        prompt,
        model: (options?.aspectRatio?.includes('9:16') ? 'flux' : 'flux') as Pollinations.FreeTierModel,
        width: options?.resolution?.includes('2K') ? 1024 : 1024,
        height: options?.resolution?.includes('2K') ? 1024 : 1024,
        negativePrompt: options?.negativePrompt,
        enhance: options?.enhance ?? true,
        nologo: false, // Always watermark for free
      });
      
      // Record usage
      await Pollinations.recordFreeGeneration(userId, redis);
      await RuleOf60.recordGeneration(userId, { type: 'image', model: 'flux-schnell' });
      
      return {
        success: true,
        tier: 'free',
        result: {
          url: result.url,
          model: result.model,
          seed: result.seed,
          watermark: result.usedWatermark,
        },
        freeGenerationsRemaining: freeStatus.remaining - 1,
      };
    }
    
    if (type === 'text') {
      const result = await Pollinations.generateFreeText({
        prompt,
        model: 'openai',
        temperature: 0.7,
      });
      
      await Pollinations.recordFreeGeneration(userId, redis);
      
      return {
        success: true,
        tier: 'free',
        result: {
          url: result, // For text, we return the text directly
          model: 'openai',
        },
        freeGenerationsRemaining: freeStatus.remaining - 1,
      };
    }
    
    return {
      success: false,
      tier: 'free',
      error: 'Video generation not available on free tier',
      freeGenerationsRemaining: freeStatus.remaining,
    };
    
  } catch (error) {
    return {
      success: false,
      tier: 'free',
      error: error instanceof Error ? error.message : 'Free generation failed',
      freeGenerationsRemaining: freeStatus.remaining,
    };
  }
}

/**
 * Generate using premium tier (Kie AI)
 */
async function generatePremiumTier(
  request: GenerationRequest,
  tierInfo: TierInfo
): Promise<GenerationResponse> {
  const { userId, type, prompt, model, options } = request;
  
  // Determine which Kie AI model to use
  let kieModel: Kie.KieAIModel;
  let cost: number;
  
  if (type === 'image') {
    if (model?.includes('flux-2-pro')) {
      kieModel = options?.resolution === '2K' ? 'flux-2-pro-2k' : 'flux-2-pro-1k';
    } else if (model?.includes('nanobanana')) {
      kieModel = 'nanobanana-2k';
    } else {
      kieModel = 'flux-2-pro-1k'; // Default
    }
    
    cost = Kie.calculateGenerationCost(kieModel, {
      referenceImageCount: options?.referenceImages?.length
    });
  } else if (type === 'video') {
    if (model?.includes('kling')) {
      kieModel = 'kling-3-std-5s';
    } else if (model?.includes('wan')) {
      kieModel = 'wan-2-6-720p-10s';
    } else if (model?.includes('fast')) {
      kieModel = 'veo-3-fast';
    } else {
      kieModel = 'veo-3-quality';
    }
    cost = Kie.calculateGenerationCost(kieModel);
  } else {
    kieModel = 'gemini-3-flash';
    cost = Kie.calculateGenerationCost(kieModel);
  }
  
  // Check credits (unless Top Creator)
  if (!tierInfo.hasCoconutAccess) {
    const creditBalance = await Credits.getCreditBalance(userId);
    const totalCredits = creditBalance.premium + creditBalance.free;
    
    if (totalCredits < cost) {
      return {
        success: false,
        tier: 'premium',
        error: `Insufficient credits. Need ${cost}, have ${totalCredits}. Please purchase more credits.`,
        remainingCredits: totalCredits,
      };
    }
    
    // Debit credits
    const debitResult = await Credits.debitCredits(userId, cost, 'generation', `Generate ${type} with ${kieModel}`);
    if (!debitResult.success) {
      return {
        success: false,
        tier: 'premium',
        error: debitResult.error || 'Credit debit failed',
        remainingCredits: totalCredits,
      };
    }
  }
  
  try {
    let result: Kie.KieAITaskResponse;
    
    if (type === 'image') {
      result = await Kie.generatePremiumImage({
        prompt,
        model: kieModel.includes('flux') ? 'flux-2-pro' : 'flux-2-flex',
        aspectRatio: (options?.aspectRatio as any) || '1:1',
        resolution: kieModel.includes('2k') ? '2K' : '1K',
        referenceImages: options?.referenceImages,
      }, userId);
    } else if (type === 'video') {
      result = await Kie.generatePremiumVideo({
        prompt,
        model: kieModel === 'veo-3-fast' ? 'veo3_fast' : 'veo3',
        generationType: options?.referenceImages?.length 
          ? 'REFERENCE_2_VIDEO' 
          : 'TEXT_2_VIDEO',
        imageUrls: options?.referenceImages,
        aspectRatio: (options?.aspectRatio as any) || '16:9',
      }, userId);
    } else {
      return {
        success: false,
        tier: 'premium',
        error: 'Text generation via Kie AI not yet implemented',
      };
    }
    
    if (!result.success) {
      // Refund credits on failure
      if (!tierInfo.hasCoconutAccess) {
        await Credits.refundCredits(userId, cost, 'premium', {
          jobId: result.taskId || 'unknown',
          reason: `Refund for failed ${type} generation`,
        });
      }
      
      return {
        success: false,
        tier: 'premium',
        error: result.error || 'Premium generation failed',
        creditsDeducted: tierInfo.hasCoconutAccess ? 0 : cost,
      };
    }
    
    // Record generation for Rule of 60
    await RuleOf60.recordGeneration(userId, { type, model: kieModel });
    
    // Get updated balance
    const newBalance = await Credits.getCreditBalance(userId);
    
    return {
      success: true,
      tier: 'premium',
      result: {
        taskId: result.taskId,
        model: kieModel,
        url: '', // URL will be fetched via status check
      },
      creditsDeducted: tierInfo.hasCoconutAccess ? 0 : cost,
      remainingCredits: newBalance.premium + newBalance.free,
    };
    
  } catch (error) {
    // Refund on exception
    if (!tierInfo.hasCoconutAccess) {
      await Credits.refundCredits(userId, cost, 'premium', {
        jobId: result?.taskId || 'unknown',
        reason: `Refund for error: ${error instanceof Error ? error.message : 'unknown'}`,
      });
    }
    
    return {
      success: false,
      tier: 'premium',
      error: error instanceof Error ? error.message : 'Premium generation failed',
    };
  }
}

/**
 * Check status of a generation task
 */
export async function checkGenerationStatus(
  taskId: string,
  type: 'image' | 'video',
  tier: GenerationTier
): Promise<{ 
  status: 'pending' | 'completed' | 'failed';
  url?: string;
  error?: string;
}> {
  if (tier === 'free') {
    // Pollinations doesn't have task status - it's synchronous
    return { status: 'completed' };
  }
  
  try {
    const status = await Kie.checkTaskStatus(taskId, type);
    
    if (status.code !== 200) {
      return { status: 'failed', error: status.msg };
    }
    
    const data = status.data;
    
    if (type === 'video') {
      if (data.successFlag === 1) {
        return {
          status: 'completed',
          url: data.response?.resultUrls?.[0],
        };
      } else if (data.successFlag === 2 || data.successFlag === 3) {
        return {
          status: 'failed',
          error: data.errorMessage || 'Video generation failed',
        };
      }
    } else {
      // Image
      if (data.state === 'success') {
        const result = JSON.parse(data.resultJson || '{}');
        return {
          status: 'completed',
          url: result.resultUrls?.[0],
        };
      } else if (data.state === 'fail') {
        return {
          status: 'failed',
          error: data.failMsg || 'Image generation failed',
        };
      }
    }
    
    return { status: 'pending' };
    
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Status check failed',
    };
  }
}

/**
 * Get available models for user
 */
export async function getAvailableModels(
  userId: string,
  redis?: { get: (key: string) => Promise<string | null> }
): Promise<{
  free: Array<{ id: string; name: string; description: string }>;
  premium: Array<{ id: string; name: string; credits: number; description: string }>;
  canUsePremium: boolean;
  reason: string;
}> {
  const tierInfo = await determineTier(userId, undefined, redis);
  
  return {
    free: Pollinations.getFreeTierModels(),
    premium: Kie.getPremiumModels(),
    canUsePremium: tierInfo.tier === 'premium',
    reason: tierInfo.reason,
  };
}
