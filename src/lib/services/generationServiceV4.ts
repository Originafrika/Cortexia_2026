/**
 * Generation Service V4 - For CreateV4 Full
 * Handles image generation with all providers
 */

import type { GenerationConfig, GenerationResult } from '../types/create-v4';
import { enhancePrompt } from './enhancerService';

interface GenerateParams {
  prompt: string;
  config: GenerationConfig;
  uploadedImages: File[];
  onProgress?: (progress: number) => void;
}

export async function generateImageV4({
  prompt,
  config,
  uploadedImages,
  onProgress,
}: GenerateParams): Promise<GenerationResult> {
  
  let finalPrompt = prompt;
  
  try {
    // Phase 1: Analyzing (0-10%)
    onProgress?.(5);
    await delay(500);

    // Phase 2: Enhancing (10-30%)
    if (config.enhancePrompt) {
      onProgress?.(15);
      
      try {
        const enhancementResult = await enhancePrompt(prompt);
        finalPrompt = enhancementResult.enhanced;
        onProgress?.(30);
      } catch (e) {
        console.warn('Enhancement failed, using original prompt');
        onProgress?.(30);
      }
    } else {
      onProgress?.(30);
    }

    // Phase 3: Generating (30-90%)
    onProgress?.(40);
    
    let imageUrl: string;
    
    // Route to appropriate provider
    switch (config.provider) {
      case 'together':
        imageUrl = await generateWithTogether(finalPrompt, config, onProgress);
        break;
      
      case 'pollinations':
        imageUrl = await generateWithPollinations(finalPrompt, config, uploadedImages, onProgress);
        break;
      
      case 'replicate':
        imageUrl = await generateWithReplicate(finalPrompt, config, onProgress);
        break;
      
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    // Phase 4: Finalizing (90-100%)
    onProgress?.(95);
    await delay(500);
    onProgress?.(100);

    return {
      id: generateId(),
      imageUrl,
      prompt,
      enhancedPrompt: config.enhancePrompt ? finalPrompt : undefined,
      config,
      timestamp: Date.now(),
      cost: 0, // Will be set by caller
      seed: config.seed,
    };

  } catch (error: any) {
    console.error('Generation failed:', error);
    throw new Error(error.message || 'Generation failed');
  }
}

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

async function generateWithTogether(
  prompt: string,
  config: GenerationConfig,
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(50);
  
  const apiUrl = 'https://api.together.xyz/v1/images/generations';
  
  // Check API key
  const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
  if (!apiKey) {
    throw new Error('Together AI API key not configured. Please set VITE_TOGETHER_API_KEY environment variable.');
  }
  
  // Map aspect ratio to dimensions
  const dimensions = getDimensions(config.aspectRatio);
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt,
      width: dimensions.width,
      height: dimensions.height,
      steps: config.quality === 'draft' ? 2 : config.quality === 'high' ? 6 : 4,
      n: config.imageCount || 1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Together AI error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  onProgress?.(90);
  
  if (!data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('Invalid response from Together AI');
  }
  
  return data.data[0].url;
}

async function generateWithPollinations(
  prompt: string,
  config: GenerationConfig,
  uploadedImages: File[],
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(50);
  
  // Determine which Pollinations model to use
  let model = 'flux';
  if (config.model === 'kontext') model = 'flux';
  else if (config.model === 'nanobanana') model = 'flux';
  else if (config.model === 'seedream') model = 'flux';
  
  const dimensions = getDimensions(config.aspectRatio);
  
  // Build URL
  const params = new URLSearchParams({
    width: dimensions.width.toString(),
    height: dimensions.height.toString(),
    model,
    enhance: config.enhancePrompt ? 'true' : 'false',
    nologo: 'true',
  });

  if (config.seed) {
    params.set('seed', config.seed.toString());
  }

  if (config.negativePrompt) {
    params.set('negative', config.negativePrompt);
  }

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
  
  // Preload image to ensure it's generated
  await preloadImage(imageUrl);
  
  onProgress?.(90);
  return imageUrl;
}

async function generateWithReplicate(
  prompt: string,
  config: GenerationConfig,
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(50);
  
  // For now, use Pollinations as fallback since Replicate requires API key setup
  // TODO: Implement real Replicate integration
  console.warn('Replicate not fully implemented, using Pollinations fallback');
  
  return generateWithPollinations(prompt, config, [], onProgress);
}

// ============================================================================
// HELPERS
// ============================================================================

function getDimensions(aspectRatio: string): { width: number; height: number } {
  const ratios: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '9:16': { width: 576, height: 1024 },
    '16:9': { width: 1024, height: 576 },
    '21:9': { width: 1344, height: 576 },
    '3:4': { width: 768, height: 1024 },
    '4:3': { width: 1024, height: 768 },
  };

  return ratios[aspectRatio] || ratios['1:1'];
}

function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}