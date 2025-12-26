/**
 * IMAGE OPTIMIZER - Image optimization utilities
 * 
 * Provides utilities for:
 * - Next-gen format support (WebP, AVIF)
 * - Responsive images (srcset)
 * - Lazy loading
 * - Blur placeholders
 */

// ============================================
// TYPES
// ============================================

export interface ImageOptimizationOptions {
  src: string;
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'webp' | 'avif' | 'auto';
  lazy?: boolean;
  blur?: boolean;
}

export interface ResponsiveImageSizes {
  sm: number;  // mobile
  md: number;  // tablet
  lg: number;  // desktop
  xl: number;  // large desktop
}

// ============================================
// FORMAT SUPPORT DETECTION
// ============================================

let webpSupport: boolean | null = null;
let avifSupport: boolean | null = null;

/**
 * Check if browser supports WebP
 */
export async function supportsWebP(): Promise<boolean> {
  if (webpSupport !== null) return webpSupport;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      webpSupport = img.width === 1;
      resolve(webpSupport);
    };
    img.onerror = () => {
      webpSupport = false;
      resolve(false);
    };
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * Check if browser supports AVIF
 */
export async function supportsAVIF(): Promise<boolean> {
  if (avifSupport !== null) return avifSupport;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      avifSupport = img.width === 1;
      resolve(avifSupport);
    };
    img.onerror = () => {
      avifSupport = false;
      resolve(false);
    };
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get best supported format
 */
export async function getBestFormat(): Promise<'avif' | 'webp' | 'original'> {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'original';
}

// ============================================
// RESPONSIVE IMAGES
// ============================================

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  sizes: ResponsiveImageSizes
): string {
  const entries = [
    `${optimizeImageUrl(src, { width: sizes.sm })} ${sizes.sm}w`,
    `${optimizeImageUrl(src, { width: sizes.md })} ${sizes.md}w`,
    `${optimizeImageUrl(src, { width: sizes.lg })} ${sizes.lg}w`,
    `${optimizeImageUrl(src, { width: sizes.xl })} ${sizes.xl}w`,
  ];

  return entries.join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttr(): string {
  return [
    '(max-width: 640px) 640px',
    '(max-width: 768px) 768px',
    '(max-width: 1024px) 1024px',
    '1280px',
  ].join(', ');
}

// ============================================
// IMAGE OPTIMIZATION
// ============================================

/**
 * Optimize image URL with parameters
 * 
 * This is a placeholder - in production you would:
 * 1. Use a CDN (Cloudflare Images, Vercel Image Optimization, etc.)
 * 2. Or implement server-side image processing
 * 3. Or use a service like imgix, Cloudinary
 */
export function optimizeImageUrl(
  src: string,
  options: Partial<ImageOptimizationOptions> = {}
): string {
  // If it's a Figma asset or external URL, return as-is
  if (src.startsWith('figma:') || src.startsWith('http')) {
    return src;
  }

  // In production, you would append optimization params here
  // For now, just return the source
  // Example with imgix:
  // const params = new URLSearchParams();
  // if (options.width) params.set('w', options.width.toString());
  // if (options.quality) params.set('q', options.quality.toString());
  // if (options.format === 'webp') params.set('fm', 'webp');
  // return `${src}?${params.toString()}`;

  return src;
}

// ============================================
// BLUR PLACEHOLDER
// ============================================

/**
 * Generate blur placeholder data URL
 * Uses a tiny base64 encoded image
 */
export function getBlurPlaceholder(width: number = 10, height: number = 10): string {
  // In production, you would:
  // 1. Generate this server-side
  // 2. Or use a service to create tiny blurred versions
  // 3. Or use blurhash/thumbhash

  // For now, return a simple gray placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='.5'%3E%3C/feGaussianBlur%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='1 1'%3E%3C/feFuncA%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Cimage filter='url(%23b)' x='0' y='0' height='100%25' width='100%25' href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+bMfwAGhAK8BI3LuwAAAABJRU5ErkJggg=='%3E%3C/image%3E%3C/svg%3E`;
}

// ============================================
// LAZY LOADING
// ============================================

/**
 * Create an Intersection Observer for lazy loading images
 */
export function createLazyLoadObserver(
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.01,
    }
  );
}

// ============================================
// PRELOAD CRITICAL IMAGES
// ============================================

/**
 * Preload critical images (above the fold)
 */
export function preloadImage(src: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(sources: string[]): void {
  sources.forEach(preloadImage);
}

// ============================================
// IMAGE LOADING STRATEGY
// ============================================

export type LoadingStrategy = 'eager' | 'lazy' | 'auto';

/**
 * Determine loading strategy based on position
 */
export function getLoadingStrategy(
  isAboveFold: boolean = false
): LoadingStrategy {
  return isAboveFold ? 'eager' : 'lazy';
}

// ============================================
// CDN UTILITIES
// ============================================

/**
 * Get CDN URL for image
 * Placeholder - configure with your CDN
 */
export function getCDNUrl(src: string): string {
  // In production, prepend your CDN domain
  // Example:
  // const CDN_DOMAIN = 'https://cdn.cortexia.app';
  // return `${CDN_DOMAIN}${src}`;

  return src;
}
