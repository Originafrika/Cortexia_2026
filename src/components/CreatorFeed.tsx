import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PostOptionsSheet } from './PostOptionsSheet';
import { CommentsSheet } from './CommentsSheet';
import { RemixScreen } from './RemixScreen';

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
  remixVariants?: string[];
  currentVariant: number;
}

interface CreatorFeedProps {
  creatorUsername: string;
  creatorPosts: Post[];
  initialPostIndex: number;
  onClose: () => void;
  onOpenRemix?: (imageUrl: string, prompt?: string) => void; // ✅ NEW: Remix handler
}

export function CreatorFeed({ creatorUsername, creatorPosts, initialPostIndex, onClose, onOpenRemix }: CreatorFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPostIndex);
  const [posts, setPosts] = useState(creatorPosts);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showRemixScreen, setShowRemixScreen] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);
  const lastWheelTime = useRef(0);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  const currentPost = posts[currentIndex];

  const truncateCaption = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 3) return text;
    return words.slice(0, 3).join(' ') + '...';
  };

  useEffect(() => {
    setExpandedCaption(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          setSlideDirection('down');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentIndex(currentIndex - 1);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < posts.length - 1) {
          setSlideDirection('up');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentIndex(currentIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentPost.remixVariants && currentPost.remixVariants.length > 1) {
          setSlideDirection('right');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('left');
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentPost.remixVariants && currentPost.remixVariants.length > 1) {
          setSlideDirection('left');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('right');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts.length, currentPost]);

  // Mouse wheel navigation (desktop) - unified with ForYouFeed approach
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastWheelTime.current < 500) return;
    lastWheelTime.current = now;

    // Horizontal scroll - change remix variant
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (currentPost.remixVariants && currentPost.remixVariants.length > 1) {
        if (e.deltaX > 0) {
          setSlideDirection('left');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('right');
        } else if (e.deltaX < 0) {
          setSlideDirection('right');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('left');
        }
      }
    }
    // Vertical scroll - change post
    else {
      if (e.deltaY > 0 && currentIndex < posts.length - 1) {
        setSlideDirection('up');
        setTimeout(() => setSlideDirection(null), 250);
        setCurrentIndex(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setSlideDirection('down');
        setTimeout(() => setSlideDirection(null), 250);
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  // Touch navigation (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    swipeDirection.current = null;
    
    // Check if the touch started on an interactive element
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      isSwiping.current = false;
      return;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
      
      if (deltaX > 10 || deltaY > 10) {
        isSwiping.current = true;
        swipeDirection.current = deltaX > deltaY ? 'horizontal' : 'vertical';
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (swipeDirection.current === 'vertical' && Math.abs(deltaY) > 50) {
      if (deltaY < 0 && currentIndex < posts.length - 1) {
        setSlideDirection('up');
        setTimeout(() => setSlideDirection(null), 250);
        setCurrentIndex(currentIndex + 1);
      } else if (deltaY > 0 && currentIndex > 0) {
        setSlideDirection('down');
        setTimeout(() => setSlideDirection(null), 250);
        setCurrentIndex(currentIndex - 1);
      }
    } else if (swipeDirection.current === 'horizontal' && Math.abs(deltaX) > 50) {
      if (currentPost.remixVariants && currentPost.remixVariants.length > 1) {
        if (deltaX < 0) {
          setSlideDirection('left');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('right');
        } else {
          setSlideDirection('right');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('left');
        }
      }
    }

    isSwiping.current = false;
    swipeDirection.current = null;
  };

  const handleVariantChange = (direction: 'left' | 'right') => {
    setPosts(prevPosts => prevPosts.map((post, idx) => {
      if (idx === currentIndex && post.remixVariants) {
        const newVariant = direction === 'right'
          ? (post.currentVariant + 1) % post.remixVariants.length
          : (post.currentVariant - 1 + post.remixVariants.length) % post.remixVariants.length;
        return { ...post, currentVariant: newVariant };
      }
      return post;
    }));
  };

  const toggleLike = () => {
    const isLiking = !currentPost.liked;
    setPosts(prevPosts => prevPosts.map((post, idx) => {
      if (idx === currentIndex) {
        return { ...post, liked: isLiking };
      }
      return post;
    }));
    toast.success(isLiking ? 'Added to liked posts' : 'Removed from liked posts');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this post by @${currentPost.username}`,
          text: currentPost.caption,
          url: `https://cortexia.app/p/${currentPost.id}`,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(`https://cortexia.app/p/${currentPost.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const handleFollow = () => {
    const isFollowing = !currentPost.following;
    setPosts(prevPosts => prevPosts.map((post, idx) => {
      if (idx === currentIndex) {
        return { ...post, following: isFollowing };
      }
      return post;
    }));
    toast.success(isFollowing ? `Following @${currentPost.username}` : `Unfollowed @${currentPost.username}`);
  };

  const handleDotClick = (variantIndex: number) => {
    if (!currentPost.remixVariants) return;
    
    setPosts(prevPosts => prevPosts.map((post, idx) => {
      if (idx === currentIndex) {
        return { ...post, currentVariant: variantIndex };
      }
      return post;
    }));
  };

  if (!currentPost) {
    return null;
  }

  const displayMediaUrl = currentPost.remixVariants && currentPost.remixVariants.length > 0
    ? currentPost.remixVariants[currentPost.currentVariant]
    : currentPost.mediaUrl;

  // Parse comments count for display
  const commentsCount = parseInt(currentPost.comments.replace('K', '')) * 1000;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent pt-safe pb-8 px-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onClose} 
              className="p-2 -ml-2"
              aria-label="Go back"
            >
              <ArrowLeft className="text-white" size={24} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-white">@{creatorUsername}</span>
              {currentPost.verified && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                </svg>
              )}
            </div>
            <div className="w-8" />
          </div>
        </div>

        {/* Main Content */}
        <div
          className="relative w-full h-screen overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* Video/Image with gradient overlay */}
          <div 
            className={`absolute inset-0 ${
              slideDirection === 'up' ? 'animate-feed-slide-up' :
              slideDirection === 'down' ? 'animate-feed-slide-down' :
              slideDirection === 'left' ? 'animate-feed-slide-left' :
              slideDirection === 'right' ? 'animate-feed-slide-right' :
              'animate-fade-in'
            }`}
            style={{ 
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
            }}
          >
            <ImageWithFallback
              src={displayMediaUrl}
              alt={currentPost.caption}
              className="w-full h-full object-cover"
              style={{ 
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
              }}
            />
            {/* Gradient Overlay for readability */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"
              style={{ 
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
              }}
            />
          </div>

          {/* Remix Pagination Dots - unified with ForYouFeed */}
          {currentPost.remixVariants && currentPost.remixVariants.length > 1 && (
            <div className="absolute bottom-36 left-0 right-0 flex justify-center gap-2 z-30">
              {currentPost.remixVariants.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full transition-colors flex items-center justify-center"
                  aria-label={`View variant ${idx + 1}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === currentPost.currentVariant ? 'bg-[#6366f1]' : 'bg-white/40'
                  }`} />
                </button>
              ))}
            </div>
          )}

          {/* Bottom Left - Creator Info */}
          <div className="absolute bottom-20 left-4 right-20 z-20">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <ImageWithFallback
                  src={currentPost.avatarUrl}
                  alt={currentPost.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              </div>
              {!currentPost.following && (
                <button
                  onClick={handleFollow}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="px-4 py-1.5 bg-[#6366f1] text-white text-sm rounded-full"
                  aria-label={`Follow @${currentPost.username}`}
                >
                  Follow
                </button>
              )}
            </div>

            {/* Caption */}
            <button
              onClick={() => setExpandedCaption(!expandedCaption)}
              onTouchStart={(e) => e.stopPropagation()}
              className="text-left"
              aria-label="Expand caption"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[#6366f1]">@{currentPost.username}</span>
                {currentPost.verified && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                  </svg>
                )}
              </div>
              <p className="text-white text-sm leading-relaxed" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
                {expandedCaption ? currentPost.caption : truncateCaption(currentPost.caption)}
              </p>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-6">
            {/* Like */}
            <button 
              onClick={toggleLike}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1"
              aria-label={currentPost.liked ? 'Unlike' : 'Like'}
            >
              <Heart 
                className={currentPost.liked ? 'text-red-500 fill-red-500' : 'text-white'}
                size={32}
                strokeWidth={1.5}
              />
              <span className="text-white text-xs" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
                {currentPost.likes}
              </span>
            </button>

            {/* Comments */}
            <button 
              onClick={() => setShowCommentsSheet(true)}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1"
              aria-label="View comments"
            >
              <MessageCircle className="text-white" size={32} strokeWidth={1.5} />
              <span className="text-white text-xs" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
                {currentPost.comments}
              </span>
            </button>

            {/* Remix */}
            <button 
              onClick={() => {
                if (onOpenRemix) {
                  const displayMediaUrl = currentPost.remixVariants?.[currentPost.currentVariant] || currentPost.mediaUrl;
                  onOpenRemix(displayMediaUrl, currentPost.caption);
                } else {
                  setShowRemixScreen(true);
                }
              }}
              onTouchStart={(e) => e.stopPropagation()}
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

            {/* Share */}
            <button 
              onClick={handleShare}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1"
              aria-label="Share"
            >
              <Share2 className="text-white" size={28} strokeWidth={1.5} />
            </button>

            {/* More Options */}
            <button 
              onClick={() => setShowOptionsSheet(true)}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1"
              aria-label="More options"
            >
              <MoreVertical className="text-white" size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm z-20">
            {currentIndex + 1} / {posts.length}
          </div>
        </div>
      </div>

      {/* Post Options Sheet - with all required props */}
      {showOptionsSheet && (
        <PostOptionsSheet 
          username={currentPost.username}
          isFollowing={currentPost.following || false}
          onClose={() => setShowOptionsSheet(false)}
          onDownload={() => {
            toast.success('Media downloaded to your device');
            setShowOptionsSheet(false);
          }}
          onCopyLink={() => {
            navigator.clipboard.writeText(`https://cortexia.app/p/${currentPost.id}`);
            toast.success('Link copied to clipboard');
            setShowOptionsSheet(false);
          }}
          onFollow={() => {
            handleFollow();
            setShowOptionsSheet(false);
          }}
          onSeeLess={() => {
            toast.success('You will see less content like this');
            setShowOptionsSheet(false);
          }}
          onReport={() => {
            toast.success('Content reported. Thanks for keeping Cortexia safe.');
            setShowOptionsSheet(false);
          }}
        />
      )}

      {/* Comments Sheet - with correct props */}
      {showCommentsSheet && (
        <CommentsSheet 
          totalComments={commentsCount}
          onClose={() => setShowCommentsSheet(false)}
        />
      )}

      {/* Remix Screen */}
      {showRemixScreen && (
        <RemixScreen
          mediaUrl={displayMediaUrl}
          onClose={() => setShowRemixScreen(false)}
          onGenerate={(changes) => {
            toast.success('Remix generated successfully');
            setShowRemixScreen(false);
          }}
        />
      )}
    </>
  );
}
