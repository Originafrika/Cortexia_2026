/**
 * KIE AI SERVICE - Premium Tier
 * High-quality models: Flux 2 Pro, Veo 3.1, Kling, WAN, Gemini
 */

const KIE_AI_BASE_URL = 'https://api.kie.ai';

// Model configurations with credit costs
export const KIE_AI_MODELS = {
  // Image models
  'flux-2-pro-1k': { type: 'image', credits: 2, costUsd: 0.025, name: 'Flux 2 Pro 1K' },
  'flux-2-pro-2k': { type: 'image', credits: 4, costUsd: 0.05, name: 'Flux 2 Pro 2K' },
  'nanobanana-2k': { type: 'image', credits: 3, costUsd: 0.09, name: 'Nano Banana Pro 2K' },
  
  // Video models
  'veo-3-fast': { type: 'video', credits: 4, costUsd: 0.20, name: 'Veo 3.1 Fast' },
  'veo-3-quality': { type: 'video', credits: 8, costUsd: 0.40, name: 'Veo 3.1 Quality' },
  'kling-3-std-5s': { type: 'video', credits: 8, costUsd: 0.35, name: 'Kling 3.0 Std 5s' },
  'wan-2-6-720p-10s': { type: 'video', credits: 15, costUsd: 0.70, name: 'WAN 2.6 720p 10s' },
  
  // Text/Analysis models
  'gemini-3-flash': { type: 'text', credits: 100, costUsd: 0.005, name: 'Gemini 3-Flash' },
} as const;

export type KieAIModel = keyof typeof KIE_AI_MODELS;

export interface KieAIImageParams {
  prompt: string | Record<string, any>;
  model: 'flux-2-pro' | 'flux-2-flex';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'auto';
  resolution?: '1K' | '2K';
  referenceImages?: string[];
}

export interface KieAIVideoParams {
  prompt: string;
  model: 'veo3_fast' | 'veo3';
  generationType?: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO';
  imageUrls?: string[];
  aspectRatio?: '16:9' | '9:16' | 'Auto';
  seeds?: number[];
  watermark?: boolean;
}

export interface KieAITaskResponse {
  success: boolean;
  taskId?: string;
  error?: string;
}

/**
 * Calculate credits needed for a generation
 */
export function calculateGenerationCost(
  model: KieAIModel,
  options?: { referenceImageCount?: number }
): number {
  const config = KIE_AI_MODELS[model];
  if (!config) return 1;
  
  let cost = config.credits;
  
  // Add cost for reference images (image-to-image)
  if (options?.referenceImageCount && config.type === 'image') {
    cost += Math.min(options.referenceImageCount, 8);
  }
  
  return cost;
}

/**
 * Generate image using Kie AI (premium)
 */
export async function generatePremiumImage(
  params: KieAIImageParams,
  userId: string
): Promise<KieAITaskResponse> {
  const apiKey = typeof window !== 'undefined' 
    ? (import.meta as any).env?.VITE_KIE_AI_API_KEY 
    : undefined;
  
  if (!apiKey) {
    throw new Error('KIE_AI_API_KEY not configured');
  }

  const hasRefImages = params.referenceImages && params.referenceImages.length > 0;
  
  // Map to Kie AI model format
  const modelMap: Record<string, string> = {
    'flux-2-pro': hasRefImages ? 'flux-2/pro-image-to-image' : 'flux-2/pro-text-to-image',
    'flux-2-flex': hasRefImages ? 'flux-2/flex-image-to-image' : 'flux-2/flex-text-to-image'
  };

  const input: Record<string, any> = {
    prompt: typeof params.prompt === 'object' 
      ? JSON.stringify(params.prompt) 
      : params.prompt,
    aspect_ratio: params.aspectRatio || '1:1',
    resolution: params.resolution || '1K'
  };

  if (hasRefImages && params.referenceImages) {
    input.input_urls = params.referenceImages.slice(0, 8);
    input.strength = 0.85;
  }

  try {
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelMap[params.model],
        input
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kie AI error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    if (result.code === 200 && result.data?.taskId) {
      return { success: true, taskId: result.data.taskId };
    }
    
    return { success: false, error: result.msg || 'Task creation failed' };
    
  } catch (error) {
    console.error('Kie AI generation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate video using Kie AI (premium)
 */
export async function generatePremiumVideo(
  params: KieAIVideoParams,
  userId: string
): Promise<KieAITaskResponse> {
  const apiKey = typeof window !== 'undefined' 
    ? (import.meta as any).env?.VITE_KIE_AI_API_KEY 
    : undefined;
  
  if (!apiKey) {
    throw new Error('KIE_AI_API_KEY not configured');
  }

  try {
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/veo/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: params.prompt,
        model: params.model,
        generationType: params.generationType || 'TEXT_2_VIDEO',
        imageUrls: params.imageUrls?.length ? params.imageUrls : undefined,
        aspectRatio: params.aspectRatio || '16:9',
        seeds: params.seeds,
        watermark: params.watermark,
        enableTranslation: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kie AI error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    if (result.code === 200 && result.data?.taskId) {
      return { success: true, taskId: result.data.taskId };
    }
    
    return { success: false, error: result.msg || 'Video generation failed' };
    
  } catch (error) {
    console.error('Kie AI video generation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check task status
 */
export async function checkTaskStatus(taskId: string, type: 'image' | 'video' = 'image') {
  const apiKey = typeof window !== 'undefined' 
    ? (import.meta as any).env?.VITE_KIE_AI_API_KEY 
    : undefined;
  
  if (!apiKey) {
    throw new Error('KIE_AI_API_KEY not configured');
  }

  const endpoint = type === 'video' 
    ? `/api/v1/veo/record-info?taskId=${taskId}`
    : `/api/v1/jobs/recordInfo?taskId=${taskId}`;

  try {
    const response = await fetch(`${KIE_AI_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
}

/**
 * Get available premium models
 */
export function getPremiumModels(): Array<{ 
  id: KieAIModel; 
  name: string; 
  type: string; 
  credits: number;
  description: string;
}> {
  return [
    { 
      id: 'flux-2-pro-1k', 
      name: 'Flux 2 Pro 1K', 
      type: 'image', 
      credits: 2,
      description: 'Professional image generation, 1024x1024'
    },
    { 
      id: 'flux-2-pro-2k', 
      name: 'Flux 2 Pro 2K', 
      type: 'image', 
      credits: 4,
      description: 'High-res images, 2048x2048'
    },
    { 
      id: 'nanobanana-2k', 
      name: 'Nano Banana Pro 2K', 
      type: 'image', 
      credits: 3,
      description: 'Ultra-realistic faces and characters'
    },
    { 
      id: 'veo-3-fast', 
      name: 'Veo 3.1 Fast', 
      type: 'video', 
      credits: 4,
      description: 'Quick video generation, good quality'
    },
    { 
      id: 'veo-3-quality', 
      name: 'Veo 3.1 Quality', 
      type: 'video', 
      credits: 8,
      description: 'Best video quality from Google'
    },
    { 
      id: 'kling-3-std-5s', 
      name: 'Kling 3.0 Std 5s', 
      type: 'video', 
      credits: 8,
      description: 'Professional 5-second clips'
    },
    { 
      id: 'wan-2-6-720p-10s', 
      name: 'WAN 2.6 720p 10s', 
      type: 'video', 
      credits: 15,
      description: 'Extended 10-second generation'
    },
    { 
      id: 'gemini-3-flash', 
      name: 'Gemini 3-Flash', 
      type: 'text', 
      credits: 100,
      description: 'Cocoboard analysis and planning'
    },
  ];
}
