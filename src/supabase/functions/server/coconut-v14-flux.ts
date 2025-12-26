/**
 * COCONUT V14 - FLUX 2 PRO SERVICE
 * Complete Flux 2 Pro integration via Kie AI
 * Supports: Text-to-Image & Image-to-Image (1-8 refs)
 */

import type { FluxPrompt, TechnicalSpecs, FluxTaskStatus } from '../../../lib/types/coconut-v14.ts';

// ============================================
// CONFIGURATION
// ============================================

const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
const KIE_AI_BASE_URL = 'https://api.kie.ai';
const FLUX_MODEL = 'flux-2-pro'; // Flux 2 Pro model

// Timeouts & Limits
const MAX_POLL_ATTEMPTS = 120; // 120 × 5s = 10 minutes max
const POLL_INTERVAL_MS = 5000; // 5 seconds
const MAX_REFERENCES = 8; // Max 8 reference images

// ============================================
// ERROR CLASSES
// ============================================

class FluxGenerationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'FluxGenerationError';
  }
}

class FluxTimeoutError extends Error {
  constructor(taskId: string, timeout: number) {
    super(`Flux generation timed out: ${taskId} (${timeout}ms)`);
    this.name = 'FluxTimeoutError';
  }
}

// ============================================
// TYPES
// ============================================

interface FluxTextToImagePayload {
  prompt: string;
  model: string;
  width: number;
  height: number;
  numImages?: number;
  guidance?: number;
  safetyTolerance?: number;
  seed?: number;
}

interface FluxImageToImagePayload {
  prompt: string;
  model: string;
  imageUrls: string[];
  width: number;
  height: number;
  numImages?: number;
  guidance?: number;
  imagePromptStrength?: number;
  safetyTolerance?: number;
  seed?: number;
}

interface FluxTaskResponse {
  code: number;
  message: string;
  data?: {
    taskId: string;
  };
}

interface FluxStatusResponse {
  code: number;
  message: string;
  data?: {
    taskId: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    progress?: number;
    imageUrls?: string[];
    errorMessage?: string;
  };
}

// ============================================
// RESOLUTION MAPPING
// ============================================

const RESOLUTION_MAP: Record<string, { width: number; height: number }> = {
  '1K': { width: 1024, height: 1024 },
  '2K': { width: 2048, height: 2048 },
  '4K': { width: 4096, height: 4096 },
  '8K': { width: 8192, height: 8192 }
};

/**
 * Calculate dimensions from ratio and resolution
 */
function calculateDimensions(
  ratio: string,
  resolution: string
): { width: number; height: number } {
  const baseResolution = RESOLUTION_MAP[resolution] || RESOLUTION_MAP['2K'];
  
  // Parse ratio (e.g., "16:9", "3:4", "1:1")
  const [widthRatio, heightRatio] = ratio.split(':').map(Number);
  
  if (!widthRatio || !heightRatio) {
    return baseResolution;
  }
  
  // Calculate aspect-aware dimensions
  const aspectRatio = widthRatio / heightRatio;
  
  if (aspectRatio > 1) {
    // Landscape
    const width = baseResolution.width;
    const height = Math.round(width / aspectRatio);
    return { width, height };
  } else {
    // Portrait or square
    const height = baseResolution.height;
    const width = Math.round(height * aspectRatio);
    return { width, height };
  }
}

// ============================================
// TEXT-TO-IMAGE
// ============================================

/**
 * Build Text-to-Image payload for Flux 2 Pro
 */
export function buildTextToImagePayload(
  prompt: FluxPrompt,
  specs: TechnicalSpecs
): FluxTextToImagePayload {
  const { width, height } = calculateDimensions(specs.format, specs.resolution);
  
  // Build comprehensive prompt string from JSON structure
  let promptString = '';
  
  if (prompt.scene) {
    promptString += `${prompt.scene}. `;
  }
  
  // Add subjects
  if (prompt.subjects && prompt.subjects.length > 0) {
    const subjectsDesc = prompt.subjects
      .map(s => `${s.name} (${s.position})`)
      .join(', ');
    promptString += `Subjects: ${subjectsDesc}. `;
  }
  
  // Add style
  if (prompt.style) {
    promptString += `Style: ${prompt.style}. `;
  }
  
  // Add color palette
  if (prompt.color_palette && prompt.color_palette.length > 0) {
    promptString += `Colors: ${prompt.color_palette.join(', ')}. `;
  }
  
  // Add lighting
  if (prompt.lighting) {
    promptString += `Lighting: ${prompt.lighting}. `;
  }
  
  // Add background
  if (prompt.background) {
    promptString += `Background: ${prompt.background}. `;
  }
  
  // Add composition
  if (prompt.composition) {
    promptString += `Composition: ${prompt.composition}. `;
  }
  
  // Add mood
  if (prompt.mood) {
    promptString += `Mood: ${prompt.mood}. `;
  }
  
  // Add camera
  if (prompt.camera) {
    const cameraDesc = typeof prompt.camera === 'string' 
      ? prompt.camera 
      : `${prompt.camera.angle || ''} ${prompt.camera.lens || ''} ${prompt.camera.depth_of_field || ''}`.trim();
    promptString += `Camera: ${cameraDesc}. `;
  }
  
  return {
    prompt: promptString.trim(),
    model: FLUX_MODEL,
    width,
    height,
    numImages: 1,
    guidance: 7.5,
    safetyTolerance: 2
  };
}

/**
 * Create Text-to-Image task
 */
export async function createTextToImageTask(
  prompt: FluxPrompt,
  specs: TechnicalSpecs
): Promise<string> {
  console.log('🎨 Creating Flux Text-to-Image task...');
  
  if (!KIE_AI_API_KEY) {
    throw new FluxGenerationError('KIE_AI_API_KEY not configured');
  }
  
  const payload = buildTextToImagePayload(prompt, specs);
  
  console.log('Payload:', {
    promptLength: payload.prompt.length,
    width: payload.width,
    height: payload.height,
    model: payload.model
  });
  
  try {
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/flux/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new FluxGenerationError(
        `Kie AI API error: ${response.status}`,
        { status: response.status, error }
      );
    }
    
    const result: FluxTaskResponse = await response.json();
    
    console.log('Kie AI response:', result);
    
    if (result.code !== 200 || !result.data?.taskId) {
      throw new FluxGenerationError(
        'Failed to create Flux task',
        { result }
      );
    }
    
    console.log(`✅ Flux task created: ${result.data.taskId}`);
    
    return result.data.taskId;
  } catch (error) {
    console.error('Error creating Flux task:', error);
    throw error instanceof FluxGenerationError 
      ? error 
      : new FluxGenerationError('Failed to create Flux task', { error });
  }
}

// ============================================
// IMAGE-TO-IMAGE
// ============================================

/**
 * Build Image-to-Image payload for Flux 2 Pro
 */
export function buildImageToImagePayload(
  prompt: FluxPrompt,
  references: string[],
  specs: TechnicalSpecs
): FluxImageToImagePayload {
  const { width, height } = calculateDimensions(specs.format, specs.resolution);
  
  // Validate references count
  if (references.length === 0) {
    throw new FluxGenerationError('At least 1 reference image required for image-to-image');
  }
  
  if (references.length > MAX_REFERENCES) {
    throw new FluxGenerationError(
      `Maximum ${MAX_REFERENCES} reference images allowed (got ${references.length})`
    );
  }
  
  // Build prompt string (same as text-to-image)
  const textPayload = buildTextToImagePayload(prompt, specs);
  
  return {
    prompt: textPayload.prompt,
    model: FLUX_MODEL,
    imageUrls: references,
    width,
    height,
    numImages: 1,
    guidance: 7.5,
    imagePromptStrength: 0.5, // Balance between reference and prompt
    safetyTolerance: 2
  };
}

/**
 * Create Image-to-Image task
 */
export async function createImageToImageTask(
  prompt: FluxPrompt,
  references: string[],
  specs: TechnicalSpecs
): Promise<string> {
  console.log('🎨 Creating Flux Image-to-Image task...');
  console.log(`References: ${references.length} images`);
  
  if (!KIE_AI_API_KEY) {
    throw new FluxGenerationError('KIE_AI_API_KEY not configured');
  }
  
  const payload = buildImageToImagePayload(prompt, references, specs);
  
  console.log('Payload:', {
    promptLength: payload.prompt.length,
    width: payload.width,
    height: payload.height,
    model: payload.model,
    imageCount: payload.imageUrls.length
  });
  
  try {
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/flux/img2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_AI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new FluxGenerationError(
        `Kie AI API error: ${response.status}`,
        { status: response.status, error }
      );
    }
    
    const result: FluxTaskResponse = await response.json();
    
    console.log('Kie AI response:', result);
    
    if (result.code !== 200 || !result.data?.taskId) {
      throw new FluxGenerationError(
        'Failed to create Flux task',
        { result }
      );
    }
    
    console.log(`✅ Flux task created: ${result.data.taskId}`);
    
    return result.data.taskId;
  } catch (error) {
    console.error('Error creating Flux task:', error);
    throw error instanceof FluxGenerationError 
      ? error 
      : new FluxGenerationError('Failed to create Flux task', { error });
  }
}

// ============================================
// POLLING & STATUS
// ============================================

/**
 * Get Flux task status
 */
export async function getFluxTaskStatus(
  taskId: string
): Promise<FluxTaskStatus> {
  if (!KIE_AI_API_KEY) {
    throw new FluxGenerationError('KIE_AI_API_KEY not configured');
  }
  
  try {
    const response = await fetch(
      `${KIE_AI_BASE_URL}/api/v1/flux/task/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new FluxGenerationError(
        `Failed to get task status: ${response.status}`,
        { status: response.status, error }
      );
    }
    
    const result: FluxStatusResponse = await response.json();
    
    if (result.code !== 200 || !result.data) {
      throw new FluxGenerationError(
        'Invalid status response',
        { result }
      );
    }
    
    const data = result.data;
    
    // Map Kie AI status to our status
    let status: FluxTaskStatus['status'];
    if (data.status === 'SUCCESS') {
      status = 'completed';
    } else if (data.status === 'FAILED') {
      status = 'failed';
    } else if (data.status === 'PROCESSING') {
      status = 'processing';
    } else {
      status = 'pending';
    }
    
    return {
      taskId: data.taskId,
      status,
      progress: data.progress || 0,
      imageUrls: data.imageUrls || [],
      error: data.errorMessage
    };
  } catch (error) {
    console.error('Error getting task status:', error);
    throw error instanceof FluxGenerationError 
      ? error 
      : new FluxGenerationError('Failed to get task status', { error });
  }
}

/**
 * Poll Flux task until completion
 */
export async function pollFluxTask(
  taskId: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  console.log(`⏳ Polling Flux task: ${taskId}`);
  
  let attempts = 0;
  
  while (attempts < MAX_POLL_ATTEMPTS) {
    attempts++;
    
    try {
      const status = await getFluxTaskStatus(taskId);
      
      console.log(`Poll attempt ${attempts}/${MAX_POLL_ATTEMPTS}: ${status.status} (${status.progress}%)`);
      
      // Call progress callback
      if (onProgress) {
        onProgress(status.progress, status.status);
      }
      
      // Check status
      if (status.status === 'completed') {
        if (!status.imageUrls || status.imageUrls.length === 0) {
          throw new FluxGenerationError('Task completed but no images returned');
        }
        
        console.log(`✅ Flux task completed: ${status.imageUrls[0]}`);
        return status.imageUrls[0]; // Return first image URL
      }
      
      if (status.status === 'failed') {
        throw new FluxGenerationError(
          `Task failed: ${status.error || 'Unknown error'}`,
          { taskId, status }
        );
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
      
    } catch (error) {
      if (error instanceof FluxGenerationError) {
        throw error;
      }
      
      console.error(`Poll attempt ${attempts} error:`, error);
      
      // Continue polling on temporary errors
      if (attempts < MAX_POLL_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }
      
      throw error;
    }
  }
  
  // Timeout
  throw new FluxTimeoutError(taskId, MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS);
}

/**
 * Poll with retry logic
 */
export async function pollFluxTaskWithRetry(
  taskId: string,
  maxRetries: number = 2,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await pollFluxTask(taskId, onProgress);
    } catch (error) {
      lastError = error as Error;
      
      console.error(`Polling attempt ${attempt}/${maxRetries} failed:`, error);
      
      // Don't retry on permanent errors
      if (error instanceof FluxGenerationError && error.message.includes('Task failed')) {
        throw error;
      }
      
      // Wait before retry
      if (attempt < maxRetries) {
        const delay = 5000 * attempt; // 5s, 10s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new FluxGenerationError(
    `Flux polling failed after ${maxRetries} attempts`,
    { lastError: lastError?.message }
  );
}

// ============================================
// CANCEL TASK
// ============================================

/**
 * Cancel Flux task
 */
export async function cancelFluxTask(taskId: string): Promise<void> {
  console.log(`❌ Cancelling Flux task: ${taskId}`);
  
  if (!KIE_AI_API_KEY) {
    throw new FluxGenerationError('KIE_AI_API_KEY not configured');
  }
  
  try {
    const response = await fetch(
      `${KIE_AI_BASE_URL}/api/v1/flux/task/${taskId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      console.warn(`Failed to cancel task: ${response.status}`);
      // Don't throw - cancellation is best-effort
    } else {
      console.log(`✅ Task cancelled: ${taskId}`);
    }
  } catch (error) {
    console.error('Error cancelling task:', error);
    // Don't throw - cancellation is best-effort
  }
}

// ============================================
// EXPORTS & INFO
// ============================================

export const FLUX_SERVICE_INFO = {
  version: '14.0.0',
  phase: 3,
  model: FLUX_MODEL,
  provider: 'Kie AI',
  features: {
    textToImage: true,
    imageToImage: true,
    maxReferences: MAX_REFERENCES,
    polling: true,
    retry: true,
    cancel: true
  },
  pricing: {
    textToImage: 15, // 15 crédits
    imageToImage: 20 // 20 crédits
  }
};

console.log('✅ Flux service loaded (Phase 3 - Jour 1)');
