/**
 * TEAM MANAGEMENT PAGE - Enterprise Feature
 * 
 * Core team collaboration UI for Enterprise accounts
 * Features:
 * - Team members list with roles
 * - Invite new members
 * - Manage roles and permissions
 * - Pending approvals tab
 * - Activity overview
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Eye, Edit3, AlertCircle, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { InviteMemberModal } from './InviteMemberModal';
import { MemberCard } from './MemberCard';
import { ApprovalsPanel } from './ApprovalsPanel';
import { ActivityFeed } from './ActivityFeed';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'client';
  status: 'active' | 'invited' | 'inactive';
  joinedAt: string;
  lastActive: string;
  avatar?: string;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  activityThisWeek: number;
}

interface TeamManagementPageProps {
  teamId?: string;
  onNavigate?: (view: string) => void;
}

export function TeamManagementPage({ teamId, onNavigate }: TeamManagementPageProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0,
    activityThisWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'members' | 'pending' | 'approvals'>('members');

  // Determine teamId (from props or user profile)
  const effectiveTeamId = teamId || user?.teamId || user?.id;

  useEffect(() => {
    loadTeamData();
  }, [effectiveTeamId]);

  const loadTeamData = async () => {
    if (!effectiveTeamId) {
      console.warn('[TeamManagementPage] No teamId available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('[TeamManagementPage] Loading team data for:', effectiveTeamId);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      // Load team members
      const membersRes = await fetch(`${apiUrl}/teams/${effectiveTeamId}/members`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (membersRes.ok) {
        const data = await membersRes.json();
        console.log('[TeamManagementPage] Members loaded:', data);
        setMembers(data.members || []);

        // Calculate stats
        const activeCount = data.members.filter((m: TeamMember) => m.status === 'active').length;
        const pendingCount = data.members.filter((m: TeamMember) => m.status === 'invited').length;

        setStats({
          totalMembers: data.members.length,
          activeMembers: activeCount,
          pendingInvites: pendingCount,
          activityThisWeek: data.activityCount || 0
        });
      } else {
        console.error('[TeamManagementPage] Failed to load members:', await membersRes.text());
        toast.error('Failed to load team members');
      }
    } catch (error) {
      console.error('[TeamManagementPage] Error loading team data:', error);
      toast.error('Error loading team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (email: string, role: TeamMember['role'], message?: string) => {
    try {
      console.log('[TeamManagementPage] Inviting member:', { email, role });

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${effectiveTeamId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role, message })
      });

      if (res.ok) {
        toast.success('Invitation sent!', {
          description: `${email} will receive an invitation email`
        });
        setShowInviteModal(false);
        loadTeamData(); // Reload to show pending invite
      } else {
        const error = await res.text();
        console.error('[TeamManagementPage] Failed to invite member:', error);
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      console.error('[TeamManagementPage] Error inviting member:', error);
      toast.error('Error sending invitation');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      console.log('[TeamManagementPage] Removing member:', memberId);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${effectiveTeamId}/remove-member`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberId })
      });

      if (res.ok) {
        toast.success('Member removed');
        loadTeamData();
      } else {
        const error = await res.text();
        console.error('[TeamManagementPage] Failed to remove member:', error);
        toast.error('Failed to remove member');
      }
    } catch (error) {
      console.error('[TeamManagementPage] Error removing member:', error);
      toast.error('Error removing member');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      console.log('[TeamManagementPage] Updating role:', { memberId, newRole });

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${effectiveTeamId}/update-role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberId, role: newRole })
      });

      if (res.ok) {
        toast.success('Role updated');
        loadTeamData();
      } else {
        const error = await res.text();
        console.error('[TeamManagementPage] Failed to update role:', error);
        toast.error('Failed to update role');
      }
    } catch (error) {
      console.error('[TeamManagementPage] Error updating role:', error);
      toast.error('Error updating role');
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-amber-600" />;
      case 'editor': return <Edit3 size={16} className="text-blue-600" />;
      case 'viewer': return <Eye size={16} className="text-gray-600" />;
      case 'client': return <Users size={16} className="text-purple-600" />;
    }
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'editor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'client': return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const activeMembers = members.filter(m => m.status === 'active');
  const pendingMembers = members.filter(m => m.status === 'invited');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Team Management
            </h1>
            <p className="text-gray-600">
              Manage your team members, roles, and approval workflows
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <UserPlus size={20} />
            <span className="font-medium">Invite Member</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingInvites}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activityThisWeek}</p>
                <p className="text-sm text-gray-600">Activity/Week</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-cream-100">
          <button
            onClick={() => setSelectedTab('members')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              selectedTab === 'members'
                ? 'text-amber-600 border-amber-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Active Members ({activeMembers.length})
          </button>
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              selectedTab === 'pending'
                ? 'text-amber-600 border-amber-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Pending Invites ({pendingMembers.length})
          </button>
          <button
            onClick={() => setSelectedTab('approvals')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              selectedTab === 'approvals'
                ? 'text-amber-600 border-amber-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Approvals
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {activeMembers.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-2">No active members yet</p>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Invite your first member
                    </button>
                  </div>
                ) : (
                  activeMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onRemove={handleRemoveMember}
                      onUpdateRole={handleUpdateRole}
                      getRoleIcon={getRoleIcon}
                      getRoleColor={getRoleColor}
                    />
                  ))
                )}
              </motion.div>
            )}

            {selectedTab === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {pendingMembers.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
                    <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">No pending invitations</p>
                  </div>
                ) : (
                  pendingMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onRemove={handleRemoveMember}
                      onUpdateRole={handleUpdateRole}
                      getRoleIcon={getRoleIcon}
                      getRoleColor={getRoleColor}
                    />
                  ))
                )}
              </motion.div>
            )}

            {selectedTab === 'approvals' && (
              <motion.div
                key="approvals"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ApprovalsPanel 
                  teamId={effectiveTeamId || ''}
                  onApprovalUpdate={loadTeamData}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteMemberModal
            onClose={() => setShowInviteModal(false)}
            onInvite={handleInviteMember}
          />
        )}
      </AnimatePresence>
    </div>
  );
}