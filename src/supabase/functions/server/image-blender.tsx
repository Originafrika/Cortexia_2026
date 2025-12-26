/**
 * IMAGE BLENDER - Advanced image blending with multiple layers
 * 
 * Uses canvas API to blend multiple images with different modes,
 * opacity, and color adjustments.
 * 
 * Features:
 * - 12 blend modes
 * - Per-layer opacity
 * - Color adjustments (brightness, contrast, saturation, hue)
 * - Position and scale transforms
 * - Export in multiple formats (PNG, JPG, WebP)
 */

import { createCanvas, loadImage, Canvas, Image } from 'npm:canvas';

// ============================================
// TYPES
// ============================================

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface BlendLayer {
  id: string;
  imageUrl: string;
  visible: boolean;
  opacity: number; // 0-100
  blendMode: BlendMode;
  colorAdjustments: {
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    saturation: number; // -100 to 100
    hue: number; // -180 to 180
  };
  position: {
    x: number;
    y: number;
  };
  scale: number; // 0.1 to 2.0
}

export interface BlendOptions {
  layers: BlendLayer[];
  outputWidth: number;
  outputHeight: number;
  outputFormat: 'png' | 'jpg' | 'webp';
  quality?: number; // 0-100 (for jpg/webp)
}

// ============================================
// IMAGE BLENDER CLASS
// ============================================

export class ImageBlender {
  /**
   * Blend multiple layers into a single image
   */
  async blendImages(options: BlendOptions): Promise<Buffer> {
    const { layers, outputWidth, outputHeight, outputFormat, quality = 90 } = options;

    console.log(`🎨 Blending ${layers.length} layers (${outputWidth}x${outputHeight})...`);

    // Create output canvas
    const canvas = createCanvas(outputWidth, outputHeight);
    const ctx = canvas.getContext('2d');

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // Process each visible layer
    const visibleLayers = layers.filter((l) => l.visible);
    for (const layer of visibleLayers) {
      await this.renderLayer(ctx, layer, outputWidth, outputHeight);
    }

    // Export to buffer
    const mimeType = this.getMimeType(outputFormat);
    const buffer = canvas.toBuffer(mimeType as any, {
      quality: quality / 100,
    });

    console.log(`✅ Blending complete: ${buffer.length} bytes`);

    return buffer;
  }

  /**
   * Render a single layer onto the canvas
   */
  private async renderLayer(
    ctx: any,
    layer: BlendLayer,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    try {
      console.log(`  → Rendering layer: ${layer.id} (${layer.blendMode})`);

      // Load image
      const img = await loadImage(layer.imageUrl);

      // Create temporary canvas for this layer
      const tempCanvas = createCanvas(canvasWidth, canvasHeight);
      const tempCtx = tempCanvas.getContext('2d');

      // Apply transforms
      const scaledWidth = img.width * layer.scale;
      const scaledHeight = img.height * layer.scale;
      const x = layer.position.x + (canvasWidth - scaledWidth) / 2;
      const y = layer.position.y + (canvasHeight - scaledHeight) / 2;

      // Draw image
      tempCtx.drawImage(img as any, x, y, scaledWidth, scaledHeight);

      // Apply color adjustments
      if (this.hasColorAdjustments(layer.colorAdjustments)) {
        this.applyColorAdjustments(tempCtx, layer.colorAdjustments, canvasWidth, canvasHeight);
      }

      // Apply opacity
      ctx.globalAlpha = layer.opacity / 100;

      // Apply blend mode
      ctx.globalCompositeOperation = this.getCompositeOperation(layer.blendMode);

      // Composite onto main canvas
      ctx.drawImage(tempCanvas, 0, 0);

      // Reset
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    } catch (error) {
      console.error(`❌ Failed to render layer ${layer.id}:`, error);
      // Continue with other layers
    }
  }

  /**
   * Apply color adjustments to canvas
   */
  private applyColorAdjustments(
    ctx: any,
    adjustments: BlendLayer['colorAdjustments'],
    width: number,
    height: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      if (adjustments.brightness !== 0) {
        const brightness = (adjustments.brightness / 100) * 255;
        r = Math.max(0, Math.min(255, r + brightness));
        g = Math.max(0, Math.min(255, g + brightness));
        b = Math.max(0, Math.min(255, b + brightness));
      }

      // Apply contrast
      if (adjustments.contrast !== 0) {
        const contrast = (adjustments.contrast + 100) / 100;
        r = Math.max(0, Math.min(255, ((r / 255 - 0.5) * contrast + 0.5) * 255));
        g = Math.max(0, Math.min(255, ((g / 255 - 0.5) * contrast + 0.5) * 255));
        b = Math.max(0, Math.min(255, ((b / 255 - 0.5) * contrast + 0.5) * 255));
      }

      // Apply saturation
      if (adjustments.saturation !== 0) {
        const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
        const saturation = (adjustments.saturation + 100) / 100;
        r = Math.max(0, Math.min(255, gray + (r - gray) * saturation));
        g = Math.max(0, Math.min(255, gray + (g - gray) * saturation));
        b = Math.max(0, Math.min(255, gray + (b - gray) * saturation));
      }

      // Apply hue rotation
      if (adjustments.hue !== 0) {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        const newH = (h + adjustments.hue / 360) % 1;
        [r, g, b] = this.hslToRgb(newH, s, l);
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Check if layer has any color adjustments
   */
  private hasColorAdjustments(adjustments: BlendLayer['colorAdjustments']): boolean {
    return (
      adjustments.brightness !== 0 ||
      adjustments.contrast !== 0 ||
      adjustments.saturation !== 0 ||
      adjustments.hue !== 0
    );
  }

  /**
   * Map blend mode to canvas composite operation
   */
  private getCompositeOperation(blendMode: BlendMode): GlobalCompositeOperation {
    const mapping: Record<BlendMode, GlobalCompositeOperation> = {
      normal: 'source-over',
      multiply: 'multiply',
      screen: 'screen',
      overlay: 'overlay',
      darken: 'darken',
      lighten: 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      difference: 'difference',
      exclusion: 'exclusion',
    };

    return mapping[blendMode] || 'source-over';
  }

  /**
   * Get MIME type for output format
   */
  private getMimeType(format: 'png' | 'jpg' | 'webp'): string {
    const types = {
      png: 'image/png',
      jpg: 'image/jpeg',
      webp: 'image/webp',
    };
    return types[format] || 'image/png';
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [h, s, l];
  }

  /**
   * Convert HSL to RGB
   */
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Create a preview thumbnail of blended result
   */
  async createPreview(options: BlendOptions, maxSize = 300): Promise<Buffer> {
    const aspectRatio = options.outputWidth / options.outputHeight;
    let previewWidth = maxSize;
    let previewHeight = maxSize;

    if (aspectRatio > 1) {
      previewHeight = maxSize / aspectRatio;
    } else {
      previewWidth = maxSize * aspectRatio;
    }

    const previewOptions: BlendOptions = {
      ...options,
      outputWidth: Math.round(previewWidth),
      outputHeight: Math.round(previewHeight),
    };

    return this.blendImages(previewOptions);
  }
}

// ============================================
// PRESET CONFIGURATIONS
// ============================================

export const BLEND_PRESETS = {
  doubleExposure: {
    name: 'Double Exposure',
    description: 'Classic double exposure effect',
    layers: [
      {
        blendMode: 'screen' as BlendMode,
        opacity: 100,
      },
      {
        blendMode: 'multiply' as BlendMode,
        opacity: 70,
      },
    ],
  },
  
  vintageFilm: {
    name: 'Vintage Film',
    description: 'Retro film look',
    layers: [
      {
        blendMode: 'normal' as BlendMode,
        opacity: 100,
        colorAdjustments: {
          brightness: -10,
          contrast: 20,
          saturation: -30,
          hue: 10,
        },
      },
      {
        blendMode: 'overlay' as BlendMode,
        opacity: 30,
      },
    ],
  },

  lightLeak: {
    name: 'Light Leak',
    description: 'Light leak overlay effect',
    layers: [
      {
        blendMode: 'normal' as BlendMode,
        opacity: 100,
      },
      {
        blendMode: 'screen' as BlendMode,
        opacity: 50,
      },
    ],
  },

  colorPop: {
    name: 'Color Pop',
    description: 'Vibrant color enhancement',
    layers: [
      {
        blendMode: 'normal' as BlendMode,
        opacity: 100,
        colorAdjustments: {
          brightness: 10,
          contrast: 15,
          saturation: 40,
          hue: 0,
        },
      },
    ],
  },
};

// ============================================
// EXPORT
// ============================================

export default ImageBlender;
