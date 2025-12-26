// together.tsx - Together AI integration (Flux Schnell)

const TOGETHER_API_KEY = Deno.env.get('TOGETHER_API_KEY');
const TOGETHER_API_URL = 'https://api.together.xyz/v1/images/generations';

// Flux Schnell - Fast, free model (600 RPM)
const FLUX_SCHNELL_MODEL = 'black-forest-labs/FLUX.1-schnell-Free';

export interface TogetherGenerateOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  steps?: number;
}

export interface TogetherGenerateResult {
  success: boolean;
  url?: string;
  error?: string;
  provider: 'together';
  model: string;
}

/**
 * Generate image using Together AI (Flux Schnell)
 * Fast, free model with 600 RPM limit
 */
export async function generateFluxSchnell(
  options: TogetherGenerateOptions
): Promise<TogetherGenerateResult> {
  if (!TOGETHER_API_KEY) {
    return {
      success: false,
      error: 'TOGETHER_API_KEY not configured',
      provider: 'together',
      model: FLUX_SCHNELL_MODEL
    };
  }
  
  try {
    console.log(`🚀 Generating with Together AI (Flux Schnell)`);
    console.log(`📝 Prompt: ${options.prompt.substring(0, 100)}...`);
    
    const requestBody = {
      model: FLUX_SCHNELL_MODEL,
      prompt: options.prompt,
      negative_prompt: options.negativePrompt || '',
      width: options.width || 720,
      height: options.height || 1280,
      steps: options.steps || 4, // Flux Schnell is optimized for 4 steps
      n: 1,
      seed: options.seed || Math.floor(Math.random() * 1000000),
      response_format: 'url'
    };
    
    console.log('🔧 Request params:', {
      model: requestBody.model,
      width: requestBody.width,
      height: requestBody.height,
      steps: requestBody.steps,
      seed: requestBody.seed
    });
    
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOGETHER_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Together AI error (${response.status}):`, errorText);
      
      // Parse error for better messaging
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Ignore parse error
      }
      
      return {
        success: false,
        error: errorMessage,
        provider: 'together',
        model: FLUX_SCHNELL_MODEL
      };
    }
    
    const data = await response.json();
    
    // Together AI returns array of images
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error('❌ No image URL in response:', data);
      return {
        success: false,
        error: 'No image URL returned',
        provider: 'together',
        model: FLUX_SCHNELL_MODEL
      };
    }
    
    console.log(`✅ Together AI generated successfully: ${imageUrl.substring(0, 60)}...`);
    
    return {
      success: true,
      url: imageUrl,
      provider: 'together',
      model: FLUX_SCHNELL_MODEL
    };
    
  } catch (error) {
    console.error('❌ Together AI generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'together',
      model: FLUX_SCHNELL_MODEL
    };
  }
}

/**
 * Check if Together AI is available (API key configured)
 */
export function isTogetherAvailable(): boolean {
  return !!TOGETHER_API_KEY;
}

/**
 * Get Together AI rate limit info
 * Flux Schnell: 600 requests per minute (free tier)
 */
export function getRateLimitInfo() {
  return {
    model: FLUX_SCHNELL_MODEL,
    requestsPerMinute: 600,
    cost: 'free',
    recommendedSteps: 4
  };
}

/**
 * Validate dimensions for Together AI
 * Together AI supports various aspect ratios
 */
export function validateDimensions(width: number, height: number): {
  valid: boolean;
  error?: string;
  suggested?: { width: number; height: number };
} {
  // Together AI supports dimensions from 256 to 2048
  const MIN_DIM = 256;
  const MAX_DIM = 2048;
  
  if (width < MIN_DIM || height < MIN_DIM) {
    return {
      valid: false,
      error: `Dimensions too small. Minimum: ${MIN_DIM}x${MIN_DIM}`,
      suggested: { width: Math.max(width, MIN_DIM), height: Math.max(height, MIN_DIM) }
    };
  }
  
  if (width > MAX_DIM || height > MAX_DIM) {
    return {
      valid: false,
      error: `Dimensions too large. Maximum: ${MAX_DIM}x${MAX_DIM}`,
      suggested: { width: Math.min(width, MAX_DIM), height: Math.min(height, MAX_DIM) }
    };
  }
  
  // Dimensions should be multiples of 8 for best results
  if (width % 8 !== 0 || height % 8 !== 0) {
    return {
      valid: true, // Still valid, but not optimal
      error: 'Dimensions should be multiples of 8 for best results',
      suggested: {
        width: Math.round(width / 8) * 8,
        height: Math.round(height / 8) * 8
      }
    };
  }
  
  return { valid: true };
}

/**
 * Get optimal steps for different quality levels
 */
export function getOptimalSteps(quality: 'fast' | 'standard' | 'high'): number {
  switch (quality) {
    case 'fast':
      return 2; // Fastest
    case 'standard':
      return 4; // Recommended for Flux Schnell
    case 'high':
      return 6; // Better quality, slower
    default:
      return 4;
  }
}
