/**
 * APPROVALS PANEL - Team Collaboration
 * 
 * Panel for managing approval requests
 * Features:
 * - List of pending approval requests
 * - Preview of generation details
 * - Approve/Reject actions
 * - Credit cost display
 * - Requester information
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Image as ImageIcon, Video, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { ApprovalCard } from './ApprovalCard';

export interface ApprovalRequest {
  id: string;
  type: 'image' | 'video' | 'campaign';
  requestedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  description: string;
  prompt?: string;
  cost: number;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  preview?: string;
  metadata?: {
    format?: string;
    resolution?: string;
    duration?: string;
    style?: string;
  };
}

interface ApprovalsPanelProps {
  teamId: string;
  onApprovalUpdate?: () => void;
}

export function ApprovalsPanel({ teamId, onApprovalUpdate }: ApprovalsPanelProps) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadApprovals();
  }, [teamId]);

  const loadApprovals = async () => {
    try {
      setIsLoading(true);
      console.log('[ApprovalsPanel] Loading approvals for team:', teamId);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/approvals`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[ApprovalsPanel] Approvals loaded:', data);
        setApprovals(data.approvals || []);
      } else {
        console.error('[ApprovalsPanel] Failed to load approvals:', await res.text());
        // Don't show error toast if just empty
        if (res.status !== 404) {
          toast.error('Failed to load approvals');
        }
      }
    } catch (error) {
      console.error('[ApprovalsPanel] Error loading approvals:', error);
      toast.error('Error loading approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      console.log('[ApprovalsPanel] Approving request:', approvalId);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/approvals/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalId })
      });

      if (res.ok) {
        toast.success('Request approved!', {
          description: 'Generation will start shortly'
        });
        loadApprovals(); // Reload to update status
        onApprovalUpdate?.();
      } else {
        const error = await res.text();
        console.error('[ApprovalsPanel] Failed to approve:', error);
        toast.error('Failed to approve request');
      }
    } catch (error) {
      console.error('[ApprovalsPanel] Error approving:', error);
      toast.error('Error approving request');
    }
  };

  const handleReject = async (approvalId: string, reason?: string) => {
    try {
      console.log('[ApprovalsPanel] Rejecting request:', approvalId);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/approvals/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalId, reason })
      });

      if (res.ok) {
        toast.success('Request rejected');
        loadApprovals(); // Reload to update status
        onApprovalUpdate?.();
      } else {
        const error = await res.text();
        console.error('[ApprovalsPanel] Failed to reject:', error);
        toast.error('Failed to reject request');
      }
    } catch (error) {
      console.error('[ApprovalsPanel] Error rejecting:', error);
      toast.error('Error rejecting request');
    }
  };

  const getTypeIcon = (type: ApprovalRequest['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'campaign': return Briefcase;
    }
  };

  const getTypeColor = (type: ApprovalRequest['type']) => {
    switch (type) {
      case 'image': return 'text-blue-600 bg-blue-50';
      case 'video': return 'text-purple-600 bg-purple-50';
      case 'campaign': return 'text-amber-600 bg-amber-50';
    }
  };

  const getPriorityColor = (priority: ApprovalRequest['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    if (filter === 'all') return true;
    return approval.status === filter;
  });

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-cream-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-cream-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-cream-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-cream-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvals.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-cream-100">
        {[
          { id: 'pending', label: 'Pending', count: pendingCount },
          { id: 'approved', label: 'Approved', count: approvedCount },
          { id: 'rejected', label: 'Rejected', count: rejectedCount },
          { id: 'all', label: 'All', count: approvals.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              filter === tab.id
                ? 'text-amber-600 border-amber-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <AnimatePresence mode="wait">
        {filteredApprovals.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-12 text-center border border-cream-100"
          >
            <div className="w-16 h-16 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {filter === 'pending' ? (
                <Clock size={32} className="text-gray-400" />
              ) : filter === 'approved' ? (
                <CheckCircle size={32} className="text-gray-400" />
              ) : filter === 'rejected' ? (
                <AlertCircle size={32} className="text-gray-400" />
              ) : (
                <Briefcase size={32} className="text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'pending' && 'No pending approvals'}
              {filter === 'approved' && 'No approved requests'}
              {filter === 'rejected' && 'No rejected requests'}
              {filter === 'all' && 'No approval requests yet'}
            </h3>
            <p className="text-gray-600 text-sm">
              {filter === 'pending' && 'Approval requests from team members will appear here'}
              {filter === 'approved' && 'Approved requests will appear here'}
              {filter === 'rejected' && 'Rejected requests will appear here'}
              {filter === 'all' && 'Team members can request approvals for generations'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredApprovals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={handleApprove}
                onReject={handleReject}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
