/**
 * Flux 2 Pro Service
 * Professional image generation via Together AI
 */

import type {
  FluxGenerationRequest,
  FluxGenerationResponse,
} from "./coconut-types.ts";

// ============================================
// CONSTANTS
// ============================================

const FLUX_2_PRO_MODEL = 'black-forest-labs/FLUX.1.1-pro';

const ASPECT_RATIOS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:3': { width: 1536, height: 1152 },
  '3:4': { width: 1152, height: 1536 },
};

const DEFAULT_SETTINGS = {
  steps: 28,
  guidance: 3.5,
  aspectRatio: '1:1' as const,
  seed: -1, // Random
};

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Generate image with Flux 2 Pro
 * Uses Together AI API
 */
export async function generateWithFluxPro(
  request: FluxGenerationRequest
): Promise<FluxGenerationResponse> {
  console.log('🎨 Flux 2 Pro - Starting generation');
  console.log('📝 Prompt:', request.prompt.substring(0, 100));
  
  const startTime = Date.now();
  
  try {
    // Get API key
    const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');
    if (!togetherApiKey) {
      throw new Error('TOGETHER_API_KEY not configured');
    }
    
    // Prepare dimensions
    const dimensions = getDimensions(request);
    
    // Prepare seed
    const seed = request.seed && request.seed > 0 
      ? request.seed 
      : Math.floor(Math.random() * 1000000);
    
    // Build request payload
    const payload = {
      model: FLUX_2_PRO_MODEL,
      prompt: request.prompt,
      negative_prompt: request.negativePrompt || '',
      width: dimensions.width,
      height: dimensions.height,
      steps: request.steps || DEFAULT_SETTINGS.steps,
      guidance_scale: request.guidance || DEFAULT_SETTINGS.guidance,
      seed: seed,
      n: 1,
    };
    
    console.log('📤 Sending request to Together AI:', {
      model: payload.model,
      dimensions: `${payload.width}x${payload.height}`,
      steps: payload.steps,
      guidance: payload.guidance_scale,
      seed: payload.seed,
    });
    
    // Call Together AI
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Together AI error:', error);
      throw new Error(`Together AI request failed: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    // Extract image URL
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      console.error('❌ No image URL in response:', data);
      throw new Error('No image URL returned from Flux 2 Pro');
    }
    
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    
    console.log('✅ Flux 2 Pro generation complete:', {
      url: imageUrl.substring(0, 50),
      timeTaken: `${timeTaken}s`,
      size: `${dimensions.width}x${dimensions.height}`,
    });
    
    return {
      imageUrl,
      seed,
      width: dimensions.width,
      height: dimensions.height,
      timeTaken,
      cost: 10, // 10 credits per image
    };
    
  } catch (error) {
    console.error('❌ Flux 2 Pro generation error:', error);
    throw error;
  }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get dimensions from request
 */
function getDimensions(request: FluxGenerationRequest): { width: number; height: number } {
  // If explicit width/height provided, use them
  if (request.width && request.height) {
    return {
      width: request.width,
      height: request.height,
    };
  }
  
  // If aspect ratio provided, use preset dimensions
  if (request.aspectRatio && ASPECT_RATIOS[request.aspectRatio]) {
    return ASPECT_RATIOS[request.aspectRatio];
  }
  
  // Default to 1:1
  return ASPECT_RATIOS['1:1'];
}

/**
 * Optimize prompt for Flux 2 Pro
 * Adds professional photography/artistic terminology
 */
export function optimizePromptForFlux(basicPrompt: string): string {
  // Check if prompt already looks optimized
  const hasQualityTerms = /\b(4k|8k|high quality|professional|cinematic|detailed)\b/i.test(basicPrompt);
  
  if (hasQualityTerms) {
    // Already optimized, return as-is
    return basicPrompt;
  }
  
  // Add quality enhancers
  const qualityEnhancers = [
    'professional photography',
    'high quality',
    '8K resolution',
    'sharp focus',
    'highly detailed',
  ];
  
  // Random selection to vary outputs
  const selectedEnhancers = qualityEnhancers
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .join(', ');
  
  return `${basicPrompt}, ${selectedEnhancers}`;
}

/**
 * Validate Flux generation request
 */
export function validateFluxRequest(request: FluxGenerationRequest): {
  valid: boolean;
  error?: string;
} {
  // Check prompt
  if (!request.prompt || request.prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' };
  }
  
  if (request.prompt.length > 2000) {
    return { valid: false, error: 'Prompt too long (max 2000 characters)' };
  }
  
  // Check dimensions
  if (request.width) {
    if (request.width < 256 || request.width > 2048) {
      return { valid: false, error: 'Width must be between 256 and 2048' };
    }
    if (request.width % 8 !== 0) {
      return { valid: false, error: 'Width must be divisible by 8' };
    }
  }
  
  if (request.height) {
    if (request.height < 256 || request.height > 2048) {
      return { valid: false, error: 'Height must be between 256 and 2048' };
    }
    if (request.height % 8 !== 0) {
      return { valid: false, error: 'Height must be divisible by 8' };
    }
  }
  
  // Check steps
  if (request.steps && (request.steps < 1 || request.steps > 50)) {
    return { valid: false, error: 'Steps must be between 1 and 50' };
  }
  
  // Check guidance
  if (request.guidance && (request.guidance < 1 || request.guidance > 20)) {
    return { valid: false, error: 'Guidance must be between 1 and 20' };
  }
  
  return { valid: true };
}

/**
 * Estimate generation time
 */
export function estimateFluxGenerationTime(request: FluxGenerationRequest): number {
  const dimensions = getDimensions(request);
  const steps = request.steps || DEFAULT_SETTINGS.steps;
  
  // Base time: ~1 second per step for standard resolution
  const baseTime = steps;
  
  // Adjust for resolution (higher res = longer)
  const totalPixels = dimensions.width * dimensions.height;
  const standardPixels = 1024 * 1024;
  const resolutionMultiplier = totalPixels / standardPixels;
  
  return Math.round(baseTime * resolutionMultiplier);
}

// ============================================
// BATCH GENERATION
// ============================================

/**
 * Generate multiple images with Flux 2 Pro
 * Uses different seeds for variations
 */
export async function generateFluxBatch(
  request: FluxGenerationRequest,
  count: number
): Promise<FluxGenerationResponse[]> {
  console.log(`🎨 Flux 2 Pro - Batch generation (${count} images)`);
  
  const baseSeed = request.seed && request.seed > 0 
    ? request.seed 
    : Math.floor(Math.random() * 1000000);
  
  const promises = Array.from({ length: count }, (_, i) => {
    const seedForThisImage = baseSeed + i;
    return generateWithFluxPro({
      ...request,
      seed: seedForThisImage,
    });
  });
  
  try {
    const results = await Promise.all(promises);
    console.log(`✅ Batch generation complete: ${results.length}/${count} succeeded`);
    return results;
  } catch (error) {
    console.error('❌ Batch generation error:', error);
    throw error;
  }
}

// ============================================
// IMAGE-TO-IMAGE (if supported in future)
// ============================================

/**
 * Placeholder for image-to-image generation
 * Not yet implemented in Flux 2 Pro via Together AI
 */
export async function generateFluxImageToImage(
  request: FluxGenerationRequest & { sourceImageUrl: string }
): Promise<FluxGenerationResponse> {
  throw new Error('Image-to-image not yet supported in Flux 2 Pro');
}
