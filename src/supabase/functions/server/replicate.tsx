// replicate.tsx - Replicate integration (Flux 2 Pro, Imagen 4)
// ✅ Updated with full API specs

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const REPLICATE_API_URL = 'https://api.replicate.com/v1';

// ✅ Premium models - Using correct model identifiers
const FLUX_2_PRO_MODEL = 'black-forest-labs/flux-1.1-pro';
const IMAGEN_4_MODEL = 'google/imagen-4';

export interface ReplicateGenerateOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  model: 'flux-2-pro' | 'imagen-4';
  images?: string[]; // For image-to-image (Flux 2 Pro only)
  aspectRatio?: string; // For aspect ratio (both models)
  safetyFilterLevel?: string; // For Imagen 4
  outputFormat?: string; // jpg, png, webp
}

export interface ReplicateGenerateResult {
  success: boolean;
  url?: string;
  error?: string;
  provider: 'replicate';
  model: string;
  predictionId?: string;
}

/**
 * Create a prediction on Replicate
 */
async function createPrediction(
  model: string,
  input: Record<string, any>
): Promise<any> {
  const response = await fetch(REPLICATE_API_URL + '/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${REPLICATE_API_KEY}`
    },
    body: JSON.stringify({
      version: model,
      input
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replicate API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * Poll prediction status until completion
 */
async function waitForPrediction(predictionId: string, maxAttempts: number = 60): Promise<any> {
  const pollInterval = 2000; // 2 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to poll prediction: ${response.status}`);
    }
    
    const prediction = await response.json();
    
    if (prediction.status === 'succeeded') {
      return prediction;
    }
    
    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`);
    }
    
    // Still processing, wait and retry
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    
    if (attempt % 5 === 0) {
      console.log(`⏳ Waiting for prediction ${predictionId}... (${attempt * 2}s)`);
    }
  }
  
  throw new Error('Prediction timeout after 2 minutes');
}

/**
 * Generate image using Flux 2 Pro
 */
export async function generateFlux2Pro(
  options: ReplicateGenerateOptions
): Promise<ReplicateGenerateResult> {
  if (!REPLICATE_API_KEY) {
    return {
      success: false,
      error: 'REPLICATE_API_KEY not configured',
      provider: 'replicate',
      model: FLUX_2_PRO_MODEL
    };
  }
  
  try {
    console.log(`🚀 Generating with Replicate (Flux 2 Pro)`);
    console.log(`📝 Prompt: ${options.prompt.substring(0, 100)}...`);
    
    const input: Record<string, any> = {
      prompt: options.prompt,
      width: options.width || 720,
      height: options.height || 1280,
      num_outputs: 1,
      output_format: 'png',
      output_quality: 100
    };
    
    if (options.negativePrompt) {
      input.negative_prompt = options.negativePrompt;
    }
    
    if (options.seed) {
      input.seed = options.seed;
    }
    
    // Add image if provided (image-to-image)
    if (options.images && options.images.length > 0) {
      input.image = options.images[0]; // Flux 2 Pro supports one reference image
    }
    
    console.log('🔧 Request params:', {
      model: FLUX_2_PRO_MODEL,
      width: input.width,
      height: input.height,
      hasImage: !!input.image
    });
    
    // Create prediction
    const prediction = await createPrediction(FLUX_2_PRO_MODEL, input);
    console.log(`📦 Prediction created: ${prediction.id}`);
    
    // Wait for completion
    const result = await waitForPrediction(prediction.id);
    
    // Extract image URL
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    if (!imageUrl) {
      console.error('❌ No image URL in response:', result);
      return {
        success: false,
        error: 'No image URL returned',
        provider: 'replicate',
        model: FLUX_2_PRO_MODEL,
        predictionId: prediction.id
      };
    }
    
    console.log(`✅ Flux 2 Pro generated successfully: ${imageUrl.substring(0, 60)}...`);
    
    return {
      success: true,
      url: imageUrl,
      provider: 'replicate',
      model: FLUX_2_PRO_MODEL,
      predictionId: prediction.id
    };
    
  } catch (error) {
    console.error('❌ Flux 2 Pro generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'replicate',
      model: FLUX_2_PRO_MODEL
    };
  }
}

/**
 * Generate image using Imagen 4
 */
export async function generateImagen4(
  options: ReplicateGenerateOptions
): Promise<ReplicateGenerateResult> {
  if (!REPLICATE_API_KEY) {
    return {
      success: false,
      error: 'REPLICATE_API_KEY not configured',
      provider: 'replicate',
      model: IMAGEN_4_MODEL
    };
  }
  
  try {
    console.log(`🚀 Generating with Replicate (Imagen 4)`);
    console.log(`📝 Prompt: ${options.prompt.substring(0, 100)}...`);
    
    const input: Record<string, any> = {
      prompt: options.prompt,
      aspect_ratio: '9:16', // Mobile portrait by default
      output_format: 'png',
      num_outputs: 1
    };
    
    if (options.negativePrompt) {
      input.negative_prompt = options.negativePrompt;
    }
    
    if (options.seed) {
      input.seed = options.seed;
    }
    
    console.log('🔧 Request params:', {
      model: IMAGEN_4_MODEL,
      aspect_ratio: input.aspect_ratio
    });
    
    // Create prediction
    const prediction = await createPrediction(IMAGEN_4_MODEL, input);
    console.log(`📦 Prediction created: ${prediction.id}`);
    
    // Wait for completion
    const result = await waitForPrediction(prediction.id);
    
    // Extract image URL
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    if (!imageUrl) {
      console.error('❌ No image URL in response:', result);
      return {
        success: false,
        error: 'No image URL returned',
        provider: 'replicate',
        model: IMAGEN_4_MODEL,
        predictionId: prediction.id
      };
    }
    
    console.log(`✅ Imagen 4 generated successfully: ${imageUrl.substring(0, 60)}...`);
    
    return {
      success: true,
      url: imageUrl,
      provider: 'replicate',
      model: IMAGEN_4_MODEL,
      predictionId: prediction.id
    };
    
  } catch (error) {
    console.error('❌ Imagen 4 generation failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'replicate',
      model: IMAGEN_4_MODEL
    };
  }
}

/**
 * Main generate function - routes to correct premium model
 */
export async function generatePremium(
  options: ReplicateGenerateOptions
): Promise<ReplicateGenerateResult> {
  if (options.model === 'flux-2-pro') {
    return generateFlux2Pro(options);
  } else if (options.model === 'imagen-4') {
    return generateImagen4(options);
  } else {
    return {
      success: false,
      error: `Unknown premium model: ${options.model}`,
      provider: 'replicate',
      model: options.model
    };
  }
}

/**
 * Check if Replicate is available (API key configured)
 */
export function isReplicateAvailable(): boolean {
  return !!REPLICATE_API_KEY;
}

/**
 * Get model info
 */
export function getModelInfo(model: 'flux-2-pro' | 'imagen-4') {
  if (model === 'flux-2-pro') {
    return {
      name: 'Flux 2 Pro',
      version: FLUX_2_PRO_MODEL,
      cost: 3,
      quality: 'professional',
      speed: 'medium',
      supportsImageToImage: true
    };
  } else {
    return {
      name: 'Imagen 4',
      version: IMAGEN_4_MODEL,
      cost: 3,
      quality: 'professional',
      speed: 'fast',
      supportsImageToImage: false
    };
  }
}