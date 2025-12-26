/**
 * VIDEO GENERATION TYPES
 * Veo 3.1 models from Kie AI
 */

export type VideoModel = 'veo3_fast' | 'veo3';

export type GenerationType = 
  | 'TEXT_2_VIDEO' 
  | 'FIRST_AND_LAST_FRAMES_2_VIDEO' 
  | 'REFERENCE_2_VIDEO';

export type AspectRatio = '16:9' | '9:16' | 'Auto';

export interface VideoGenerationRequest {
  prompt: string;
  model?: VideoModel;
  generationType?: GenerationType;
  imageUrls?: string[];
  aspectRatio?: AspectRatio;
  seeds?: number;
  watermark?: string;
  userId?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  taskId?: string;
  message?: string;
  error?: string;
  code?: number;
}

export interface VideoStatusResponse {
  success: boolean;
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt?: string;
  completedAt?: string;
  resultUrls?: string[];
  originUrls?: string[];
  resolution?: string;
  storedUrl?: string;
  errorCode?: number;
  errorMessage?: string;
}

export interface VideoExtendRequest {
  taskId: string;
  prompt: string;
  seeds?: number;
  watermark?: string;
  userId?: string;
}

export interface Video1080PResponse {
  success: boolean;
  url?: string;
  resolution?: string;
  error?: string;
}

/**
 * VIDEO PRICING CONFIGURATION
 */
export const VIDEO_PRICING = {
  // Veo3 Fast
  veo3_fast: {
    base: 10, // 10 credits
    perImage: 1, // +1 credit per image
    extend: 10, // 10 credits to extend
  },
  // Veo3 Quality
  veo3: {
    base: 40, // 40 credits
    perImage: 1, // +1 credit per image
    extend: 40, // 40 credits to extend
  },
  // 1080P upgrade
  upgrade_1080p: 2, // 2 credits
} as const;

/**
 * Calculate video generation cost
 */
export function calculateVideoCost(
  model: VideoModel,
  generationType?: GenerationType,
  imageCount: number = 0
): number {
  const pricing = VIDEO_PRICING[model];
  if (!pricing) {
    console.error('Invalid video model:', model);
    return 0;
  }
  return pricing.base + (imageCount * pricing.perImage);
}

/**
 * MODEL CONFIGURATIONS
 */
export const VIDEO_MODELS = [
  {
    value: 'veo3_fast' as VideoModel,
    label: 'Veo 3.1 Fast',
    speed: '~30s',
    quality: 'Standard',
    description: 'Fast generation for quick iterations',
    paid: true,
    modes: ['TEXT_2_VIDEO', 'FIRST_AND_LAST_FRAMES_2_VIDEO', 'REFERENCE_2_VIDEO'] as GenerationType[],
    aspectRatios: ['16:9', '9:16', 'Auto'] as AspectRatio[],
  },
  {
    value: 'veo3' as VideoModel,
    label: 'Veo 3.1 Quality',
    speed: '~60s',
    quality: 'Premium',
    description: 'High quality for final production',
    paid: true,
    badge: 'BEST' as const,
    modes: ['TEXT_2_VIDEO', 'FIRST_AND_LAST_FRAMES_2_VIDEO'] as GenerationType[],
    aspectRatios: ['16:9', '9:16', 'Auto'] as AspectRatio[],
  },
] as const;

/**
 * GENERATION MODE CONFIGURATIONS
 */
export const GENERATION_MODES = [
  {
    value: 'TEXT_2_VIDEO' as GenerationType,
    label: 'Text to Video',
    icon: '✍️',
    description: 'Generate video from text prompt only',
    imageCount: 0,
    supportsModels: ['veo3_fast', 'veo3'] as VideoModel[],
  },
  {
    value: 'FIRST_AND_LAST_FRAMES_2_VIDEO' as GenerationType,
    label: 'Animate Image',
    icon: '🎬',
    description: '1 image (animate) or 2 images (transition)',
    imageCount: [1, 2],
    supportsModels: ['veo3_fast', 'veo3'] as VideoModel[],
  },
  {
    value: 'REFERENCE_2_VIDEO' as GenerationType,
    label: 'Reference-based',
    icon: '🖼️',
    description: '1-3 reference images for style guidance',
    imageCount: [1, 2, 3],
    supportsModels: ['veo3_fast'] as VideoModel[],
    requirements: '⚠️ veo3_fast + 16:9 only',
  },
] as const;