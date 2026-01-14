import { useState, useMemo } from 'react';
import { ArrowLeft, Share2, MoreHorizontal, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { UserOptionsSheet } from './UserOptionsSheet';
import { CreatorFeed } from './CreatorFeed';
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
  remixVariants?: string[];
  currentVariant: number;
}

interface UserProfileProps {
  username: string;
  onClose: () => void;
  allPosts?: Post[];
  onOpenPost?: (postId: string) => void;
  onOpenRemix?: (imageUrl: string, prompt?: string) => void; // ✅ NEW: Remix handler
}

export function UserProfile({ username, onClose, allPosts = [], onOpenPost, onOpenRemix }: UserProfileProps) {
  const [following, setFollowing] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showCreatorFeed, setShowCreatorFeed] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);

  // Filter posts by this user
  const userPosts = useMemo(() => {
    return allPosts.filter(post => post.username === username);
  }, [allPosts, username]);

  // Get user data from their posts
  const userData = useMemo(() => {
    if (userPosts.length === 0) {
      return {
        avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
        verified: false,
        totalLikes: 0,
        totalRemixes: 0,
        followers: '0',
      };
    }

    const firstPost = userPosts[0];
    
    // Calculate total likes and remixes
    const parseCount = (str: string): number => {
      const num = parseFloat(str.replace('K', ''));
      return str.includes('K') ? num * 1000 : num;
    };

    const totalLikes = userPosts.reduce((sum, post) => sum + parseCount(post.likes), 0);
    const totalRemixes = userPosts.reduce((sum, post) => sum + parseCount(post.remixes), 0);

    const formatCount = (num: number): string => {
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    return {
      avatarUrl: firstPost.avatarUrl,
      verified: firstPost.verified,
      totalLikes: formatCount(totalLikes),
      totalRemixes: formatCount(totalRemixes),
      followers: formatCount(Math.floor(totalLikes * 1.8)), // Mock follower count based on likes
      following: firstPost.following,
    };
  }, [userPosts]);

  const handleFollowToggle = () => {
    setFollowing(!following);
    toast.success(following ? `Unfollowed @${username}` : `Following @${username}`);
  };

  const handleMessage = () => {
    toast.success(`Opening chat with @${username}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `@${username} on Cortexia`,
        text: `Check out @${username}'s AI creations`,
        url: `https://cortexia.app/u/${username}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`https://cortexia.app/u/${username}`);
      toast.success('Profile link copied to clipboard');
    }
  };

  const handlePostClick = (postIndex: number) => {
    setSelectedPostIndex(postIndex);
    setShowCreatorFeed(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black">
        <div className="w-full h-screen overflow-y-auto pb-20">
          {/* Header */}
          <div className="sticky top-0 bg-black/95 backdrop-blur-xl z-10 px-4 pt-12 pb-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <button onClick={onClose}>
                <ArrowLeft className="text-white" size={24} />
              </button>
              <h1 className="text-white">@{username}</h1>
              <button onClick={() => setShowOptionsSheet(true)}>
                <MoreHorizontal className="text-white" size={24} />
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-4 pt-6">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <ImageWithFallback
                src={userData.avatarUrl}
                alt={username}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>

            {/* Username */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-white">@{username}</h1>
                {userData.verified && (
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                  </svg>
                )}
              </div>
              <p className="text-gray-400">
                Creating AI magic ✨ | Digital artist
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-around mb-6 py-4 border-y border-gray-800">
              <div className="text-center">
                <div className="text-white">{userPosts.length}</div>
                <div className="text-gray-400 text-sm">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-white">{userData.totalLikes}</div>
                <div className="text-gray-400 text-sm">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-white">{userData.totalRemixes}</div>
                <div className="text-gray-400 text-sm">Remixes</div>
              </div>
              <div className="text-center">
                <div className="text-white">{userData.followers}</div>
                <div className="text-gray-400 text-sm">Followers</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={handleFollowToggle}
                className={`flex-1 py-3 rounded-xl transition-colors ${
                  following || userData.following
                    ? 'border border-[#6366f1] text-[#6366f1]' 
                    : 'bg-[#6366f1] text-white'
                }`}
              >
                {following || userData.following ? 'Following' : 'Follow'}
              </button>
              <button 
                onClick={handleMessage}
                className="px-5 py-3 border border-gray-700 rounded-xl text-white hover:bg-[#1A1A1A] transition-colors"
              >
                <MessageCircle size={20} />
              </button>
              <button 
                onClick={handleShare}
                className="px-5 py-3 border border-gray-700 rounded-xl text-white hover:bg-[#1A1A1A] transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-3 gap-1 pb-4">
              {userPosts.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-400">No posts yet</p>
                </div>
              ) : (
                userPosts.map((post, index) => (
                  <button
                    key={post.id}
                    onClick={() => handlePostClick(index)}
                    className="aspect-[9/16] relative overflow-hidden rounded-lg group"
                  >
                    <ImageWithFallback
                      src={post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Hover overlay with stats */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span className="text-sm">{post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Options Sheet */}
      {showOptionsSheet && (
        <UserOptionsSheet
          username={username}
          onClose={() => setShowOptionsSheet(false)}
        />
      )}

      {/* Creator Feed */}
      {showCreatorFeed && (
        <CreatorFeed
          creatorUsername={username}
          creatorPosts={userPosts}
          initialPostIndex={selectedPostIndex}
          onClose={() => setShowCreatorFeed(false)}
          onOpenRemix={onOpenRemix}
        />
      )}
    </>
  );
}
