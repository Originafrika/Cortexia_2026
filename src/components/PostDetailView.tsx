import { useState } from 'react';
import { X, Heart, MessageCircle, Share2, MoreHorizontal, Repeat, Download } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { CommentsSheet } from './CommentsSheet';
import { PostOptionsSheet } from './PostOptionsSheet';

interface PostDetailViewProps {
  postId: string;
  thumbnail: string;
  prompt: string;
  creator: string;
  likes: number;
  remixes: number;
  type: 'image' | 'video';
  isVerified: boolean;
  onClose: () => void;
  onRemix: (prompt: string) => void;
  onViewCreator: (username: string) => void;
}

export function PostDetailView({ 
  postId, 
  thumbnail, 
  prompt, 
  creator, 
  likes, 
  remixes, 
  type,
  isVerified,
  onClose,
  onRemix,
  onViewCreator
}: PostDetailViewProps) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [following, setFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [localCommentsCount] = useState(234);

  const handleLike = () => {
    setLiked(!liked);
    setLocalLikes(liked ? localLikes - 1 : localLikes + 1);
    if (!liked) {
      toast.success('Added to favorites');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt,
          text: `Check out this ${type} created by @${creator}`,
          url: `https://cortexia.app/p/${postId}`,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(`https://cortexia.app/p/${postId}`);
      toast.success('Link copied to clipboard');
    }
  };

  const handleFollow = () => {
    setFollowing(!following);
    setShowOptions(false);
    if (!following) {
      toast.success(`Following @${creator}`);
    } else {
      toast.success(`Unfollowed @${creator}`);
    }
  };

  const handleDownload = () => {
    toast.success('Download started');
    setShowOptions(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://cortexia.app/p/${postId}`);
    toast.success('Link copied to clipboard');
    setShowOptions(false);
  };

  const handleSeeLess = () => {
    toast.success('We\'ll show you less content like this');
    setShowOptions(false);
  };

  const handleReport = () => {
    toast.success('Content reported. Thank you for helping keep Cortexia safe.');
    setShowOptions(false);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pt-safe">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={onClose}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full"
          >
            <X className="text-white" size={24} />
          </button>
          <button 
            onClick={() => setShowOptions(true)}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full"
          >
            <MoreHorizontal className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Media Content */}
      <div className="w-full h-full flex items-center justify-center bg-black">
        <ImageWithFallback
          src={thumbnail}
          alt={prompt}
          className="w-full h-full object-contain"
        />
        {type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
                <path d="M10 8l16 8-16 8V8z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Info & Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/90 to-transparent pb-safe">
        <div className="p-4 space-y-4">
          {/* Creator Info */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onViewCreator(creator)}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-12 h-12 bg-[#1A1A1A] rounded-full overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={`https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1535713875002-d1d0cf377fde' : '1494790108377-be9c29b29330'}?w=100`}
                  alt={creator}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-white truncate">@{creator}</p>
                  {isVerified && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                      <path d="M8 0L9.6 5.6L16 8L9.6 10.4L8 16L6.4 10.4L0 8L6.4 5.6L8 0Z" fill="#6366f1"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>
            <button 
              onClick={handleFollow}
              className={`px-6 py-2 rounded-full text-white text-sm flex-shrink-0 transition-colors ${
                following 
                  ? 'bg-[#1A1A1A] border border-gray-700' 
                  : 'bg-[#6366f1]'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Prompt */}
          <p className="text-white text-sm line-clamp-3">
            {prompt}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                  <Heart 
                    size={24} 
                    className={liked ? 'text-red-500 fill-red-500' : 'text-white'} 
                  />
                </div>
                <span className="text-gray-400 text-xs">{formatCount(localLikes)}</span>
              </button>

              <button 
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <span className="text-gray-400 text-xs">{formatCount(localCommentsCount)}</span>
              </button>

              <button 
                onClick={() => onRemix(prompt)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-[#6366f1] rounded-full flex items-center justify-center">
                  <Repeat size={24} className="text-white" />
                </div>
                <span className="text-gray-400 text-xs">{formatCount(remixes)}</span>
              </button>

              <button 
                onClick={handleShare}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                  <Share2 size={24} className="text-white" />
                </div>
                <span className="text-gray-400 text-xs">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Bottom Sheet */}
      {showComments && (
        <CommentsSheet 
          totalComments={localCommentsCount}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Options Bottom Sheet */}
      {showOptions && (
        <PostOptionsSheet
          username={creator}
          isFollowing={following}
          onClose={() => setShowOptions(false)}
          onDownload={handleDownload}
          onCopyLink={handleCopyLink}
          onFollow={handleFollow}
          onSeeLess={handleSeeLess}
          onReport={handleReport}
        />
      )}
    </div>
  );
}
