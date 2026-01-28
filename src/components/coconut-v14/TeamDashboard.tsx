/**
 * TEAM DASHBOARD - Enterprise Feature
 * 
 * Main dashboard for team collaboration
 * 
 * Features:
 * - Team overview with members
 * - Recent activity feed
 * - Pending approvals
 * - Quick actions
 * - Team settings
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  Settings,
  Activity,
  CheckCircle,
  Clock,
  MessageSquare,
  Folder,
  Sparkles,
  TrendingUp,
  UserPlus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import type { Team, TeamMember, TeamActivity } from '../../supabase/functions/server/team-collaboration';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

// ============================================
// TYPES
// ============================================

interface TeamDashboardProps {
  userId: string;
  enterpriseAccountId: string;
  onCreateTeam?: () => void;
  onInviteMember?: (teamId: string) => void;
  onManageTeam?: (teamId: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export const TeamDashboard: React.FC<TeamDashboardProps> = ({
  userId,
  enterpriseAccountId,
  onCreateTeam,
  onInviteMember,
  onManageTeam,
}) => {
  const { playClick, playHover, playSuccess } = useSoundContext();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user's teams
  useEffect(() => {
    loadTeams();
  }, [userId, enterpriseAccountId]);
  
  // Load team data when selected
  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
      loadTeamActivities(selectedTeam.id);
    }
  }, [selectedTeam]);
  
  const loadTeams = async () => {
    setIsLoading(true);
    try {
      // TODO: Get teams for enterprise account
      // For now, mock data
      const mockTeams: Team[] = [
        {
          id: 'team_1',
          enterpriseAccountId,
          name: 'Design Team',
          description: 'Main design team for product work',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: {
            allowClientComments: true,
            requireApproval: true,
            autoNotifyOnComment: true,
          },
        },
      ];
      
      setTeams(mockTeams);
      if (mockTeams.length > 0) {
        setSelectedTeam(mockTeams[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTeamMembers = async (teamId: string) => {
    try {
      const response = await fetch(`${API_BASE}/team/teams/${teamId}/members`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setMembers(result.data.members || []);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };
  
  const loadTeamActivities = async (teamId: string) => {
    try {
      const response = await fetch(`${API_BASE}/team/teams/${teamId}/activities?limit=10`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setActivities(result.data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };
  
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)]">
      <div className="max-w-7xl mx-auto p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--coconut-dark)] mb-2">
                Team Collaboration
              </h1>
              <p className="text-[var(--coconut-husk)]">
                Work together with your team in real-time
              </p>
            </div>
            
            <button
              onClick={() => {
                playClick();
                onCreateTeam?.();
              }}
              onMouseEnter={playHover}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white font-semibold transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Create Team
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={Users}
            label="Total Members"
            value={members.length}
            color="from-blue-500 to-cyan-500"
          />
          
          <StatsCard
            icon={Folder}
            label="Shared Projects"
            value={0}
            color="from-purple-500 to-pink-500"
          />
          
          <StatsCard
            icon={MessageSquare}
            label="Comments Today"
            value={0}
            color="from-amber-500 to-orange-500"
          />
          
          <StatsCard
            icon={CheckCircle}
            label="Pending Approvals"
            value={0}
            color="from-green-500 to-emerald-500"
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Team Members */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--coconut-dark)] flex items-center gap-2">
                  <Users size={24} className="text-[var(--coconut-shell)]" />
                  Team Members
                </h2>
                
                {selectedTeam && (
                  <button
                    onClick={() => {
                      playClick();
                      onInviteMember?.(selectedTeam.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/40 text-[var(--coconut-shell)] font-medium transition-all flex items-center gap-2"
                  >
                    <UserPlus size={16} />
                    Invite
                  </button>
                )}
              </div>
              
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">No team members yet</p>
                  <button
                    onClick={() => selectedTeam && onInviteMember?.(selectedTeam.id)}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white font-medium"
                  >
                    Invite First Member
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Activity Feed */}
          <div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl">
              <h2 className="text-xl font-bold text-[var(--coconut-dark)] mb-6 flex items-center gap-2">
                <Activity size={24} className="text-[var(--coconut-shell)]" />
                Recent Activity
              </h2>
              
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-sm">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STATS CARD
// ============================================

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      
      <div className="text-3xl font-bold text-[var(--coconut-dark)] mb-1">
        {value}
      </div>
      
      <div className="text-sm text-[var(--coconut-husk)]">
        {label}
      </div>
    </motion.div>
  );
};

// ============================================
// MEMBER CARD
// ============================================

interface MemberCardProps {
  member: TeamMember;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { bg: 'bg-red-500/20', text: 'text-red-600', label: 'Admin' },
      editor: { bg: 'bg-blue-500/20', text: 'text-blue-600', label: 'Editor' },
      viewer: { bg: 'bg-gray-500/20', text: 'text-gray-600', label: 'Viewer' },
      client: { bg: 'bg-purple-500/20', text: 'text-purple-600', label: 'Client' },
    };
    
    return badges[role as keyof typeof badges] || badges.viewer;
  };
  
  const badge = getRoleBadge(member.role);
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 hover:bg-white/80 border border-white/40 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center text-white font-bold">
          {member.displayName.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <div className="font-semibold text-[var(--coconut-dark)]">
            {member.displayName}
          </div>
          <div className="text-xs text-[var(--coconut-husk)]">
            {member.email}
          </div>
        </div>
      </div>
      
      <div className={`px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-xs font-semibold`}>
        {badge.label}
      </div>
    </div>
  );
};

// ============================================
// ACTIVITY CARD
// ============================================

interface ActivityCardProps {
  activity: TeamActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const getActionIcon = (action: string) => {
    const icons = {
      created: Sparkles,
      edited: Settings,
      commented: MessageSquare,
      approved: CheckCircle,
      rejected: AlertCircle,
      generated: Sparkles,
      invited: UserPlus,
      deleted: AlertCircle,
    };
    
    return icons[action as keyof typeof icons] || Activity;
  };
  
  const Icon = getActionIcon(activity.action);
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-all">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[var(--coconut-shell)]" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--coconut-dark)]">
          <span className="font-semibold">{activity.userName}</span>
          {' '}
          {activity.action}
          {' '}
          {activity.targetName}
        </p>
        <p className="text-xs text-[var(--coconut-husk)] mt-1">
          {new Date(activity.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
