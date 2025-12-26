// Smart Model Selection - Auto-select best model based on context
// Handles fallback logic when providers are rate limited

import type { 
  ModelConfig, 
  ModelSelection, 
  GenerationContext, 
  ProviderStatus,
  CostCalculation
} from './types';
import { 
  AVAILABLE_MODELS, 
  POLLINATIONS_MODELS, 
  TOGETHER_MODELS, 
  REPLICATE_MODELS 
} from './config';
import { calculateGenerationCost, canAffordGeneration } from './credits';

/**
 * Select best model based on context and provider availability
 */
export function selectBestModel(
  context: GenerationContext,
  providerStatuses: ProviderStatus[]
): ModelSelection {
  
  const { params, user, preferences } = context;
  
  // Get provider availability
  const pollinationsAvailable = isProviderAvailable('pollinations', providerStatuses);
  const togetherAvailable = isProviderAvailable('together', providerStatuses);
  const replicateAvailable = isProviderAvailable('replicate', providerStatuses);
  
  // === PRIORITY 1: User has PAID credits → Use premium models ===
  if (user.credits.paid > 0 && replicateAvailable) {
    const model = selectPremiumModel(params);
    const cost = calculateGenerationCost(params, model);
    
    if (canAffordGeneration(cost.total, user.credits)) {
      return {
        model,
        reason: 'Using premium model (paid credits available)',
        confidence: 'high',
        alternatives: getPremiumAlternatives(model, params),
        cost
      };
    }
  }
  
  // === PRIORITY 2: Pollinations available (free primary) ===
  if (pollinationsAvailable) {
    const model = selectPollinationsModel(params);
    const cost = calculateGenerationCost(params, model);
    
    return {
      model,
      reason: 'Using Pollinations (best free quality)',
      confidence: 'high',
      alternatives: [],
      cost
    };
  }
  
  // === PRIORITY 3: Pollinations rate limited ===
  
  // Text-to-image: Use Together AI Flux Schnell (free fallback)
  if (params.type === 'text-to-image' && !params.referenceImages?.length) {
    if (togetherAvailable) {
      const model = TOGETHER_MODELS[0]; // Flux Schnell
      const cost = calculateGenerationCost(params, model);
      
      return {
        model,
        reason: 'Pollinations rate limited - using free fallback',
        confidence: 'medium',
        alternatives: getPremiumAlternatives(model, params),
        cost,
        warning: 'Lower quality than Pollinations. Upgrade to premium for best results.'
      };
    }
  }
  
  // Image-to-image or enhancement: Requires premium
  if (params.referenceImages?.length || params.isEnhancement) {
    const premiumModel = selectPremiumModel(params);
    const cost = calculateGenerationCost(params, premiumModel);
    
    // Check if user can afford
    if (canAffordGeneration(cost.total, user.credits)) {
      return {
        model: premiumModel,
        reason: 'Image-to-image requires premium (Pollinations unavailable)',
        confidence: 'high',
        alternatives: [],
        cost
      };
    }
    
    // Cannot afford
    return {
      model: premiumModel,
      reason: 'Image-to-image requires premium credits',
      confidence: 'high',
      alternatives: [],
      cost,
      error: {
        type: 'upgrade_required',
        message: 'Image-to-image currently unavailable in free tier',
        solutions: [
          {
            option: 'Wait for Pollinations reset',
            eta: getPollinationsResetETA(providerStatuses),
            free: true
          },
          {
            option: `Use Flux 2 Pro (${cost.total} credits)`,
            cost: cost.total,
            free: false
          }
        ]
      }
    };
  }
  
  // Video: Always requires premium
  if (params.type === 'video') {
    const videoModel = selectVideoModel(params);
    const cost = calculateGenerationCost(params, videoModel);
    
    if (canAffordGeneration(cost.total, user.credits)) {
      return {
        model: videoModel,
        reason: 'Video generation (premium)',
        confidence: 'high',
        alternatives: getVideoAlternatives(videoModel),
        cost
      };
    }
    
    return {
      model: videoModel,
      reason: 'Video generation requires premium credits',
      confidence: 'high',
      alternatives: [],
      cost,
      error: {
        type: 'insufficient_credits',
        message: 'Not enough credits for video generation',
        solutions: [
          {
            option: `Purchase ${cost.total} credits ($${cost.usd.toFixed(2)})`,
            cost: cost.total,
            free: false
          }
        ]
      }
    };
  }
  
  // Fallback: No suitable model
  return {
    model: AVAILABLE_MODELS[0], // Default to first available
    reason: 'No suitable model available',
    confidence: 'low',
    alternatives: [],
    cost: { baseGeneration: 0, referenceImages: 0, enhancement: 0, duration: 0, total: 0, usd: 0 },
    error: {
      type: 'no_provider',
      message: 'Unable to process request with current configuration',
      solutions: []
    }
  };
}

/**
 * Select best Pollinations model
 */
function selectPollinationsModel(params: GenerationContext['params']): ModelConfig {
  // Enhancement: Use Nanobanana
  if (params.isEnhancement || params.type === 'enhancement') {
    return POLLINATIONS_MODELS.find(m => m.name === 'nanobanana')!;
  }
  
  // Default: Seedream
  return POLLINATIONS_MODELS.find(m => m.name === 'seedream')!;
}

/**
 * Select best premium model
 */
function selectPremiumModel(params: GenerationContext['params']): ModelConfig {
  // Video: Use Veo 3 Fast (best quality)
  if (params.type === 'video') {
    return REPLICATE_MODELS.find(m => m.id === 'replicate-veo-3-fast')!;
  }
  
  // Default: Flux 2 Pro
  return REPLICATE_MODELS.find(m => m.id === 'replicate-flux-2-pro')!;
}

/**
 * Select video model (consider speed vs quality preference)
 */
function selectVideoModel(params: GenerationContext['params']): ModelConfig {
  // Default to Veo 3 Fast (best quality + good speed)
  return REPLICATE_MODELS.find(m => m.id === 'replicate-veo-3-fast')!;
}

/**
 * Get premium alternatives
 */
function getPremiumAlternatives(current: ModelConfig, params: GenerationContext['params']): ModelConfig[] {
  const alternatives: ModelConfig[] = [];
  
  // If current is not premium, suggest premium
  if (current.providerTier !== 'premium') {
    const flux2Pro = REPLICATE_MODELS.find(m => m.id === 'replicate-flux-2-pro');
    if (flux2Pro && modelSupportsParams(flux2Pro, params)) {
      alternatives.push(flux2Pro);
    }
  }
  
  return alternatives;
}

/**
 * Get video alternatives
 */
function getVideoAlternatives(current: ModelConfig): ModelConfig[] {
  const videoModels = REPLICATE_MODELS.filter(m => 
    m.capabilities.includes('video-generation') && 
    m.id !== current.id
  );
  
  return videoModels;
}

/**
 * Check if model supports given parameters
 */
function modelSupportsParams(model: ModelConfig, params: GenerationContext['params']): boolean {
  // Check text-to-image
  if (params.type === 'text-to-image' && !params.referenceImages?.length) {
    return model.capabilities.includes('text-to-image');
  }
  
  // Check image-to-image
  if (params.referenceImages && params.referenceImages.length > 0) {
    return model.capabilities.includes('image-to-image');
  }
  
  // Check enhancement
  if (params.isEnhancement || params.type === 'enhancement') {
    return model.capabilities.includes('enhancement');
  }
  
  // Check video
  if (params.type === 'video') {
    return model.capabilities.includes('video-generation');
  }
  
  return false;
}

/**
 * Check if provider is available
 */
function isProviderAvailable(provider: string, statuses: ProviderStatus[]): boolean {
  const status = statuses.find(s => s.provider === provider);
  return status ? status.available && !status.rateLimited : true;
}

/**
 * Get Pollinations reset ETA
 */
function getPollinationsResetETA(statuses: ProviderStatus[]): string {
  const pollinationsStatus = statuses.find(s => s.provider === 'pollinations');
  
  if (pollinationsStatus?.resetTime) {
    const now = new Date();
    const diff = pollinationsStatus.resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
  
  return 'Unknown';
}

/**
 * Get models filtered by user tier and capabilities
 */
export function getAvailableModelsForContext(context: GenerationContext): ModelConfig[] {
  const { params, user } = context;
  
  return AVAILABLE_MODELS.filter(model => {
    // Filter by capability
    if (!modelSupportsParams(model, params)) {
      return false;
    }
    
    // Free user: Hide premium if no paid credits
    if (user.tier === 'free' && model.providerTier === 'premium' && user.credits.paid === 0) {
      return false;
    }
    
    return model.available;
  });
}
