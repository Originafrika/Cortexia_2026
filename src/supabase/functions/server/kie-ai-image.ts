const KIE_AI_BASE_URL = 'https://api.kie.ai/api/v1/jobs';
const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');

export interface KieAIImageGenerationParams {
  prompt: string | Record<string, any>; // ✅ Support both string and object prompts
  model: 'flux-2-pro' | 'flux-2-flex';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'auto';
  resolution?: '1K' | '2K';
  referenceImages?: string[]; // Up to 8 images - triggers image-to-image mode
}

export interface KieAITaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface KieAIStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
    param: string;
    resultJson?: string;
    failCode?: string;
    failMsg?: string;
    costTime?: number;
    completeTime?: number;
    createTime: number;
    updateTime?: number;
  };
}

/**
 * Calculate cost for Kie AI image generation
 */
export function calculateKieAIImageCost(
  model: 'flux-2-pro' | 'flux-2-flex',
  resolution: '1K' | '2K',
  referenceImageCount: number = 0
): number {
  // Base cost
  let baseCost = 0;
  
  if (model === 'flux-2-pro') {
    baseCost = resolution === '1K' ? 1 : 2;
  } else if (model === 'flux-2-flex') {
    baseCost = resolution === '1K' ? 3 : 6;
  }
  
  // Add reference image cost (+1 credit per image)
  const refImageCost = Math.min(referenceImageCount, 8); // Max 8 images
  
  return baseCost + refImageCost;
}

/**
 * Create a Flux 2 image generation task
 * Automatically selects text-to-image or image-to-image based on reference images
 */
export async function createKieAIImageTask(
  params: KieAIImageGenerationParams
): Promise<string> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY environment variable not set');
  }

  // Determine if we have reference images
  const hasRefImages = params.referenceImages && params.referenceImages.length > 0;

  // Map our model names to Kie AI format
  // Choose text-to-image OR image-to-image based on reference images
  const modelMap = {
    'flux-2-pro': hasRefImages ? 'flux-2/pro-image-to-image' : 'flux-2/pro-text-to-image',
    'flux-2-flex': hasRefImages ? 'flux-2/flex-image-to-image' : 'flux-2/flex-text-to-image'
  };

  const kieModel = modelMap[params.model];
  if (!kieModel) {
    throw new Error(`Unknown model: ${params.model}`);
  }

  console.log('🎨 Creating Kie AI image task:', {
    model: params.model,
    kieModel,
    mode: hasRefImages ? 'image-to-image' : 'text-to-image',
    resolution: params.resolution || '1K',
    aspectRatio: params.aspectRatio || '1:1',
    referenceImageCount: params.referenceImages?.length || 0
  });

  // Build input object
  const input: Record<string, any> = {
    // ✅ Support both string and object prompts
    // If prompt is object (JSON structured prompt), stringify it for Flux 2 Pro
    // Flux 2 Pro can parse JSON strings as structured prompts
    prompt: typeof params.prompt === 'object' 
      ? JSON.stringify(params.prompt) 
      : params.prompt,
    aspect_ratio: params.aspectRatio || '1:1',
    resolution: params.resolution || '1K'
  };

  // Add reference images if provided (image-to-image mode)
  if (hasRefImages) {
    const images = params.referenceImages!.slice(0, 8); // Max 8 images
    
    // ✅ Flux 2 Pro SUPPORTS multi-image blending/compositing
    // Send ALL reference images - the model will blend them together
    input.input_urls = images; // Array of ALL images for blending
    
    // ✅ Add strength parameter to control transformation intensity
    // Lower strength (0.3-0.5) = stay very close to originals
    // Medium strength (0.6-0.7) = balanced blend and new content
    // Higher strength (0.8-0.95) = more creative freedom, strong blending
    
    // ⚠️ CRITICAL: Use higher strength (0.85) to force blending of different aspect ratios
    // When blending 16:9 + 1:1 images, lower strength ignores the 1:1 element
    input.strength = 0.85; // High strength to force compositing across aspect ratios
    
    console.log(`📸 Multi-image blending mode: ${images.length} images, strength=0.85 (high for better compositing)`);
  }

  const requestBody = {
    model: kieModel,
    input
  };

  console.log('📤 Kie AI request:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${KIE_AI_BASE_URL}/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_AI_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  });

  const responseText = await response.text();
  console.log('📥 Kie AI raw response:', responseText);

  if (!response.ok) {
    console.error('❌ Kie AI task creation failed:', response.status, responseText);
    throw new Error(`Kie AI API error: ${response.status} - ${responseText}`);
  }

  let result: KieAITaskResponse;
  try {
    result = JSON.parse(responseText);
  } catch (parseError) {
    console.error('❌ Failed to parse Kie AI response:', responseText);
    throw new Error(`Invalid JSON response from Kie AI: ${responseText}`);
  }

  if (result.code !== 200 || !result.data?.taskId) {
    console.error('❌ Kie AI task creation failed:', JSON.stringify(result, null, 2));
    throw new Error(`Kie AI task creation failed: ${result.msg} (code: ${result.code})`);
  }

  console.log('✅ Kie AI task created:', result.data.taskId);
  return result.data.taskId;
}

/**
 * Query Kie AI task status
 */
export async function queryKieAIImageStatus(taskId: string): Promise<KieAIStatusResponse['data']> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY environment variable not set');
  }

  const response = await fetch(`${KIE_AI_BASE_URL}/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`
    }
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('❌ Kie AI status query failed:', response.status, responseText);
    throw new Error(`Kie AI status query failed: ${response.status} - ${responseText}`);
  }

  let result: KieAIStatusResponse;
  try {
    result = JSON.parse(responseText);
  } catch (parseError) {
    console.error('❌ Failed to parse Kie AI status response:', responseText);
    throw new Error(`Invalid JSON response from Kie AI status: ${responseText}`);
  }

  if (result.code !== 200) {
    console.error('❌ Kie AI status query error:', JSON.stringify(result, null, 2));
    throw new Error(`Kie AI status query failed: ${result.msg} (code: ${result.code})`);
  }

  return result.data;
}

/**
 * Generate image with Kie AI (creates task and polls until complete)
 */
export async function generateKieAIImage(
  params: KieAIImageGenerationParams
): Promise<{ url: string; taskId: string }> {
  // Create task
  const taskId = await createKieAIImageTask(params);

  // Poll until complete (max 3 minutes for complex image-to-image)
  const maxAttempts = 90; // 90 attempts * 2s = 180s (3 minutes max)
  const pollInterval = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const status = await queryKieAIImageStatus(taskId);

    console.log(`📊 Task ${taskId} status:`, status.state);

    if (status.state === 'success') {
      // Parse result
      if (!status.resultJson) {
        throw new Error('No result in successful task');
      }

      const result = JSON.parse(status.resultJson);
      
      if (!result.resultUrls || result.resultUrls.length === 0) {
        throw new Error('No image URL in result');
      }

      return {
        url: result.resultUrls[0],
        taskId
      };
    }

    if (status.state === 'fail') {
      console.error('❌ Kie AI generation failed:', {
        taskId,
        failCode: status.failCode,
        failMsg: status.failMsg,
        fullStatus: JSON.stringify(status, null, 2)
      });
      throw new Error(`Generation failed: ${status.failMsg || 'Unknown error'} (code: ${status.failCode || '500'})`);
    }

    // Continue polling for waiting/queuing/generating states
  }

  throw new Error('Generation timeout after 3 minutes');
}