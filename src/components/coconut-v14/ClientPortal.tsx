/**
 * CLIENT PORTAL - Team Collaboration
 * 
 * Simplified view for clients (review & approve only)
 * 
 * Features:
 * - Clean, minimal UI
 * - Review generations
 * - Leave comments
 * - Approve/request changes
 * - Download finals
 * - No backend/settings access
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle,
  MessageSquare,
  Download,
  Clock,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import { useNotify } from './NotificationProvider';
import { CommentsPanel } from './CommentsPanel';
import { ApprovalWorkflowPanel } from './ApprovalWorkflowPanel';
import type { TeamMember } from '../../supabase/functions/server/team-collaboration';

// ============================================
// TYPES
// ============================================

interface ClientPortalProps {
  userId: string;
  userName: string;
  teamId: string;
  teamMembers: TeamMember[];
}

interface Generation {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  commentsCount: number;
  boardId?: string;
}

// ============================================
// COMPONENT
// ============================================

export const ClientPortal: React.FC<ClientPortalProps> = ({
  userId,
  userName,
  teamId,
  teamMembers,
}) => {
  const { playClick, playHover, playSuccess } = useSoundContext();
  const notify = useNotify();
  
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  
  // Load generations
  useEffect(() => {
    loadGenerations();
  }, [teamId]);
  
  const loadGenerations = async () => {
    setIsLoading(true);
    try {
      // TODO: Load generations for this team
      // For now, mock data
      const mockGenerations: Generation[] = [
        {
          id: 'gen_1',
          title: 'Product Hero Banner',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
          createdAt: new Date().toISOString(),
          status: 'pending',
          commentsCount: 2,
        },
        {
          id: 'gen_2',
          title: 'Instagram Post - Summer Collection',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'approved',
          commentsCount: 5,
        },
        {
          id: 'gen_3',
          title: 'Email Header Design',
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'changes_requested',
          commentsCount: 3,
        },
      ];
      
      setGenerations(mockGenerations);
    } catch (error) {
      console.error('Failed to load generations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter generations
  const filteredGenerations = generations.filter(gen => {
    if (filter === 'all') return true;
    if (filter === 'pending') return gen.status === 'pending' || gen.status === 'changes_requested';
    if (filter === 'approved') return gen.status === 'approved';
    return true;
  });
  
  // Get status badge
  const getStatusBadge = (status: Generation['status']) => {
    const badges = {
      pending: {
        icon: Clock,
        bg: 'bg-amber-500/20',
        text: 'text-amber-600',
        label: 'Pending Review',
      },
      approved: {
        icon: CheckCircle,
        bg: 'bg-green-500/20',
        text: 'text-green-600',
        label: 'Approved',
      },
      rejected: {
        icon: AlertCircle,
        bg: 'bg-red-500/20',
        text: 'text-red-600',
        label: 'Rejected',
      },
      changes_requested: {
        icon: AlertCircle,
        bg: 'bg-orange-500/20',
        text: 'text-orange-600',
        label: 'Changes Requested',
      },
    };
    
    return badges[status];
  };
  
  // Download image
  const handleDownload = (generation: Generation) => {
    playClick();
    
    // Create download link
    const link = document.createElement('a');
    link.href = generation.imageUrl;
    link.download = `${generation.title}.png`;
    link.click();
    
    notify.success('Download started', '');
  };
  
  return (
    <div className="h-full flex bg-white">
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream-500 to-amber-500 flex items-center justify-center shadow-lg">
                <Eye size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--coconut-dark)]">
                  Client Portal
                </h1>
                <p className="text-[var(--coconut-husk)]">
                  Review and approve your designs
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-amber-500" />
              <span className="text-sm font-semibold text-[var(--coconut-husk)]">
                Pending Review
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--coconut-dark)]">
              {generations.filter(g => g.status === 'pending' || g.status === 'changes_requested').length}
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={24} className="text-green-500" />
              <span className="text-sm font-semibold text-[var(--coconut-husk)]">
                Approved
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--coconut-dark)]">
              {generations.filter(g => g.status === 'approved').length}
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={24} className="text-[var(--coconut-shell)]" />
              <span className="text-sm font-semibold text-[var(--coconut-husk)]">
                Total Designs
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--coconut-dark)]">
              {generations.length}
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                playClick();
              }}
              onMouseEnter={playHover}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white shadow-lg'
                  : 'bg-white/60 text-[var(--coconut-husk)] hover:bg-white/80 border border-white/40'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Generations Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--coconut-shell)] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredGenerations.length === 0 ? (
          <div className="text-center py-12 bg-white/60 rounded-2xl border border-white/40">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-[var(--coconut-husk)]">
              No designs to review
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGenerations.map((generation) => {
              const badge = getStatusBadge(generation.status);
              
              return (
                <motion.div
                  key={generation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/60 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedGeneration(generation);
                    setShowComments(false);
                    playClick();
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={generation.imageUrl}
                      alt={generation.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <div className="absolute top-3 right-3">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-xs font-semibold backdrop-blur-xl`}>
                        <badge.icon size={12} />
                        {badge.label}
                      </span>
                    </div>
                    
                    {generation.commentsCount > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-[var(--coconut-dark)] text-xs font-semibold">
                          <MessageSquare size={12} />
                          {generation.commentsCount}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-[var(--coconut-dark)] mb-2 group-hover:text-[var(--coconut-shell)] transition-colors">
                      {generation.title}
                    </h3>
                    
                    <p className="text-xs text-[var(--coconut-husk)]">
                      {new Date(generation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Right: Detail Panel */}
      <AnimatePresence>
        {selectedGeneration && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="w-full lg:w-[600px] bg-white/90 backdrop-blur-xl border-l border-white/60 flex flex-col"
          >
            {/* Preview */}
            <div className="p-6 border-b border-white/40">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <img
                  src={selectedGeneration.imageUrl}
                  alt={selectedGeneration.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-xl font-bold text-[var(--coconut-dark)] mb-2">
                {selectedGeneration.title}
              </h2>
              
              <p className="text-sm text-[var(--coconut-husk)]">
                Created {new Date(selectedGeneration.createdAt).toLocaleDateString()}
              </p>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(selectedGeneration);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-white/60 text-[var(--coconut-dark)] font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
                
                <button
                  onClick={() => {
                    setShowComments(!showComments);
                    playClick();
                  }}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    showComments
                      ? 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white'
                      : 'bg-white hover:bg-gray-50 border border-white/60 text-[var(--coconut-dark)]'
                  }`}
                >
                  <MessageSquare size={16} />
                  Comments ({selectedGeneration.commentsCount})
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex-1 overflow-y-auto">
              {showComments ? (
                <CommentsPanel
                  teamId={teamId}
                  targetType="generation"
                  targetId={selectedGeneration.id}
                  userId={userId}
                  userName={userName}
                  teamMembers={teamMembers}
                  isOpen={true}
                  onClose={() => setShowComments(false)}
                />
              ) : (
                <div className="p-6">
                  <ApprovalWorkflowPanel
                    teamId={teamId}
                    generationId={selectedGeneration.id}
                    boardId={selectedGeneration.boardId}
                    userId={userId}
                    userName={userName}
                    teamMembers={teamMembers}
                    canApprove={true}
                    onApprovalStatusChanged={(status) => {
                      setSelectedGeneration(prev => prev ? { ...prev, status } : null);
                      setGenerations(prev => prev.map(g =>
                        g.id === selectedGeneration.id ? { ...g, status } : g
                      ));
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};