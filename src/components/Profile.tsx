import { useState, useEffect } from 'react';
import { Menu, Share2, Edit2, Copy } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProfileMenu } from './ProfileMenu';
import type { Screen } from '../App';
import { useAuth } from '../lib/contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

interface UserPost {
  id: string;
  mediaUrl: string;
  likes: number;
  remixes: number;
}

interface UserStats {
  totalLikes: number;
  totalRemixes: number;
  followers: number;
  postsCount: number;
  cameosCount: number;
  likedCount: number;
  draftsCount: number;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'cameos' | 'liked' | 'drafts'>('posts');
  const [showMenu, setShowMenu] = useState(false);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalLikes: 0,
    totalRemixes: 0,
    followers: 0,
    postsCount: 0,
    cameosCount: 0,
    likedCount: 0,
    draftsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null); // ✅ NEW: Full user profile from backend

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;
      
      // ✅ NEW: Load full user profile first
      const profileRes = await fetch(`${apiUrl}/users/${user.id}/profile`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        setUserProfile(profile);
        console.log('✅ Loaded user profile:', profile);
      }
      
      // Load user's posts/creations
      const postsRes = await fetch(`${apiUrl}/feed/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (postsRes.ok) {
        const data = await postsRes.json();
        console.log('✅ Feed user data:', data);
        const creations = data.creations || [];
        
        // ✅ Map feed format (assetUrl) to profile format (mediaUrl)
        const mappedPosts = creations.map((post: any) => ({
          id: post.id,
          mediaUrl: post.assetUrl, // ✅ Feed uses 'assetUrl'
          likes: post.likes,
          remixes: post.remixes
        }));
        
        console.log('✅ Mapped posts:', mappedPosts);
        setUserPosts(mappedPosts);
        
        // Calculate stats from posts
        const totalLikes = creations.reduce((sum: number, post: any) => sum + (post.likes || 0), 0) || 0;
        const totalRemixes = creations.reduce((sum: number, post: any) => sum + (post.remixes || 0), 0) || 0;
        
        setStats(prev => ({
          ...prev,
          postsCount: creations.length || 0,
          totalLikes,
          totalRemixes,
        }));
      } else {
        console.error('❌ Failed to load feed posts:', postsRes.status);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const tabs = [
    { id: 'posts' as const, label: 'Posts', count: stats.postsCount },
    { id: 'cameos' as const, label: 'Cameos', count: stats.cameosCount },
    { id: 'liked' as const, label: 'Liked', count: stats.likedCount },
    { id: 'drafts' as const, label: 'Drafts', count: stats.draftsCount },
  ];

  return (
    <>
      <div className="w-full h-screen bg-black overflow-y-auto pb-20">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-6">
            {userProfile?.referralCode ? (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(userProfile.referralCode);
                  alert(`✅ Referral code copied: ${userProfile.referralCode}`);
                }}
                className="px-4 py-2 bg-[#F5EBE0]/20 hover:bg-[#F5EBE0]/30 border border-[#F5EBE0]/30 rounded-full text-[#F5EBE0] transition-all flex items-center gap-2"
              >
                <span className="text-sm font-mono">
                  {userProfile.referralCode}
                </span>
                <Copy size={14} />
              </button>
            ) : (
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/40 text-sm">
                Loading...
              </div>
            )}
            <button onClick={() => setShowMenu(true)}>
              <Menu className="text-white" size={28} />
            </button>
          </div>

          {/* Avatar and Edit */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <ImageWithFallback
                src={userProfile?.avatar || user?.picture || 'https://images.unsplash.com/photo-1592849902530-cbabb686381d'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center">
                <Edit2 className="text-white" size={16} />
              </button>
            </div>
          </div>

          {/* Username and Bio */}
          <div className="text-center mb-6">
            <h1 className="text-white text-2xl mb-2">@{userProfile?.username || user?.name || user?.email?.split('@')[0] || 'user'}</h1>
            <p className="text-gray-400">
              {userProfile?.bio || 'Creating AI magic ✨ | Digital artist'}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-around mb-6 py-4 border-y border-gray-800">
            <div className="text-center">
              <div className="text-white text-xl">{formatNumber(stats.totalLikes)}</div>
              <div className="text-gray-400 text-sm">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-white text-xl">{formatNumber(stats.totalRemixes)}</div>
              <div className="text-gray-400 text-sm">Remixes</div>
            </div>
            <div className="text-center">
              <div className="text-white text-xl">{formatNumber(userProfile?.followersCount || stats.followers)}</div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-3 bg-[#6366f1] rounded-lg text-white">
              Create cameo
            </button>
            <button className="px-6 py-3 border border-[#6366f1] rounded-lg text-[#6366f1]">
              <Share2 size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 relative transition-colors ${
                  activeTab === tab.id ? 'text-[#6366f1]' : 'text-gray-400'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-1 px-1">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="aspect-[9/16] bg-gray-800/50 animate-pulse" />
            ))
          ) : userPosts.length === 0 ? (
            // Empty state
            <div className="col-span-3 flex flex-col items-center justify-center py-20">
              <p className="text-gray-400 text-center">No posts yet</p>
              <p className="text-gray-600 text-sm text-center mt-2">Create your first AI masterpiece</p>
            </div>
          ) : (
            // Posts grid
            userPosts.filter(post => post?.mediaUrl).map((post) => (
              <button
                key={post.id}
                className="aspect-[9/16] relative overflow-hidden"
              >
                <ImageWithFallback
                  src={post.mediaUrl}
                  alt={`Post ${post.id}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))
          )}
        </div>
      </div>

      {showMenu && (
        <ProfileMenu onClose={() => setShowMenu(false)} onNavigate={onNavigate} />
      )}
    </>
  );
}