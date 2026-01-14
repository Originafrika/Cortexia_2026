import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, MessageCircle, Share2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Post {
  id: string;
  username: string;
  verified: boolean;
  caption: string;
  mediaUrl: string;
  likes: string;
  comments: string;
  remixes: string;
  avatarUrl: string;
  liked: boolean;
  following?: boolean;
  metadata?: any;
  parentCreationId?: string;
  remixChain?: string[];
}

interface RemixChainViewerProps {
  rootPost: Post;
  currentPostId: string;
  onClose: () => void;
  onPostChange: (post: Post, index: number) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onRemix: (imageUrl: string, prompt: string, parentId: string) => void;
}

export function RemixChainViewer({
  rootPost,
  currentPostId,
  onClose,
  onPostChange,
  onLike,
  onComment,
  onShare,
  onRemix
}: RemixChainViewerProps) {
  const [remixChain, setRemixChain] = useState<Post[]>([rootPost]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipeRef = useRef(false); // ✅ NEW: Track horizontal swipe
  const lastWheelTime = useRef(0); // ✅ NEW: Debounce wheel events

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch the complete remix chain
  useEffect(() => {
    const fetchRemixChain = async () => {
      try {
        console.log('🔗 Fetching remix chain for:', rootPost.id);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/${rootPost.id}/remix-chain`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        const data = await response.json();
        console.log('🔗 Remix chain response:', data);
        
        if (data.success && data.chain && data.chain.length > 0) {
          const chainPosts: Post[] = data.chain.map((creation: any) => ({
            id: creation.id,
            username: creation.username,
            verified: false,
            caption: creation.caption || creation.prompt,
            mediaUrl: creation.assetUrl,
            likes: creation.likes.toString(),
            comments: creation.comments.toString(),
            remixes: creation.remixes.toString(),
            avatarUrl: creation.userAvatar || 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?w=100',
            liked: false,
            following: false,
            metadata: creation.metadata,
            parentCreationId: creation.parentCreationId,
            remixChain: creation.remixChain
          }));
          
          setRemixChain(chainPosts);
          
          // Find current post index in chain
          const currentIdx = chainPosts.findIndex(p => p.id === currentPostId);
          if (currentIdx !== -1) {
            setCurrentIndex(currentIdx);
          }
        } else {
          // Fallback: just show the root post
          setRemixChain([rootPost]);
          setCurrentIndex(0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching remix chain:', error);
        setRemixChain([rootPost]);
        setCurrentIndex(0);
        setLoading(false);
      }
    };
    
    fetchRemixChain();
  }, [rootPost, currentPostId]);

  const currentPost = remixChain[currentIndex];

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setTimeout(() => setSlideDirection(null), 250);
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onPostChange(remixChain[newIndex], newIndex);
    }
  }, [currentIndex, remixChain, onPostChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < remixChain.length - 1) {
      setSlideDirection('left');
      setTimeout(() => setSlideDirection(null), 250);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onPostChange(remixChain[newIndex], newIndex);
    }
  }, [currentIndex, remixChain, onPostChange]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Detect horizontal swipe early
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isHorizontalSwipeRef.current = true;
      e.preventDefault(); // ✅ Prevent default behavior during swipe
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Only swipe if horizontal movement is dominant
    if (isHorizontalSwipeRef.current && Math.abs(deltaX) > 50) {
      e.preventDefault(); // ✅ Prevent default behavior
      if (deltaX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    
    isHorizontalSwipeRef.current = false;
  };

  // ✅ NEW: Handle wheel/touchpad events
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    
    // Debounce: Only process one event per 300ms
    if (now - lastWheelTime.current < 300) return;

    // Check if this is primarily a horizontal scroll
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
      e.stopPropagation();
      e.preventDefault();
      lastWheelTime.current = now;
      
      if (e.deltaX > 0) {
        // Scroll right - go to next
        handleNext();
      } else if (e.deltaX < 0) {
        // Scroll left - go to previous
        handlePrevious();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 z-50 pt-safe">
        <div className="flex items-center justify-between px-4 h-full">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label="Close remix chain"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#6366f1]">
              <path d="M7 7H17V10L21 6L17 2V5H5V11H7V7Z" fill="currentColor"/>
              <path d="M17 17H7V14L3 18L7 22V19H19V13H17V17Z" fill="currentColor"/>
            </svg>
            <span className="text-white text-sm font-medium">Remix Chain</span>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : slideDirection === 'right' ? -100 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : slideDirection === 'right' ? 100 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <ImageWithFallback
              src={currentPost.mediaUrl}
              alt={currentPost.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-30 hover:bg-white/30 transition-colors"
            aria-label="Previous remix"
          >
            <ChevronLeft size={28} />
          </button>
        )}
        
        {currentIndex < remixChain.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white z-30 hover:bg-white/30 transition-colors"
            aria-label="Next remix"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Progress Indicator */}
        <div className="absolute bottom-36 left-0 right-0 z-30">
          <div className="flex justify-center gap-2 mb-4">
            {remixChain.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx !== currentIndex) {
                    setSlideDirection(idx > currentIndex ? 'left' : 'right');
                    setTimeout(() => setSlideDirection(null), 250);
                    setCurrentIndex(idx);
                    onPostChange(remixChain[idx], idx);
                  }
                }}
                className="w-8 h-8 rounded-full transition-colors flex items-center justify-center"
                aria-label={`Go to remix ${idx + 1}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-[#6366f1] scale-125' : 'bg-white/40'
                }`} />
              </button>
            ))}
          </div>
          
          <div className="text-center text-white/80 text-sm">
            {currentIndex === 0 ? 'Original' : `Remix ${currentIndex}`} • {currentIndex + 1} of {remixChain.length}
          </div>
        </div>

        {/* Post Info */}
        <div className="absolute bottom-20 left-4 right-20 z-20">
          <div className="flex items-center gap-2 mb-2">
            <ImageWithFallback
              src={currentPost.avatarUrl}
              alt={currentPost.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#6366f1] font-medium">@{currentPost.username}</span>
                {currentPost.verified && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                  </svg>
                )}
              </div>
              {currentIndex > 0 && (
                <div className="text-white/60 text-xs">
                  Remixed from @{remixChain[currentIndex - 1]?.username}
                </div>
              )}
            </div>
          </div>
          <p className="text-white mt-2" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
            {currentPost.caption}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-20">
          <button 
            onClick={() => onLike(currentPost.id)}
            className="flex flex-col items-center gap-1"
            aria-label="Like"
          >
            <Heart
              className={currentPost.liked ? 'text-[#6366f1]' : 'text-white'}
              size={32}
              fill={currentPost.liked ? '#6366f1' : 'none'}
              strokeWidth={1.5}
            />
            <span className="text-white text-xs" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
              {currentPost.likes}
            </span>
          </button>

          <button 
            onClick={() => onRemix(currentPost.mediaUrl, currentPost.caption, currentPost.id)}
            className="flex flex-col items-center gap-1"
            aria-label="Remix"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M7 7H17V10L21 6L17 2V5H5V11H7V7Z" fill="currentColor"/>
              <path d="M17 17H7V14L3 18L7 22V19H19V13H17V17Z" fill="currentColor"/>
            </svg>
            <span className="text-white text-xs" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
              {currentPost.remixes}
            </span>
          </button>

          <button 
            onClick={() => onComment(currentPost.id)}
            className="flex flex-col items-center gap-1"
            aria-label="Comment"
          >
            <MessageCircle className="text-white" size={32} strokeWidth={1.5} />
            <span className="text-white text-xs" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
              {currentPost.comments}
            </span>
          </button>

          <button 
            onClick={() => onShare(currentPost.id)}
            className="flex flex-col items-center gap-1"
            aria-label="Share"
          >
            <Share2 className="text-white" size={28} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}