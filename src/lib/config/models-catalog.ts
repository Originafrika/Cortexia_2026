/**
 * MODELS CATALOG
 * Catalogue complet de tous les modèles disponibles
 */

export type ModelProvider = 'pollinations' | 'together' | 'kie-ai';
export type CreditType = 'free' | 'paid';

export interface ModelDefinition {
  id: string;
  name: string;
  description: string;
  provider: ModelProvider;
  creditType: CreditType;
  creditCost: number; // Base cost (for 1K resolution if applicable)
  creditCost2K?: number; // Cost for 2K resolution
  category: 'text-to-image' | 'image-to-image' | 'video' | 'avatar' | 'nsfw' | 'utility';
  capabilities: string[];
  speed: string;
  quality: 'standard' | 'premium' | 'ultra';
  fallback?: string; // Model ID to fallback to
  isAvailable?: boolean; // For provider status
  maxReferenceImages?: number; // Max number of reference images
}

// FREE MODELS (25 credits/month)
export const FREE_MODELS: ModelDefinition[] = [
  {
    id: 'seedream',
    name: 'SeeDream',
    description: 'Rapide et créatif pour text-to-image',
    provider: 'pollinations',
    creditType: 'free',
    creditCost: 1,
    category: 'text-to-image',
    capabilities: ['text-to-image', 'fast-generation', 'creative'],
    speed: '~3s',
    quality: 'standard',
    fallback: 'flux-schnell',
  },
  {
    id: 'nanobanana',
    name: 'NanoBanana',
    description: 'Multi-image et compositions complexes',
    provider: 'pollinations',
    creditType: 'free',
    creditCost: 2,
    category: 'image-to-image',
    capabilities: ['multi-image', 'composition', 'merge'],
    speed: '~5s',
    quality: 'standard',
    fallback: 'flux-schnell',
  },
  {
    id: 'kontext',
    name: 'Kontext',
    description: 'Enhancement d\'une seule image',
    provider: 'pollinations',
    creditType: 'free',
    creditCost: 1,
    category: 'image-to-image',
    capabilities: ['single-image', 'enhancement', 'refinement'],
    speed: '~4s',
    quality: 'standard',
    fallback: 'flux-schnell',
  },
];

// FALLBACK MODEL (Free, Together AI)
export const FALLBACK_MODEL: ModelDefinition = {
  id: 'flux-schnell',
  name: 'Flux Schnell',
  description: 'Fallback rapide et fiable (Together AI)',
  provider: 'together',
  creditType: 'free',
  creditCost: 1,
  category: 'text-to-image',
  capabilities: ['text-to-image', 'fast', 'reliable'],
  speed: '~4s',
  quality: 'standard',
};

// PAID MODELS (Via Kie AI)
export const PAID_MODELS: ModelDefinition[] = [
  // Premium Image Models
  {
    id: 'flux-2-pro',
    name: 'Flux 2 Pro',
    description: 'Professional quality SOTA - Up to 8 reference images',
    provider: 'kie-ai',
    creditType: 'paid',
    creditCost: 1,    // 1K resolution: 1 Cortexia credit ($0.10) | Cost us: $0.025
    creditCost2K: 2,  // 2K resolution: 2 Cortexia credits ($0.20) | Cost us: $0.035
    category: 'text-to-image',
    capabilities: ['text-to-image', 'high-quality', 'professional', 'reference-images'],
    speed: '~10s',
    quality: 'ultra',
    maxReferenceImages: 8, // +1 credit per image
  },
  {
    id: 'flux-2-flex',
    name: 'Flux 2 Flex',
    description: 'ULTIMATE quality - Best on market - Up to 8 reference images',
    provider: 'kie-ai',
    creditType: 'paid',
    creditCost: 3,    // 1K resolution: 3 Cortexia credits ($0.30) | Cost us: $0.07
    creditCost2K: 6,  // 2K resolution: 6 Cortexia credits ($0.60) | Cost us: $0.12
    category: 'text-to-image',
    capabilities: ['text-to-image', 'ultra-quality', 'flexible', 'adaptable', 'reference-images'],
    speed: '~12s',
    quality: 'ultra',
    maxReferenceImages: 8, // +1 credit per image
  },
  
  // NanoBanana Paid Versions
  {
    id: 'nanobanana-text',
    name: 'NanoBanana Text',
    description: 'Text-to-image premium avec NanoBanana',
    provider: 'kie-ai',
    creditType: 'paid',
    creditCost: 2,
    category: 'text-to-image',
    capabilities: ['text-to-image', 'creative', 'premium'],
    speed: '~6s',
    quality: 'premium',
  },
  {
    id: 'nanobanana-i2i',
    name: 'NanoBanana Image-to-Image',
    description: 'Image-to-image premium',
    provider: 'kie-ai',
    creditType: 'paid',
    creditCost: 3,
    category: 'image-to-image',
    capabilities: ['image-to-image', 'transformation', 'premium'],
    speed: '~7s',
    quality: 'premium',
  },
  
  // Video
  {
    id: 'veo-3-fast',
    name: 'Veo 3 Fast',
    description: 'Génération vidéo ultra-rapide',
    provider: 'kie-ai',
    creditType: 'paid',
    creditCost: 10,
    category: 'video',
    capabilities: ['image-to-video', 'fast-video', 'cinematic'],
    speed: '~15s',
    quality: 'ultra',
  },
  
  // NSFW
  {
    id: 'z-image',
    name: 'Z-Image',
    description: 'Génération NSFW sans restrictions',
    provider: 'kie-ai',
    creditType: 'paid',
    creditCost: 4,
    category: 'nsfw',
    capabilities: ['nsfw', 'unrestricted', 'adult-content'],
    speed: '~8s',
    quality: 'premium',
  },
  
  // Avatar
  {
    id: 'infinitalk',
    name: 'InfiniTalk',
    description: 'Création d\'avatars parlants',
    provider: 'kie-ai',
    creditType: 'paid',
    creditCost: 8,
    category: 'avatar',
    capabilities: ['avatar', 'talking-head', 'animation'],
    speed: '~20s',
    quality: 'ultra',
  },
];

// ALL MODELS COMBINED
export const ALL_MODELS: ModelDefinition[] = [
  ...FREE_MODELS,
  FALLBACK_MODEL,
  ...PAID_MODELS,
];

// MODEL CATEGORIES
export const MODEL_CATEGORIES = [
  {
    id: 'text-to-image' as const,
    name: 'Text to Image',
    description: 'Créez des images à partir de texte',
    icon: '🎨',
  },
  {
    id: 'image-to-image' as const,
    name: 'Image to Image',
    description: 'Transformez vos images',
    icon: '🖼️',
  },
  {
    id: 'video' as const,
    name: 'Video',
    description: 'Créez des vidéos',
    icon: '🎬',
  },
  {
    id: 'avatar' as const,
    name: 'Avatar',
    description: 'Avatars parlants animés',
    icon: '👤',
  },
  {
    id: 'nsfw' as const,
    name: 'NSFW',
    description: 'Contenu adulte sans restrictions',
    icon: '🔞',
  },
];

// CREDIT RULES
export const CREDIT_RULES = {
  FREE_MONTHLY_ALLOWANCE: 25,
  
  // Important: If user has paid credits, they CANNOT use free credits
  canUseFreeCredits: (userPaidCredits: number) => userPaidCredits === 0,
  
  // Model access based on credit type
  canAccessModel: (model: ModelDefinition, userFreeCredits: number, userPaidCredits: number) => {
    if (model.creditType === 'free') {
      // Can only use free models if no paid credits
      return userPaidCredits === 0 && userFreeCredits >= model.creditCost;
    } else {
      // Paid models require paid credits
      return userPaidCredits >= model.creditCost;
    }
  },
};

// PROVIDER STATUS (for fallback logic)
export const PROVIDER_STATUS = {
  pollinations: { available: true, lastCheck: new Date() },
  together: { available: true, lastCheck: new Date() },
  'kie-ai': { available: true, lastCheck: new Date() },
};

// Helper functions
export function getModelById(modelId: string): ModelDefinition | undefined {
  return ALL_MODELS.find(m => m.id === modelId);
}

export function getModelsByCategory(category: string): ModelDefinition[] {
  return ALL_MODELS.filter(m => m.category === category);
}

export function getFreeModels(): ModelDefinition[] {
  return ALL_MODELS.filter(m => m.creditType === 'free');
}

export function getPaidModels(): ModelDefinition[] {
  return ALL_MODELS.filter(m => m.creditType === 'paid');
}

export function getAvailableModels(userFreeCredits: number, userPaidCredits: number): ModelDefinition[] {
  return ALL_MODELS.filter(model => 
    CREDIT_RULES.canAccessModel(model, userFreeCredits, userPaidCredits)
  );
}