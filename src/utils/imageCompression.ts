/**
 * 🗜️ IMAGE COMPRESSION UTILITY
 * 
 * Compresses images that exceed the specified size limit
 * while maintaining visual quality.
 * 
 * Features:
 * - Automatic compression for large files
 * - Progressive quality reduction
 * - Maintains aspect ratio
 * - Supports JPG, PNG, WebP
 */

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
}

/**
 * Compresses an image file if it exceeds the size limit
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxSizeMB = 10,
    maxWidthOrHeight = 2048,
    quality = 0.85,
    outputFormat = 'image/webp'
  } = options;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const originalSize = file.size;

  // If file is already small enough, return as-is
  if (originalSize <= maxSizeBytes) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false
    };
  }

  console.log(`🗜️ [COMPRESSION] Starting compression:`, {
    originalSize: `${(originalSize / 1024 / 1024).toFixed(2)}MB`,
    maxSize: `${maxSizeMB}MB`,
    filename: file.name
  });

  try {
    // Load image
    const img = await loadImage(file);
    
    // Calculate new dimensions (maintain aspect ratio)
    let { width, height } = img;
    
    if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
      if (width > height) {
        height = (height / width) * maxWidthOrHeight;
        width = maxWidthOrHeight;
      } else {
        width = (width / height) * maxWidthOrHeight;
        height = maxWidthOrHeight;
      }
    }

    console.log(`📐 [COMPRESSION] Resizing:`, {
      original: `${img.width}x${img.height}`,
      new: `${Math.round(width)}x${Math.round(height)}`
    });

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Use better image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob with compression
    const compressedBlob = await canvasToBlob(canvas, outputFormat, quality);
    
    // If compressed version is still too large, try lower quality
    let finalBlob = compressedBlob;
    let currentQuality = quality;
    
    while (finalBlob.size > maxSizeBytes && currentQuality > 0.5) {
      currentQuality -= 0.1;
      console.log(`🔄 [COMPRESSION] Retrying with quality ${currentQuality.toFixed(2)}...`);
      finalBlob = await canvasToBlob(canvas, outputFormat, currentQuality);
    }

    // Convert blob to file
    const compressedFile = new File(
      [finalBlob],
      file.name.replace(/\.[^.]+$/, '.webp'), // Always use .webp extension
      { type: outputFormat }
    );

    const compressedSize = compressedFile.size;
    const compressionRatio = originalSize / compressedSize;

    console.log(`✅ [COMPRESSION] Success:`, {
      originalSize: `${(originalSize / 1024 / 1024).toFixed(2)}MB`,
      compressedSize: `${(compressedSize / 1024 / 1024).toFixed(2)}MB`,
      saved: `${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`,
      ratio: `${compressionRatio.toFixed(2)}x`,
      finalQuality: currentQuality.toFixed(2)
    });

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      wasCompressed: true
    };

  } catch (error) {
    console.error('❌ [COMPRESSION] Failed:', error);
    // Return original file if compression fails
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false
    };
  }
}

/**
 * Loads an image file into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Converts canvas to blob with specified format and quality
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Compresses multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<CompressionResult[]> {
  console.log(`🗜️ [COMPRESSION] Compressing ${files.length} images...`);
  
  const results = await Promise.all(
    files.map(file => compressImage(file, options))
  );
  
  const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const compressedCount = results.filter(r => r.wasCompressed).length;
  
  console.log(`✅ [COMPRESSION] Batch complete:`, {
    total: files.length,
    compressed: compressedCount,
    originalSize: `${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`,
    compressedSize: `${(totalCompressedSize / 1024 / 1024).toFixed(2)}MB`,
    saved: `${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)}%`
  });
  
  return results;
}
