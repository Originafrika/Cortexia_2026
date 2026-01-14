/**
 * COCONUT V14 - CAMPAIGN REAL GENERATION
 * Phase 4: Real generation with Flux 2 Pro + Veo 3.1
 * 
 * Connects campaign assets to actual AI generation pipelines
 * 
 * ARCHITECTURE:
 * - Utilise les services existants (coconut-v14-flux.ts + veo-service.ts)
 * - Ajoute l'injection de visual identity pour cohérence campagne
 * - Orchestration spécifique au mode campagne
 */

import type {
  GeminiCampaignAnalysisResponse,
  CampaignAsset,
  CampaignAssetResult,
} from './coconut-v14-campaign-types.ts';
import {
  createTextToImageTask,
  createImageToImageTask,
  pollFluxTask,
  type FluxPrompt,
  type TechnicalSpecs,
} from './coconut-v14-flux.ts';

// Note: Pour les vidéos, on utilise directement Kie AI Veo
// au lieu de veo-service.ts qui utilise Replicate en fallback

// ============================================================================
// CONFIGURATION
// ============================================================================

const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
const KIE_AI_BASE_URL = 'https://api.kie.ai';

// ============================================================================
// GENERATE IMAGE ASSET (Real Flux 2 Pro)
// ============================================================================

export async function generateCampaignImageReal(params: {
  asset: CampaignAsset;
  visualIdentity: GeminiCampaignAnalysisResponse['visualIdentity'];
  providedAssets?: string[];
}): Promise<CampaignAssetResult> {
  const { asset, visualIdentity, providedAssets } = params;

  console.log(`🖼️ [Campaign Real Gen] Generating image: ${asset.id}`);
  console.log(`   Concept: ${asset.concept}`);
  console.log(`   Format: ${asset.format} @ ${asset.resolution || '2K'}`);

  try {
    // Build enhanced Flux prompt with visual identity injection
    const fluxPrompt = buildFluxPromptWithIdentity(asset, visualIdentity);
    
    // Build technical specs
    const specs: TechnicalSpecs = {
      format: asset.format,
      resolution: asset.resolution || '2K',
      targetUsage: asset.channels.includes('print') ? 'print' : 'social',
    };

    let taskId: string;

    // Choose generation mode
    if (providedAssets && providedAssets.length > 0) {
      // Image-to-Image with brand references
      console.log(`   Mode: Image-to-Image (${providedAssets.length} refs)`);
      taskId = await createImageToImageTask(fluxPrompt, providedAssets, specs);
    } else {
      // Text-to-Image
      console.log(`   Mode: Text-to-Image`);
      taskId = await createTextToImageTask(fluxPrompt, specs);
    }

    console.log(`   Task created: ${taskId}`);

    // Poll for completion
    const imageUrl = await pollFluxTask(taskId, (progress, status) => {
      console.log(`   Progress: ${progress}% (${status})`);
    });

    console.log(`✅ [Campaign Real Gen] Image completed: ${imageUrl}`);

    // Calculate actual cost (Flux 2 Pro pricing)
    const actualCost = calculateFluxCost(asset.format, asset.resolution || '2K');

    return {
      assetId: asset.id,
      weekNumber: asset.weekNumber,
      type: 'image',
      concept: asset.concept,
      url: imageUrl,
      thumbnailUrl: imageUrl,
      format: asset.format,
      resolution: asset.resolution,
      actualCost,
      status: 'completed',
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error(`❌ [Campaign Real Gen] Image failed: ${asset.id}`, error);

    return {
      assetId: asset.id,
      weekNumber: asset.weekNumber,
      type: 'image',
      concept: asset.concept,
      url: '',
      format: asset.format,
      actualCost: 0,
      status: 'failed',
      error: error.message || 'Image generation failed',
    };
  }
}

// ============================================================================
// HELPER: Build Flux prompt with visual identity injection
// ============================================================================

function buildFluxPromptWithIdentity(
  asset: CampaignAsset,
  visualIdentity: GeminiCampaignAnalysisResponse['visualIdentity']
): FluxPrompt {
  const mainDescription = asset.visualDescription;

  const colorInstruction = `Color palette: ${visualIdentity.palette
    .map((c) => `${c.hex} (${c.name})`)
    .join(', ')}`;

  const styleInstruction = visualIdentity.photographyStyle;

  let copyInstruction = '';
  if (asset.copy?.headline) {
    copyInstruction = `Text overlay: "${asset.copy.headline}"`;
    if (asset.copy.subheadline) {
      copyInstruction += ` with subtext "${asset.copy.subheadline}"`;
    }
  }

  const fullPrompt = `
${mainDescription}

VISUAL IDENTITY:
${styleInstruction}
${colorInstruction}

${copyInstruction}

Shot on professional camera, ${asset.format} format for ${asset.channels.join(', ')}.
`.trim();

  return {
    subject: asset.concept,
    scene: mainDescription,
    style: styleInstruction,
    camera: 'Professional camera',
    lighting: 'Cinematic lighting',
    mood: visualIdentity.archetypes.join(', '),
    quality: ['ultra detailed', 'professional', '8k'],
    technical: [
      colorInstruction,
      `${asset.format} aspect ratio`,
      copyInstruction,
    ].filter(Boolean),
    fullPrompt,
  };
}

// ============================================================================
// HELPER: Calculate image cost
// ============================================================================

function calculateFluxCost(format: string, resolution: string): number {
  // Flux 2 Pro pricing
  if (resolution === '2K') {
    // High resolution
    if (format === '16:9') return 20;
    if (format === '9:16') return 20;
    return 25; // For 1:1, 4:3, etc.
  } else {
    // Standard resolution
    if (format === '16:9') return 10;
    if (format === '9:16') return 10;
    return 15; // For 1:1, 4:3, etc.
  }
}

// ============================================================================
// GENERATE VIDEO ASSET (Real Veo 3.1)
// ============================================================================

export async function generateCampaignVideoReal(params: {
  asset: CampaignAsset;
  visualIdentity: GeminiCampaignAnalysisResponse['visualIdentity'];
  providedAssets?: string[];
}): Promise<CampaignAssetResult> {
  const { asset, visualIdentity, providedAssets } = params;

  console.log(`🎬 [Campaign Real Gen] Generating video: ${asset.id}`);
  console.log(`   Concept: ${asset.concept}`);
  console.log(`   Duration: ${asset.videoDuration || 8}s @ ${asset.format}`);

  try {
    // Build enhanced Veo prompt with visual identity
    const veoPrompt = buildVeoPromptWithIdentity(asset, visualIdentity);
    
    // Map format to aspectRatio
    const aspectRatio = mapFormatToAspectRatio(asset.format);
    
    // Choose model (fast vs quality)
    const model = asset.videoModel || 'veo3_fast';

    console.log(`   Model: ${model}, AspectRatio: ${aspectRatio}`);

    // Call Kie AI Veo API (same logic as kie-ai.ts)
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/veo/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: veoPrompt,
        model,
        generationType: providedAssets && providedAssets.length > 0 
          ? 'REFERENCE_2_VIDEO' 
          : 'TEXT_2_VIDEO',
        imageUrls: providedAssets || [],
        aspectRatio,
        enableTranslation: true,
      }),
    });

    const result = await response.json();

    if (result.code !== 200 || !result.data?.taskId) {
      throw new Error(`Veo API error: ${result.msg || 'Unknown error'}`);
    }

    const taskId = result.data.taskId;
    console.log(`   Task created: ${taskId}`);

    // Poll for completion
    const videoUrl = await pollVeoTask(taskId);

    console.log(`✅ [Campaign Real Gen] Video completed: ${videoUrl}`);

    // Calculate actual cost
    const actualCost = calculateVeoCost(
      asset.videoDuration || 8,
      model as 'veo3_fast' | 'veo3'
    );

    return {
      assetId: asset.id,
      weekNumber: asset.weekNumber,
      type: 'video',
      concept: asset.concept,
      url: videoUrl,
      thumbnailUrl: `${videoUrl}?frame=0`, // First frame as thumbnail
      format: asset.format,
      duration: asset.videoDuration,
      actualCost,
      status: 'completed',
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error(`❌ [Campaign Real Gen] Video failed: ${asset.id}`, error);

    return {
      assetId: asset.id,
      weekNumber: asset.weekNumber,
      type: 'video',
      concept: asset.concept,
      url: '',
      format: asset.format,
      actualCost: 0,
      status: 'failed',
      error: error.message || 'Video generation failed',
    };
  }
}

// ============================================================================
// HELPER: Build Veo prompt with visual identity injection
// ============================================================================

function buildVeoPromptWithIdentity(
  asset: CampaignAsset,
  visualIdentity: GeminiCampaignAnalysisResponse['visualIdentity']
): string {
  const mainDescription = asset.visualDescription;

  const colorInstruction = `Colors: ${visualIdentity.palette
    .slice(0, 3)
    .map((c) => c.hex)
    .join(', ')}`;

  const styleInstruction = visualIdentity.photographyStyle.substring(0, 100);

  let textInstruction = '';
  if (asset.copy?.headline) {
    textInstruction = `Text: "${asset.copy.headline}"`;
  }

  // Veo prompt format (optimized for 512 chars)
  return `
${mainDescription}

Style: ${styleInstruction}
${colorInstruction}
${textInstruction}

Duration: ${asset.videoDuration || 8}s
Format: ${asset.format}
Mood: ${visualIdentity.archetypes.join(', ')}
`.trim().substring(0, 512);
}

// ============================================================================
// HELPER: Poll Veo task
// ============================================================================

async function pollVeoTask(taskId: string): Promise<string> {
  console.log(`⏳ [Veo] Polling task: ${taskId}`);

  const maxAttempts = 120; // 10 minutes max
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${KIE_AI_BASE_URL}/api/v1/veo/record-info?taskId=${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          },
        }
      );

      const result = await response.json();

      if (result.code !== 200 || !result.data) {
        throw new Error('Invalid status response');
      }

      const data = result.data;

      console.log(`   Poll ${attempt}/${maxAttempts}: ${data.status} (${data.progress || 0}%)`);

      if (data.status === 'SUCCESS' && data.videoUrls?.length > 0) {
        console.log(`✅ [Veo] Task completed`);
        return data.videoUrls[0];
      }

      if (data.status === 'FAILED') {
        throw new Error(data.errorMessage || 'Video generation failed');
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      // Continue polling on temporary errors
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('Video generation timeout');
}

// ============================================================================
// HELPER: Map format to aspect ratio
// ============================================================================

function mapFormatToAspectRatio(format: string): '16:9' | '9:16' | 'Auto' {
  if (format === '16:9') return '16:9';
  if (format === '9:16') return '9:16';
  return 'Auto'; // For 1:1, 4:3, etc.
}

// ============================================================================
// HELPER: Calculate video cost
// ============================================================================

function calculateVeoCost(duration: number, model: 'veo3_fast' | 'veo3'): number {
  // Veo 3.1 pricing via Kie AI
  if (model === 'veo3') {
    // Quality model
    if (duration <= 8) return 40;
    if (duration <= 20) return 80;
    return 100;
  } else {
    // Fast model
    if (duration <= 8) return 10;
    if (duration <= 20) return 25;
    return 35;
  }
}