/**
 * COMMENTS PANEL - Team Collaboration
 * 
 * Real-time comments thread with @mentions
 * 
 * Features:
 * - Threaded comments
 * - @mentions with autocomplete
 * - Attach images/files
 * - Resolve/unresolve
 * - Notification badges
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCircle,
  Circle,
  X,
  AtSign,
  Image as ImageIcon,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import type { TeamComment, TeamMember } from '../../supabase/functions/server/team-collaboration';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

// ============================================
// TYPES
// ============================================

interface CommentsPanelProps {
  teamId: string;
  targetType: 'generation' | 'board' | 'project';
  targetId: string;
  userId: string;
  userName: string;
  teamMembers?: TeamMember[];
  isOpen?: boolean;
  onClose?: () => void;
  onCommentAdded?: (comment: TeamComment) => void;
}

// ============================================
// COMPONENT
// ============================================

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  teamId,
  targetType,
  targetId,
  userId,
  userName,
  teamMembers = [],
  isOpen = true,
  onClose,
  onCommentAdded,
}) => {
  const { playClick, playHover, playSuccess } = useSoundContext();
  
  const [comments, setComments] = useState<TeamComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);
  
  // Load comments
  useEffect(() => {
    if (isOpen) {
      loadComments();
      
      // Poll for new comments every 5s
      const interval = setInterval(loadComments, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, teamId, targetType, targetId]);
  
  const loadComments = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/team/teams/${teamId}/comments/${targetType}/${targetId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setComments(result.data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };
  
  // Handle @mentions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewComment(text);
    
    // Check for @ symbol
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && lastAtIndex === cursorPos - 1) {
      // Just typed @
      setShowMentions(true);
      setMentionQuery('');
      setSelectedMentionIndex(0);
      
      // Calculate mention dropdown position
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setMentionPosition({
          top: rect.top - 200,
          left: rect.left,
        });
      }
    } else if (lastAtIndex !== -1 && showMentions) {
      // Typing after @
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query.toLowerCase());
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };
  
  // Filter members for mentions
  const filteredMembers = teamMembers.filter(member =>
    member.displayName.toLowerCase().includes(mentionQuery) ||
    member.email.toLowerCase().includes(mentionQuery)
  );
  
  // Handle mention selection
  const insertMention = (member: TeamMember) => {
    if (!textareaRef.current) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = newComment.slice(0, cursorPos);
    const textAfterCursor = newComment.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      textBeforeCursor.slice(0, lastAtIndex) +
      `@${member.displayName} ` +
      textAfterCursor;
    
    setNewComment(newText);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = lastAtIndex + member.displayName.length + 2;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };
  
  // Handle keyboard navigation in mentions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        Math.min(prev + 1, filteredMembers.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMentionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredMembers.length > 0) {
      e.preventDefault();
      insertMention(filteredMembers[selectedMentionIndex]);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };
  
  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    playClick();
    
    try {
      // Extract mentioned user IDs
      const mentions: string[] = [];
      const mentionRegex = /@(\w+)/g;
      let match;
      
      while ((match = mentionRegex.exec(newComment)) !== null) {
        const mentionedName = match[1];
        const member = teamMembers.find(m => 
          m.displayName === mentionedName
        );
        if (member) {
          mentions.push(member.userId);
        }
      }
      
      const response = await fetch(
        `${API_BASE}/team/teams/${teamId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            targetType,
            targetId,
            userId,
            userName,
            content: newComment,
            mentions,
          }),
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        const comment = result.data.comment;
        
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        playSuccess();
        
        onCommentAdded?.(comment);
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Resolve comment
  const handleResolve = async (commentId: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/team/teams/${teamId}/comments/${commentId}/resolve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, isResolved: true } : c
        ));
        playSuccess();
      }
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-l border-white/60"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/40">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-[var(--coconut-shell)]" />
          <h3 className="font-bold text-[var(--coconut-dark)]">Comments</h3>
          {comments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--coconut-shell)]/20 text-[var(--coconut-shell)] text-xs font-semibold">
              {comments.length}
            </span>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/60 transition-colors"
          >
            <X size={18} className="text-[var(--coconut-husk)]" />
          </button>
        )}
      </div>
      
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-[var(--coconut-husk)] text-sm">
              No comments yet. Start the conversation!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={userId}
              onResolve={() => handleResolve(comment.id)}
            />
          ))
        )}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/40 relative">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (Use @ to mention)"
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--coconut-shell)]/30 resize-none"
            rows={3}
            disabled={isSubmitting}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/60 transition-colors"
              title="Attach file"
            >
              <Paperclip size={16} className="text-[var(--coconut-husk)]" />
            </button>
            
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="p-2 rounded-lg bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        
        {/* @Mentions Dropdown */}
        <AnimatePresence>
          {showMentions && filteredMembers.length > 0 && (
            <motion.div
              ref={mentionsRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-2xl border border-white/60 overflow-hidden z-50"
            >
              <div className="p-2 bg-[var(--coconut-cream)] border-b border-white/40">
                <p className="text-xs text-[var(--coconut-husk)] flex items-center gap-1">
                  <AtSign size={12} />
                  Mention team member
                </p>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {filteredMembers.map((member, index) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => insertMention(member)}
                    onMouseEnter={() => setSelectedMentionIndex(index)}
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-[var(--coconut-cream)] transition-colors ${
                      index === selectedMentionIndex ? 'bg-[var(--coconut-cream)]' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center text-white text-sm font-bold">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-[var(--coconut-dark)]">
                        {member.displayName}
                      </div>
                      <div className="text-xs text-[var(--coconut-husk)]">
                        {member.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

// ============================================
// COMMENT CARD
// ============================================

interface CommentCardProps {
  comment: TeamComment;
  currentUserId: string;
  onResolve: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentUserId,
  onResolve,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const isOwner = comment.userId === currentUserId;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl bg-white/60 border transition-all ${
        comment.isResolved 
          ? 'border-green-200 bg-green-50/20' 
          : 'border-white/40'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center text-white text-sm font-bold">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <div className="font-semibold text-[var(--coconut-dark)] text-sm">
              {comment.userName}
            </div>
            <div className="text-xs text-[var(--coconut-husk)]">
              {new Date(comment.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {comment.isResolved && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold">
              <CheckCircle size={12} />
              Resolved
            </span>
          )}
          
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-white/60 transition-colors"
          >
            <MoreVertical size={16} className="text-[var(--coconut-husk)]" />
          </button>
        </div>
      </div>
      
      <p className="text-[var(--coconut-dark)] text-sm leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>
      
      {!comment.isResolved && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onResolve}
            className="px-3 py-1 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 text-[var(--coconut-shell)] text-xs font-medium transition-all flex items-center gap-1"
          >
            <CheckCircle size={12} />
            Mark as resolved
          </button>
        </div>
      )}
    </motion.div>
  );
};
