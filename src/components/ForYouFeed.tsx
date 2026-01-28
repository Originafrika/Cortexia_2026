import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Sparkles, TrendingUp, Crown, Award, Zap, Share2, Plus, ChevronLeft, Filter, Clock, Flame, ChevronDown, Bell, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router'; // ✅ FIX: Add missing import
import { toast } from 'sonner@2.0.3'; // ✅ FIX: Add missing import
import type { Screen } from '../App';
import { PostCard } from './feed/PostCard';
import { PostDetailModal } from './feed/PostDetailModal';
import { CommentsSection } from './CommentsSection';
import { ShareModal } from './ShareModal';
import { RemixChainViewer } from './RemixChainViewer';
import { UserProfile } from './UserProfile';
import { formatNumber } from '../utils/formatNumber';
import { useAuth } from '../lib/contexts/AuthContext'; // ✅ NEW: Get auth context
import { useTranslation } from '../lib/i18n'; // ✅ NEW: i18n hook
import { LanguageSwitcher } from './LanguageSwitcher'; // ✅ NEW: Language switcher
import { useCurrentUser } from '../lib/hooks/useCurrentUser'; // ✅ FIX: Add missing import
import { ImageWithFallback } from './figma/ImageWithFallback'; // ✅ FIX: Add missing import
import { RemixCarousel } from './feed/RemixCarousel'; // ✅ FIX: Add missing import
import { FeedFilterMenu } from './FeedFilterMenu'; // ✅ FIX: Add missing import
import { RemixScreen } from './RemixScreen'; // ✅ FIX: Add missing import
import { SignupPromptModal } from './SignupPromptModal'; // ✅ FIX: Add missing import
import { PostOptionsSheet } from './PostOptionsSheet'; // ✅ FIX: Add missing import
import { projectId, publicAnonKey } from '../utils/supabase/info'; // ✅ FIX: Add missing import
import { downloadImageWithWatermark } from '../utils/watermarkHelpers'; // ✅ FIX: Correct import path
import { getAvatarUrl, formatUsername } from '../utils/avatarHelpers'; // ✅ FIX: Correct import path

interface Post {
  id: string;
  userId?: string; // ✅ ADD: userId for avatar generation
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
  metadata?: any;
  parentCreationId?: string;
  remixChain?: string[];
  remixChainData?: Post[]; // ✅ NEW: Cached remix chain data for horizontal scroll
  remixChainIndex?: number; // ✅ NEW: Current index in remix chain
}

interface ForYouFeedProps {
  onNavigate: (screen: Screen) => void;
  onOpenCreate?: () => void;
  onOpenRemixScreen?: (imageUrl: string, prompt?: string, parentCreationId?: string) => void; // ✅ ADD: parentCreationId
  feedPosts?: Post[];
}

export function ForYouFeed({
  onNavigate,
  onOpenCreate,
  onOpenRemixScreen,
  feedPosts = []
}: ForYouFeedProps) {
  const { t } = useTranslation(); // ✅ NEW
  const { user } = useAuth(); // ✅ NEW: Get user from AuthContext
  const navigate = useNavigate(); // ✅ NEW: For redirecting
  const currentUserId = useCurrentUser(); // ✅ NEW: Get current user ID
  
  // ✅ NEW: Access Control - Block Enterprise & Developers
  useEffect(() => {
    if (!user) {
      // Not logged in - allow viewing but restrict actions
      return;
    }
    
    // Block Enterprise accounts
    if (user.accountType === 'enterprise') {
      console.log('🚫 Feed blocked for Enterprise accounts');
      toast.error('Feed is only available for Individual accounts');
      navigate('/coconut-v14');
      return;
    }
    
    // Block Developer accounts
    if (user.accountType === 'developer') {
      console.log('🚫 Feed blocked for Developer accounts');
      toast.error('Feed is only available for Individual accounts');
      navigate('/dashboard-dev');
      return;
    }
    
    console.log('✅ Feed access granted for Individual user');
  }, [user, navigate]);
  
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showRemixScreen, setShowRemixScreen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showRemixChainViewer, setShowRemixChainViewer] = useState(false); // ✅ NEW: Remix chain viewer
  const [selectedFilter, setSelectedFilter] = useState<'for-you' | 'following' | 'latest'>('for-you');
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [imageObjectFit, setImageObjectFit] = useState<'cover' | 'contain'>('cover'); // ✅ NEW: Image fit mode
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);
  const lastWheelTime = useRef(0);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptAction, setSignupPromptAction] = useState<'like' | 'comment' | 'share' | 'remix' | 'follow' | 'download'>('like');
  
  // ✅ NEW: Loading state for remix chains
  const [loadingRemixChains, setLoadingRemixChains] = useState<Set<string>>(new Set());
  
  // ✅ NEW: Creator status tracking for posts
  const [postCreatorStatus, setPostCreatorStatus] = useState<Record<string, boolean>>({});
  
  // ✅ Filter posts based on selected filter (MOVED UP before using currentPost)
  const filteredPosts = useMemo(() => {
    switch (selectedFilter) {
      case 'following':
        return posts.filter(post => post.following);
      case 'latest':
        return [...posts].reverse();
      case 'for-you':
      default:
        return posts;
    }
  }, [posts, selectedFilter]);

  // ✅ Current post (MOVED UP before using in callbacks)
  const currentPost = filteredPosts[currentPostIndex];
  
  // ✅ NEW: Fetch remix chain for a post
  const fetchRemixChain = useCallback(async (postId: string) => {
    if (loadingRemixChains.has(postId)) return; // Already loading
    
    setLoadingRemixChains(prev => new Set(prev).add(postId));
    
    try {
      console.log(`🔗 Fetching remix chain for: ${postId}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/${postId}/remix-chain`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const data = await response.json();
      console.log(`🔗 Remix chain response:`, data);
      
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
          currentVariant: 0,
          metadata: creation.metadata,
          parentCreationId: creation.parentCreationId,
          remixChain: creation.remixChain
        }));
        
        // Update the post with remix chain data
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            // Find the current post index in the chain
            const currentIndex = chainPosts.findIndex(p => p.id === postId);
            return {
              ...post,
              remixChainData: chainPosts,
              remixChainIndex: currentIndex !== -1 ? currentIndex : 0
            };
          }
          return post;
        }));
        
        console.log(`✅ Loaded remix chain: ${chainPosts.length} items`);
      }
    } catch (error) {
      console.error('❌ Error fetching remix chain:', error);
    } finally {
      setLoadingRemixChains(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }, []); // ✅ FIX: Remove loadingRemixChains from dependencies to avoid infinite loop
  
  // ✅ NEW: Auto-load remix chain when post with remixes is displayed
  useEffect(() => {
    if (currentPost && parseInt(currentPost.remixes) > 0 && !currentPost.remixChainData) {
      console.log(`🔗 Auto-loading remix chain for post ${currentPost.id} (${currentPost.remixes} remixes)`);
      fetchRemixChain(currentPost.id);
    } else if (currentPost?.remixChainData) {
      console.log(`✅ Remix chain already loaded: ${currentPost.remixChainData.length} items, current index: ${currentPost.remixChainIndex}`);
    }
  }, [currentPost?.id, currentPost?.remixes, currentPost?.remixChainData, fetchRemixChain]);
  
  // ✅ NEW: Handle remix chain navigation
  const handleRemixChainIndexChange = useCallback((newIndex: number) => {
    if (!currentPost?.remixChainData) return;
    
    setPosts(prev => prev.map(post => {
      if (post.id === currentPost.id) {
        return {
          ...post,
          remixChainIndex: newIndex
        };
      }
      return post;
    }));
  }, [currentPost?.id, currentPost?.remixChainData]);

  // ✅ NEW: Check if post author is a Creator
  const checkCreatorStatus = useCallback(async (userId: string, postId: string) => {
    if (!userId || postCreatorStatus[postId] !== undefined) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${userId}/coconut-access`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      setPostCreatorStatus(prev => ({
        ...prev,
        [postId]: data.hasCoconutAccess || false
      }));
    } catch (error) {
      console.error('Failed to check Creator status:', error);
    }
  }, [postCreatorStatus]);

  // ✅ NEW: Check Creator status when post loads
  useEffect(() => {
    if (currentPost?.userId) {
      checkCreatorStatus(currentPost.userId, currentPost.id);
    }
  }, [currentPost?.id, currentPost?.userId, checkCreatorStatus]);

  // ✅ Fetch real feed data from backend
  const fetchFeedPosts = useCallback(async (offset = 0, limit = 20) => {
    try {
      console.log(`📥 Fetching feed posts: offset=${offset}, limit=${limit}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/community?offset=${offset}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const data = await response.json();
      console.log(`📥 Feed response:`, data);
      
      if (data.success && data.creations) {
        const newPosts: Post[] = data.creations.map((creation: any) => ({
          id: creation.id,
          userId: creation.userId, // ✅ ADD: userId for avatar generation
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
          currentVariant: 0,
          metadata: creation.metadata,
          parentCreationId: creation.parentCreationId,
          remixChain: creation.remixChain
        }));
        
        setHasMore(data.pagination.hasMore);
        return newPosts;
      } else {
        console.warn('⚠️ Backend feed returned no creations');
        return [];
      }
    } catch (error) {
      console.error('❌ Fetch feed error:', error);
      return [];
    }
  }, []);
  
  // ✅ Initial load
  useEffect(() => {
    const loadInitialFeed = async () => {
      const initialPosts = await fetchFeedPosts(0, 20);
      setPosts(initialPosts);
      setInitialLoading(false);
    };
    
    loadInitialFeed();
  }, [fetchFeedPosts]);
  
  // ✅ Load more posts when near end
  useEffect(() => {
    if (currentPostIndex >= posts.length - 5 && !isLoadingMore && hasMore) {
      const loadMore = async () => {
        setIsLoadingMore(true);
        const morePosts = await fetchFeedPosts(posts.length, 20);
        setPosts(prev => [...prev, ...morePosts]);
        setIsLoadingMore(false);
      };
      
      loadMore();
    }
  }, [currentPostIndex, posts.length, fetchFeedPosts, isLoadingMore, hasMore]);
  
  const handleProtectedAction = useCallback((action: typeof signupPromptAction, callback: () => void) => {
    if (!user) {
      setSignupPromptAction(action);
      setShowSignupPrompt(true);
      return;
    }
    callback();
  }, [user]);

  const truncateCaption = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 3) return text;
    return words.slice(0, 3).join(' ') + '...';
  };

  useEffect(() => {
    setExpandedCaption(false);
  }, [currentPostIndex]);

  useEffect(() => {
    setCurrentPostIndex(0);
    setExpandedCaption(false);
  }, [selectedFilter]);

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

  // Keyboard navigation
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
  }, [currentPostIndex, filteredPosts.length, currentPost, handleVariantChange]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastWheelTime.current < 500) return;
    lastWheelTime.current = now;

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
    } else {
      if (e.deltaY > 0) {
        const nextIndex = currentPostIndex + 1;
        if (nextIndex < filteredPosts.length) {
          setSlideDirection('up');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(nextIndex);
          setExpandedCaption(false);
        }
      } else if (e.deltaY < 0) {
        if (currentPostIndex > 0) {
          setSlideDirection('down');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(currentPostIndex - 1);
          setExpandedCaption(false);
        }
      }
    }
  };

  const handleLike = useCallback(async () => {
    if (!user?.id) {
      toast.error('Please log in to like posts');
      return;
    }

    const isLiking = !currentPost.liked;
    
    // ✅ Optimistic UI update
    setPosts(prev => prev.map(post => {
      if (post.id === currentPost.id) {
        return { 
          ...post, 
          liked: isLiking,
          likes: isLiking 
            ? (parseInt(post.likes) + 1).toString()
            : (parseInt(post.likes) - 1).toString()
        };
      }
      return post;
    }));
    
    toast.success(isLiking ? 'Added to liked posts' : 'Removed from liked posts');

    // ✅ Call backend API
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/${currentPost.id}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            username: user.username || user.email?.split('@')[0] || 'user',
            userAvatar: user.avatarUrl || ''
          })
        }
      );

      const data = await response.json();
      
      if (!data.success) {
        // Revert optimistic update if API failed
        setPosts(prev => prev.map(post => {
          if (post.id === currentPost.id) {
            return { 
              ...post, 
              liked: !isLiking,
              likes: !isLiking 
                ? (parseInt(post.likes) + 1).toString()
                : (parseInt(post.likes) - 1).toString()
            };
          }
          return post;
        }));
        toast.error('Failed to update like');
      } else {
        // Update with real likes count from backend
        setPosts(prev => prev.map(post => {
          if (post.id === currentPost.id) {
            return { ...post, likes: data.likes.toString() };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('❌ Like error:', error);
      // Revert optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === currentPost.id) {
          return { 
            ...post, 
            liked: !isLiking,
            likes: !isLiking 
              ? (parseInt(post.likes) + 1).toString()
              : (parseInt(post.likes) - 1).toString()
          };
        }
        return post;
      }));
      toast.error('Failed to update like');
    }
  }, [currentPost, user]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    swipeDirection.current = null;
    
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
    } else if (swipeDirection.current === 'vertical' && Math.abs(deltaY) > 30) {
      if (deltaY < 0) {
        const nextIndex = currentPostIndex + 1;
        if (nextIndex < filteredPosts.length) {
          setSlideDirection('up');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(nextIndex);
          setExpandedCaption(false);
        }
      } else {
        if (currentPostIndex > 0) {
          setSlideDirection('down');
          setTimeout(() => setSlideDirection(null), 250);
          setCurrentPostIndex(currentPostIndex - 1);
          setExpandedCaption(false);
        }
      }
    }

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
    if (!currentPost?.remixVariants) return;
    
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
    'for-you': t('feed.forYou'),
    'following': t('feed.following'),
    'latest': t('feed.new')
  };

  if (!currentPost || filteredPosts.length === 0) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white text-xl mb-2">No posts found</p>
          <p className="text-white/60">Try a different filter or create something!</p>
        </div>
      </div>
    );
  }

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

  // ✅ Calculate display media URL (AFTER early returns when currentPost is guaranteed to exist)
  const displayMediaUrl = currentPost.remixVariants && currentPost.remixVariants.length > 0
    ? currentPost.remixVariants[currentPost.currentVariant]
    : currentPost.mediaUrl;

  // ✅ NEW: Handle download with watermark for non-Creators
  const handleDownload = async () => {
    try {
      const filename = `cortexia-${currentPost.id}.jpg`;
      await downloadImageWithWatermark(
        displayMediaUrl,
        filename,
        currentUserId.userId, // ✅ FIX: userId is already a string (never null)
        projectId,
        publicAnonKey
      );
      toast.success('Downloaded successfully!');
      setShowOptionsSheet(false);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
      setShowOptionsSheet(false);
    }
  };

  const commentsCount = parseInt(currentPost.comments.replace('K', '')) * 1000;

  return (
    <>
      <div className="relative w-full h-screen bg-black">
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
          {/* ✅ NEW: Use RemixCarousel if remix chain is loaded, otherwise show regular image */}
          {currentPost.remixChainData && currentPost.remixChainData.length > 1 ? (
            <RemixCarousel
              currentPost={currentPost}
              remixChain={currentPost.remixChainData.map(p => ({
                id: p.id,
                imageUrl: p.mediaUrl,
                username: p.username
              }))}
              currentIndex={currentPost.remixChainIndex || 0}
              onIndexChange={handleRemixChainIndexChange}
              onTouchStart={handleTouchStart}
              imageObjectFit={imageObjectFit}
            />
          ) : (
            <>
              <ImageWithFallback
                src={displayMediaUrl}
                alt={currentPost.caption}
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
                  pointerEvents: 'none'
                }}
              />
            </>
          )}
        </div>

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
                  src={getAvatarUrl(currentPost.avatarUrl, currentPost.username, currentPost.userId)} // ✅ FIX: Pass correct params
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
              <span className="text-[#6366f1]">@{formatUsername(currentPost.username)}</span>
              {currentPost.verified && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                </svg>
              )}
              {/* ✅ NEW: Creator Badge */}
              {postCreatorStatus[currentPost.id] && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white text-xs font-bold rounded-full">
                  CREATOR
                </span>
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
          
          {/* ✅ NEW: Remix Chain Indicator */}
          {parseInt(currentPost.remixes) > 0 && (
            <button
              onClick={() => {
                console.log('🔗 Opening remix chain for post:', currentPost.id);
                setShowRemixChainViewer(true);
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="mt-2 px-3 py-1.5 rounded-full bg-[#6366f1]/20 backdrop-blur-sm border border-[#6366f1]/40 flex items-center gap-2 hover:bg-[#6366f1]/30 transition-colors"
              aria-label="View remix chain"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#6366f1]">
                <path d="M7 7H17V10L21 6L17 2V5H5V11H7V7Z" fill="currentColor"/>
                <path d="M17 17H7V14L3 18L7 22V19H19V13H17V17Z" fill="currentColor"/>
              </svg>
              <span className="text-[#6366f1] text-sm font-medium">{currentPost.remixes} remix{parseInt(currentPost.remixes) > 1 ? 'es' : ''}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#6366f1]">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-20">
          <button 
            onClick={() => handleProtectedAction('like', handleLike)} 
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
            onClick={() => {
              if (onOpenRemixScreen) {
                onOpenRemixScreen(displayMediaUrl, currentPost.caption, currentPost.id); // ✅ FIX: Pass post.id as parent
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

          <button 
            onClick={() => handleProtectedAction('comment', () => setShowCommentsSheet(true))}
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
            onClick={() => handleProtectedAction('share', handleShare)}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1"
            aria-label="Share"
          >
            <Share2 className="text-white" size={28} strokeWidth={1.5} />
          </button>

          <button 
            onClick={() => handleProtectedAction('follow', () => setShowOptionsSheet(true))}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1"
            aria-label="More options"
          >
            <MoreVertical className="text-white" size={28} strokeWidth={1.5} />
          </button>
          
          {/* ✅ NEW: Image Fit Toggle */}
          <button 
            onClick={() => {
              const newFit = imageObjectFit === 'cover' ? 'contain' : 'cover';
              setImageObjectFit(newFit);
              toast.success(newFit === 'contain' ? 'Showing full image' : 'Filling screen');
            }}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-1"
            aria-label={imageObjectFit === 'cover' ? 'Show full image' : 'Fill screen'}
          >
            {imageObjectFit === 'cover' ? (
              // Icon for "show full image"
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <rect x="7" y="8" width="10" height="8" fill="currentColor" />
              </svg>
            ) : (
              // Icon for "fill screen"
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
              </svg>
            )}
            <span className="text-white text-[10px]" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
              {imageObjectFit === 'cover' ? 'Fit' : 'Fill'}
            </span>
          </button>
        </div>
      </div>

        {showOptionsSheet && (
          <PostOptionsSheet
            username={currentPost.username}
            isFollowing={currentPost.following || false}
            onClose={() => setShowOptionsSheet(false)}
            onDownload={handleDownload}
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

        {showCommentsSheet && currentPost && (
          <CommentsSection
            postId={currentPost.id}
            totalComments={parseInt(currentPost.comments) || 0}
            onClose={() => setShowCommentsSheet(false)}
            onCommentsUpdate={(newCount) => {
              // ✅ Update comments count in the post
              setPosts(prev => prev.map(post => 
                post.id === currentPost.id 
                  ? { ...post, comments: newCount.toString() }
                  : post
              ));
            }}
          />
        )}

        {showFilterMenu && (
          <FeedFilterMenu
            selectedFilter={selectedFilter}
            onSelect={setSelectedFilter}
            onClose={() => setShowFilterMenu(false)}
          />
        )}
      </div>

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
          onOpenRemix={onOpenRemixScreen}
        />
      )}
      
      {showRemixChainViewer && currentPost && (
        <RemixChainViewer
          rootPost={currentPost}
          currentPostId={currentPost.id}
          onClose={() => setShowRemixChainViewer(false)}
          onPostChange={(post, index) => {
            console.log(`📍 Viewing remix ${index + 1} in chain`);
          }}
          onLike={(postId) => {
            setPosts(prev => prev.map(p => 
              p.id === postId ? { ...p, liked: !p.liked } : p
            ));
          }}
          onComment={(postId) => {
            setShowRemixChainViewer(false);
            setShowCommentsSheet(true);
          }}
          onShare={(postId) => {
            const post = posts.find(p => p.id === postId);
            if (post) {
              navigator.clipboard.writeText(`https://cortexia.app/p/${postId}`);
              toast.success('Link copied to clipboard');
            }
          }}
          onRemix={(imageUrl, prompt, parentId) => {
            setShowRemixChainViewer(false);
            if (onOpenRemixScreen) {
              onOpenRemixScreen(imageUrl, prompt, parentId);
            }
          }}
        />
      )}
      
      {showSignupPrompt && (
        <SignupPromptModal
          isOpen={showSignupPrompt}
          action={signupPromptAction}
          onClose={() => setShowSignupPrompt(false)}
          onSignup={() => {
            setShowSignupPrompt(false);
            onNavigate('signup');
          }}
          onLogin={() => {
            setShowSignupPrompt(false);
            onNavigate('login');
          }}
        />
      )}
    </>
  );
}