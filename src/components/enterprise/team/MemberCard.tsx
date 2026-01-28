/**
 * MEMBER CARD - Team Collaboration
 * 
 * Individual member card with actions
 * Features:
 * - Member info (avatar, name, email)
 * - Role badge with icon
 * - Status indicator (active/invited/inactive)
 * - Actions dropdown (Change role, Remove)
 * - Last active timestamp
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Shield, Clock, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TeamMember } from './TeamManagementPage';

interface MemberCardProps {
  member: TeamMember;
  onRemove: (memberId: string) => void;
  onUpdateRole: (memberId: string, role: TeamMember['role']) => void;
  getRoleIcon: (role: TeamMember['role']) => JSX.Element;
  getRoleColor: (role: TeamMember['role']) => string;
}

export function MemberCard({ member, onRemove, onUpdateRole, getRoleIcon, getRoleColor }: MemberCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
        setShowRoleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusIcon = () => {
    switch (member.status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'invited':
        return <Mail size={16} className="text-amber-500" />;
      case 'inactive':
        return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (member.status) {
      case 'active':
        return 'Active';
      case 'invited':
        return 'Invitation Sent';
      case 'inactive':
        return 'Inactive';
    }
  };

  const getStatusColor = () => {
    switch (member.status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'invited':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleRoleChange = (newRole: TeamMember['role']) => {
    onUpdateRole(member.id, newRole);
    setShowRoleMenu(false);
    setShowActions(false);
  };

  const handleDelete = () => {
    onRemove(member.id);
    setShowDeleteConfirm(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {getInitials(member.name)}
              </span>
            </div>
          )}
          {/* Status indicator dot */}
          {member.status === 'active' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate mb-1">
            {member.name}
          </h3>
          <p className="text-sm text-gray-600 truncate mb-2">
            {member.email}
          </p>
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${getRoleColor(member.role)}`}>
              {getRoleIcon(member.role)}
              <span className="capitalize">{member.role}</span>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor()}`}>
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>

        {/* Last Active & Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {member.status === 'active' && (
            <div className="text-right">
              <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mb-1">
                <Clock size={12} />
                Last active
              </p>
              <p className="text-sm font-medium text-gray-700">
                {formatDate(member.lastActive)}
              </p>
            </div>
          )}

          {/* Actions Dropdown */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="w-10 h-10 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-cream-100 overflow-hidden z-10"
                >
                  {/* Change Role */}
                  <button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-50 transition-colors text-left"
                  >
                    <Shield size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Change Role</span>
                  </button>

                  {showRoleMenu && (
                    <div className="border-t border-cream-100 bg-cream-50">
                      {(['admin', 'editor', 'viewer', 'client'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          disabled={member.role === role}
                          className={`w-full flex items-center gap-3 px-8 py-2.5 text-left transition-colors ${
                            member.role === role
                              ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                              : 'hover:bg-cream-100 text-gray-700'
                          }`}
                        >
                          {getRoleIcon(role)}
                          <span className="text-sm capitalize">{role}</span>
                          {member.role === role && (
                            <CheckCircle size={14} className="ml-auto text-amber-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Remove Member */}
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-cream-100"
                  >
                    <Trash2 size={16} className="text-red-600" />
                    <span className="text-sm font-medium text-red-600">Remove Member</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-cream-100 overflow-hidden"
          >
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">
                    Remove {member.name}?
                  </h4>
                  <p className="text-sm text-red-700">
                    This member will lose access to the team workspace. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Remove Member
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
