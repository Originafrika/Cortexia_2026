/**
 * TEAM INVITE MODAL - Team Collaboration
 * 
 * Modal to invite team members
 * 
 * Features:
 * - Invite by email
 * - Set role (Admin/Editor/Viewer/Client)
 * - Copy invite link
 * - Bulk invite (CSV upload)
 * - BDS 7 Arts compliance
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  UserPlus,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Shield,
  Edit3,
  Eye,
  Crown,
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import { useNotify } from './NotificationProvider';
import type { TeamRole } from '../../supabase/functions/server/team-collaboration';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

// ============================================
// TYPES
// ============================================

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  invitedBy: string;
  onMemberInvited?: () => void;
}

// ============================================
// ROLE CONFIGS
// ============================================

const ROLE_CONFIGS: Record<TeamRole, {
  icon: React.ElementType;
  color: string;
  label: string;
  description: string;
  permissions: string[];
}> = {
  admin: {
    icon: Crown,
    color: 'from-red-500 to-rose-500',
    label: 'Admin',
    description: 'Full access to everything',
    permissions: [
      'Generate & edit',
      'Comment & approve',
      'Invite & manage members',
      'Delete content',
    ],
  },
  editor: {
    icon: Edit3,
    color: 'from-blue-500 to-cyan-500',
    label: 'Editor',
    description: 'Can create and edit content',
    permissions: [
      'Generate & edit',
      'Comment on content',
      'View all projects',
    ],
  },
  viewer: {
    icon: Eye,
    color: 'from-gray-500 to-slate-500',
    label: 'Viewer',
    description: 'View-only with comments',
    permissions: [
      'View all content',
      'Comment on content',
      'No editing',
    ],
  },
  client: {
    icon: Shield,
    color: 'from-purple-500 to-pink-500',
    label: 'Client',
    description: 'Review and approve only',
    permissions: [
      'View assigned content',
      'Comment & approve',
      'Download finals',
    ],
  },
};

// ============================================
// COMPONENT
// ============================================

export const TeamInviteModal: React.FC<TeamInviteModalProps> = ({
  isOpen,
  onClose,
  teamId,
  invitedBy,
  onMemberInvited,
}) => {
  const { playClick, playHover, playSuccess, playError } = useSoundContext();
  const notify = useNotify();
  
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  // Generate invite link
  const generateInviteLink = () => {
    const link = `${window.location.origin}/join-team/${teamId}?role=${selectedRole}`;
    setInviteLink(link);
  };
  
  // Copy invite link
  const copyInviteLink = async () => {
    if (!inviteLink) {
      generateInviteLink();
    }
    
    try {
      await navigator.clipboard.writeText(inviteLink || `${window.location.origin}/join-team/${teamId}?role=${selectedRole}`);
      setLinkCopied(true);
      playSuccess();
      notify.success('Link copied!', 'Share it with your team');
      
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      playError();
      notify.error('Failed to copy', 'Please try again');
    }
  };
  
  // Send invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !displayName) {
      notify.error('Missing fields', 'Please enter email and name');
      return;
    }
    
    setIsSubmitting(true);
    playClick();
    
    try {
      // Generate a userId from email (in real app, this would be handled by auth)
      const userId = `user_${email.split('@')[0]}_${Date.now()}`;
      
      const response = await fetch(
        `${API_BASE}/team/teams/${teamId}/members/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            email,
            displayName,
            role: selectedRole,
            invitedBy,
          }),
        }
      );
      
      if (response.ok) {
        playSuccess();
        notify.success('Invite sent!', `${displayName} has been invited`);
        
        setEmail('');
        setDisplayName('');
        setSelectedRole('editor');
        
        onMemberInvited?.();
        onClose();
      } else {
        throw new Error('Failed to send invite');
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
      playError();
      notify.error('Failed to send invite', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[var(--coconut-dark)] mb-2">
                Invite Team Members
              </h2>
              <p className="text-[var(--coconut-husk)]">
                Add people to your team workspace
              </p>
            </div>
            
            <button
              onClick={onClose}
              onMouseEnter={playHover}
              className="p-2 rounded-xl hover:bg-white/60 transition-all"
            >
              <X size={24} className="text-[var(--coconut-husk)]" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-white/60 rounded-xl">
            <button
              onClick={() => {
                setShowBulkUpload(false);
                playClick();
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                !showBulkUpload
                  ? 'bg-white shadow-lg text-[var(--coconut-dark)]'
                  : 'text-[var(--coconut-husk)] hover:bg-white/40'
              }`}
            >
              <Mail size={20} className="inline mr-2" />
              Email Invite
            </button>
            
            <button
              onClick={() => {
                setShowBulkUpload(true);
                playClick();
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                showBulkUpload
                  ? 'bg-white shadow-lg text-[var(--coconut-dark)]'
                  : 'text-[var(--coconut-husk)] hover:bg-white/40'
              }`}
            >
              <Upload size={20} className="inline mr-2" />
              Bulk Upload
            </button>
          </div>
          
          {/* Email Invite Form */}
          {!showBulkUpload ? (
            <div className="space-y-6">
              <form onSubmit={handleSendInvite} className="space-y-4">
                {/* Email & Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--coconut-dark)] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--coconut-shell)]/30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[var(--coconut-dark)] mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--coconut-shell)]/30"
                      required
                    />
                  </div>
                </div>
                
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--coconut-dark)] mb-3">
                    Select Role
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Object.entries(ROLE_CONFIGS) as [TeamRole, typeof ROLE_CONFIGS[TeamRole]][]).map(([role, config]) => {
                      const Icon = config.icon;
                      const isSelected = selectedRole === role;
                      
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role);
                            playClick();
                          }}
                          onMouseEnter={playHover}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-[var(--coconut-shell)] bg-white shadow-lg scale-[1.02]'
                              : 'border-white/40 bg-white/60 hover:bg-white/80 hover:border-[var(--coconut-shell)]/30'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon size={20} className="text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-bold text-[var(--coconut-dark)] mb-1">
                                {config.label}
                              </div>
                              <div className="text-xs text-[var(--coconut-husk)]">
                                {config.description}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {config.permissions.map((permission, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-[var(--coconut-husk)]">
                                <Check size={12} className="text-green-500" />
                                {permission}
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email || !displayName}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <UserPlus size={24} />
                  {isSubmitting ? 'Sending Invite...' : 'Send Invite'}
                </button>
              </form>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/40" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[var(--coconut-cream)] text-[var(--coconut-husk)]">
                    Or share invite link
                  </span>
                </div>
              </div>
              
              {/* Invite Link */}
              <div className="bg-white/80 rounded-xl p-6 border border-white/60">
                <p className="text-sm text-[var(--coconut-husk)] mb-3">
                  Anyone with this link can join as <strong>{ROLE_CONFIGS[selectedRole].label}</strong>
                </p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink || `${window.location.origin}/join-team/${teamId}?role=${selectedRole}`}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--coconut-cream)] border border-white/40 text-[var(--coconut-dark)] text-sm font-mono"
                  />
                  
                  <button
                    onClick={copyInviteLink}
                    className="px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-white/60 text-[var(--coconut-dark)] font-semibold transition-all flex items-center gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <Check size={20} className="text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={20} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Bulk Upload
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      CSV Format Instructions
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Upload a CSV file with the following columns:
                    </p>
                    <code className="block bg-white/60 rounded-lg p-3 text-sm font-mono text-blue-900">
                      email,name,role
                      <br />
                      john@company.com,John Doe,editor
                      <br />
                      jane@company.com,Jane Smith,client
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-[var(--coconut-shell)]/30 rounded-xl p-12 text-center bg-white/60 hover:bg-white/80 transition-all cursor-pointer">
                <Upload size={48} className="mx-auto mb-4 text-[var(--coconut-shell)]" />
                <h4 className="font-bold text-[var(--coconut-dark)] mb-2">
                  Drop CSV file here
                </h4>
                <p className="text-sm text-[var(--coconut-husk)] mb-4">
                  or click to browse
                </p>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white font-semibold">
                  Choose File
                </button>
              </div>
              
              <p className="text-xs text-[var(--coconut-husk)] text-center">
                Maximum 100 invites per upload
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
