/**
 * APPROVAL WORKFLOW PANEL - Team Collaboration
 * 
 * Approval workflow for generations
 * 
 * Features:
 * - Submit for approval
 * - Select approvers
 * - Status badges (Pending/Approved/Rejected)
 * - Approve/Reject/Request Changes
 * - Approval history
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  User,
  MessageSquare,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import { useNotify } from './NotificationProvider';
import type { ApprovalRequest, TeamMember } from '../../supabase/functions/server/team-collaboration';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

// ============================================
// TYPES
// ============================================

interface ApprovalWorkflowPanelProps {
  teamId: string;
  generationId: string;
  boardId?: string;
  userId: string;
  userName: string;
  teamMembers: TeamMember[];
  canApprove?: boolean;
  onApprovalStatusChanged?: (status: ApprovalRequest['status']) => void;
}

// ============================================
// COMPONENT
// ============================================

export const ApprovalWorkflowPanel: React.FC<ApprovalWorkflowPanelProps> = ({
  teamId,
  generationId,
  boardId,
  userId,
  userName,
  teamMembers,
  canApprove = false,
  onApprovalStatusChanged,
}) => {
  const { playClick, playHover, playSuccess, playError } = useSoundContext();
  const notify = useNotify();
  
  const [currentApproval, setCurrentApproval] = useState<ApprovalRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [approvalComment, setApprovalComment] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load current approval status
  useEffect(() => {
    loadApprovalStatus();
    
    // Poll every 10s for updates
    const interval = setInterval(loadApprovalStatus, 10000);
    return () => clearInterval(interval);
  }, [generationId]);
  
  const loadApprovalStatus = async () => {
    try {
      // TODO: Get approval by generation ID
      // For now, mock no approval
      setCurrentApproval(null);
    } catch (error) {
      console.error('Failed to load approval:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Submit for approval
  const handleSubmitForApproval = async () => {
    if (selectedApprovers.length === 0) {
      notify.error('No approvers selected', 'Please select at least one approver');
      return;
    }
    
    setIsSubmitting(true);
    playClick();
    
    try {
      const response = await fetch(
        `${API_BASE}/team/teams/${teamId}/approvals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            generationId,
            boardId,
            requestedBy: userId,
            approvers: selectedApprovers,
          }),
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        const approval = result.data.approval;
        
        setCurrentApproval(approval);
        setShowSubmitModal(false);
        setSelectedApprovers([]);
        
        playSuccess();
        notify.success('Submitted for approval', 'Your team will be notified');
        
        onApprovalStatusChanged?.(approval.status);
      } else {
        throw new Error('Failed to submit for approval');
      }
    } catch (error) {
      console.error('Failed to submit for approval:', error);
      playError();
      notify.error('Failed to submit', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update approval status
  const handleUpdateStatus = async (
    status: 'approved' | 'rejected' | 'changes_requested',
    comment?: string
  ) => {
    if (!currentApproval) return;
    
    setIsSubmitting(true);
    playClick();
    
    try {
      const response = await fetch(
        `${API_BASE}/team/teams/${teamId}/approvals/${currentApproval.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            status,
            decidedBy: userId,
            comment,
          }),
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        const approval = result.data.approval;
        
        setCurrentApproval(approval);
        setApprovalComment('');
        
        playSuccess();
        
        const messages = {
          approved: 'Generation approved!',
          rejected: 'Generation rejected',
          changes_requested: 'Changes requested',
        };
        
        notify.success(messages[status], '');
        
        onApprovalStatusChanged?.(approval.status);
      } else {
        throw new Error('Failed to update approval');
      }
    } catch (error) {
      console.error('Failed to update approval:', error);
      playError();
      notify.error('Failed to update', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get approvers who can approve
  const approverCandidates = teamMembers.filter(m => 
    m.permissions.canApprove && m.userId !== userId
  );
  
  // Get status badge
  const getStatusBadge = (status: ApprovalRequest['status']) => {
    const badges = {
      pending: {
        icon: Clock,
        bg: 'bg-amber-500/20',
        text: 'text-amber-600',
        label: 'Pending Approval',
      },
      approved: {
        icon: CheckCircle,
        bg: 'bg-green-500/20',
        text: 'text-green-600',
        label: 'Approved',
      },
      rejected: {
        icon: XCircle,
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
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--coconut-shell)] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      
      {/* Current Status */}
      {currentApproval ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--coconut-dark)]">Approval Status</h3>
            
            {(() => {
              const badge = getStatusBadge(currentApproval.status);
              return (
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-sm font-semibold`}>
                  <badge.icon size={16} />
                  {badge.label}
                </span>
              );
            })()}
          </div>
          
          {/* Approvers */}
          <div className="mb-4">
            <p className="text-sm text-[var(--coconut-husk)] mb-2">Approvers:</p>
            <div className="flex flex-wrap gap-2">
              {currentApproval.approvers.map((approverId) => {
                const approver = teamMembers.find(m => m.userId === approverId);
                return (
                  <div
                    key={approverId}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/60 border border-white/40"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center text-white text-xs font-bold">
                      {approver?.displayName.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-sm text-[var(--coconut-dark)]">
                      {approver?.displayName || 'Unknown'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Decision */}
          {currentApproval.decision && (
            <div className="p-4 rounded-xl bg-[var(--coconut-cream)] border border-white/40">
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-[var(--coconut-husk)]" />
                <span className="text-sm font-semibold text-[var(--coconut-dark)]">
                  {teamMembers.find(m => m.userId === currentApproval.decision?.by)?.displayName || 'Unknown'}
                </span>
                <span className="text-xs text-[var(--coconut-husk)]">
                  {new Date(currentApproval.decision.at).toLocaleString()}
                </span>
              </div>
              
              {currentApproval.decision.comment && (
                <p className="text-sm text-[var(--coconut-dark)] mt-2">
                  {currentApproval.decision.comment}
                </p>
              )}
            </div>
          )}
          
          {/* Actions for approvers */}
          {canApprove && currentApproval.status === 'pending' && currentApproval.approvers.includes(userId) && (
            <div className="mt-4 space-y-3">
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Add a comment (optional)"
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--coconut-shell)]/30 resize-none text-sm"
                rows={3}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('approved', approvalComment)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Approve
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('changes_requested', approvalComment)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/30 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <AlertCircle size={20} />
                  Request Changes
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('rejected', approvalComment)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-500/30 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // No approval yet - show submit button
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
          <p className="text-[var(--coconut-husk)] text-sm mb-4">
            This generation hasn't been submitted for approval yet.
          </p>
          
          <button
            onClick={() => setShowSubmitModal(true)}
            onMouseEnter={playHover}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Submit for Approval
          </button>
        </div>
      )}
      
      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-[var(--coconut-dark)] mb-2">
                Submit for Approval
              </h2>
              <p className="text-[var(--coconut-husk)] mb-6">
                Select team members who can approve this generation
              </p>
              
              {approverCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No team members with approval permissions</p>
                </div>
              ) : (
                <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                  {approverCandidates.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-4 rounded-xl bg-[var(--coconut-cream)] hover:bg-[var(--coconut-milk)] border border-white/40 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedApprovers.includes(member.userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApprovers(prev => [...prev, member.userId]);
                          } else {
                            setSelectedApprovers(prev => prev.filter(id => id !== member.userId));
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-[var(--coconut-shell)] focus:ring-[var(--coconut-shell)]"
                      />
                      
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center text-white font-bold">
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--coconut-dark)]">
                          {member.displayName}
                        </div>
                        <div className="text-xs text-[var(--coconut-husk)]">
                          {member.email} • {member.role}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSubmitForApproval}
                  disabled={selectedApprovers.length === 0 || isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : `Submit to ${selectedApprovers.length} approver${selectedApprovers.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
