/**
 * Kie AI Z-Image API Integration
 * High-quality NSFW-capable image generation
 */

const KIE_AI_BASE_URL = 'https://api.kie.ai/api/v1';
const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');

if (!KIE_AI_API_KEY) {
  console.warn('⚠️ KIE_AI_API_KEY not set - Z-Image will not work');
}

/**
 * Z-Image input parameters
 */
export interface ZImageInput {
  prompt: string;
  aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
}

/**
 * Z-Image task response
 */
export interface ZImageTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

/**
 * Z-Image status response
 */
export interface ZImageStatusResponse {
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
  };
}

/**
 * Create Z-Image generation task
 */
export async function createZImageTask(
  input: ZImageInput,
  callBackUrl?: string
): Promise<ZImageTaskResponse> {
  console.log('[Z-Image] Creating task with input:', {
    promptLength: input.prompt?.length || 0,
    aspect_ratio: input.aspect_ratio || '1:1',
    callBackUrl: callBackUrl || 'none'
  });

  const requestBody = {
    model: 'z-image',
    ...(callBackUrl && { callBackUrl }),
    input: {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio || '1:1'
    }
  };

  console.log('[Z-Image] Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${KIE_AI_BASE_URL}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Z-Image] Task creation failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Z-Image task creation failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('[Z-Image] Task created successfully:', result);

  return result;
}

/**
 * Query Z-Image task status
 */
export async function queryZImageStatus(taskId: string): Promise<ZImageStatusResponse> {
  const response = await fetch(`${KIE_AI_BASE_URL}/jobs/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Z-Image] Status query failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Z-Image status query failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Calculate credit cost for Z-Image generation
 * Pricing: 1 credit per image (all aspect ratios same price)
 */
export function calculateZImageCost(aspect_ratio: string = '1:1'): number {
  // Flat pricing: 1 credit per image regardless of aspect ratio
  return 1;
}
