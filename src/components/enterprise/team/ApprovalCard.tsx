/**
 * APPROVAL CARD - Team Collaboration
 * 
 * Individual approval request card
 * Features:
 * - Request details (type, description, cost)
 * - Requester information
 * - Preview image (if available)
 * - Approve/Reject actions with confirmation
 * - Priority badge
 * - Timestamp
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState } from 'react';
import { Check, X, AlertTriangle, Eye, Calendar, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ApprovalRequest } from './ApprovalsPanel';

interface ApprovalCardProps {
  approval: ApprovalRequest;
  onApprove: (approvalId: string) => void;
  onReject: (approvalId: string, reason?: string) => void;
  getTypeIcon: (type: ApprovalRequest['type']) => any;
  getTypeColor: (type: ApprovalRequest['type']) => string;
  getPriorityColor: (priority: ApprovalRequest['priority']) => string;
}

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
  getTypeIcon,
  getTypeColor,
  getPriorityColor
}: ApprovalCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const TypeIcon = getTypeIcon(approval.type);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleApprove = () => {
    onApprove(approval.id);
  };

  const handleReject = () => {
    onReject(approval.id, rejectReason || undefined);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isPending = approval.status === 'pending';
  const isApproved = approval.status === 'approved';
  const isRejected = approval.status === 'rejected';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 ${
        isPending ? 'border-amber-200 hover:shadow-md' : 
        isApproved ? 'border-green-200 bg-green-50/30' :
        'border-red-200 bg-red-50/30'
      }`}
    >
      <div className="flex items-start gap-6">
        {/* Preview Image (if available) */}
        {approval.preview && (
          <div className="relative flex-shrink-0">
            <img
              src={approval.preview}
              alt="Preview"
              className="w-32 h-32 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowPreview(true)}
            />
            <button
              onClick={() => setShowPreview(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
            >
              <Eye size={24} className="text-white" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Type Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getTypeColor(approval.type)}`}>
                <TypeIcon size={16} />
                <span className="text-sm font-semibold capitalize">{approval.type}</span>
              </div>

              {/* Priority Badge */}
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getPriorityColor(approval.priority)}`}>
                <span className="capitalize">{approval.priority} Priority</span>
              </div>

              {/* Status Badge */}
              {!isPending && (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isApproved ? '✓ Approved' : '✗ Rejected'}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(approval.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {approval.description}
          </h3>

          {/* Prompt (if available) */}
          {approval.prompt && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              "{approval.prompt}"
            </p>
          )}

          {/* Metadata */}
          {approval.metadata && (
            <div className="flex items-center gap-4 mb-4">
              {approval.metadata.format && (
                <span className="text-xs text-gray-600">
                  Format: <strong>{approval.metadata.format}</strong>
                </span>
              )}
              {approval.metadata.resolution && (
                <span className="text-xs text-gray-600">
                  Resolution: <strong>{approval.metadata.resolution}</strong>
                </span>
              )}
              {approval.metadata.duration && (
                <span className="text-xs text-gray-600">
                  Duration: <strong>{approval.metadata.duration}</strong>
                </span>
              )}
              {approval.metadata.style && (
                <span className="text-xs text-gray-600">
                  Style: <strong>{approval.metadata.style}</strong>
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Requester Info */}
            <div className="flex items-center gap-3">
              {approval.requestedBy.avatar ? (
                <img
                  src={approval.requestedBy.avatar}
                  alt={approval.requestedBy.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {getInitials(approval.requestedBy.name)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {approval.requestedBy.name}
                </p>
                <p className="text-xs text-gray-600">
                  {approval.requestedBy.email}
                </p>
              </div>
            </div>

            {/* Cost & Actions */}
            <div className="flex items-center gap-4">
              {/* Cost Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <DollarSign size={16} className="text-amber-600" />
                <span className="font-bold text-amber-900">{approval.cost}</span>
                <span className="text-xs text-amber-700">credits</span>
              </div>

              {/* Actions (only if pending) */}
              {isPending && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRejectDialog(true)}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-colors border border-red-200"
                  >
                    <X size={18} className="inline mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Check size={18} className="inline mr-1" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <AnimatePresence>
        {showRejectDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-cream-100 overflow-hidden"
          >
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Reject this request?
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    Provide a reason for rejection (optional):
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Budget constraints, needs revision, etc."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 rounded-lg bg-white border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && approval.preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={approval.preview}
              alt="Preview"
              className="max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
