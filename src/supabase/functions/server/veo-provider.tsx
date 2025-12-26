/**
 * VEO 2 PROVIDER (Experimental)
 * Uses Google Veo 2 for cinematic video generation
 * 
 * Key Features:
 * - Extended video generation (up to 2 minutes)
 * - Cinematic quality and style
 * - Advanced camera movements
 * 
 * Model: google/veo-2 (via Replicate)
 * Max Duration: 8 seconds
 */

import { uploadAssetFromUrl, extractLastFrameFromVideo } from './storage.tsx';

// ============================================
// TYPES
// ============================================

export interface VeoGenerationParams {
  prompt: string;
  duration: number;              // Max 8 seconds
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: '720p' | '1080p';
  
  // Frame continuity
  image?: string;                // Start frame URL (image-to-video)
  lastFrame?: string;            // DEPRECATED: Use image instead
  
  // Advanced options
  generateAudio: boolean;        // Default: false
  seed?: number;
  
  // Metadata
  cocoboardId?: string;
  nodeId?: string;
}

export interface VeoGenerationResult {
  success: boolean;
  url?: string;                  // Video URL in Supabase Storage
  lastFrameUrl?: string;         // Extracted last frame for next shot
  error?: string;
  metadata?: {
    model: string;
    creditsUsed: number;
    duration: number;
    generationTime: number;
    seed: number;
    prompt: string;
  };
}

// ============================================
// REPLICATE API
// ============================================

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const VEO_MODEL = 'google/veo-2';
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

/**
 * Call Replicate API and wait for result
 */
async function runReplicateModel(input: any): Promise<string> {
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
      version: VEO_MODEL,
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
  console.log('  ⏳ Waiting for generation... (this may take 2-5 minutes)');
  
  // Poll for result
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes timeout
  
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
      // Veo returns a single video URL
      return typeof status.output === 'string' ? status.output : status.output[0];
    }
    
    if (status.status === 'failed') {
      throw new Error(`Generation failed: ${status.error}`);
    }
    
    attempts++;
    
    if (attempts % 12 === 0) {
      console.log(`  ⏳ Still generating... (${attempts * 5}s elapsed)`);
    }
  }
  
  throw new Error('Generation timeout (10 minutes)');
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Generate video using Veo 3.1 Fast
 * 
 * Supports last_frame continuity for smooth shot-to-shot transitions.
 * Automatically extracts last frame for use in next shot.
 * 
 * @param params - Generation parameters
 * @returns Generation result with video URL and extracted last frame
 */
export async function generateVeoVideo(
  params: VeoGenerationParams
): Promise<VeoGenerationResult> {
  try {
    console.log('\n🎬 ===== VEO 3.1 FAST GENERATION =====');
    console.log(`   Prompt: "${params.prompt}"`);
    console.log(`   Duration: ${params.duration}s`);
    console.log(`   Aspect Ratio: ${params.aspectRatio}`);
    console.log(`   Resolution: ${params.resolution}`);
    
    const startTime = Date.now();
    
    // ============================================
    // PREPARE REQUEST BODY
    // ============================================
    
    const body: any = {
      prompt: params.prompt,
      duration: params.duration,
      aspect_ratio: params.aspectRatio,
      resolution: params.resolution,
      generate_audio: params.generateAudio || false,
    };
    
    // ============================================
    // LAST_FRAME CONTINUITY (Key Feature)
    // ============================================
    
    if (params.image) {
      console.log(`\n   🎞️  CONTINUITY ENABLED`);
      console.log(`   Start Frame: ${params.image.substring(0, 60)}...`);
      
      // Veo uses "image" parameter for start frame (image-to-video)
      // This enables smooth transitions between shots
      body.image = params.image;
      
      console.log('   ℹ️  Video will start from this frame');
    } else {
      console.log('   ℹ️  Text-to-video (no start frame)');
    }
    
    // ============================================
    // OPTIONAL PARAMETERS
    // ============================================
    
    if (params.seed) {
      body.seed = params.seed;
      console.log(`   Seed: ${params.seed}`);
    } else {
      // Generate random seed for reproducibility
      body.seed = Math.floor(Math.random() * 1000000);
    }
    
    console.log(`   Generate Audio: ${body.generate_audio}`);
    
    // ============================================
    // CALL REPLICATE API
    // ============================================
    
    const videoUrl = await runReplicateModel(body);
    
    const generationTime = Date.now() - startTime;
    
    console.log(`\n   ✅ Video generated in ${(generationTime / 1000).toFixed(1)}s`);
    console.log(`   Temporary URL: ${videoUrl.substring(0, 60)}...`);
    
    // ============================================
    // UPLOAD TO SUPABASE STORAGE
    // ============================================
    
    console.log('   📤 Uploading to Supabase Storage...');
    
    const cocoboardId = params.cocoboardId || 'unknown';
    const nodeId = params.nodeId || 'unknown';
    
    const storedVideoUrl = await uploadAssetFromUrl(
      videoUrl,
      'video',
      cocoboardId,
      nodeId
    );
    
    console.log(`   ✅ Stored at: ${storedVideoUrl.substring(0, 60)}...`);
    
    // ============================================
    // EXTRACT LAST FRAME (Critical for Continuity)
    // ============================================
    
    console.log('\n   📸 Extracting last frame for next shot...');
    
    let lastFrameUrl: string | undefined;
    
    try {
      lastFrameUrl = await extractLastFrameFromVideo(
        videoUrl,
        cocoboardId,
        `${nodeId}-lastframe`
      );
      
      console.log(`   ✅ Last frame extracted and uploaded`);
      console.log(`   Frame URL: ${lastFrameUrl.substring(0, 60)}...`);
    } catch (frameError) {
      console.error('   ⚠️  Failed to extract last frame:', frameError);
      console.error('   ⚠️  Next shot will not have continuity!');
      // Don't fail the entire generation if frame extraction fails
    }
    
    // ============================================
    // CALCULATE CREDITS
    // ============================================
    
    const creditsUsed = Math.ceil(params.duration * 8); // 8 credits per second
    
    // ============================================
    // RETURN RESULT
    // ============================================
    
    const result: VeoGenerationResult = {
      success: true,
      url: storedVideoUrl,
      lastFrameUrl,
      metadata: {
        model: 'veo-3.1-fast',
        creditsUsed,
        duration: params.duration,
        generationTime,
        seed: body.seed,
        prompt: params.prompt,
      },
    };
    
    console.log('\n✅ ===== VEO GENERATION COMPLETE =====');
    console.log(`   Credits Used: ${result.metadata!.creditsUsed}`);
    console.log(`   Total Time: ${(generationTime / 1000).toFixed(1)}s`);
    console.log(`   Has Last Frame: ${!!lastFrameUrl}\n`);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ ===== VEO GENERATION ERROR =====');
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
 * Estimate credits for Veo generation
 * 
 * @param params - Generation parameters
 * @returns Estimated credits
 */
export function estimateVeoCredits(params: VeoGenerationParams): number {
  // 8 credits per second, rounded up
  return Math.ceil(params.duration * 8);
}

/**
 * Validate Veo generation parameters
 * 
 * @param params - Parameters to validate
 * @throws Error if invalid
 */
export function validateVeoParams(params: VeoGenerationParams): void {
  if (!params.prompt || params.prompt.trim().length === 0) {
    throw new Error('Prompt is required');
  }
  
  if (params.duration < 1 || params.duration > 8) {
    throw new Error('Duration must be between 1 and 8 seconds');
  }
  
  const validAspectRatios = ['16:9', '9:16', '1:1'];
  if (!validAspectRatios.includes(params.aspectRatio)) {
    throw new Error(`Aspect ratio must be one of: ${validAspectRatios.join(', ')}`);
  }
  
  const validResolutions = ['720p', '1080p'];
  if (!validResolutions.includes(params.resolution)) {
    throw new Error(`Resolution must be one of: ${validResolutions.join(', ')}`);
  }
  
  // Warn if using deprecated lastFrame parameter
  if ('lastFrame' in params && params.lastFrame) {
    console.warn('⚠️  lastFrame parameter is deprecated. Use image parameter instead.');
  }
}

// ============================================
// EXPORT
// ============================================

export default generateVeoVideo;