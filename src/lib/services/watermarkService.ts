// Watermark Service - Apply Cortexia watermark to generated images/videos
// Used for Coconut V14 outputs before storing in R2

export interface WatermarkOptions {
  text?: string;
  logoUrl?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  scale?: number;
}

const DEFAULT_WATERMARK: WatermarkOptions = {
  text: 'Cortexia',
  position: 'bottom-right',
  opacity: 0.5,
  scale: 0.15,
};

class WatermarkService {
  /**
   * Apply watermark to an image using Canvas API
   */
  async applyToImage(
    imageUrl: string,
    options: WatermarkOptions = DEFAULT_WATERMARK
  ): Promise<Blob | null> {
    try {
      // Load image
      const img = await this.loadImage(imageUrl);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Apply watermark
      ctx.globalAlpha = options.opacity || 0.5;
      
      if (options.text) {
        this.drawTextWatermark(ctx, img.width, img.height, options);
      }
      
      // Reset alpha
      ctx.globalAlpha = 1;
      
      // Convert to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/png');
      });
    } catch (error) {
      console.error('Watermark error:', error);
      return null;
    }
  }
  
  /**
   * Load image from URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }
  
  /**
   * Draw text watermark on canvas
   */
  private drawTextWatermark(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    options: WatermarkOptions
  ): void {
    const text = options.text || 'Cortexia';
    const position = options.position || 'bottom-right';
    const scale = options.scale || 0.15;
    
    // Calculate font size based on image dimensions
    const fontSize = Math.min(width, height) * scale;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = fontSize / 20;
    
    // Measure text
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    // Calculate position
    let x: number;
    let y: number;
    const padding = fontSize;
    
    switch (position) {
      case 'top-left':
        x = padding;
        y = padding + textHeight;
        break;
      case 'top-right':
        x = width - textWidth - padding;
        y = padding + textHeight;
        break;
      case 'bottom-left':
        x = padding;
        y = height - padding;
        break;
      case 'bottom-right':
        x = width - textWidth - padding;
        y = height - padding;
        break;
      case 'center':
        x = (width - textWidth) / 2;
        y = (height + textHeight) / 2;
        break;
      default:
        x = width - textWidth - padding;
        y = height - padding;
    }
    
    // Draw text with outline for visibility
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }
  
  /**
   * Apply watermark to video (placeholder - would use ffmpeg.wasm in production)
   * For now, videos are watermarked server-side or by provider
   */
  async applyToVideo(
    videoUrl: string,
    options: WatermarkOptions = DEFAULT_WATERMARK
  ): Promise<string> {
    // In production, this would use ffmpeg.wasm to burn watermark into video
    // For now, we rely on Kie AI's built-in watermarking or server-side processing
    console.log('Video watermarking requested:', videoUrl, options);
    return videoUrl;
  }
  
  /**
   * Check if watermark should be applied based on user tier
   */
  shouldApplyWatermark(userType: 'free' | 'creator' | 'enterprise'): boolean {
    // Free tier: always watermark
    // Creator: optional watermark (off by default)
    // Enterprise: no watermark
    return userType === 'free';
  }
  
  /**
   * Get watermark options for tier
   */
  getOptionsForTier(userType: 'free' | 'creator' | 'enterprise'): WatermarkOptions {
    switch (userType) {
      case 'free':
        return {
          ...DEFAULT_WATERMARK,
          opacity: 0.6,
          scale: 0.2,
        };
      case 'creator':
        return {
          ...DEFAULT_WATERMARK,
          opacity: 0.3,
          scale: 0.1,
        };
      case 'enterprise':
        return {};
      default:
        return DEFAULT_WATERMARK;
    }
  }
}

export const watermarkService = new WatermarkService();
