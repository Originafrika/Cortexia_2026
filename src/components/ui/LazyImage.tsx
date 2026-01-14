/**
 * LAZY IMAGE - Progressive image loading
 * ✅ Performance optimization with IntersectionObserver
 * 
 * Features:
 * - Lazy loading (only loads when visible)
 * - Blur placeholder
 * - Loading skeleton
 * - Error fallback
 * - Fade-in animation
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string; // e.g., "16/9", "1/1", "4/3"
  blur?: boolean;
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholderSrc,
  fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3EImage non disponible%3C/text%3E%3C/svg%3E',
  onLoad,
  onError,
  aspectRatio,
  blur = true,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Setup IntersectionObserver
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const containerStyle: React.CSSProperties = aspectRatio
    ? { aspectRatio, position: 'relative', overflow: 'hidden' }
    : { position: 'relative' };

  return (
    <div ref={imgRef} style={containerStyle} className={className}>
      {/* Placeholder/Skeleton */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            {placeholderSrc && (
              <img
                src={placeholderSrc}
                alt=""
                className={`w-full h-full object-cover ${blur ? 'blur-lg' : ''}`}
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Image */}
      {isInView && !hasError && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
          loading="lazy"
          {...props}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <motion.img
          src={fallbackSrc}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

/**
 * Lazy Background Image
 */
interface LazyBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  blur?: boolean;
}

export function LazyBackground({
  src,
  className = '',
  children,
  blur = false
}: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(divRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  return (
    <div
      ref={divRef}
      className={`relative ${className}`}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: blur && !isLoaded ? 'blur(10px)' : undefined,
        transition: 'filter 0.3s ease'
      }}
    >
      {/* Skeleton while loading */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}
