/**
 * LIGHTBOX - P2-12
 * Full-screen image viewer with zoom
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3B: Import sound
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  images: Array<{ url: string; alt?: string; caption?: string }>;
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ isOpen, images, initialIndex = 0, onClose }: LightboxProps) {
  // 🔊 PHASE 3B: Sound context
  const { playClick, playWhoosh, playSuccess } = useSoundContext();
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, zoom, handlePrevious, handleNext, handleZoomIn, handleZoomOut, handleResetZoom, handleClose]);

  const handlePrevious = useCallback(() => {
    if (hasMultiple) {
      playWhoosh(); // 🔊 Sound feedback for navigation
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  }, [hasMultiple, images.length, playWhoosh]);

  const handleNext = useCallback(() => {
    if (hasMultiple) {
      playWhoosh(); // 🔊 Sound feedback for navigation
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  }, [hasMultiple, images.length, playWhoosh]);

  const handleZoomIn = useCallback(() => {
    playClick(); // 🔊 Sound feedback for zoom
    setZoom((prev) => Math.min(prev + 0.25, 4));
  }, [playClick]);

  const handleZoomOut = useCallback(() => {
    playClick(); // 🔊 Sound feedback for zoom
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, [playClick]);

  const handleResetZoom = useCallback(() => {
    playClick(); // 🔊 Sound feedback for reset
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [playClick]);

  const handleDownload = useCallback(() => {
    playSuccess(); // 🔊 Sound feedback for download
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.alt || `image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentImage, currentIndex, playSuccess]);

  const handleClose = () => {
    playClick(); // 🔊 Sound feedback for close
    onClose();
  };

  // Drag to pan (when zoomed)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen || !currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
        onClick={handleClose}
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </motion.button>

        {/* Top Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-4 left-4 right-20 z-10 flex items-center justify-between"
        >
          {/* Image Counter */}
          {hasMultiple && (
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= 0.5}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 4}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResetZoom();
              }}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Reset zoom"
              title="Reset zoom (Press 0)"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}

        {/* Image Container */}
        <div
          className="absolute inset-0 flex items-center justify-center p-20"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            src={currentImage.url}
            alt={currentImage.alt || `Image ${currentIndex + 1}`}
            className={`max-w-full max-h-full object-contain ${
              zoom > 1 ? 'cursor-move' : 'cursor-zoom-in'
            }`}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
              e.stopPropagation();
              if (zoom === 1) handleZoomIn();
            }}
            draggable={false}
          />
        </div>

        {/* Bottom Caption & Actions */}
        {(currentImage.caption || currentImage.alt) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute bottom-4 left-4 right-4 z-10"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white max-w-2xl mx-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {currentImage.alt && (
                    <p className="text-sm font-medium mb-1">{currentImage.alt}</p>
                  )}
                  {currentImage.caption && (
                    <p className="text-xs text-white/70">{currentImage.caption}</p>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="flex-shrink-0 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Download image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Keyboard Shortcuts Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 right-4 z-10 text-white/50 text-xs"
        >
          <div className="flex items-center gap-3 text-[10px]">
            <span>ESC: Close</span>
            <span>←→: Navigate</span>
            <span>+−: Zoom</span>
            <span>0: Reset</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Usage example:
 * 
 * const [lightboxOpen, setLightboxOpen] = useState(false);
 * const [lightboxIndex, setLightboxIndex] = useState(0);
 * 
 * <button onClick={() => {
 *   setLightboxIndex(0);
 *   setLightboxOpen(true);
 * }}>
 *   View Image
 * </button>
 * 
 * <Lightbox
 *   isOpen={lightboxOpen}
 *   images={[
 *     { url: '/image1.jpg', alt: 'Product Photo', caption: 'High-res product shot' },
 *     { url: '/image2.jpg', alt: 'Lifestyle Photo' }
 *   ]}
 *   initialIndex={lightboxIndex}
 *   onClose={() => setLightboxOpen(false)}
 * />
 */