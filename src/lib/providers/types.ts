// Provider System - Type Definitions
// Defines all types for multi-provider architecture

export type ProviderType = 'pollinations' | 'together' | 'replicate';

export type ProviderTier = 'free-primary' | 'free-fallback' | 'premium';

export type ModelCapability = 
  | 'text-to-image'
  | 'image-to-image'
  | 'enhancement'
  | 'upscaling'
  | 'video-generation'
  | 'image-to-video';

export type MediaType = 'image' | 'video';

export interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
  provider: ProviderType;
  providerTier: ProviderTier;
  capabilities: ModelCapability[];
  
  // Quality & Performance
  speedRating: 1 | 2 | 3 | 4 | 5; // 1=slow, 5=ultra-fast
  qualityRating: 1 | 2 | 3 | 4 | 5; // 1=basic, 5=professional
  
  // Pricing
  costPerGeneration: number; // Base cost in credits
  costPerReferenceImage: number; // Additional cost per ref image
  enhancementBonus: number; // Extra cost if enhancement
  
  // Technical
  maxResolution: { width: number; height: number };
  supportedFormats: string[];
  
  // Metadata
  description: string;
  shortDescription: string;
  recommendedFor: string[];
  limitations?: string[];
  available: boolean;
}

export interface ProviderStatus {
  provider: ProviderType;
  available: boolean;
  rateLimited: boolean;
  resetTime?: Date;
  remaining?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface GenerationParams {
  type: 'text-to-image' | 'image-to-image' | 'enhancement' | 'video';
  prompt: string;
  negativePrompt?: string;
  referenceImages?: string[];
  isEnhancement?: boolean;
  duration?: number; // For video (seconds)
  seed?: number;
  width?: number;
  height?: number;
}

export interface CostCalculation {
  baseGeneration: number;
  referenceImages: number;
  enhancement: number;
  duration: number; // For video
  total: number;
  usd: number; // Total in USD
}

export interface ModelSelection {
  model: ModelConfig;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  alternatives: ModelConfig[];
  cost: CostCalculation;
  warning?: string;
  error?: {
    type: 'upgrade_required' | 'rate_limited' | 'no_provider' | 'insufficient_credits';
    message: string;
    solutions?: {
      option: string;
      cost?: number;
      eta?: string;
      free: boolean;
    }[];
  };
}

// Credit System Types
export type CreditType = 'free' | 'paid';

export interface UserCredits {
  free: number;
  paid: number;
  total: number;
}

export interface CreditDeduction {
  success: boolean;
  paidCreditsUsed: number;
  freeCreditsUsed: number;
  newBalance: UserCredits;
  error?: string;
}

export interface CreditPackage {
  credits: number;
  price: number; // USD
  discount: number; // Percentage
  popular?: boolean;
}

// Generation Context
export interface GenerationContext {
  params: GenerationParams;
  user: {
    credits: UserCredits;
    tier: 'free' | 'premium';
  };
  template?: {
    id: string;
    category: string;
    premium: boolean;
  };
  useCase: 'quick-create' | 'template' | 'remix' | 'coconut-pro';
  preferences?: {
    preferSpeed?: boolean;
    preferQuality?: boolean;
    maxCost?: number;
  };
}
