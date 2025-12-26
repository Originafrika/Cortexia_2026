/**
 * CORTEXIA MODELS - Real Specification
 * BDS: Grammaire du Design - Clarté des Signes
 */

export type ModelProvider = 'pollinations' | 'together' | 'kie-ai' | 'replicate';
export type CreditType = 'free' | 'paid';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: ModelProvider;
  creditType: CreditType;
  capabilities: {
    textToImage?: boolean;
    imageToImage?: boolean;
    multiImage?: { min: number; max: number };
    video?: boolean;
    intelligence?: boolean;
  };
  speed: string;
  quality: 'standard' | 'premium' | 'ultra';
}

// ========== FREE MODELS (Pollinations) ==========

export const FREE_MODELS: ModelDefinition[] = [
  {
    id: 'seedream',
    name: 'SeeDream',
    provider: 'pollinations',
    creditType: 'free',
    capabilities: {
      textToImage: true,
      imageToImage: true,
      multiImage: { min: 4, max: 10 }, // 4-10 images
    },
    speed: '~3s',
    quality: 'standard',
  },
  {
    id: 'kontext',
    name: 'Kontext',
    provider: 'pollinations',
    creditType: 'free',
    capabilities: {
      imageToImage: true,
      multiImage: { min: 1, max: 1 }, // Exactly 1 image
    },
    speed: '~4s',
    quality: 'standard',
  },
  {
    id: 'nanobanana',
    name: 'NanoBanana',
    provider: 'pollinations',
    creditType: 'free',
    capabilities: {
      imageToImage: true,
      multiImage: { min: 2, max: 3 }, // 2-3 images
    },
    speed: '~5s',
    quality: 'standard',
  },
];

// ========== FALLBACK MODEL (Together AI) ==========

export const FALLBACK_MODEL: ModelDefinition = {
  id: 'flux-schnell',
  name: 'Flux Schnell',
  provider: 'together',
  creditType: 'free',
  capabilities: {
    textToImage: true, // ONLY text-to-image for fallback
  },
  speed: '~4s',
  quality: 'standard',
};

// ========== PAID MODELS ==========

export const PAID_MODELS: ModelDefinition[] = [
  // Image Generation (Kie AI)
  {
    id: 'flux-2-pro',
    name: 'Flux 2 Pro',
    provider: 'kie-ai',
    creditType: 'paid',
    capabilities: {
      textToImage: true,
      imageToImage: true,
      multiImage: { min: 1, max: 8 }, // Up to 8 images (for Coconut)
    },
    speed: '~8s',
    quality: 'ultra',
  },
  {
    id: 'flux-2-flex',
    name: 'Flux 2 Flex',
    provider: 'kie-ai',
    creditType: 'paid',
    capabilities: {
      textToImage: true,
      imageToImage: true,
    },
    speed: '~7s',
    quality: 'premium',
  },
  {
    id: 'nanobanana-kie',
    name: 'NanoBanana Pro',
    provider: 'kie-ai',
    creditType: 'paid',
    capabilities: {
      imageToImage: true,
      multiImage: { min: 2, max: 8 },
    },
    speed: '~6s',
    quality: 'premium',
  },
  
  // Video (Kie AI)
  {
    id: 'veo-3.1-fast',
    name: 'Veo 3.1 Fast',
    provider: 'kie-ai',
    creditType: 'paid',
    capabilities: {
      video: true,
      // Supports image + last_frame
    },
    speed: '~15s',
    quality: 'ultra',
  },
  
  // Intelligence (Replicate)
  {
    id: 'gemini-vision',
    name: 'Gemini Vision',
    provider: 'replicate',
    creditType: 'paid',
    capabilities: {
      intelligence: true,
    },
    speed: '~5s',
    quality: 'ultra',
  },
];

// ========== MODEL SELECTION LOGIC ==========

export interface GenerationRequest {
  prompt: string;
  images?: string[];
  mode: 'text-to-image' | 'image-to-image' | 'video' | 'intelligence';
  userCreditType: 'free' | 'paid';
}

export function selectBestModel(request: GenerationRequest): ModelDefinition {
  const { mode, images = [], userCreditType } = request;
  const imageCount = images.length;

  // FREE USERS
  if (userCreditType === 'free') {
    if (mode === 'text-to-image') {
      return FREE_MODELS.find(m => m.id === 'seedream')!;
    }
    
    if (mode === 'image-to-image') {
      // 1 image → Kontext
      if (imageCount === 1) {
        return FREE_MODELS.find(m => m.id === 'kontext')!;
      }
      // 2-3 images → NanoBanana
      if (imageCount >= 2 && imageCount <= 3) {
        return FREE_MODELS.find(m => m.id === 'nanobanana')!;
      }
      // 4-10 images → SeeDream
      if (imageCount >= 4 && imageCount <= 10) {
        return FREE_MODELS.find(m => m.id === 'seedream')!;
      }
    }
    
    // Default free
    return FREE_MODELS.find(m => m.id === 'seedream')!;
  }

  // PAID USERS
  if (userCreditType === 'paid') {
    if (mode === 'video') {
      return PAID_MODELS.find(m => m.id === 'veo-3.1-fast')!;
    }
    
    if (mode === 'intelligence') {
      return PAID_MODELS.find(m => m.id === 'gemini-vision')!;
    }
    
    // Default paid: Flux 2 Pro
    return PAID_MODELS.find(m => m.id === 'flux-2-pro')!;
  }

  // Fallback
  return FREE_MODELS.find(m => m.id === 'seedream')!;
}

// ========== PROVIDER STATUS ==========

export const PROVIDER_STATUS = {
  pollinations: { available: true, lastCheck: new Date() },
  together: { available: true, lastCheck: new Date() },
  'kie-ai': { available: true, lastCheck: new Date() },
  replicate: { available: true, lastCheck: new Date() },
};

export function shouldUseFallback(model: ModelDefinition): boolean {
  return model.provider === 'pollinations' && !PROVIDER_STATUS.pollinations.available;
}

export function getFallbackForFreeUser(): ModelDefinition {
  return FALLBACK_MODEL; // Flux Schnell - text-to-image only
}
