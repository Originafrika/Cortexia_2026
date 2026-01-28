/**
 * INVITE MEMBER MODAL - Team Collaboration
 * 
 * Modal for inviting new team members
 * Features:
 * - Email input validation
 * - Role selection (Admin, Editor, Viewer, Client)
 * - Optional personal message
 * - Preview of permissions for each role
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState } from 'react';
import { X, Mail, Shield, AlertCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (email: string, role: 'admin' | 'editor' | 'viewer' | 'client', message?: string) => Promise<void>;
}

const roleDescriptions = {
  admin: {
    label: 'Admin',
    description: 'Full access to all features and settings',
    permissions: [
      'Create and manage generations',
      'Invite and remove members',
      'Approve/reject requests',
      'Manage team settings',
      'View all analytics'
    ],
    color: 'amber'
  },
  editor: {
    label: 'Editor',
    description: 'Can create and edit, requires approval for publish',
    permissions: [
      'Create generations',
      'Edit CocoBoards',
      'Comment and collaborate',
      'Request approvals',
      'View team activity'
    ],
    color: 'blue'
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to view and comment',
    permissions: [
      'View generations',
      'Comment on CocoBoards',
      'View team activity',
      'Download approved assets'
    ],
    color: 'gray'
  },
  client: {
    label: 'Client',
    description: 'Limited access for external clients',
    permissions: [
      'View shared CocoBoards',
      'Provide feedback',
      'Approve final assets',
      'Download approved files'
    ],
    color: 'purple'
  }
};

export function InviteMemberModal({ onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer' | 'client'>('editor');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onInvite(email.trim(), role, message.trim() || undefined);
      // Success handled by parent component
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedRoleInfo = roleDescriptions[role];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-cream-100 px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invite Team Member</h2>
            <p className="text-sm text-gray-600 mt-1">
              Send an invitation to join your team
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="colleague@company.com"
                className="w-full pl-12 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Role & Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(roleDescriptions) as Array<keyof typeof roleDescriptions>).map((roleKey) => {
                const roleInfo = roleDescriptions[roleKey];
                const isSelected = role === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => setRole(roleKey)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `border-${roleInfo.color}-500 bg-${roleInfo.color}-50`
                        : 'border-cream-200 bg-white hover:border-cream-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={16} className={`text-${roleInfo.color}-600`} />
                      <span className="font-semibold text-gray-900">{roleInfo.label}</span>
                      {isSelected && (
                        <div className={`ml-auto w-5 h-5 rounded-full bg-${roleInfo.color}-500 flex items-center justify-center`}>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{roleInfo.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Role Permissions */}
          <div className="bg-gradient-to-br from-cream-50 to-amber-50 rounded-xl p-6 border border-cream-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {selectedRoleInfo.label} Permissions
            </h3>
            <ul className="space-y-2">
              {selectedRoleInfo.permissions.map((permission, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${selectedRoleInfo.color}-500 mt-1.5 flex-shrink-0`} />
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Message (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to the invitation..."
              rows={3}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              This message will be included in the invitation email
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-8 py-6 flex items-center justify-end gap-3 border-t border-cream-100 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-cream-100 hover:bg-cream-200 text-gray-700 font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !email.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Invitation</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
