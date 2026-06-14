import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';

interface RemixItem {
  id: string;
  imageUrl: string;
  username: string;
}

interface RemixCarouselProps {
  currentPost: any;
  remixChain: Array<{ id: string; imageUrl: string; username: string }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  imageObjectFit?: 'cover' | 'contain'; // ✅ NEW: Image fit mode
}

export function RemixCarousel({
  currentPost,
  remixChain,
  currentIndex,
  onIndexChange,
  onTouchStart,
  imageObjectFit = 'cover' // ✅ NEW: Default to 'cover'
}: RemixCarouselProps) {
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const isHorizontalSwipeRef = useRef(false); // ✅ NEW: Track if this is a horizontal swipe
  const lastWheelTime = useRef(0); // ✅ NEW: Debounce wheel events

  const handleCarouselTouchStart = (e: React.TouchEvent) => {
    console.log('🔵 RemixCarousel: Touch Start');
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = false;
    
    // ✅ Stop propagation to prevent parent from handling
    e.stopPropagation();
  };

  const handleCarouselTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;

    // Detect if this is a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isHorizontalSwipeRef.current = true;
      e.stopPropagation();
      e.preventDefault(); // ✅ Prevent scroll and parent handling
      console.log('🔵 RemixCarousel: Horizontal swipe detected', { deltaX, deltaY });
    }
  };

  const handleCarouselTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    console.log('🔵 RemixCarousel: Touch End', { deltaX, deltaY, isHorizontal: isHorizontalSwipeRef.current });

    // Only handle horizontal swipes
    if (isHorizontalSwipeRef.current && Math.abs(deltaX) > 50) {
      e.stopPropagation();
      e.preventDefault();
      
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous
        console.log('🔵 RemixCarousel: Swipe RIGHT - Previous');
        setSlideDirection('right');
        setTimeout(() => setSlideDirection(null), 250);
        onIndexChange(currentIndex - 1);
      } else if (deltaX < 0 && currentIndex < remixChain.length - 1) {
        // Swipe left - go to next
        console.log('🔵 RemixCarousel: Swipe LEFT - Next');
        setSlideDirection('left');
        setTimeout(() => setSlideDirection(null), 250);
        onIndexChange(currentIndex + 1);
      }
    }
    
    isHorizontalSwipeRef.current = false;
  };

  // ✅ NEW: Handle wheel/touchpad events
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    
    // Debounce: Only process one event per 300ms
    if (now - lastWheelTime.current < 300) return;
    
    console.log('🔵 RemixCarousel: Wheel event', { deltaX: e.deltaX, deltaY: e.deltaY });

    // Check if this is primarily a horizontal scroll
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
      e.stopPropagation();
      e.preventDefault();
      lastWheelTime.current = now;
      
      if (e.deltaX > 0 && currentIndex < remixChain.length - 1) {
        // Scroll right - go to next
        console.log('🔵 RemixCarousel: Wheel RIGHT - Next');
        setSlideDirection('left');
        setTimeout(() => setSlideDirection(null), 250);
        onIndexChange(currentIndex + 1);
      } else if (e.deltaX < 0 && currentIndex > 0) {
        // Scroll left - go to previous
        console.log('🔵 RemixCarousel: Wheel LEFT - Previous');
        setSlideDirection('right');
        setTimeout(() => setSlideDirection(null), 250);
        onIndexChange(currentIndex - 1);
      }
    }
  };

  const currentRemix = remixChain[currentIndex];

  return (
    <div className="absolute inset-0">
      {/* Carousel Content */}
      <div
        className="relative w-full h-full"
        onTouchStart={handleCarouselTouchStart}
        onTouchMove={handleCarouselTouchMove}
        onTouchEnd={handleCarouselTouchEnd}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRemix.id}
            initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : slideDirection === 'right' ? -100 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : slideDirection === 'right' ? 100 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{ 
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
            }}
          >
            <ImageWithFallback
              src={currentRemix.imageUrl}
              alt={`Remix by ${currentRemix.username}`}
              className={`w-full h-full ${imageObjectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
              style={{ 
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                backgroundColor: imageObjectFit === 'contain' ? '#000' : 'transparent'
              }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" 
              style={{ 
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      {remixChain.length > 1 && (
        <div className="absolute bottom-36 left-0 right-0 flex justify-center gap-2 z-30 pointer-events-none">
          {remixChain.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'bg-[#6366f1] scale-125' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Remix Badge */}
      {currentIndex > 0 && (
        <div className="absolute top-16 left-4 z-30 px-3 py-1.5 rounded-full bg-[#6366f1]/30 backdrop-blur-sm border border-[#6366f1]/60 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M7 7H17V10L21 6L17 2V5H5V11H7V7Z" fill="currentColor"/>
            <path d="M17 17H7V14L3 18L7 22V19H19V13H17V17Z" fill="currentColor"/>
          </svg>
          <span className="text-white text-xs font-medium">
            Remix {currentIndex} by @{currentRemix.username}
          </span>
        </div>
      )}
    </div>
  );
}