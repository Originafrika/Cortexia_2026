/**
 * LAZY IMAGE COMPONENT
 * Phase 9 - Performance & Optimizations
 * 
 * Image component avec lazy loading automatique.
 * 
 * Features:
 * - Lazy loading avec IntersectionObserver
 * - Blur placeholder pendant chargement
 * - Fade-in animation
 * - Error fallback
 * - Responsive srcset support
 * 
 * Usage:
 * <LazyImage src="/image.jpg" alt="Description" />
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLazyLoad } from '../../lib/hooks/useIntersectionObserver';
import { ImageOff } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  blurDataURL?: string;
  fallbackSrc?: string;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
  priority?: boolean; // Skip lazy loading for above-fold images
}

export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  objectFit = 'cover',
  blurDataURL,
  fallbackSrc = '/placeholder.png',
  rootMargin = '200px',
  onLoad,
  onError,
  style,
  priority = false,
}: LazyImageProps) {
  const { ref, shouldLoad } = useLazyLoad({ rootMargin });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(priority ? src : null);

  // Load image when shouldLoad becomes true
  useEffect(() => {
    if (shouldLoad && !currentSrc && !hasError) {
      setCurrentSrc(src);
    }
  }, [shouldLoad, src, currentSrc, hasError]);

  // Priority images load immediately
  useEffect(() => {
    if (priority && !currentSrc) {
      setCurrentSrc(src);
    }
  }, [priority, src, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    onError?.(new Error(`Failed to load image: ${src}`));
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        ...style,
      }}
    >
      {/* Blur placeholder */}
      {!isLoaded && blurDataURL && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Skeleton placeholder */}
      {!isLoaded && !blurDataURL && !hasError && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}

      {/* Error state */}
      {hasError && !currentSrc && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <ImageOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <AnimatePresence>
        {currentSrc && (
          <motion.img
            src={currentSrc}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            onLoad={handleLoad}
            onError={handleError}
            className="relative z-10 w-full h-full"
            style={{
              objectFit,
              objectPosition: 'center',
            }}
            loading={priority ? 'eager' : 'lazy'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Lazy Background Image Component
 */
interface LazyBackgroundImageProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  rootMargin?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

export function LazyBackgroundImage({
  src,
  className = '',
  children,
  rootMargin = '200px',
  priority = false,
  style,
}: LazyBackgroundImageProps) {
  const { ref, shouldLoad } = useLazyLoad({ rootMargin });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(priority ? src : null);

  useEffect(() => {
    if (shouldLoad && !currentSrc) {
      setCurrentSrc(src);
    }
  }, [shouldLoad, src, currentSrc]);

  useEffect(() => {
    if (priority && !currentSrc) {
      setCurrentSrc(src);
    }
  }, [priority, src, currentSrc]);

  useEffect(() => {
    if (currentSrc) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = currentSrc;
    }
  }, [currentSrc]);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        ...style,
        backgroundImage: currentSrc ? `url(${currentSrc})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Skeleton */}
      {!isLoaded && !currentSrc && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}

      {/* Content */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Lazy Image Grid with staggered loading
 */
interface LazyImageGridProps {
  images: Array<{ src: string; alt: string; id: string }>;
  columns?: number;
  gap?: number;
  className?: string;
}

export function LazyImageGrid({
  images,
  columns = 3,
  gap = 4,
  className = '',
}: LazyImageGridProps) {
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 4}px`,
      }}
    >
      {images.map((image, index) => (
        <LazyImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          className="w-full h-64 rounded-lg"
          rootMargin={`${index * 100}px`}
        />
      ))}
    </div>
  );
}
