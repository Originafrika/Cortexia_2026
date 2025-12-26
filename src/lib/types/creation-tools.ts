/**
 * CREATION TOOLS TYPES
 * Types pour le hub de création multi-outils
 */

export type ToolCategory = 'image' | 'video' | 'ai-tools' | 'utilities' | 'coconut';

export type APIProvider = 'pollinations' | 'together' | 'replicate';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  provider: APIProvider;
  isPro?: boolean;
  estimatedTime?: string; // "~5s", "~30s", etc.
}

// Text to Image
export interface TextToImageParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps?: number;
  seed?: number;
  provider: APIProvider;
}

export interface TextToImageResult {
  id: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
  provider: APIProvider;
  createdAt: string;
}

// Image to Image
export interface ImageToImageParams {
  sourceImage: string;
  prompt: string;
  strength?: number; // 0-1
  provider: APIProvider;
}

export interface ImageToImageResult {
  id: string;
  url: string;
  sourceUrl: string;
  prompt: string;
  provider: APIProvider;
  createdAt: string;
}

// Image to Video
export interface ImageToVideoParams {
  sourceImage: string;
  prompt?: string;
  duration?: number; // seconds
  motion?: 'low' | 'medium' | 'high';
  provider: APIProvider;
}

export interface ImageToVideoResult {
  id: string;
  url: string;
  sourceUrl: string;
  duration: number;
  provider: APIProvider;
  createdAt: string;
}

// Image Upscale
export interface ImageUpscaleParams {
  sourceImage: string;
  scale: 2 | 4 | 8;
  enhance?: boolean;
  provider: APIProvider;
}

export interface ImageUpscaleResult {
  id: string;
  url: string;
  sourceUrl: string;
  scale: number;
  provider: APIProvider;
  createdAt: string;
}

// Background Removal
export interface BackgroundRemovalParams {
  sourceImage: string;
  provider: APIProvider;
}

export interface BackgroundRemovalResult {
  id: string;
  url: string;
  sourceUrl: string;
  provider: APIProvider;
  createdAt: string;
}

// Style Transfer
export interface StyleTransferParams {
  sourceImage: string;
  styleImage: string;
  strength?: number;
  provider: APIProvider;
}

export interface StyleTransferResult {
  id: string;
  url: string;
  sourceUrl: string;
  styleUrl: string;
  provider: APIProvider;
  createdAt: string;
}

// Prompt Enhancer
export interface PromptEnhancerParams {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cinematic' | 'anime';
  detail?: 'low' | 'medium' | 'high';
}

export interface PromptEnhancerResult {
  original: string;
  enhanced: string;
  improvements: string[];
  keywords: string[];
}

// Video to Video
export interface VideoToVideoParams {
  sourceVideo: string;
  prompt: string;
  strength?: number;
  provider: APIProvider;
}

export interface VideoToVideoResult {
  id: string;
  url: string;
  sourceUrl: string;
  prompt: string;
  provider: APIProvider;
  createdAt: string;
}

// Batch Generation
export interface BatchGenerationParams {
  prompts: string[];
  width: number;
  height: number;
  provider: APIProvider;
}

export interface BatchGenerationResult {
  id: string;
  results: TextToImageResult[];
  total: number;
  completed: number;
  failed: number;
  createdAt: string;
}

// Generation History
export interface GenerationHistoryItem {
  id: string;
  tool: string;
  params: any;
  result: any;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error?: string;
  createdAt: string;
}
