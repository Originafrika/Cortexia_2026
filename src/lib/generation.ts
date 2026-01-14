// AI Generation API Integration
// ✅ FIXED: Now uses Supabase backend for authenticated Pollinations API calls
// The backend handles API key authentication securely
// ✅ SMART MODEL SELECTION: Automatically chooses best model for face quality

import type { MediaType, GenerationOptions } from "./types";
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';
import { selectBestModel } from './modelSelector'; // ✅ Smart model selection

const BACKEND_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;
const REQUEST_TIMEOUT = 120000; // 120 seconds (2 minutes) - matches backend timeout

export interface GenerationResult {
  success: boolean;
  url?: string;
  error?: string;
  seed?: number | string;
}

/**
 * Main generation function - routes to backend API
 * ✅ FIXED: Now accepts type in options object for consistency
 */
export async function generateMedia(
  prompt: string,
  options: {
    type: MediaType;
    style?: string;
    ratio?: string;
    seed?: number | string;
    quality?: string;
    referenceImages?: string[]; // Reference images for img2img
    model?: string; // ✅ Model selection
    enhancePrompt?: boolean; // ✅ Enhance prompt with Apriel (+1 credit)
    userId?: string; // ✅ NEW: User ID for credit tracking
  }
): Promise<GenerationResult> {
  // Route to appropriate generator based on type
  if (options.type === "video") {
    return generateVideo(prompt, options);
  }
  return generateImage(prompt, options);
}

/**
 * Generate image via backend Pollinations API
 * ✅ FIXED: Uses authenticated backend endpoint
 */
export async function generateImage(
  prompt: string,
  options?: Partial<GenerationOptions> & { referenceImages?: string[]; model?: string; enhancePrompt?: boolean; userId?: string }
): Promise<GenerationResult> {
  try {
    console.log('🎨 Starting image generation via backend');
    console.log('📝 Prompt:', prompt.substring(0, 100));
    
    // Enhance prompt with style if provided
    let enhancedPrompt = prompt;
    if (options?.style) {
      enhancedPrompt = `${prompt}, ${options.style} style`;
    }
    
    // Add quality hints
    if (options?.quality === "ultra") {
      enhancedPrompt += ", ultra high quality, 8k, detailed";
    } else if (options?.quality === "high") {
      enhancedPrompt += ", high quality, detailed";
    }
    
    // Get dimensions - prioritize explicit width/height, fallback to ratio calculation
    let dimensions: { width: number; height: number };
    
    if (options?.width && options?.height) {
      // Use explicit dimensions if provided
      dimensions = { width: options.width, height: options.height };
      console.log(`📐 Using explicit dimensions: ${dimensions.width}×${dimensions.height}`);
    } else if (options?.ratio) {
      // Calculate from ratio
      dimensions = getRatioPixels(options.ratio);
      console.log(`📐 Calculated dimensions from ratio ${options.ratio}: ${dimensions.width}×${dimensions.height}`);
    } else {
      // Default dimensions
      dimensions = { width: 1024, height: 1024 };
      console.log(`📐 Using default dimensions: ${dimensions.width}×${dimensions.height}`);
    }
    
    // ✅ USE MODEL FROM OPTIONS OR FALLBACK TO AUTO-SELECTION
    let selectedModel: string;
    if (options?.model) {
      selectedModel = options.model;
      console.log(`🤖 Using provided model: ${selectedModel}`);
    } else {
      const modelRecommendation = selectBestModel(enhancedPrompt);
      selectedModel = modelRecommendation.model;
      console.log(`🤖 Auto-selected model: ${selectedModel} (${modelRecommendation.reason})`);
    }
    
    // Build request payload
    const payload = {
      prompt: enhancedPrompt,
      options: {
        seed: options?.seed || Math.floor(Math.random() * 1000000),
        width: dimensions.width,
        height: dimensions.height,
        model: selectedModel, // ✅ Use provided or auto-selected model
        quality: options?.quality === 'ultra' ? 'high' : (options?.quality || 'high'),
        enhance: false, // ✅ Disabled by default - can be enabled per model/request
        safe: true, // ✅ Always true - NSFW content filtering enabled
        private: true, // Privacy
        nologo: true, // No watermark
        referenceImages: options?.referenceImages || [], // Reference images
        enhancePrompt: options?.enhancePrompt ?? true, // ✅ Default true - enhance with Apriel
        userId: options?.userId // ✅ NEW: User ID for credit tracking
      }
    };
    
    console.log('📦 Request payload:', {
      prompt: payload.prompt.substring(0, 50) + '...',
      options: payload.options
    });
    
    // ✅ Call backend /generate endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Backend error:', errorData);
        
        // ✅ DETECT NSFW CONTENT ERROR
        let errorMessage = errorData.error || `Backend error: ${response.status}`;
        
        if (typeof errorData.error === 'string' && errorData.error.includes('NSFW content detected')) {
          errorMessage = 'Content policy violation: Your prompt contains inappropriate content. Please rephrase and try again.';
        } else if (typeof errorData.error === 'object' && errorData.error.message) {
          // Parse nested error structure
          const nestedMessage = errorData.error.message;
          if (typeof nestedMessage === 'string' && nestedMessage.includes('NSFW content detected')) {
            errorMessage = 'Content policy violation: Your prompt contains inappropriate content. Please rephrase and try again.';
          }
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('❌ Generation failed:', data.error);
        return {
          success: false,
          error: data.error || 'Generation failed'
        };
      }
      
      console.log('✅ Image generated successfully');
      console.log('🔗 URL:', data.url);
      
      return {
        success: true,
        url: data.url,
        seed: data.seed
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error('❌ Request timeout');
          return {
            success: false,
            error: 'Request timeout - generation took too long'
          };
        }
        
        console.error('❌ Network error:', fetchError.message);
        return {
          success: false,
          error: `Network error: ${fetchError.message}`
        };
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed"
    };
  }
}

/**
 * Get pixel dimensions for aspect ratio
 */
function getRatioPixels(ratio: string): { width: number; height: number } {
  const ratios: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },   // Square (Instagram post)
    "9:16": { width: 768, height: 1344 },   // Vertical (TikTok, Reels)
    "16:9": { width: 1344, height: 768 },   // Horizontal (YouTube)
    "4:3": { width: 1152, height: 896 },    // Standard
    "4:5": { width: 1024, height: 1280 },   // Instagram portrait
    "3:2": { width: 1280, height: 853 },    // Photo standard
    "2:3": { width: 853, height: 1280 },    // Photo portrait
  };

  return ratios[ratio] || ratios["1:1"]; // Default to 1:1 (seedream default)
}

/**
 * Generate video (placeholder - not yet implemented)
 */
export async function generateVideo(
  prompt: string,
  options?: Partial<GenerationOptions>
): Promise<GenerationResult> {
  console.warn('⚠️ Video generation not yet implemented');
  return {
    success: false,
    error: "Video generation is not yet implemented. Please use image generation for now."
  };
}

/**
 * Generate multiple variations with different seeds
 */
export async function generateVariations(
  prompt: string,
  type: MediaType,
  options?: Partial<GenerationOptions>,
  count: number = 3
): Promise<GenerationResult[]> {
  console.log(`🎨 Generating ${count} variations`);
  
  const variants: GenerationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    // Use different seeds for each variant
    const variantOptions = {
      type,
      ...options,
      seed: options?.seed ? Number(options.seed) + i : Math.floor(Math.random() * 1000000)
    };
    
    const result = await generateMedia(prompt, variantOptions);
    variants.push(result);
    
    // Small delay between generations to avoid rate limiting
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return variants;
}

/**
 * Remix/variation of existing image
 * Uses the original image as reference for img2img generation
 */
export async function remixImage(
  imageUrl: string,
  newPrompt: string,
  strength: number = 0.7
): Promise<GenerationResult> {
  console.log('🔄 Remixing image');
  console.log('🖼️ Original URL:', imageUrl);
  console.log('📝 New prompt:', newPrompt);
  
  // Use reference images parameter to pass original image
  return generateImage(newPrompt, {
    referenceImages: [imageUrl],
    quality: 'high'
  });
}

/**
 * Batch generation with progress callback
 */
export async function generateBatch(
  prompts: Array<{
    prompt: string;
    type: MediaType;
    options?: Partial<GenerationOptions>;
  }>,
  onProgress?: (completed: number, total: number) => void
): Promise<GenerationResult[]> {
  console.log(`📦 Batch generating ${prompts.length} items`);
  
  const results: GenerationResult[] = [];
  
  for (let i = 0; i < prompts.length; i++) {
    const { prompt, type, options } = prompts[i];
    
    const result = await generateMedia(prompt, {
      type,
      ...options
    });
    
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, prompts.length);
    }
    
    // Small delay between generations
    if (i < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`✅ Batch generation complete: ${results.filter(r => r.success).length}/${prompts.length} succeeded`);
  
  return results;
}

// Export utility functions
export { getRatioPixels };