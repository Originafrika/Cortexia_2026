import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Bell, ChevronDown, Heart, MessageCircle, Share2, MoreVertical, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PostOptionsSheet } from './PostOptionsSheet';
import { CommentsSheet } from './CommentsSheet';
import { FeedFilterMenu } from './FeedFilterMenu';
import { RemixScreen } from './RemixScreen';
import { UserProfile } from './UserProfile';
import type { Screen } from '../App';

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

interface ForYouFeedProps {
  onNavigate: (screen: Screen) => void;
}

const BASE_POSTS: Post[] = [
  {
    id: '1',
    username: 'ai_artist_pro',
    verified: true,
    caption: 'Futuristic cityscape generated with AI - Portrait mode, high detail',
    mediaUrl: 'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwYWklMjBnZW5lcmF0ZWQlMjBhcnR8ZW58MXx8fHwxNzYxOTAzMTIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: '11.2K',
    comments: '2.1K',
    remixes: '873',
    avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE4ODU2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: false,
    following: false,
    remixVariants: [
      'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwYWklMjBnZW5lcmF0ZWQlMjBhcnR8ZW58MXx8fHwxNzYxOTAzMTIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBuZW9uJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc2MTgyNDM3OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRpZ2l0YWwlMjBhcnR8ZW58MXx8fHwxNzYxODExMTk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    currentVariant: 0,
  },
  {
    id: '2',
    username: 'creative_mind',
    verified: true,
    caption: 'Abstract digital dreamscape - experimenting with color gradients',
    mediaUrl: 'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRpZ2l0YWwlMjBhcnR8ZW58MXx8fHwxNzYxODExMTk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: '8.4K',
    comments: '1.3K',
    remixes: '542',
    avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE4ODU2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: false,
    following: true,
    currentVariant: 0,
  },
  {
    id: '3',
    username: 'visual_explorer',
    verified: false,
    caption: 'Surreal landscape that doesn\'t exist - AI imagination at its finest',
    mediaUrl: 'https://images.unsplash.com/photo-1514449372970-c013485804bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJyZWFsJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MTg5NjE2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: '15.7K',
    comments: '3.2K',
    remixes: '1.2K',
    avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE4ODU2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: true,
    following: false,
    currentVariant: 0,
  },
  {
    id: '4',
    username: 'neon_dreams',
    verified: true,
    caption: 'Cyberpunk aesthetic meets natural beauty - AI fusion art',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBuZW9uJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc2MTgyNDM3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: '23.5K',
    comments: '4.8K',
    remixes: '2.1K',
    avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE4ODU2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: false,
    following: false,
    remixVariants: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBuZW9uJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc2MTgyNDM3OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwYWklMjBnZW5lcmF0ZWQlMjBhcnR8ZW58MXx8fHwxNzYxOTAzMTIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    currentVariant: 0,
  },
  {
    id: '5',
    username: 'pixel_wizard',
    verified: false,
    caption: 'Ethereal portrait with glowing elements - prompt: mystical fantasy character',
    mediaUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxODk2MTY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: '19.3K',
    comments: '2.7K',
    remixes: '1.5K',
    avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE4ODU2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: false,
    following: true,
    currentVariant: 0,
  },
  {
    id: '6',
    username: 'synthwave_art',
    verified: true,
    caption: 'Retro futuristic vibes - 80s meets AI generation',
    mediaUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aHdhdmUlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzYxODk2MTY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: '31.8K',
    comments: '5.2K',
    remixes: '3.4K',
    avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE4ODU2NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: true,
    following: false,
    currentVariant: 0,
  },
];

// Generate infinite scroll by duplicating posts with unique IDs
const generatePosts = (count: number): Post[] => {
  const posts: Post[] = [];
  for (let i = 0; i < count; i++) {
    const basePost = BASE_POSTS[i % BASE_POSTS.length];
    posts.push({
      ...basePost,
      id: `${basePost.id}-${Math.floor(i / BASE_POSTS.length)}`,
    });
  }
  return posts;
};

const INITIAL_POST_COUNT = 20;
const MOCK_POSTS = generatePosts(INITIAL_POST_COUNT);

export function ForYouFeed({ onNavigate }: ForYouFeedProps) {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showRemixScreen, setShowRemixScreen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'for-you' | 'following' | 'latest'>('for-you');
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);
  const lastWheelTime = useRef(0);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter posts based on selected filter
  const filteredPosts = useMemo(() => {
    switch (selectedFilter) {
      case 'following':
        return posts.filter(post => post.following);
      case 'latest':
        // Reverse the order to show latest first
        return [...posts].reverse();
      case 'for-you':
      default:
        return posts;
    }
  }, [posts, selectedFilter]);

  const currentPost = filteredPosts[currentPostIndex];

  // Truncate caption to first 3 words
  const truncateCaption = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 3) return text;
    return words.slice(0, 3).join(' ') + '...';
  };

  // Reset caption expansion when post changes
  useEffect(() => {
    setExpandedCaption(false);
  }, [currentPostIndex]);

  // Reset index only when filter changes (not when posts are loaded)
  useEffect(() => {
    setCurrentPostIndex(0);
    setExpandedCaption(false);
  }, [selectedFilter]);

  // Load more posts when reaching near the end (infinite scroll)
  const loadMorePosts = useCallback(() => {
    const newPosts = generatePosts(10);
    setPosts(prev => [...prev, ...newPosts]);
  }, []);

  // Handle variant change for remix posts
  const handleVariantChange = useCallback((direction: 'left' | 'right') => {
    if (!currentPost.remixVariants) return;
    
    setPosts(prev => prev.map(post => {
      if (post.id === currentPost.id) {
        const newVariant = direction === 'right'
          ? (post.currentVariant + 1) % post.remixVariants!.length
          : (post.currentVariant - 1 + post.remixVariants!.length) % post.remixVariants!.length;
        return { 
          ...post, 
          currentVariant: newVariant,
          mediaUrl: post.remixVariants![newVariant]
        };
      }
      return post;
    }));
  }, [currentPost]);

  // Keyboard navigation (desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentPostIndex > 0) {
          setSlideDirection('down');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(currentPostIndex - 1);
          setExpandedCaption(false);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentPostIndex + 1;
        if (nextIndex < filteredPosts.length) {
          setSlideDirection('up');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(nextIndex);
          setExpandedCaption(false);
          
          // Load more posts when near the end
          if (nextIndex >= filteredPosts.length - 3) {
            loadMorePosts();
          }
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
  }, [currentPostIndex, filteredPosts.length, currentPost, posts.length, loadMorePosts, handleVariantChange]);

  // Mouse wheel navigation (desktop)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Debounce wheel events
    const now = Date.now();
    if (now - lastWheelTime.current < 500) return;
    lastWheelTime.current = now;

    // Horizontal scroll - change remix variant
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (currentPost.remixVariants && currentPost.remixVariants.length > 1) {
        if (e.deltaX > 0) {
          // Scroll right - next variant
          setSlideDirection('left');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('right');
        } else if (e.deltaX < 0) {
          // Scroll left - previous variant
          setSlideDirection('right');
          setTimeout(() => setSlideDirection(null), 250);
          handleVariantChange('left');
        }
      }
    }
    // Vertical scroll - change post
    else {
      if (e.deltaY > 0) {
        // Scroll down - next post
        const nextIndex = currentPostIndex + 1;
        if (nextIndex < filteredPosts.length) {
          setSlideDirection('up');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(nextIndex);
          setExpandedCaption(false);
          
          // Load more posts when near the end
          if (nextIndex >= filteredPosts.length - 3) {
            loadMorePosts();
          }
        }
      } else if (e.deltaY < 0) {
        // Scroll up - previous post
        if (currentPostIndex > 0) {
          setSlideDirection('down');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(currentPostIndex - 1);
          setExpandedCaption(false);
        }
      }
    }
  };

  const handleLike = useCallback(() => {
    const isLiking = !currentPost.liked;
    setPosts(prev => prev.map(post => 
      post.id === currentPost.id ? { ...post, liked: isLiking } : post
    ));
    toast.success(isLiking ? 'Added to liked posts' : 'Removed from liked posts');
  }, [currentPost]);

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
      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      
      // Determine swipe direction once it exceeds threshold
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isSwiping.current = true;
        swipeDirection.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Horizontal swipe - change remix variant
    if (swipeDirection.current === 'horizontal' && Math.abs(deltaX) > 30) {
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
    // Vertical swipe - change post
    else if (swipeDirection.current === 'vertical' && Math.abs(deltaY) > 30) {
      if (deltaY < 0) {
        // Swipe up - next post
        const nextIndex = currentPostIndex + 1;
        if (nextIndex < filteredPosts.length) {
          setSlideDirection('up');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(nextIndex);
          setExpandedCaption(false);
          
          // Load more posts when near the end (infinite scroll)
          if (nextIndex >= filteredPosts.length - 3) {
            loadMorePosts();
          }
        }
      } else {
        // Swipe down - previous post (only if not at start)
        if (currentPostIndex > 0) {
          setSlideDirection('down');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(currentPostIndex - 1);
          setExpandedCaption(false);
        }
      }
    }

    // Reset
    isSwiping.current = false;
    swipeDirection.current = null;
  };

  const handleFollow = useCallback(() => {
    const isFollowing = !currentPost.following;
    setPosts(prev => prev.map(post => 
      post.id === currentPost.id ? { ...post, following: isFollowing } : post
    ));
    toast.success(isFollowing ? `Following @${currentPost.username}` : `Unfollowed @${currentPost.username}`);
  }, [currentPost]);

  const handleShare = useCallback(async () => {
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
  }, [currentPost]);

  const handleDotClick = useCallback((variantIndex: number) => {
    if (!currentPost.remixVariants) return;
    
    setPosts(prev => prev.map(post => {
      if (post.id === currentPost.id) {
        return { 
          ...post, 
          currentVariant: variantIndex,
          mediaUrl: post.remixVariants![variantIndex]
        };
      }
      return post;
    }));
  }, [currentPost]);

  const filterLabels = {
    'for-you': 'For You',
    'following': 'Following',
    'latest': 'Latest',
  };

  // Handle empty filtered posts
  if (!currentPost || filteredPosts.length === 0) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white text-xl mb-2">No posts found</p>
          <p className="text-white/60">Try a different filter</p>
        </div>
      </div>
    );
  }

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading feed...</p>
        </div>
      </div>
    );
  }

  // Get display media URL (for variants)
  const displayMediaUrl = currentPost.remixVariants && currentPost.remixVariants.length > 0
    ? currentPost.remixVariants[currentPost.currentVariant]
    : currentPost.mediaUrl;

  // Parse comments count
  const commentsCount = parseInt(currentPost.comments.replace('K', '')) * 1000;

  return (
    <>
      <div className="relative w-full h-screen bg-black">
        {/* Status Bar Space */}
        <div className="absolute top-0 left-0 right-0 h-12 z-50 pt-safe">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="w-16"></div>
            <button 
              onClick={() => setShowFilterMenu(true)}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-white relative"
              aria-label={`Current filter: ${filterLabels[selectedFilter]}`}
            >
              <span>{filterLabels[selectedFilter]}</span>
              <ChevronDown size={20} />
              {selectedFilter !== 'for-you' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#6366f1] rounded-full" />
              )}
            </button>
            <button 
              onClick={() => onNavigate('activity')} 
              onTouchStart={(e) => e.stopPropagation()}
              className="w-16 flex justify-end"
              aria-label="View notifications"
            >
              <Bell className="text-white" size={24} />
            </button>
          </div>
        </div>

      {/* Main Content - Video/Image */}
      <div 
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div 
          key={currentPost.id}
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

        {/* Remix Pagination Dots */}
        {currentPost.remixVariants && currentPost.remixVariants.length > 1 && (
          <div className="absolute bottom-36 left-0 right-0 flex justify-center gap-2 z-30">
            {currentPost.remixVariants.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                onTouchStart={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full transition-colors flex items-center justify-center"
                aria-label={`View variant ${idx + 1} of ${currentPost.remixVariants!.length}`}
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
              <button 
                onClick={() => setShowUserProfile(true)}
                onTouchStart={(e) => e.stopPropagation()}
                className="block"
                aria-label={`View @${currentPost.username}'s profile`}
              >
                <ImageWithFallback
                  src={currentPost.avatarUrl}
                  alt={currentPost.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              </button>
              {!currentPost.following && (
                <button
                  onClick={handleFollow}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center text-white"
                  aria-label={`Follow @${currentPost.username}`}
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowUserProfile(true)}
            onTouchStart={(e) => e.stopPropagation()}
            className="text-left"
            aria-label={`View @${currentPost.username}'s profile`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[#6366f1]">@{currentPost.username}</span>
              {currentPost.verified && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                </svg>
              )}
            </div>
          </button>
          <button
            onClick={() => setExpandedCaption(!expandedCaption)}
            onTouchStart={(e) => e.stopPropagation()}
            className="text-white mt-2 text-left"
            style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}
            aria-label={expandedCaption ? 'Collapse caption' : 'Expand caption'}
          >
            {expandedCaption ? currentPost.caption : truncateCaption(currentPost.caption)}
          </button>
        </div>

        {/* Right Side - Actions */}
        <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-20">
          <button 
            onClick={handleLike} 
            onTouchStart={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1"
            aria-label={currentPost.liked ? 'Unlike' : 'Like'}
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
            onClick={() => setShowRemixScreen(true)}
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

          <button 
            onClick={() => setShowCommentsSheet(true)}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1"
            aria-label="Comments"
          >
            <MessageCircle className="text-white" size={32} strokeWidth={1.5} />
            <span className="text-white text-xs" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
              {currentPost.comments}
            </span>
          </button>

          <button 
            onClick={handleShare}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1"
            aria-label="Share"
          >
            <Share2 className="text-white" size={28} strokeWidth={1.5} />
          </button>

          <button 
            onClick={() => setShowOptionsSheet(true)}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1"
            aria-label="More options"
          >
            <MoreVertical className="text-white" size={28} strokeWidth={1.5} />
          </button>
        </div>
      </div>

        {/* Options Sheet - with all required props */}
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

        {/* Filter Menu */}
        {showFilterMenu && (
          <FeedFilterMenu
            selectedFilter={selectedFilter}
            onSelect={setSelectedFilter}
            onClose={() => setShowFilterMenu(false)}
          />
        )}
      </div>

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

      {/* User Profile */}
      {showUserProfile && (
        <UserProfile
          username={currentPost.username}
          onClose={() => setShowUserProfile(false)}
          allPosts={posts}
          onOpenPost={(postId) => {
            const postIndex = posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
              setCurrentPostIndex(postIndex);
              setShowUserProfile(false);
            }
          }}
        />
      )}
    </>
  );
}