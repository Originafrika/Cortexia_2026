/**
 * IMAGE PREPROCESSOR
 * 
 * Prépare les images pour le blending multi-images optimal:
 * - Redimensionne au même aspect ratio
 * - Optimise la qualité
 * - Valide les dimensions
 */

import { createClient } from 'jsr:@supabase/supabase-js';

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface PreprocessedImage {
  url: string;
  originalUrl: string;
  dimensions: ImageDimensions;
  needsResize: boolean;
}

/**
 * Calculate dimensions from aspect ratio string
 */
export function calculateDimensionsFromAspectRatio(
  aspectRatio: string,
  resolution: '1K' | '2K' = '1K'
): ImageDimensions {
  const multiplier = resolution === '2K' ? 2 : 1;
  
  const dimensionMap: Record<string, ImageDimensions> = {
    '1:1': { width: 1024 * multiplier, height: 1024 * multiplier, aspectRatio: '1:1' },
    '16:9': { width: 1920 * multiplier, height: 1080 * multiplier, aspectRatio: '16:9' },
    '9:16': { width: 1080 * multiplier, height: 1920 * multiplier, aspectRatio: '9:16' },
    '4:3': { width: 1440 * multiplier, height: 1080 * multiplier, aspectRatio: '4:3' },
    '3:4': { width: 1080 * multiplier, height: 1440 * multiplier, aspectRatio: '3:4' },
    '3:2': { width: 1536 * multiplier, height: 1024 * multiplier, aspectRatio: '3:2' },
    '2:3': { width: 1024 * multiplier, height: 1536 * multiplier, aspectRatio: '2:3' },
  };
  
  return dimensionMap[aspectRatio] || dimensionMap['1:1'];
}

/**
 * Get image dimensions from URL
 */
async function getImageDimensions(imageUrl: string): Promise<ImageDimensions> {
  try {
    // Fetch image headers to get dimensions
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    // Try to get dimensions from Content-Type or other headers
    // If not available, we'll need to download and analyze
    const contentLength = response.headers.get('content-length');
    console.log(`📊 Image size: ${contentLength} bytes`);
    
    // Download image to analyze (only first 100KB to detect dimensions)
    const partialResponse = await fetch(imageUrl, {
      headers: { 'Range': 'bytes=0-102400' }, // First 100KB
      signal: AbortSignal.timeout(10000)
    });
    
    const buffer = await partialResponse.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    
    // Detect image type and extract dimensions
    const dimensions = extractDimensionsFromBuffer(uint8);
    
    return dimensions;
  } catch (error) {
    console.error('❌ Failed to get image dimensions:', error);
    // Return default dimensions
    return { width: 1024, height: 1024, aspectRatio: '1:1' };
  }
}

/**
 * Extract dimensions from image buffer
 */
function extractDimensionsFromBuffer(buffer: Uint8Array): ImageDimensions {
  // PNG detection
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    // PNG: IHDR chunk at bytes 16-23
    const width = (buffer[16] << 24) | (buffer[17] << 16) | (buffer[18] << 8) | buffer[19];
    const height = (buffer[20] << 24) | (buffer[21] << 16) | (buffer[22] << 8) | buffer[23];
    return {
      width,
      height,
      aspectRatio: calculateAspectRatioString(width, height)
    };
  }
  
  // JPEG detection
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    // JPEG: Scan for SOF0 marker (0xFFC0)
    for (let i = 0; i < buffer.length - 10; i++) {
      if (buffer[i] === 0xFF && buffer[i + 1] === 0xC0) {
        const height = (buffer[i + 5] << 8) | buffer[i + 6];
        const width = (buffer[i + 7] << 8) | buffer[i + 8];
        return {
          width,
          height,
          aspectRatio: calculateAspectRatioString(width, height)
        };
      }
    }
  }
  
  // WebP detection
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    // WebP: dimensions at different offsets depending on format
    // Simplified detection - return default
    console.warn('⚠️ WebP format detected, using default dimensions');
  }
  
  // Default fallback
  return { width: 1024, height: 1024, aspectRatio: '1:1' };
}

/**
 * Calculate aspect ratio string from dimensions
 */
function calculateAspectRatioString(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  const ratioW = width / divisor;
  const ratioH = height / divisor;
  
  // Map to common aspect ratios
  const ratio = ratioW / ratioH;
  if (Math.abs(ratio - 1) < 0.05) return '1:1';
  if (Math.abs(ratio - 16/9) < 0.05) return '16:9';
  if (Math.abs(ratio - 9/16) < 0.05) return '9:16';
  if (Math.abs(ratio - 4/3) < 0.05) return '4:3';
  if (Math.abs(ratio - 3/4) < 0.05) return '3:4';
  if (Math.abs(ratio - 3/2) < 0.05) return '3:2';
  if (Math.abs(ratio - 2/3) < 0.05) return '2:3';
  
  return `${ratioW}:${ratioH}`;
}

/**
 * Resize image to target aspect ratio using Kie AI
 * Uses Flux 2 Pro image-to-image to preserve quality while changing aspect ratio
 */
async function resizeImageToAspectRatio(
  imageUrl: string,
  targetAspectRatio: string,
  resolution: '1K' | '2K' = '1K'
): Promise<string> {
  console.log(`🔄 Resizing image to ${targetAspectRatio}...`);
  
  const targetDims = calculateDimensionsFromAspectRatio(targetAspectRatio, resolution);
  
  // Use Flux 2 Pro image-to-image with VERY LOW strength to just resize/pad
  const requestBody = {
    model: 'flux-2/pro-image-to-image',
    input: {
      prompt: `Professional studio photography. Maintain exact visual content while adapting to ${targetAspectRatio} aspect ratio. Preserve all details, colors, and composition. Add natural padding or crop intelligently to fit new dimensions.`,
      input_urls: [imageUrl],
      aspect_ratio: targetAspectRatio,
      resolution: resolution,
      strength: 0.35, // Very low strength = minimal changes, just resize/pad
      guidance_scale: 3.0 // Low guidance = stick close to input
    }
  };
  
  console.log('📤 Resizing via Kie AI Flux 2 Pro...');
  
  const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('KIE_AI_API_KEY')}`
    },
    body: JSON.stringify(requestBody)
  });
  
  const responseText = await response.text();
  
  if (!response.ok) {
    throw new Error(`Resize failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  
  if (result.code !== 200 || !result.data?.taskId) {
    throw new Error(`Resize task creation failed: ${result.msg}`);
  }
  
  const taskId = result.data.taskId;
  console.log(`✅ Resize task created: ${taskId}`);
  
  // Poll for completion
  const maxAttempts = 40; // 40 * 2s = 80s
  const pollInterval = 2000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    
    const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/queryResult?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${Deno.env.get('KIE_AI_API_KEY')}` }
    });
    
    const statusText = await statusResponse.text();
    const statusData = JSON.parse(statusText);
    
    if (statusData.data?.state === 'success') {
      const resultJson = JSON.parse(statusData.data.resultJson);
      const resizedUrl = resultJson.result?.[0] || resultJson.url;
      
      if (!resizedUrl) {
        throw new Error('No resized image URL in result');
      }
      
      console.log(`✅ Image resized to ${targetAspectRatio}: ${resizedUrl.substring(0, 60)}...`);
      return resizedUrl;
    }
    
    if (statusData.data?.state === 'fail') {
      throw new Error(`Resize failed: ${statusData.data.failMsg}`);
    }
  }
  
  throw new Error('Resize timeout');
}

/**
 * Preprocess images for optimal multi-image blending
 * Ensures all images have the same aspect ratio
 */
export async function preprocessImagesForBlending(
  images: Array<{ url: string; purpose: string }>,
  targetAspectRatio: string,
  targetResolution: '1K' | '2K' = '1K'
): Promise<PreprocessedImage[]> {
  console.log(`🔍 Preprocessing ${images.length} images for ${targetAspectRatio} blending...`);
  
  const preprocessed: PreprocessedImage[] = [];
  
  for (const image of images) {
    try {
      // Get current dimensions
      const dimensions = await getImageDimensions(image.url);
      
      console.log(`📊 Image (${image.purpose}): ${dimensions.width}x${dimensions.height} (${dimensions.aspectRatio})`);
      
      // Check if resize needed
      if (dimensions.aspectRatio !== targetAspectRatio) {
        console.log(`⚠️ Aspect ratio mismatch: ${dimensions.aspectRatio} → ${targetAspectRatio}. Resizing...`);
        
        // Resize image to match target aspect ratio
        const resizedUrl = await resizeImageToAspectRatio(
          image.url,
          targetAspectRatio,
          targetResolution
        );
        
        preprocessed.push({
          url: resizedUrl,
          originalUrl: image.url,
          dimensions: calculateDimensionsFromAspectRatio(targetAspectRatio, targetResolution),
          needsResize: true
        });
      } else {
        // No resize needed
        console.log(`✅ Aspect ratio matches: ${dimensions.aspectRatio}`);
        
        preprocessed.push({
          url: image.url,
          originalUrl: image.url,
          dimensions,
          needsResize: false
        });
      }
    } catch (error) {
      console.error(`❌ Failed to preprocess image (${image.purpose}):`, error);
      
      // Use original image as fallback
      preprocessed.push({
        url: image.url,
        originalUrl: image.url,
        dimensions: calculateDimensionsFromAspectRatio(targetAspectRatio, targetResolution),
        needsResize: false
      });
    }
  }
  
  console.log(`✅ Preprocessing complete: ${preprocessed.length} images ready`);
  
  return preprocessed;
}

/**
 * Validate image dimensions match expected
 */
export async function validateImageDimensions(
  imageUrl: string,
  expectedAspectRatio: string
): Promise<{ valid: boolean; actual: ImageDimensions }> {
  const actual = await getImageDimensions(imageUrl);
  const valid = actual.aspectRatio === expectedAspectRatio;
  
  if (!valid) {
    console.warn(`⚠️ Dimension validation failed: expected ${expectedAspectRatio}, got ${actual.aspectRatio}`);
  }
  
  return { valid, actual };
}
