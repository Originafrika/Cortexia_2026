// Model Configuration - Multi-Provider Strategy
// Priority: Pollinations (free) → Together AI (free fallback) → Replicate (paid)

export type ProviderType = 'pollinations' | 'together' | 'replicate';
export type ModelTier = 'free' | 'paid';
export type ModelCapability = 
  | 'text-to-image'
  | 'image-to-image'
  | 'enhancement'
  | 'video-generation';

export interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
  provider: ProviderType;
  tier: ModelTier;
  capabilities: ModelCapability[];
  
  // Credit costs
  baseCost: number;           // Credits per generation (0 for free models)
  requiresPaidCredits: boolean;
  
  // Performance ratings
  speedRating: 1 | 2 | 3 | 4 | 5;  // 1=slow, 5=ultra-fast
  qualityRating: 1 | 2 | 3 | 4 | 5; // 1=basic, 5=professional
  
  // Technical specs
  maxResolution: { width: number; height: number };
  supportedFormats: string[];
  
  // UI metadata
  description: string;
  badge?: {
    text: string;
    color: string;
    icon: string;
  };
  
  // Availability
  available: boolean;
  fallbackModelId?: string; // Model to use if this one fails
  rateLimited?: boolean;    // Set dynamically when Pollinations hits limit
}

// ===== POLLINATIONS MODELS (Primary Free Tier) =====

export const POLLINATIONS_MODELS: ModelConfig[] = [
  {
    id: 'seedream',
    name: 'seedream',
    displayName: 'Seedream',
    provider: 'pollinations',
    tier: 'free',
    capabilities: ['text-to-image'],
    baseCost: 0, // FREE (until rate limit)
    requiresPaidCredits: false,
    speedRating: 4,
    qualityRating: 4,
    maxResolution: { width: 2048, height: 2048 },
    supportedFormats: ['png', 'jpg', 'webp'],
    description: 'High-quality text-to-image generation - completely free!',
    badge: {
      text: '⚡ Free',
      color: 'green',
      icon: '⚡'
    },
    available: true,
    fallbackModelId: 'flux-schnell-free',
    rateLimited: false // Set to true when rate limit hit
  },
  
  {
    id: 'nanobanana',
    name: 'nanobanana',
    displayName: 'Nanobanana Enhancement',
    provider: 'pollinations',
    tier: 'free',
    capabilities: ['image-to-image', 'enhancement'],
    baseCost: 0, // FREE (until rate limit)
    requiresPaidCredits: false,
    speedRating: 3,
    qualityRating: 4,
    maxResolution: { width: 4096, height: 4096 },
    supportedFormats: ['png', 'jpg'],
    description: 'Professional image enhancement and upscaling - completely free!',
    badge: {
      text: '⚡ Free Enhancement',
      color: 'green',
      icon: '⚡'
    },
    available: true,
    fallbackModelId: 'flux-2-pro', // Paid fallback for enhancement
    rateLimited: false
  }
];

// ===== TOGETHER AI MODELS (Free Fallback) =====

export const TOGETHER_AI_MODELS: ModelConfig[] = [
  {
    id: 'flux-schnell-free',
    name: 'black-forest-labs/FLUX.1-schnell-Free',
    displayName: 'Flux Schnell',
    provider: 'together',
    tier: 'free',
    capabilities: ['text-to-image', 'image-to-image'],
    baseCost: 1, // 1 FREE credit (from monthly 25)
    requiresPaidCredits: false,
    speedRating: 5, // Ultra-fast (4 steps)
    qualityRating: 3,
    maxResolution: { width: 1792, height: 1792 },
    supportedFormats: ['png', 'jpg', 'webp'],
    description: 'Ultra-fast generation when Pollinations is rate-limited. Uses your monthly free credits.',
    badge: {
      text: '🚀 Fast Fallback',
      color: 'blue',
      icon: '🚀'
    },
    available: true,
    rateLimited: false
  }
];

// ===== REPLICATE MODELS (Paid Premium) =====

export const REPLICATE_MODELS: ModelConfig[] = [
  {
    id: 'flux-2-pro',
    name: 'black-forest-labs/flux-2-pro',
    displayName: 'Flux 2 Pro',
    provider: 'replicate',
    tier: 'paid',
    capabilities: ['text-to-image', 'image-to-image', 'enhancement'],
    baseCost: 1, // 1 PAID credit base + 1 per ref image
    requiresPaidCredits: true,
    speedRating: 3,
    qualityRating: 5, // Professional grade
    maxResolution: { width: 2048, height: 2048 },
    supportedFormats: ['png', 'jpg', 'webp'],
    description: 'Professional-grade generation with perfect text rendering and photorealism. Best quality available.',
    badge: {
      text: '👑 Premium',
      color: 'amber',
      icon: '👑'
    },
    available: true
  },
  
  {
    id: 'veo-3-fast',
    name: 'google/veo-3-fast',
    displayName: 'Google Veo 3 Fast',
    provider: 'replicate',
    tier: 'paid',
    capabilities: ['video-generation'],
    baseCost: 7, // 7 PAID credits per 5sec
    requiresPaidCredits: true,
    speedRating: 4,
    qualityRating: 5,
    maxResolution: { width: 1920, height: 1080 },
    supportedFormats: ['mp4'],
    description: 'Google\'s fastest high-quality video generation. Professional results in seconds.',
    badge: {
      text: '🎬 Premium Video',
      color: 'purple',
      icon: '🎬'
    },
    available: true
  }
];

// ===== ALL MODELS =====

export const ALL_MODELS: ModelConfig[] = [
  ...POLLINATIONS_MODELS,
  ...TOGETHER_AI_MODELS,
  ...REPLICATE_MODELS
];

// ===== HELPER FUNCTIONS =====

/**
 * Get model by ID
 */
export function getModelById(id: string): ModelConfig | undefined {
  return ALL_MODELS.find(m => m.id === id);
}

/**
 * Get models by tier
 */
export function getModelsByTier(tier: ModelTier): ModelConfig[] {
  return ALL_MODELS.filter(m => m.tier === tier && m.available);
}

/**
 * Get models by capability
 */
export function getModelsByCapability(capability: ModelCapability): ModelConfig[] {
  return ALL_MODELS.filter(m => 
    m.capabilities.includes(capability) && m.available
  );
}

/**
 * Get available free models (not rate-limited)
 */
export function getAvailableFreeModels(): ModelConfig[] {
  return ALL_MODELS.filter(m => 
    m.tier === 'free' && 
    m.available && 
    !m.rateLimited
  );
}

/**
 * Get fallback model when primary fails
 */
export function getFallbackModel(modelId: string): ModelConfig | undefined {
  const model = getModelById(modelId);
  if (!model?.fallbackModelId) return undefined;
  return getModelById(model.fallbackModelId);
}

/**
 * Check if Pollinations is rate-limited
 */
export function isPollinationsRateLimited(): boolean {
  return POLLINATIONS_MODELS.some(m => m.rateLimited);
}

/**
 * Set Pollinations rate limit status
 */
export function setPollinationsRateLimited(limited: boolean): void {
  POLLINATIONS_MODELS.forEach(m => {
    m.rateLimited = limited;
  });
}

/**
 * Get best available model for capability
 * Priority: Free (not rate-limited) → Free fallback → Paid
 */
export function getBestModelForCapability(
  capability: ModelCapability,
  userHasPaidCredits: boolean
): ModelConfig {
  const models = getModelsByCapability(capability);
  
  // 1. Try Pollinations (free, not rate-limited)
  const pollinationsFree = models.find(m => 
    m.provider === 'pollinations' && 
    !m.rateLimited
  );
  if (pollinationsFree) return pollinationsFree;
  
  // 2. Try Together AI (free fallback)
  const togetherFree = models.find(m => 
    m.provider === 'together' && 
    m.tier === 'free'
  );
  if (togetherFree) return togetherFree;
  
  // 3. Use paid model if user has credits
  if (userHasPaidCredits) {
    const paidModel = models.find(m => m.tier === 'paid');
    if (paidModel) return paidModel;
  }
  
  // Fallback: First available model
  return models[0];
}

/**
 * Format model name for display
 */
export function formatModelName(modelId: string): string {
  const model = getModelById(modelId);
  return model?.displayName || modelId;
}

/**
 * Get model badge color
 */
export function getModelBadgeColor(modelId: string): string {
  const model = getModelById(modelId);
  if (!model) return 'gray';
  
  switch (model.tier) {
    case 'free':
      return model.provider === 'pollinations' ? 'green' : 'blue';
    case 'paid':
      return 'amber';
    default:
      return 'gray';
  }
}
