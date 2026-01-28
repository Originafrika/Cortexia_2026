/**
 * TEAM COLLABORATION - Enterprise Feature
 * 
 * Core collaboration logic for Enterprise teams
 * 
 * Features:
 * - Team management (create, invite, remove)
 * - Role-based permissions (Admin, Editor, Viewer, Client)
 * - Real-time comments with @mentions
 * - Approval workflows
 * - Activity tracking
 * - Shared workspaces
 */

import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import * as kv from './kv_store.tsx';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================
// TYPES
// ============================================

export type TeamRole = 'admin' | 'editor' | 'viewer' | 'client';

export interface Team {
  id: string;
  enterpriseAccountId: string; // Link to enterprise subscription
  name: string;
  description?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    allowClientComments: boolean;
    requireApproval: boolean;
    autoNotifyOnComment: boolean;
  };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  email: string;
  displayName: string;
  role: TeamRole;
  permissions: {
    canGenerate: boolean;
    canEdit: boolean;
    canComment: boolean;
    canApprove: boolean;
    canInvite: boolean;
    canDelete: boolean;
  };
  invitedBy: string;
  invitedAt: string;
  joinedAt?: string;
  status: 'pending' | 'active' | 'inactive';
}

export interface TeamComment {
  id: string;
  teamId: string;
  targetType: 'generation' | 'board' | 'project';
  targetId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[]; // User IDs mentioned with @
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    filename: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  isResolved: boolean;
}

export interface ApprovalRequest {
  id: string;
  teamId: string;
  generationId: string;
  boardId?: string;
  requestedBy: string;
  requestedAt: string;
  approvers: string[]; // User IDs who can approve
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  decision?: {
    by: string;
    at: string;
    comment?: string;
  };
  version: number; // Track revisions
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  action: 'created' | 'edited' | 'commented' | 'approved' | 'rejected' | 'generated' | 'invited' | 'deleted';
  targetType: 'team' | 'member' | 'project' | 'board' | 'generation' | 'comment';
  targetId: string;
  targetName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ============================================
// ROLE PERMISSIONS
// ============================================

const ROLE_PERMISSIONS: Record<TeamRole, TeamMember['permissions']> = {
  admin: {
    canGenerate: true,
    canEdit: true,
    canComment: true,
    canApprove: true,
    canInvite: true,
    canDelete: true,
  },
  editor: {
    canGenerate: true,
    canEdit: true,
    canComment: true,
    canApprove: false,
    canInvite: false,
    canDelete: false,
  },
  viewer: {
    canGenerate: false,
    canEdit: false,
    canComment: true,
    canApprove: false,
    canInvite: false,
    canDelete: false,
  },
  client: {
    canGenerate: false,
    canEdit: false,
    canComment: true,
    canApprove: true, // Clients can approve
    canInvite: false,
    canDelete: false,
  },
};

// ============================================
// TEAM MANAGEMENT
// ============================================

/**
 * Create a new team
 */
export async function createTeam(
  enterpriseAccountId: string,
  name: string,
  creatorUserId: string,
  description?: string
): Promise<Team> {
  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const team: Team = {
    id: teamId,
    enterpriseAccountId,
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      allowClientComments: true,
      requireApproval: true,
      autoNotifyOnComment: true,
    },
  };
  
  // Save team
  await kv.set(`team:${teamId}`, team);
  
  // Add creator as admin
  await addTeamMember(
    teamId,
    creatorUserId,
    'admin',
    creatorUserId
  );
  
  // Track activity
  await logActivity(teamId, creatorUserId, 'created', 'team', teamId, name);
  
  console.log(`✅ Team created: ${teamId}`);
  return team;
}

/**
 * Get team by ID
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  return await kv.get<Team>(`team:${teamId}`);
}

/**
 * Update team settings
 */
export async function updateTeam(
  teamId: string,
  updates: Partial<Team>
): Promise<Team> {
  const team = await getTeam(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  const updated = {
    ...team,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(`team:${teamId}`, updated);
  return updated;
}

// ============================================
// MEMBER MANAGEMENT
// ============================================

/**
 * Add member to team
 */
export async function addTeamMember(
  teamId: string,
  userId: string,
  role: TeamRole,
  invitedBy: string,
  email?: string,
  displayName?: string
): Promise<TeamMember> {
  const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const member: TeamMember = {
    id: memberId,
    teamId,
    userId,
    email: email || `${userId}@temp.com`,
    displayName: displayName || userId,
    role,
    permissions: ROLE_PERMISSIONS[role],
    invitedBy,
    invitedAt: new Date().toISOString(),
    joinedAt: new Date().toISOString(),
    status: 'active',
  };
  
  // Save member
  await kv.set(`team:${teamId}:member:${userId}`, member);
  
  // Add to team members list
  const membersKey = `team:${teamId}:members`;
  const members = await kv.get<string[]>(membersKey) || [];
  if (!members.includes(userId)) {
    members.push(userId);
    await kv.set(membersKey, members);
  }
  
  // Track activity
  await logActivity(teamId, invitedBy, 'invited', 'member', userId, displayName);
  
  console.log(`✅ Member added to team ${teamId}: ${userId} as ${role}`);
  return member;
}

/**
 * Get team member
 */
export async function getTeamMember(
  teamId: string,
  userId: string
): Promise<TeamMember | null> {
  return await kv.get<TeamMember>(`team:${teamId}:member:${userId}`);
}

/**
 * Get all team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const memberIds = await kv.get<string[]>(`team:${teamId}:members`) || [];
  const members: TeamMember[] = [];
  
  for (const userId of memberIds) {
    const member = await getTeamMember(teamId, userId);
    if (member) {
      members.push(member);
    }
  }
  
  return members;
}

/**
 * Update member role
 */
export async function updateMemberRole(
  teamId: string,
  userId: string,
  newRole: TeamRole,
  updatedBy: string
): Promise<TeamMember> {
  const member = await getTeamMember(teamId, userId);
  if (!member) {
    throw new Error('Member not found');
  }
  
  member.role = newRole;
  member.permissions = ROLE_PERMISSIONS[newRole];
  
  await kv.set(`team:${teamId}:member:${userId}`, member);
  
  // Track activity
  await logActivity(teamId, updatedBy, 'edited', 'member', userId, `Role changed to ${newRole}`);
  
  return member;
}

/**
 * Remove member from team
 */
export async function removeMemberFromTeam(
  teamId: string,
  userId: string,
  removedBy: string
): Promise<void> {
  // Remove member data
  await kv.del(`team:${teamId}:member:${userId}`);
  
  // Remove from members list
  const membersKey = `team:${teamId}:members`;
  const members = await kv.get<string[]>(membersKey) || [];
  const filtered = members.filter(id => id !== userId);
  await kv.set(membersKey, filtered);
  
  // Track activity
  await logActivity(teamId, removedBy, 'deleted', 'member', userId);
  
  console.log(`✅ Member removed from team ${teamId}: ${userId}`);
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  teamId: string,
  userId: string,
  permission: keyof TeamMember['permissions']
): Promise<boolean> {
  const member = await getTeamMember(teamId, userId);
  if (!member || member.status !== 'active') {
    return false;
  }
  return member.permissions[permission];
}

// ============================================
// COMMENTS
// ============================================

/**
 * Add comment
 */
export async function addComment(
  teamId: string,
  targetType: TeamComment['targetType'],
  targetId: string,
  userId: string,
  userName: string,
  content: string,
  mentions: string[] = []
): Promise<TeamComment> {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const comment: TeamComment = {
    id: commentId,
    teamId,
    targetType,
    targetId,
    userId,
    userName,
    content,
    mentions,
    createdAt: new Date().toISOString(),
    isResolved: false,
  };
  
  // Save comment
  await kv.set(`comment:${commentId}`, comment);
  
  // Add to target's comments list
  const commentsKey = `${targetType}:${targetId}:comments`;
  const comments = await kv.get<string[]>(commentsKey) || [];
  comments.push(commentId);
  await kv.set(commentsKey, comments);
  
  // Track activity
  await logActivity(teamId, userId, 'commented', targetType, targetId);
  
  // TODO: Send notifications to @mentioned users
  
  console.log(`✅ Comment added: ${commentId}`);
  return comment;
}

/**
 * Get comments for target
 */
export async function getComments(
  targetType: TeamComment['targetType'],
  targetId: string
): Promise<TeamComment[]> {
  const commentIds = await kv.get<string[]>(`${targetType}:${targetId}:comments`) || [];
  const comments: TeamComment[] = [];
  
  for (const commentId of commentIds) {
    const comment = await kv.get<TeamComment>(`comment:${commentId}`);
    if (comment) {
      comments.push(comment);
    }
  }
  
  // Sort by created date (newest first)
  return comments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Resolve comment
 */
export async function resolveComment(commentId: string): Promise<void> {
  const comment = await kv.get<TeamComment>(`comment:${commentId}`);
  if (comment) {
    comment.isResolved = true;
    await kv.set(`comment:${commentId}`, comment);
  }
}

// ============================================
// APPROVAL WORKFLOWS
// ============================================

/**
 * Create approval request
 */
export async function createApprovalRequest(
  teamId: string,
  generationId: string,
  requestedBy: string,
  approvers: string[],
  boardId?: string
): Promise<ApprovalRequest> {
  const requestId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const request: ApprovalRequest = {
    id: requestId,
    teamId,
    generationId,
    boardId,
    requestedBy,
    requestedAt: new Date().toISOString(),
    approvers,
    status: 'pending',
    version: 1,
  };
  
  // Save request
  await kv.set(`approval:${requestId}`, request);
  
  // Add to generation's approvals
  await kv.set(`generation:${generationId}:approval`, requestId);
  
  // Track activity
  await logActivity(teamId, requestedBy, 'created', 'generation', generationId, 'Submitted for approval');
  
  console.log(`✅ Approval request created: ${requestId}`);
  return request;
}

/**
 * Approve/reject request
 */
export async function updateApprovalStatus(
  requestId: string,
  decidedBy: string,
  status: 'approved' | 'rejected' | 'changes_requested',
  comment?: string
): Promise<ApprovalRequest> {
  const request = await kv.get<ApprovalRequest>(`approval:${requestId}`);
  if (!request) {
    throw new Error('Approval request not found');
  }
  
  request.status = status;
  request.decision = {
    by: decidedBy,
    at: new Date().toISOString(),
    comment,
  };
  
  await kv.set(`approval:${requestId}`, request);
  
  // Track activity
  await logActivity(
    request.teamId,
    decidedBy,
    status === 'approved' ? 'approved' : 'rejected',
    'generation',
    request.generationId
  );
  
  console.log(`✅ Approval ${status}: ${requestId}`);
  return request;
}

/**
 * Get pending approvals for user
 */
export async function getPendingApprovals(
  teamId: string,
  userId: string
): Promise<ApprovalRequest[]> {
  // This is simplified - in production, you'd have an index
  // For now, we'll return empty array
  // TODO: Implement proper indexing
  return [];
}

// ============================================
// ACTIVITY TRACKING
// ============================================

/**
 * Log activity
 */
export async function logActivity(
  teamId: string,
  userId: string,
  action: TeamActivity['action'],
  targetType: TeamActivity['targetType'],
  targetId: string,
  targetName?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const activity: TeamActivity = {
    id: activityId,
    teamId,
    userId,
    userName: userId, // TODO: Get real user name
    action,
    targetType,
    targetId,
    targetName,
    metadata,
    createdAt: new Date().toISOString(),
  };
  
  // Save activity
  await kv.set(`activity:${activityId}`, activity);
  
  // Add to team activities list (keep last 100)
  const activitiesKey = `team:${teamId}:activities`;
  const activities = await kv.get<string[]>(activitiesKey) || [];
  activities.unshift(activityId); // Add to front
  const trimmed = activities.slice(0, 100); // Keep only last 100
  await kv.set(activitiesKey, trimmed);
}

/**
 * Get team activities
 */
export async function getTeamActivities(
  teamId: string,
  limit: number = 50
): Promise<TeamActivity[]> {
  const activityIds = await kv.get<string[]>(`team:${teamId}:activities`) || [];
  const activities: TeamActivity[] = [];
  
  for (const activityId of activityIds.slice(0, limit)) {
    const activity = await kv.get<TeamActivity>(`activity:${activityId}`);
    if (activity) {
      activities.push(activity);
    }
  }
  
  return activities;
}

// ============================================
// SHARED WORKSPACES
// ============================================

/**
 * Share project with team
 */
export async function shareProjectWithTeam(
  projectId: string,
  teamId: string,
  sharedBy: string
): Promise<void> {
  // Add project to team's shared projects
  const projectsKey = `team:${teamId}:projects`;
  const projects = await kv.get<string[]>(projectsKey) || [];
  if (!projects.includes(projectId)) {
    projects.push(projectId);
    await kv.set(projectsKey, projects);
  }
  
  // Mark project as shared
  await kv.set(`project:${projectId}:team`, teamId);
  
  // Track activity
  await logActivity(teamId, sharedBy, 'created', 'project', projectId);
  
  console.log(`✅ Project ${projectId} shared with team ${teamId}`);
}

/**
 * Get team's shared projects
 */
export async function getTeamProjects(teamId: string): Promise<string[]> {
  return await kv.get<string[]>(`team:${teamId}:projects`) || [];
}

/**
 * Check if user can access project
 */
export async function canAccessProject(
  projectId: string,
  userId: string
): Promise<boolean> {
  // Get project's team
  const teamId = await kv.get<string>(`project:${projectId}:team`);
  if (!teamId) {
    return false; // Not a team project
  }
  
  // Check if user is team member
  const member = await getTeamMember(teamId, userId);
  return member !== null && member.status === 'active';
}
