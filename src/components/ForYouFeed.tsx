import { useState, useRef } from 'react';
import { Bell, ChevronDown, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
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

const MOCK_POSTS: Post[] = [
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
];

export function ForYouFeed({ onNavigate }: ForYouFeedProps) {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showRemixScreen, setShowRemixScreen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'for-you' | 'following' | 'latest'>('for-you');
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentPost = posts[currentPostIndex];

  const handleLike = () => {
    setPosts(posts.map((post, idx) => 
      idx === currentPostIndex ? { ...post, liked: !post.liked } : post
    ));
  };

  const handleVariantChange = (direction: 'left' | 'right') => {
    if (!currentPost.remixVariants) return;
    
    setPosts(posts.map((post, idx) => {
      if (idx === currentPostIndex) {
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
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Determine if it's a horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      // Horizontal swipe - change remix variant
      if (deltaX < 0) {
        handleVariantChange('right');
      } else {
        handleVariantChange('left');
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      // Vertical swipe - change post
      if (deltaY < 0) {
        // Swipe up - next post
        setCurrentPostIndex((prev) => (prev + 1) % posts.length);
      } else {
        // Swipe down - previous post
        setCurrentPostIndex((prev) => (prev - 1 + posts.length) % posts.length);
      }
    }
  };

  const handleFollow = () => {
    setPosts(posts.map((post, idx) => 
      idx === currentPostIndex ? { ...post, following: !post.following } : post
    ));
  };

  const filterLabels = {
    'for-you': 'For You',
    'following': 'Following',
    'latest': 'Latest',
  };

  return (
    <>
      <div className="relative w-full h-screen bg-black">
        {/* Status Bar Space */}
        <div className="absolute top-0 left-0 right-0 h-12 z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between px-4 h-full">
            <div className="w-16"></div>
            <button 
              onClick={() => setShowFilterMenu(true)}
              className="flex items-center gap-1 text-white"
            >
              <span>{filterLabels[selectedFilter]}</span>
              <ChevronDown size={20} />
            </button>
            <button onClick={() => onNavigate('activity')} className="w-16 flex justify-end">
              <Bell className="text-white" size={24} />
            </button>
          </div>
        </div>

      {/* Main Content - Video/Image */}
      <div 
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
          style={{ 
            backgroundImage: `url(${currentPost.mediaUrl})`,
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }}
        >
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" 
               style={{ 
                 borderBottomLeftRadius: '16px',
                 borderBottomRightRadius: '16px',
               }}
          />
        </div>

        {/* Remix Pagination Dots */}
        {currentPost.remixVariants && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-1.5 z-10">
            {currentPost.remixVariants.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentPost.currentVariant ? 'bg-[#6366f1]' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom Left - Creator Info */}
        <div className="absolute bottom-20 left-4 right-20 z-20">
          <div className="flex items-center gap-2 mb-2">
            <button className="relative">
              <ImageWithFallback
                src={currentPost.avatarUrl}
                alt={currentPost.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              {!currentPost.following && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow();
                  }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center text-white"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              )}
            </button>
          </div>
          <button 
            onClick={() => setShowUserProfile(true)}
            className="text-left"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[#6366f1] font-semibold">@{currentPost.username}</span>
              {currentPost.verified && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                </svg>
              )}
            </div>
          </button>
          <p className="text-white mt-2" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
            {currentPost.caption}
          </p>
        </div>

        {/* Right Side - Actions */}
        <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-20">
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
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
            className="flex flex-col items-center gap-1"
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
            className="flex flex-col items-center gap-1"
          >
            <MessageCircle className="text-white" size={32} strokeWidth={1.5} />
            <span className="text-white text-xs" style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.5)' }}>
              {currentPost.comments}
            </span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <Share2 className="text-white" size={28} strokeWidth={1.5} />
          </button>

          <button 
            onClick={() => setShowOptionsSheet(true)}
            className="flex flex-col items-center gap-1"
          >
            <MoreVertical className="text-white" size={28} strokeWidth={1.5} />
          </button>
        </div>
      </div>

        {/* Options Sheet */}
        {showOptionsSheet && (
          <PostOptionsSheet
            username={currentPost.username}
            isFollowing={false}
            onClose={() => setShowOptionsSheet(false)}
            onDownload={() => {
              console.log('Download');
              setShowOptionsSheet(false);
            }}
            onCopyLink={() => {
              console.log('Copy link');
              setShowOptionsSheet(false);
            }}
            onFollow={() => {
              console.log('Follow');
              setShowOptionsSheet(false);
            }}
            onSeeLess={() => {
              console.log('See less');
              setShowOptionsSheet(false);
            }}
            onReport={() => {
              console.log('Report');
              setShowOptionsSheet(false);
            }}
          />
        )}

        {/* Comments Sheet */}
        {showCommentsSheet && (
          <CommentsSheet
            totalComments={45}
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
          mediaUrl={currentPost.mediaUrl}
          onClose={() => setShowRemixScreen(false)}
          onGenerate={(changes) => {
            console.log('Generate remix with changes:', changes);
            setShowRemixScreen(false);
          }}
        />
      )}

      {/* User Profile */}
      {showUserProfile && (
        <UserProfile
          username={currentPost.username}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </>
  );
}

const Plus = ({ size, strokeWidth }: { size: number; strokeWidth: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
