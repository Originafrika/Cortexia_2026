/**
 * OPTIMIZED IMAGE - High-performance image component
 * 
 * Features:
 * - Lazy loading with intersection observer
 * - Responsive images (srcset)
 * - Next-gen formats (WebP, AVIF)
 * - Blur placeholder
 * - Error handling
 */

import { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/lib/performance/memoization';
import {
  optimizeImageUrl,
  generateSrcSet,
  generateSizesAttr,
  getBlurPlaceholder,
  type ResponsiveImageSizes,
} from '@/lib/performance/image-optimizer';

// ============================================
// TYPES
// ============================================

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  blur?: boolean;
  responsive?: boolean;
  responsiveSizes?: ResponsiveImageSizes;
  priority?: boolean; // Load immediately (above fold)
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

// ============================================
// DEFAULT RESPONSIVE SIZES
// ============================================

const DEFAULT_RESPONSIVE_SIZES: ResponsiveImageSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// ============================================
// COMPONENT
// ============================================

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  blur = true,
  responsive = true,
  responsiveSizes = DEFAULT_RESPONSIVE_SIZES,
  priority = false,
  onLoad,
  onError,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const [showImage, setShowImage] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection observer for lazy loading
  const entry = useIntersectionObserver(
    imgRef,
    { threshold: 0.01, rootMargin: '50px' },
    (entry) => {
      if (entry.isIntersecting && !isLoaded) {
        setShowImage(true);
      }
    }
  );

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  // Preload priority images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  // Generate optimized URLs
  const optimizedSrc = optimizeImageUrl(src, { width, quality: 85 });
  const srcSet = responsive ? generateSrcSet(src, responsiveSizes) : undefined;
  const sizes = responsive ? generateSizesAttr() : undefined;
  const placeholder = blur ? getBlurPlaceholder(width || 10, height || 10) : undefined;

  // Error state
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {blur && !isLoaded && placeholder && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full blur-xl"
          style={{ objectFit }}
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {showImage && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ objectFit }}
        />
      )}

      {/* Loading state */}
      {!isLoaded && showImage && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
    </div>
  );
}

// ============================================
// BACKGROUND IMAGE VERSION
// ============================================

export interface OptimizedBackgroundImageProps {
  src: string;
  className?: string;
  lazy?: boolean;
  blur?: boolean;
  priority?: boolean;
  children?: React.ReactNode;
  onLoad?: () => void;
}

export function OptimizedBackgroundImage({
  src,
  className = '',
  lazy = true,
  blur = true,
  priority = false,
  children,
  onLoad,
}: OptimizedBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(!lazy || priority);
  const [showImage, setShowImage] = useState(!lazy || priority);
  const divRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useIntersectionObserver(
    divRef,
    { threshold: 0.01, rootMargin: '50px' },
    (entry) => {
      if (entry.isIntersecting && !isLoaded) {
        setShowImage(true);
      }
    }
  );

  // Preload background image
  useEffect(() => {
    if (showImage) {
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        onLoad?.();
      };
      img.src = src;
    }
  }, [showImage, src, onLoad]);

  const optimizedSrc = optimizeImageUrl(src);
  const placeholder = blur ? getBlurPlaceholder() : undefined;

  return (
    <div
      ref={divRef}
      className={`relative ${className}`}
      style={{
        backgroundImage: isLoaded && showImage ? `url(${optimizedSrc})` : placeholder ? `url(${placeholder})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: !isLoaded && blur ? 'blur(20px)' : undefined,
        transition: 'filter 300ms ease-out',
      }}
    >
      {children}
    </div>
  );
}
