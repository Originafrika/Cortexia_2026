/**
 * COMMENTS SECTION - Team Collaboration
 * 
 * Real-time comments with @mentions
 * Features:
 * - Display comments thread
 * - Add new comments
 * - @mention autocomplete
 * - Delete own comments (or all if admin)
 * - Real-time updates (polling)
 * - Notifications when @mentioned
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, AtSign, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  mentions: string[]; // Array of mentioned user IDs
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface CommentsSectionProps {
  teamId: string;
  contextId?: string; // e.g., CocoBoard ID, generation ID
  contextType?: 'cocoboard' | 'generation' | 'campaign';
}

export function CommentsSection({ teamId, contextId, contextType = 'cocoboard' }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Load comments on mount and set up polling
  useEffect(() => {
    loadComments();
    loadTeamMembers();

    // Poll for new comments every 5 seconds
    const interval = setInterval(() => {
      loadComments();
    }, 5000);

    return () => clearInterval(interval);
  }, [teamId, contextId]);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const loadComments = async () => {
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/comments?contextId=${contextId || 'general'}&contextType=${contextType}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      } else if (res.status !== 404) {
        console.error('[CommentsSection] Failed to load comments:', await res.text());
      }
    } catch (error) {
      console.error('[CommentsSection] Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/members`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (error) {
      console.error('[CommentsSection] Error loading team members:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    setNewComment(value);

    // Detect @mention
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      
      // Check if there's a space after @ (which would end the mention)
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt.toLowerCase());
        setMentionCursorPosition(lastAtIndex);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleMentionSelect = (member: TeamMember) => {
    const beforeMention = newComment.slice(0, mentionCursorPosition);
    const afterMention = newComment.slice(textareaRef.current?.selectionStart || newComment.length);
    
    const newText = `${beforeMention}@${member.name} ${afterMention}`;
    setNewComment(newText);
    setShowMentionSuggestions(false);
    
    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)?)/g;
    const matches = text.matchAll(mentionRegex);
    const mentionedNames = Array.from(matches).map(m => m[1].toLowerCase());
    
    // Map names to user IDs
    const mentionedIds = teamMembers
      .filter(member => mentionedNames.some(name => member.name.toLowerCase().includes(name)))
      .map(member => member.id);
    
    return mentionedIds;
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);

      const mentions = extractMentions(newComment);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newComment.trim(),
          mentions,
          contextId: contextId || 'general',
          contextType
        })
      });

      if (res.ok) {
        setNewComment('');
        loadComments(); // Reload to show new comment
        
        if (mentions.length > 0) {
          toast.success('Comment posted', {
            description: `${mentions.length} member${mentions.length > 1 ? 's' : ''} mentioned`
          });
        }
      } else {
        const error = await res.text();
        console.error('[CommentsSection] Failed to post comment:', error);
        toast.error('Failed to post comment');
      }
    } catch (error) {
      console.error('[CommentsSection] Error posting comment:', error);
      toast.error('Error posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        toast.success('Comment deleted');
        loadComments();
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('[CommentsSection] Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const highlightMentions = (text: string) => {
    return text.split(/(@\w+(?:\s+\w+)?)/).map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(mentionQuery) ||
    member.email.toLowerCase().includes(mentionQuery)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-cream-100 bg-cream-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          💬 Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-3"
              >
                {/* Avatar */}
                {comment.authorAvatar ? (
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {getInitials(comment.authorName)}
                    </span>
                  </div>
                )}

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {/* Delete button (only for own comments or admin) */}
                    {comment.authorId === user?.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                        title="Delete comment"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 break-words">
                    {highlightMentions(comment.text)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Input Section */}
      <div className="px-6 py-4 border-t border-cream-100 bg-cream-50">
        <div className="relative">
          {/* Mention Suggestions */}
          <AnimatePresence>
            {showMentionSuggestions && filteredMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-cream-200 overflow-hidden max-h-48 overflow-y-auto z-10"
              >
                {filteredMembers.slice(0, 5).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleMentionSelect(member)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-cream-50 transition-colors text-left"
                  >
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-600 truncate">{member.email}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a comment... Use @ to mention team members"
              rows={2}
              className="flex-1 px-4 py-3 bg-white border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400 resize-none"
              disabled={isSubmitting}
            />
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <AtSign size={12} />
            Type @ to mention team members • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
