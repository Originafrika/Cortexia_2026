// Image Utilities - Format detection, dimension analysis
// Automatically detect image dimensions from uploaded files

// ✅ SEEDREAM API REQUIREMENTS
export const SEEDREAM_MIN_PIXELS = 921600; // 960x960 minimum (Seedream API requirement)
export const RECOMMENDED_MIN_WIDTH = 960;
export const RECOMMENDED_MIN_HEIGHT = 960;

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  totalPixels: number; // ✅ Add total pixel count
}

/**
 * ✅ NEW: Check if image meets Seedream minimum requirements
 */
export function meetsMinimumRequirements(dimensions: ImageDimensions): {
  valid: boolean;
  message?: string;
  recommendedDimensions?: { width: number; height: number };
} {
  const { width, height, totalPixels } = dimensions;
  
  if (totalPixels < SEEDREAM_MIN_PIXELS) {
    // Calculate scale factor needed to meet minimum
    const scaleFactor = Math.ceil(Math.sqrt(SEEDREAM_MIN_PIXELS / totalPixels));
    const recommendedWidth = width * scaleFactor;
    const recommendedHeight = height * scaleFactor;
    
    return {
      valid: false,
      message: `Image too small: ${width}×${height} (${totalPixels.toLocaleString()} pixels). Minimum required: ${SEEDREAM_MIN_PIXELS.toLocaleString()} pixels (e.g., 960×960).`,
      recommendedDimensions: {
        width: Math.ceil(recommendedWidth),
        height: Math.ceil(recommendedHeight)
      }
    };
  }
  
  return { valid: true };
}

/**
 * ✅ NEW: Auto-scale dimensions to meet minimum requirements
 * Maintains aspect ratio while ensuring minimum pixel count
 */
export function ensureMinimumDimensions(
  width: number,
  height: number
): { width: number; height: number; scaled: boolean } {
  const totalPixels = width * height;
  
  if (totalPixels >= SEEDREAM_MIN_PIXELS) {
    return { width, height, scaled: false };
  }
  
  // Calculate scale factor to meet minimum
  const scaleFactor = Math.sqrt(SEEDREAM_MIN_PIXELS / totalPixels);
  const scaledWidth = Math.ceil(width * scaleFactor);
  const scaledHeight = Math.ceil(height * scaleFactor);
  
  // Ensure even dimensions (some models prefer even numbers)
  const finalWidth = scaledWidth % 2 === 0 ? scaledWidth : scaledWidth + 1;
  const finalHeight = scaledHeight % 2 === 0 ? scaledHeight : scaledHeight + 1;
  
  console.log(`📏 Auto-scaled from ${width}×${height} (${totalPixels.toLocaleString()}px) to ${finalWidth}×${finalHeight} (${(finalWidth * finalHeight).toLocaleString()}px)`);
  
  return { 
    width: finalWidth, 
    height: finalHeight, 
    scaled: true 
  };
}

/**
 * Load an image from a File and get its dimensions
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      
      let orientation: 'portrait' | 'landscape' | 'square';
      if (aspectRatio > 1.05) {
        orientation = 'landscape';
      } else if (aspectRatio < 0.95) {
        orientation = 'portrait';
      } else {
        orientation = 'square';
      }
      
      URL.revokeObjectURL(url);
      
      resolve({
        width,
        height,
        aspectRatio,
        orientation,
        totalPixels: width * height
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Load an image from a URL and get its dimensions
 */
export async function getImageDimensionsFromUrl(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      
      let orientation: 'portrait' | 'landscape' | 'square';
      if (aspectRatio > 1.05) {
        orientation = 'landscape';
      } else if (aspectRatio < 0.95) {
        orientation = 'portrait';
      } else {
        orientation = 'square';
      }
      
      resolve({
        width,
        height,
        aspectRatio,
        orientation,
        totalPixels: width * height
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image from URL'));
    };
    
    img.src = url;
  });
}

/**
 * Calculate optimal dimensions for upscaling
 * Maintains aspect ratio while targeting a specific resolution
 */
export function calculateUpscaleDimensions(
  originalWidth: number,
  originalHeight: number,
  targetScale: number = 2
): { width: number; height: number } {
  const scaledWidth = Math.round(originalWidth * targetScale);
  const scaledHeight = Math.round(originalHeight * targetScale);
  
  // Ensure dimensions are even (some models prefer even dimensions)
  const width = scaledWidth % 2 === 0 ? scaledWidth : scaledWidth + 1;
  const height = scaledHeight % 2 === 0 ? scaledHeight : scaledHeight + 1;
  
  // Cap at reasonable maximums (15K as mentioned in Ultra Enhance)
  const MAX_DIMENSION = 15360; // 15K
  
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale)
    };
  }
  
  return { width, height };
}

/**
 * ✅ NEW: Calculate OPTIMAL upscale strategy to maximize quality (10K+)
 * Adaptively chooses multiplier based on source size
 * Target: 25+ Megapixels minimum (true 10K+ quality)
 */
export function calculateOptimalUpscale(
  sourceWidth: number,
  sourceHeight: number,
  options?: {
    targetMegapixels?: number; // Default: 25 MP
    maxDimension?: number;      // Default: 10240 (10K)
    minMultiplier?: number;     // Default: 2
    maxMultiplier?: number;     // Default: 8
  }
): {
  width: number;
  height: number;
  multiplier: number;
  megapixels: number;
  strategy: string;
} {
  const {
    targetMegapixels = 25,      // 25 MP = True 10K+ quality
    maxDimension = 10240,       // API limit (10K)
    minMultiplier = 2,
    maxMultiplier = 8
  } = options || {};
  
  const sourcePixels = sourceWidth * sourceHeight;
  const sourceMegapixels = sourcePixels / 1_000_000;
  
  // Strategy 1: Calculate multiplier needed to reach target MP
  const multiplierForTarget = Math.sqrt(targetMegapixels / sourceMegapixels);
  
  // Strategy 2: Calculate max multiplier allowed by dimension limit
  const maxMultiplierByDimension = Math.floor(
    maxDimension / Math.max(sourceWidth, sourceHeight)
  );
  
  // Choose the minimum of the two (respect both constraints)
  let multiplier = Math.min(
    Math.ceil(multiplierForTarget),
    maxMultiplierByDimension
  );
  
  // Apply user-defined bounds
  multiplier = Math.max(minMultiplier, Math.min(maxMultiplier, multiplier));
  
  // Calculate final dimensions
  let finalWidth = Math.round(sourceWidth * multiplier);
  let finalHeight = Math.round(sourceHeight * multiplier);
  
  // Ensure even dimensions
  finalWidth = finalWidth % 2 === 0 ? finalWidth : finalWidth + 1;
  finalHeight = finalHeight % 2 === 0 ? finalHeight : finalHeight + 1;
  
  // Final safety cap
  if (finalWidth > maxDimension || finalHeight > maxDimension) {
    const scale = Math.min(maxDimension / finalWidth, maxDimension / finalHeight);
    finalWidth = Math.round(finalWidth * scale);
    finalHeight = Math.round(finalHeight * scale);
  }
  
  const finalMegapixels = (finalWidth * finalHeight) / 1_000_000;
  
  // Determine strategy description
  let strategy = '';
  if (sourceMegapixels < 0.5) {
    strategy = 'Micro image - Maximum upscale';
  } else if (sourceMegapixels < 2) {
    strategy = 'Small image - Aggressive upscale';
  } else if (sourceMegapixels < 5) {
    strategy = 'Standard image - Balanced upscale';
  } else if (sourceMegapixels < 10) {
    strategy = 'High-res image - Refinement upscale';
  } else {
    strategy = 'Ultra-high-res - Polish upscale';
  }
  
  return {
    width: finalWidth,
    height: finalHeight,
    multiplier,
    megapixels: finalMegapixels,
    strategy
  };
}

/**
 * Get standard dimensions for a given aspect ratio
 * Useful for templates that don't have uploaded images
 */
export function getStandardDimensions(orientation: 'portrait' | 'landscape' | 'square', quality: 'standard' | 'high' = 'standard'): { width: number; height: number } {
  if (quality === 'high') {
    switch (orientation) {
      case 'portrait':
        return { width: 1080, height: 1920 }; // 9:16 Full HD
      case 'landscape':
        return { width: 1920, height: 1080 }; // 16:9 Full HD
      case 'square':
        return { width: 1440, height: 1440 }; // 1:1 High res
    }
  } else {
    switch (orientation) {
      case 'portrait':
        return { width: 720, height: 1280 }; // 9:16 Standard
      case 'landscape':
        return { width: 1280, height: 720 }; // 16:9 Standard
      case 'square':
        return { width: 1024, height: 1024 }; // 1:1 Standard
    }
  }
}