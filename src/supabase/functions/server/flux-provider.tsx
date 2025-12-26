/**
 * FLUX 2 PRO PROVIDER
 * Phase 1: Generation Engine Core
 * 
 * Implements image generation with multi-image blending using Flux 2 Pro.
 * 
 * Key Features:
 * - Basic text-to-image generation
 * - Multi-image blending (up to 10 reference images)
 * - Configurable reference weight
 * - Automatic upload to Supabase Storage
 * 
 * Model: black-forest-labs/flux-2-pro (Replicate)
 * Cost: 10 credits per image
 */

import { uploadAssetFromUrl } from './storage.tsx';

// ============================================
// TYPES
// ============================================

export interface FluxGenerationParams {
  prompt: string;
  width: number;
  height: number;
  
  // Multi-image blending
  referenceImages?: string[];    // URLs of reference images
  referenceWeight?: number;      // 0.0-1.0 (default: 0.6)
  
  // Advanced options
  negativePrompt?: string;
  seed?: number;
  guidanceScale?: number;        // Default: 3.5
  numInferenceSteps?: number;    // Default: 28
  
  // Metadata
  cocoboardId?: string;
  nodeId?: string;
}

export interface FluxGenerationResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    model: string;
    creditsUsed: number;
    seed: number;
    generationTime: number;
    referenceCount: number;
    prompt: string;
  };
}

// ============================================
// REPLICATE API
// ============================================

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const FLUX_MODEL = 'black-forest-labs/flux-1.1-pro';
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

/**
 * Call Replicate API and wait for result
 */
async function runReplicateModel(input: any): Promise<string[]> {
  if (!REPLICATE_API_KEY) {
    throw new Error('REPLICATE_API_KEY not configured');
  }
  
  console.log('  📡 Calling Replicate API...');
  
  // Create prediction
  const createResponse = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: FLUX_MODEL,
      input,
    }),
  });
  
  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Replicate API error: ${error}`);
  }
  
  const prediction = await createResponse.json();
  const predictionId = prediction.id;
  
  console.log(`  ⏳ Prediction created: ${predictionId}`);
  console.log('  ⏳ Waiting for generation...');
  
  // Poll for result
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes timeout
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    
    const statusResponse = await fetch(
      `${REPLICATE_API_URL}/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
        },
      }
    );
    
    if (!statusResponse.ok) {
      throw new Error('Failed to check prediction status');
    }
    
    const status = await statusResponse.json();
    
    if (status.status === 'succeeded') {
      console.log('  ✅ Generation succeeded');
      return Array.isArray(status.output) ? status.output : [status.output];
    }
    
    if (status.status === 'failed') {
      throw new Error(`Generation failed: ${status.error}`);
    }
    
    attempts++;
    
    if (attempts % 6 === 0) {
      console.log(`  ⏳ Still generating... (${attempts * 5}s elapsed)`);
    }
  }
  
  throw new Error('Generation timeout (5 minutes)');
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Generate image using Flux 2 Pro
 * 
 * Supports multi-image blending for progressive layer generation.
 * Reference images are blended with configurable weight.
 * 
 * @param params - Generation parameters
 * @returns Generation result with URL and metadata
 */
export async function generateFluxImage(
  params: FluxGenerationParams
): Promise<FluxGenerationResult> {
  try {
    console.log('\n🎨 ===== FLUX 2 PRO GENERATION =====');
    console.log(`   Prompt: "${params.prompt}"`);
    console.log(`   Size: ${params.width}×${params.height}`);
    
    const startTime = Date.now();
    
    // ============================================
    // PREPARE REQUEST BODY
    // ============================================
    
    const body: any = {
      prompt: params.prompt,
      width: params.width,
      height: params.height,
      num_inference_steps: params.numInferenceSteps || 28,
      guidance_scale: params.guidanceScale || 3.5,
      output_format: 'png',
      output_quality: 100,
    };
    
    // ============================================
    // MULTI-IMAGE BLENDING (Key Feature)
    // ============================================
    
    if (params.referenceImages && params.referenceImages.length > 0) {
      // Flux 2 Pro supports up to 10 reference images
      const maxRefs = Math.min(params.referenceImages.length, 10);
      const weight = params.referenceWeight || 0.6;
      
      console.log(`\n   🖼️  MULTI-IMAGE BLENDING ENABLED`);
      console.log(`   Reference Images: ${maxRefs}`);
      console.log(`   Blend Weight: ${weight}`);
      
      // Log each reference
      params.referenceImages.slice(0, maxRefs).forEach((url, i) => {
        console.log(`     ${i + 1}. ${url.substring(0, 60)}...`);
      });
      
      // Add to request body
      // Note: Flux 2 Pro uses "image_prompts" parameter for blending
      body.image_prompts = params.referenceImages.slice(0, maxRefs).map((url) => ({
        image: url,
        weight: weight,
      }));
    } else {
      console.log('   ℹ️  No reference images (basic generation)');
    }
    
    // ============================================
    // OPTIONAL PARAMETERS
    // ============================================
    
    if (params.negativePrompt) {
      body.negative_prompt = params.negativePrompt;
      console.log(`   Negative Prompt: "${params.negativePrompt}"`);
    }
    
    if (params.seed) {
      body.seed = params.seed;
      console.log(`   Seed: ${params.seed}`);
    } else {
      // Generate random seed for reproducibility
      body.seed = Math.floor(Math.random() * 1000000);
    }
    
    console.log(`   Guidance Scale: ${body.guidance_scale}`);
    console.log(`   Inference Steps: ${body.num_inference_steps}`);
    
    // ============================================
    // CALL REPLICATE API
    // ============================================
    
    const output = await runReplicateModel(body);
    
    if (!output || output.length === 0) {
      throw new Error('No output from Flux 2 Pro');
    }
    
    const imageUrl = output[0];
    const generationTime = Date.now() - startTime;
    
    console.log(`\n   ✅ Image generated in ${(generationTime / 1000).toFixed(1)}s`);
    console.log(`   Temporary URL: ${imageUrl.substring(0, 60)}...`);
    
    // ============================================
    // UPLOAD TO SUPABASE STORAGE
    // ============================================
    
    console.log('   📤 Uploading to Supabase Storage...');
    
    const cocoboardId = params.cocoboardId || 'unknown';
    const nodeId = params.nodeId || 'unknown';
    
    const storedUrl = await uploadAssetFromUrl(
      imageUrl,
      'image',
      cocoboardId,
      nodeId
    );
    
    console.log(`   ✅ Stored at: ${storedUrl.substring(0, 60)}...`);
    
    // ============================================
    // RETURN RESULT
    // ============================================
    
    const result: FluxGenerationResult = {
      success: true,
      url: storedUrl,
      metadata: {
        model: 'flux-2-pro',
        creditsUsed: 10, // Base cost for Flux 2 Pro
        seed: body.seed,
        generationTime,
        referenceCount: params.referenceImages?.length || 0,
        prompt: params.prompt,
      },
    };
    
    console.log('\n✅ ===== FLUX GENERATION COMPLETE =====');
    console.log(`   Credits Used: ${result.metadata!.creditsUsed}`);
    console.log(`   Total Time: ${(generationTime / 1000).toFixed(1)}s\n`);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ ===== FLUX GENERATION ERROR =====');
    console.error(error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Estimate credits for Flux generation
 * 
 * @param params - Generation parameters
 * @returns Estimated credits
 */
export function estimateFluxCredits(params: FluxGenerationParams): number {
  // Base cost: 10 credits
  // Multi-image blending: +0 (included in base)
  // High resolution: +0 (included in base)
  return 10;
}

/**
 * Validate Flux generation parameters
 * 
 * @param params - Parameters to validate
 * @throws Error if invalid
 */
export function validateFluxParams(params: FluxGenerationParams): void {
  if (!params.prompt || params.prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }
  
  if (params.width < 256 || params.width > 2048) {
    throw new Error('Width must be between 256 and 2048');
  }
  
  if (params.height < 256 || params.height > 2048) {
    throw new Error('Height must be between 256 and 2048');
  }
  
  if (params.referenceWeight !== undefined && 
      (params.referenceWeight < 0 || params.referenceWeight > 1)) {
    throw new Error('Reference weight must be between 0.0 and 1.0');
  }
  
  if (params.guidanceScale !== undefined && 
      (params.guidanceScale < 1 || params.guidanceScale > 20)) {
    throw new Error('Guidance scale must be between 1 and 20');
  }
  
  if (params.numInferenceSteps !== undefined && 
      (params.numInferenceSteps < 1 || params.numInferenceSteps > 50)) {
    throw new Error('Inference steps must be between 1 and 50');
  }
  
  if (params.referenceImages && params.referenceImages.length > 10) {
    console.warn('⚠️  Flux 2 Pro supports max 10 reference images. Truncating...');
  }
}

// ============================================
// HELPER FUNCTIONS FOR ENHANCED SYSTEM
// ============================================

/**
 * Simple text-to-image generation (wrapper)
 */
export async function generateImage(params: {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  model?: 'flux-2-pro';
}): Promise<{ url: string; dimensions: { width: number; height: number } }> {
  const dims = getAspectRatioDimensions(params.aspectRatio || '16:9');
  
  const result = await generateFluxImage({
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    width: dims.width,
    height: dims.height
  });
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Generation failed');
  }
  
  return {
    url: result.url,
    dimensions: dims
  };
}

/**
 * Image-to-image generation with reference
 */
export async function generateImageWithRef(params: {
  prompt: string;
  referenceImage: string;
  aspectRatio?: string;
  strength?: number; // 0-1, how much to follow reference
}): Promise<{ url: string; dimensions: { width: number; height: number } }> {
  const dims = getAspectRatioDimensions(params.aspectRatio || '16:9');
  
  const result = await generateFluxImage({
    prompt: params.prompt,
    width: dims.width,
    height: dims.height,
    referenceImages: [params.referenceImage],
    referenceWeight: params.strength || 0.7
  });
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Generation failed');
  }
  
  return {
    url: result.url,
    dimensions: dims
  };
}

/**
 * Get dimensions from aspect ratio string
 */
function getAspectRatioDimensions(aspectRatio: string): { width: number; height: number } {
  const ratios: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:3': { width: 1440, height: 1080 },
    '2560x1440': { width: 2560, height: 1440 },
    '1080x1920': { width: 1080, height: 1920 }
  };
  
  return ratios[aspectRatio] || ratios['16:9'];
}

// ============================================
// EXPORT
// ============================================

export default generateFluxImage;