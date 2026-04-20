/**
 * Generation Service V4 - Client (Backend API)
 * Calls Supabase Edge Functions instead of direct API calls
 * This is more secure as API keys stay on the server
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { GenerationConfig, GenerationResult } from '../types/create-v4';

const SERVER_URL = '/api';

interface GenerateOptions {
  prompt: string;
  config: GenerationConfig;
  uploadedImages?: File[];
  onProgress?: (progress: number) => void;
}

/**
 * Generate image via backend
 */
export async function generateImageV4(options: GenerateOptions): Promise<GenerationResult> {
  const { prompt, config, uploadedImages, onProgress } = options;

  // DEBUG: Log the uploadedImages value
  console.log('🔍 DEBUG generateImageV4 called with:', {
    hasUploadedImages: !!uploadedImages,
    uploadedImagesType: typeof uploadedImages,
    uploadedImagesLength: uploadedImages?.length,
    uploadedImagesValue: uploadedImages
  });

  // Phase 1: Validation (0-10%)
  onProgress?.(0);

  if (!prompt.trim()) {
    throw new Error('Prompt is required');
  }

  onProgress?.(10);

  try {
    // Phase 2: Upload images if any (10-30%)
    let uploadedImageUrls: string[] = [];
    
    console.log('🔍 DEBUG checking upload condition:', {
      condition1: !!uploadedImages,
      condition2: uploadedImages?.length,
      willUpload: uploadedImages && uploadedImages.length > 0
    });
    
    if (uploadedImages && uploadedImages.length > 0) {
      onProgress?.(15);
      
      console.log(`📤 Uploading ${uploadedImages.length} image(s)...`);
      
      const formData = new FormData();
      uploadedImages.forEach((file, index) => {
        formData.append('files', file);
        console.log(`  - File ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(1)}KB, type: ${file.type})`);
      });
      
      // DEBUG: Log FormData keys to verify
      console.log('📋 FormData keys being sent:', Array.from(formData.keys()));

      const uploadResponse = await fetch(`${SERVER_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => 'Unknown error');
        console.error('❌ Upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText
        });
        throw new Error(`Failed to upload images: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success) {
        console.error('❌ Upload response error:', uploadData);
        throw new Error(uploadData.error || 'Upload failed');
      }
      
      uploadedImageUrls = uploadData.urls || [];
      console.log(`✅ Uploaded ${uploadedImageUrls.length} image(s)`);
      onProgress?.(30);
    } else {
      console.log('⏭️  No images to upload, skipping');
      onProgress?.(30);
    }

    // Phase 3: Generate (30-90%)
    onProgress?.(40);

    // Map config to backend format
    const dimensions = getDimensions(config.aspectRatio || '1:1');
    
    // ✅ CREDIT TYPE SELECTION - Based on MODEL, not provider
    // FREE models: flux-schnell, kontext, nanobanana, seedream
    // PAID models: flux-2-pro, imagen-4
    const freeModels = ['flux-schnell', 'kontext', 'nanobanana', 'seedream'];
    const useCreditsType = freeModels.includes(config.model || 'flux-schnell') ? 'free' : 'paid';
    
    const requestBody = {
      prompt,
      negativePrompt: config.negativePrompt,
      images: uploadedImageUrls,
      quality: config.quality || 'standard',
      advancedOptions: {
        model: mapModelToBackend(config.model || 'flux-schnell'),
        enhancePrompt: config.enhancePrompt !== false,
        seed: config.seed,
        steps: getStepsForQuality(config.quality || 'standard'),
      },
      width: dimensions.width,
      height: dimensions.height,
      useCredits: useCreditsType,
      userId: 'default-user', // TODO: Get from auth context
    };

    console.log('🚀 Sending generation request to backend:', {
      prompt: requestBody.prompt.substring(0, 50),
      model: requestBody.advancedOptions.model,
      enhancePrompt: requestBody.advancedOptions.enhancePrompt,
      useCreditsType: requestBody.useCredits,
    });

    const response = await fetch(`${SERVER_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    onProgress?.(80);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Generation failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error(data.error || 'No image URL returned');
    }

    onProgress?.(90);

    // Phase 4: Return result (90-100%)
    const result: GenerationResult = {
      id: `gen-${Date.now()}`,
      imageUrl: data.url,
      prompt: prompt,
      enhancedPrompt: data.enhancedPrompt,
      model: data.model || config.model || 'flux-schnell',
      provider: data.provider || config.provider || 'together',
      timestamp: Date.now(),
      config: config,
      cost: data.creditsUsed || 1,
      usedFallback: data.usedFallback,
      fallbackReason: data.fallbackReason,
    };

    onProgress?.(100);

    console.log('✅ Generation successful:', {
      url: result.imageUrl.substring(0, 60),
      model: result.model,
      provider: result.provider,
    });

    return result;

  } catch (error) {
    console.error('❌ Generation error:', error);
    throw error;
  }
}

/**
 * Map frontend model names to backend model names
 */
function mapModelToBackend(model: string): string {
  const modelMap: Record<string, string> = {
    'flux-schnell': 'flux-schnell',
    'flux-2-pro': 'flux-2-pro',
    'imagen-4': 'imagen-4',
    'kontext': 'auto', // Pollinations
    'nanobanana': 'auto', // Pollinations
    'seedream': 'auto', // Pollinations
  };

  return modelMap[model] || 'auto';
}

/**
 * Get dimensions from aspect ratio
 */
function getDimensions(aspectRatio: string): { width: number; height: number } {
  const ratios: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '9:16': { width: 720, height: 1280 },
    '16:9': { width: 1280, height: 720 },
    '3:4': { width: 768, height: 1024 },
    '4:3': { width: 1024, height: 768 },
    '21:9': { width: 1344, height: 576 },
  };

  return ratios[aspectRatio] || ratios['1:1'];
}

/**
 * Get steps based on quality
 */
function getStepsForQuality(quality: string): number {
  const steps: Record<string, number> = {
    'draft': 2,
    'standard': 4,
    'high': 6,
  };

  return steps[quality] || 4;
}