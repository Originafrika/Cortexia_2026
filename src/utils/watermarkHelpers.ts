/**
 * WATERMARK HELPERS - Production Ready
 * Add watermarks to images/videos for non-Creator users
 * Creators get watermark-free downloads
 */

/**
 * Check if user should have watermark-free downloads
 * @param userId User ID
 * @param projectId Supabase project ID
 * @param publicAnonKey Supabase public anon key
 * @returns Promise<boolean> true if user is Creator and gets watermark-free downloads
 */
export async function shouldRemoveWatermark(
  userId: string,
  projectId: string,
  publicAnonKey: string
): Promise<boolean> {
  try {
    // Check if user is Creator
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${userId}/coconut-access`,
      {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      }
    );
    
    if (!response.ok) return false;
    
    const data = await response.json();
    
    // Remove watermark if:
    // 1. User is Enterprise (unlimited Coconut)
    // 2. User is Creator (earned or bought access)
    return data.success && (data.isEnterprise || data.hasCoconutAccess);
  } catch (error) {
    console.error('❌ Error checking watermark status:', error);
    return false;
  }
}

/**
 * Get watermark text for video generation
 * @param userId User ID
 * @param projectId Supabase project ID
 * @param publicAnonKey Supabase public anon key
 * @returns Promise<string | undefined> "CORTEXIA" for non-Creators, undefined for Creators
 */
export async function getVideoWatermark(
  userId: string,
  projectId: string,
  publicAnonKey: string
): Promise<string | undefined> {
  const removeWatermark = await shouldRemoveWatermark(userId, projectId, publicAnonKey);
  
  // Creators get no watermark
  if (removeWatermark) {
    return undefined;
  }
  
  // Non-Creators get "CORTEXIA" watermark
  return "CORTEXIA";
}

/**
 * Add text watermark to image URL (for canvas-based watermarking)
 * This is for client-side watermarking
 * @param imageUrl URL of the image
 * @param watermarkText Text to add as watermark
 * @returns Promise<string> Data URL of watermarked image
 */
export async function addWatermarkToImage(
  imageUrl: string,
  watermarkText: string = "CORTEXIA"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Add watermark
      const fontSize = Math.max(20, img.height / 20);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      // Position watermark at bottom center
      ctx.fillText(watermarkText, img.width / 2, img.height - 20);
      
      // Return data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Download image with or without watermark based on Creator status
 * @param imageUrl URL of the image
 * @param filename Filename for download
 * @param userId User ID
 * @param projectId Supabase project ID
 * @param publicAnonKey Supabase public anon key
 */
export async function downloadImageWithWatermark(
  imageUrl: string,
  filename: string,
  userId: string,
  projectId: string,
  publicAnonKey: string
): Promise<void> {
  try {
    const removeWatermark = await shouldRemoveWatermark(userId, projectId, publicAnonKey);
    
    let finalUrl = imageUrl;
    
    // Add watermark for non-Creators
    if (!removeWatermark) {
      finalUrl = await addWatermarkToImage(imageUrl, "CORTEXIA");
    }
    
    // Trigger download
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('❌ Error downloading image:', error);
    throw error;
  }
}
