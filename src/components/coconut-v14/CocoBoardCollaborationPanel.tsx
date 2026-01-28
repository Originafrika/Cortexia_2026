/**
 * COCOBOARD COLLABORATION PANEL
 * Team collaboration integrated into CocoBoard
 * 
 * Features:
 * - Tab interface (Comments / Approvals)
 * - Comments with @mentions
 * - Approval workflows
 * - Collapsible panel
 * - Enterprise-only feature
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, CheckSquare, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { CommentsPanel } from './CommentsPanel';
import { ApprovalWorkflowPanel } from './ApprovalWorkflowPanel';
import { useSoundContext } from './SoundProvider';

interface CocoBoardCollaborationPanelProps {
  teamId: string;
  teamMembers: Array<{
    userId: string;
    email: string;
    displayName: string;
    role: 'admin' | 'editor' | 'viewer' | 'client';
  }>;
  currentUserId: string;
  currentUserName: string;
  generationId?: string; // Optional - for when viewing a specific generation
  boardId?: string; // Optional - for board-level comments
  isEnterprise: boolean; // Show only for Enterprise users
}

type TabType = 'comments' | 'approvals';

export function CocoBoardCollaborationPanel({
  teamId,
  teamMembers,
  currentUserId,
  currentUserName,
  generationId,
  boardId,
  isEnterprise,
}: CocoBoardCollaborationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('comments');
  const { playClick, playPop } = useSoundContext();
  
  // Don't render if not Enterprise
  if (!isEnterprise) {
    return null;
  }
  
  const handleToggle = () => {
    playClick();
    setIsExpanded(!isExpanded);
  };
  
  const handleTabChange = (tab: TabType) => {
    playPop();
    setActiveTab(tab);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl overflow-hidden"
    >
      {/* Header with toggle */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[var(--coconut-shell)]">Team Collaboration</h3>
            <p className="text-xs text-[var(--coconut-husk)]">
              {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--coconut-husk)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--coconut-husk)]" />
        )}
      </button>
      
      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/30"
          >
            {/* Tabs */}
            <div className="flex gap-2 px-6 pt-4">
              <button
                onClick={() => handleTabChange('comments')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'comments'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-white/40 text-[var(--coconut-husk)] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Comments</span>
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('approvals')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'approvals'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-white/40 text-[var(--coconut-husk)] hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  <span>Approvals</span>
                </div>
              </button>
            </div>
            
            {/* Tab content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'comments' && (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CommentsPanel
                      teamId={teamId}
                      targetType={generationId ? 'generation' : 'board'}
                      targetId={generationId || boardId || 'unknown'}
                      currentUserId={currentUserId}
                      currentUserName={currentUserName}
                      teamMembers={teamMembers}
                    />
                  </motion.div>
                )}
                
                {activeTab === 'approvals' && (
                  <motion.div
                    key="approvals"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ApprovalWorkflowPanel
                      teamId={teamId}
                      generationId={generationId}
                      boardId={boardId}
                      currentUserId={currentUserId}
                      currentUserName={currentUserName}
                      teamMembers={teamMembers}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
