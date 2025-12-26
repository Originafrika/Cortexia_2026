/**
 * COCONUT V14 - USER PROFILE ULTRA-PREMIUM
 * Liquid Glass Design with Coconut Theme
 * 
 * Features:
 * - Premium frosted glass profile card
 * - Animated stats display
 * - Gallery grid avec glass
 * - Follow/Message actions premium
 * - BDS 7 Arts compliance
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Share2, 
  MoreHorizontal, 
  MessageCircle,
  CheckCircle,
  Heart,
  Sparkles,
  Image as ImageIcon,
  Video,
  Grid3x3,
  Bookmark,
  Settings,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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
}

interface UserProfileCoconutProps {
  username: string;
  onClose: () => void;
  allPosts?: Post[];
  onOpenPost?: (postId: string) => void;
}

export function UserProfileCoconut({ username, onClose, allPosts = [], onOpenPost }: UserProfileCoconutProps) {
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  // Filter posts by this user
  const userPosts = useMemo(() => {
    return allPosts.filter(post => post.username === username);
  }, [allPosts, username]);

  // Get user data
  const userData = useMemo(() => {
    if (userPosts.length === 0) {
      return {
        avatarUrl: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
        verified: false,
        totalLikes: '0',
        totalRemixes: '0',
        followers: '0',
        bio: 'Creative AI Artist',
      };
    }

    const firstPost = userPosts[0];
    
    const parseCount = (str: string): number => {
      const num = parseFloat(str.replace('K', ''));
      return str.includes('K') ? num * 1000 : num;
    };

    const totalLikes = userPosts.reduce((sum, post) => sum + parseCount(post.likes), 0);
    const totalRemixes = userPosts.reduce((sum, post) => sum + parseCount(post.remixes), 0);

    const formatCount = (num: number): string => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    return {
      avatarUrl: firstPost.avatarUrl,
      verified: firstPost.verified,
      totalLikes: formatCount(totalLikes),
      totalRemixes: formatCount(totalRemixes),
      followers: formatCount(Math.floor(totalLikes * 1.8)),
      bio: 'Premium AI Creative • Coconut V14 User',
      following: firstPost.following,
    };
  }, [userPosts]);

  const handleFollowToggle = () => {
    setFollowing(!following);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `@${username} on Coconut`,
        url: `https://coconut.ai/u/${username}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`https://coconut.ai/u/${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--coconut-shell)]" />
          </motion.button>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-10 h-10 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300"
            >
              <Share2 className="w-5 h-5 text-[var(--coconut-shell)]" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300"
            >
              <MoreHorizontal className="w-5 h-5 text-[var(--coconut-shell)]" />
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-50" />
          <div className="relative bg-white/70 backdrop-blur-[60px] rounded-2xl shadow-xl p-8 border border-white/60">
            
            {/* Avatar & Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-xl" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/60 shadow-xl">
                  <ImageWithFallback
                    src={userData.avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-2xl text-[var(--coconut-shell)]">@{username}</h1>
                  {userData.verified && (
                    <CheckCircle className="w-6 h-6 text-blue-600 fill-blue-600" />
                  )}
                </div>
                
                <p className="text-[var(--coconut-husk)] mb-4">{userData.bio}</p>
                
                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl text-[var(--coconut-shell)]">{userPosts.length}</div>
                    <div className="text-xs text-[var(--coconut-husk)]">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-[var(--coconut-shell)]">{userData.followers}</div>
                    <div className="text-xs text-[var(--coconut-husk)]">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-[var(--coconut-shell)]">{userData.totalLikes}</div>
                    <div className="text-xs text-[var(--coconut-husk)]">Likes</div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollowToggle}
                    className={`flex-1 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      following
                        ? 'bg-white/50 backdrop-blur-xl border border-white/40 text-[var(--coconut-shell)]'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    }`}
                  >
                    {following ? (
                      <>
                        <UserMinus className="w-5 h-5" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Follow
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl border border-white/40 shadow-lg transition-all duration-300 flex items-center gap-2 text-[var(--coconut-shell)]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-50" />
          <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl border border-white/60 p-2">
            <div className="flex items-center gap-2">
              {[
                { id: 'posts' as const, label: 'Posts', icon: Grid3x3 },
                { id: 'saved' as const, label: 'Saved', icon: Bookmark },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex-1"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeProfileTab"
                        className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-lg border border-white/60 shadow-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className={`relative px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                      isActive ? 'text-[var(--coconut-shell)]' : 'text-[var(--coconut-husk)]'
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'posts' ? (
              userPosts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-[60px] rounded-2xl shadow-xl p-12 border border-white/60 text-center">
                    <ImageIcon className="w-16 h-16 text-[var(--coconut-husk)] mx-auto mb-4" />
                    <h3 className="text-xl text-[var(--coconut-shell)] mb-2">No Posts Yet</h3>
                    <p className="text-[var(--coconut-husk)]">@{username} hasn't posted anything yet</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {userPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => onOpenPost?.(post.id)}
                      className="relative group cursor-pointer"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl overflow-hidden border border-white/60">
                        <div className="aspect-square relative">
                          <ImageWithFallback
                            src={post.mediaUrl}
                            alt={post.caption}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center justify-around text-white text-sm">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {post.likes}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {post.comments}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4" />
                                  {post.remixes}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )
            ) : (
              <motion.div
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-3xl blur-xl opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-[60px] rounded-2xl shadow-xl p-12 border border-white/60 text-center">
                  <Bookmark className="w-16 h-16 text-[var(--coconut-husk)] mx-auto mb-4" />
                  <h3 className="text-xl text-[var(--coconut-shell)] mb-2">No Saved Posts</h3>
                  <p className="text-[var(--coconut-husk)]">Saved posts will appear here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default UserProfileCoconut;
