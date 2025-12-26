// Provider Configuration - All Available Models
// Defines Pollinations, Together AI, and Replicate models

import type { ModelConfig, CreditPackage } from './types';

// ===== POLLINATIONS MODELS (Free Primary) =====

export const POLLINATIONS_MODELS: ModelConfig[] = [
  {
    id: 'pollinations-seedream',
    name: 'seedream',
    displayName: 'Seedream (Pollinations)',
    provider: 'pollinations',
    providerTier: 'free-primary',
    capabilities: ['text-to-image', 'image-to-image'],
    speedRating: 3,
    qualityRating: 4,
    costPerGeneration: 0,
    costPerReferenceImage: 0,
    enhancementBonus: 0,
    maxResolution: { width: 2048, height: 2048 },
    supportedFormats: ['png', 'jpg', 'webp'],
    description: 'High-quality creative image generation with excellent prompt understanding. Best free option for general use.',
    shortDescription: 'Free - Best quality until rate limit',
    recommendedFor: [
      'General image generation',
      'Creative content',
      'Template transformations',
      'Product mockups'
    ],
    limitations: [
      'Daily rate limit (resets 00:00 UTC)',
      'May be unavailable during peak hours'
    ],
    available: true
  },
  {
    id: 'pollinations-nanobanana',
    name: 'nanobanana',
    displayName: 'Nanobanana (Pollinations)',
    provider: 'pollinations',
    providerTier: 'free-primary',
    capabilities: ['enhancement', 'upscaling', 'image-to-image'],
    speedRating: 3,
    qualityRating: 4,
    costPerGeneration: 0,
    costPerReferenceImage: 0,
    enhancementBonus: 0,
    maxResolution: { width: 4096, height: 4096 },
    supportedFormats: ['png', 'jpg'],
    description: 'Specialized enhancement model for upscaling and quality improvement. Preserves composition while dramatically improving detail.',
    shortDescription: 'Free - Best for enhancement',
    recommendedFor: [
      'Image enhancement',
      'Upscaling',
      'Face enhancement',
      'Photo restoration',
      'Quality improvement'
    ],
    limitations: [
      'Daily rate limit (resets 00:00 UTC)',
      'Requires reference image'
    ],
    available: true
  }
];

// ===== TOGETHER AI MODELS (Free Fallback) =====

export const TOGETHER_MODELS: ModelConfig[] = [
  {
    id: 'together-flux-schnell',
    name: 'black-forest-labs/FLUX.1-schnell-Free',
    displayName: 'Flux Schnell (Together AI)',
    provider: 'together',
    providerTier: 'free-fallback',
    capabilities: ['text-to-image'],
    speedRating: 5,
    qualityRating: 3,
    costPerGeneration: 0,
    costPerReferenceImage: 0,
    enhancementBonus: 0,
    maxResolution: { width: 1792, height: 1792 },
    supportedFormats: ['png', 'jpg', 'webp'],
    description: 'Ultra-fast free text-to-image generation. 4-step inference for near-instant results. Fallback when Pollinations unavailable.',
    shortDescription: 'Free - Ultra-fast fallback',
    recommendedFor: [
      'Quick prototypes',
      'Fast iterations',
      'Simple text-to-image',
      'When Pollinations rate limited'
    ],
    limitations: [
      'Text-to-image only (no image references)',
      'Lower quality vs Pollinations Seedream',
      'Basic text rendering',
      '600 requests per minute limit'
    ],
    available: true
  }
];

// ===== REPLICATE MODELS (Premium Paid) =====

export const REPLICATE_MODELS: ModelConfig[] = [
  {
    id: 'replicate-flux-2-pro',
    name: 'black-forest-labs/flux-2-pro',
    displayName: 'Flux 2 Pro (Replicate)',
    provider: 'replicate',
    providerTier: 'premium',
    capabilities: ['text-to-image', 'image-to-image', 'enhancement'],
    speedRating: 3,
    qualityRating: 5,
    costPerGeneration: 1,
    costPerReferenceImage: 1,
    enhancementBonus: 1,
    maxResolution: { width: 2048, height: 2048 },
    supportedFormats: ['png', 'jpg', 'webp'],
    description: 'Professional-grade image generation with perfect text rendering, photorealism, and multi-reference support. Industry-leading quality.',
    shortDescription: 'Premium - Professional quality',
    recommendedFor: [
      'Marketing materials',
      'Product photography',
      'Professional portraits',
      'Architecture visualization',
      'Brand assets',
      'High-end campaigns',
      'Perfect text rendering',
      'Character consistency'
    ],
    limitations: [
      'Requires paid credits',
      'Slower than free models (~20-40s)'
    ],
    available: true
  },
  {
    id: 'replicate-veo-3-fast',
    name: 'google/veo-3-fast',
    displayName: 'Google Veo 3 Fast',
    provider: 'replicate',
    providerTier: 'premium',
    capabilities: ['video-generation', 'image-to-video'],
    speedRating: 4,
    qualityRating: 5,
    costPerGeneration: 1, // Base cost
    costPerReferenceImage: 1,
    enhancementBonus: 0,
    maxResolution: { width: 1920, height: 1080 },
    supportedFormats: ['mp4'],
    description: 'Google\'s fastest high-quality video generation. Professional broadcast quality with excellent motion consistency.',
    shortDescription: 'Premium - Best video quality',
    recommendedFor: [
      'Professional video content',
      'Marketing campaigns',
      'Social media videos',
      'Broadcast quality output'
    ],
    limitations: [
      'Requires paid credits (1 credit per second)',
      'Video generation takes 45-90 seconds',
      'Premium only'
    ],
    available: true
  },
  {
    id: 'replicate-hailuo-video',
    name: 'hailuo-video',
    displayName: 'Hailuo Video',
    provider: 'replicate',
    providerTier: 'premium',
    capabilities: ['video-generation', 'image-to-video'],
    speedRating: 3,
    qualityRating: 4,
    costPerGeneration: 1,
    costPerReferenceImage: 1,
    enhancementBonus: 0,
    maxResolution: { width: 1920, height: 1080 },
    supportedFormats: ['mp4'],
    description: 'High-quality video generation from text or images. Good balance of speed and quality.',
    shortDescription: 'Premium - Fast video',
    recommendedFor: [
      'Social media videos',
      'Product demos',
      'Animated content',
      'Quick video prototypes'
    ],
    limitations: [
      'Requires paid credits (1 credit per second)',
      'Video generation takes 60-120 seconds'
    ],
    available: true
  }
];

// ===== AGGREGATED MODELS =====

export const AVAILABLE_MODELS: ModelConfig[] = [
  ...POLLINATIONS_MODELS,
  ...TOGETHER_MODELS,
  ...REPLICATE_MODELS
];

// ===== CREDIT PACKAGES =====

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    credits: 10,
    price: 1.00,
    discount: 0
  },
  {
    credits: 50,
    price: 4.50,
    discount: 10,
    popular: true
  },
  {
    credits: 100,
    price: 8.00,
    discount: 20
  },
  {
    credits: 500,
    price: 35.00,
    discount: 30
  }
];

// ===== CONSTANTS =====

export const CREDIT_CONSTANTS = {
  CREDIT_TO_USD: 0.10, // 1 credit = $0.10
  FREE_CREDITS_MONTHLY: 25,
  RENEWAL_DAY: 1, // 1st of month
  POLLINATIONS_RESET_HOUR: 0, // 00:00 UTC
};

// ===== HELPER FUNCTIONS =====

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}

export function getModelsByProvider(provider: string): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.provider === provider);
}

export function getModelsByCapability(capability: string): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.capabilities.includes(capability as any));
}

export function getModelsByTier(tier: string): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.providerTier === tier);
}

export function getFreeModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.costPerGeneration === 0);
}

export function getPremiumModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.costPerGeneration > 0);
}

export function getVideoModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => 
    m.capabilities.includes('video-generation') || 
    m.capabilities.includes('image-to-video')
  );
}

export function getImageModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => 
    m.capabilities.includes('text-to-image') || 
    m.capabilities.includes('image-to-image') ||
    m.capabilities.includes('enhancement')
  );
}

export function creditsToUSD(credits: number): number {
  return credits * CREDIT_CONSTANTS.CREDIT_TO_USD;
}

export function usdToCredits(usd: number): number {
  return Math.ceil(usd / CREDIT_CONSTANTS.CREDIT_TO_USD);
}

export function getPackageSavings(pkg: CreditPackage): number {
  const regularPrice = pkg.credits * CREDIT_CONSTANTS.CREDIT_TO_USD;
  return regularPrice - pkg.price;
}

export function formatCredits(credits: number): string {
  return credits === 1 ? '1 credit' : `${credits} credits`;
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
