import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Send, X, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../lib/contexts/AuthContext';
import { getAvatarUrl, formatUsername } from '../utils/avatarHelpers'; // ✅ NEW: Avatar helpers

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  time?: string;
  createdAt: string;
  avatar: string;
  liked: boolean;
  likes: number;
  replyCount?: number;
  isOwner?: boolean;
}

interface CommentsSheetProps {
  postId: string;
  totalComments: number;
  onClose: () => void;
  onCommentsUpdate?: (newCount: number) => void;
}

export function CommentsSheet({ postId, totalComments, onClose, onCommentsUpdate }: CommentsSheetProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(totalComments);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ Load comments from backend
  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/${postId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        const mappedComments = (data.comments || []).map((c: any) => ({
          id: c.id || c.commentId,
          userId: c.userId,
          username: c.username,
          avatar: getAvatarUrl(c.userAvatar, c.username), // ✅ NEW: Use avatar helper
          text: c.text,
          likes: c.likes || 0,
          liked: c.liked || false,
          createdAt: c.createdAt,
          isOwner: c.userId === user?.id
        }));
        setComments(mappedComments);
        setCommentsCount(mappedComments.length);
        onCommentsUpdate?.(mappedComments.length);
      }
    } catch (error) {
      console.error('❌ Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, user?.id, onCommentsUpdate]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ✅ Auto-focus textarea
  useEffect(() => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  }, []);

  // ✅ Post new comment
  const handlePostComment = async () => {
    if (!newComment.trim() || posting) return;

    if (!user?.id) {
      toast.error('Please login to comment');
      return;
    }

    setPosting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            username: user.username || user.name || user.email?.split('@')[0] || user.id.slice(0, 8),
            userAvatar: user.picture || user.avatar || '',
            text: newComment.trim()
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        const newCommentObj: Comment = {
          id: data.commentId || `temp-${Date.now()}`,
          userId: user.id,
          username: user.username || user.name || user.email?.split('@')[0] || user.id.slice(0, 8),
          avatar: user.picture || user.avatar || `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=6366f1&color=fff`,
          text: newComment.trim(),
          likes: 0,
          liked: false,
          createdAt: new Date().toISOString(),
          isOwner: true
        };

        setComments(prev => [newCommentObj, ...prev]);
        const newCount = commentsCount + 1;
        setCommentsCount(newCount);
        onCommentsUpdate?.(newCount);
        setNewComment('');
        toast.success('Comment posted');

        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        toast.error(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('❌ Post comment error:', error);
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  // ✅ Like comment
  const handleLikeComment = async (commentId: string) => {
    if (!user?.id) {
      toast.error('Please login to like comments');
      return;
    }

    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const newLiked = !c.liked;
        return {
          ...c,
          liked: newLiked,
          likes: newLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
        };
      }
      return c;
    }));

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/${postId}/comments/${commentId}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id
          })
        }
      );

      const data = await response.json();

      if (!data.success) {
        // Revert on failure
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              liked: !c.liked,
              likes: c.liked ? Math.max(0, c.likes - 1) : c.likes + 1
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error('❌ Like comment error:', error);
    }
  };

  // ✅ Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/feed/${postId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.id
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        const newCount = commentsCount - 1;
        setCommentsCount(newCount);
        onCommentsUpdate?.(newCount);
        toast.success('Comment deleted');
      } else {
        toast.error(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('❌ Delete comment error:', error);
      toast.error('Failed to delete comment');
    }
  };

  // ✅ Format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return commentDate.toLocaleDateString();
  };

  const toggleLike = (commentId: string) => {
    handleLikeComment(commentId);
  };

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-[80vh] flex flex-col rounded-t-2xl"
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 26, 0.98)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-semibold">Comments</h2>
            <p className="text-gray-400 text-sm">{commentsCount} comment{commentsCount !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <ImageWithFallback
                  src={comment.avatar}
                  alt={comment.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white">{formatUsername(comment.username)}</span>
                    <span className="text-gray-500 text-sm">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-white mt-1">{comment.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="text-gray-400 text-sm hover:text-white transition-colors">Reply</button>
                    {comment.replyCount && (
                      <button className="text-gray-400 text-sm hover:text-white transition-colors">
                        {comment.replyCount} reply
                      </button>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => toggleLike(comment.id)}
                  className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
                >
                  <Heart 
                    className={comment.liked ? 'text-red-500' : 'text-gray-500'} 
                    size={20}
                    fill={comment.liked ? 'currentColor' : 'none'}
                  />
                </button>
                {comment.isOwner && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex-shrink-0 mt-1 transition-transform hover:scale-110"
                  >
                    <Trash2 
                      className="text-gray-500" 
                      size={20}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reply Input */}
        <div className="p-4 border-t border-gray-800 pb-safe">
          <div className="flex items-center gap-3">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a reply..."
              className="flex-1 bg-[#2A2A2A] text-white rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
              rows={1}
              style={{ resize: 'none' }}
            />
            <button
              onClick={handlePostComment}
              className="px-6 py-3 bg-[#6366f1] text-white rounded-full"
            >
              <Send className="text-white" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}