/**
 * TEAM COLLABORATION ROUTES - Enterprise Feature
 * 
 * API endpoints for team collaboration
 * 
 * Routes:
 * - POST /teams/create - Create new team
 * - GET /teams/:teamId - Get team details
 * - PATCH /teams/:teamId - Update team
 * - POST /teams/:teamId/members/invite - Invite member
 * - GET /teams/:teamId/members - Get team members
 * - PATCH /teams/:teamId/members/:userId/role - Update member role
 * - DELETE /teams/:teamId/members/:userId - Remove member
 * - POST /teams/:teamId/comments - Add comment
 * - GET /teams/:teamId/comments/:targetType/:targetId - Get comments
 * - POST /teams/:teamId/approvals - Create approval request
 * - PATCH /teams/:teamId/approvals/:requestId - Update approval
 * - GET /teams/:teamId/activities - Get team activities
 * - POST /teams/:teamId/projects/:projectId/share - Share project
 */

import { Hono } from 'npm:hono';
import * as TeamCollab from './team-collaboration.tsx';
import {
  sendTeamInvitation,
  sendMentionNotifications,
  sendApprovalRequests,
  sendApprovalDecisionNotification,
} from './email-helpers.ts'; // ✅ NEW: Email helper functions

const app = new Hono();

console.log('👥 Team collaboration routes module loaded');

// ============================================
// TEAM MANAGEMENT
// ============================================

// Create team
app.post('/teams/create', async (c) => {
  console.log('👥 [Teams] POST /teams/create');
  
  try {
    const body = await c.req.json();
    const { enterpriseAccountId, name, userId, description } = body;
    
    if (!enterpriseAccountId || !name || !userId) {
      return c.json({
        success: false,
        error: 'Missing required fields: enterpriseAccountId, name, userId'
      }, 400);
    }
    
    const team = await TeamCollab.createTeam(
      enterpriseAccountId,
      name,
      userId,
      description
    );
    
    console.log(`✅ [Teams] Team created: ${team.id}`);
    
    return c.json({
      success: true,
      data: { team }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error creating team:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get team
app.get('/teams/:teamId', async (c) => {
  const teamId = c.req.param('teamId');
  console.log(`👥 [Teams] GET /teams/${teamId}`);
  
  try {
    const team = await TeamCollab.getTeam(teamId);
    
    if (!team) {
      return c.json({
        success: false,
        error: 'Team not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: { team }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error fetching team:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update team
app.patch('/teams/:teamId', async (c) => {
  const teamId = c.req.param('teamId');
  console.log(`👥 [Teams] PATCH /teams/${teamId}`);
  
  try {
    const updates = await c.req.json();
    
    const team = await TeamCollab.updateTeam(teamId, updates);
    
    console.log(`✅ [Teams] Team updated: ${teamId}`);
    
    return c.json({
      success: true,
      data: { team }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error updating team:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// MEMBER MANAGEMENT
// ============================================

// Invite member
app.post('/teams/:teamId/members/invite', async (c) => {
  const teamId = c.req.param('teamId');
  console.log(`👥 [Teams] POST /teams/${teamId}/members/invite`);
  
  try {
    const body = await c.req.json();
    const { userId, email, displayName, role, invitedBy } = body;
    
    if (!userId || !role || !invitedBy) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId, role, invitedBy'
      }, 400);
    }
    
    // Check if inviter has permission
    const canInvite = await TeamCollab.hasPermission(teamId, invitedBy, 'canInvite');
    if (!canInvite) {
      return c.json({
        success: false,
        error: 'You do not have permission to invite members'
      }, 403);
    }
    
    const member = await TeamCollab.addTeamMember(
      teamId,
      userId,
      role,
      invitedBy,
      email,
      displayName
    );
    
    console.log(`✅ [Teams] Member invited: ${userId}`);
    
    // ✅ NEW: Send team invite email
    await sendTeamInvitation({
      teamId,
      userId: member.userId,
      email: member.email,
      displayName: member.displayName,
      role: member.role,
      invitedBy,
    });
    
    return c.json({
      success: true,
      data: { member }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error inviting member:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get team members
app.get('/teams/:teamId/members', async (c) => {
  const teamId = c.req.param('teamId');
  console.log(`👥 [Teams] GET /teams/${teamId}/members`);
  
  try {
    const members = await TeamCollab.getTeamMembers(teamId);
    
    return c.json({
      success: true,
      data: { members }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error fetching members:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update member role
app.patch('/teams/:teamId/members/:userId/role', async (c) => {
  const teamId = c.req.param('teamId');
  const userId = c.req.param('userId');
  console.log(`👥 [Teams] PATCH /teams/${teamId}/members/${userId}/role`);
  
  try {
    const body = await c.req.json();
    const { role, updatedBy } = body;
    
    if (!role || !updatedBy) {
      return c.json({
        success: false,
        error: 'Missing required fields: role, updatedBy'
      }, 400);
    }
    
    // Check if updater has permission
    const canEdit = await TeamCollab.hasPermission(teamId, updatedBy, 'canInvite');
    if (!canEdit) {
      return c.json({
        success: false,
        error: 'You do not have permission to update member roles'
      }, 403);
    }
    
    const member = await TeamCollab.updateMemberRole(teamId, userId, role, updatedBy);
    
    console.log(`✅ [Teams] Member role updated: ${userId} → ${role}`);
    
    return c.json({
      success: true,
      data: { member }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error updating member role:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Remove member
app.delete('/teams/:teamId/members/:userId', async (c) => {
  const teamId = c.req.param('teamId');
  const userId = c.req.param('userId');
  console.log(`👥 [Teams] DELETE /teams/${teamId}/members/${userId}`);
  
  try {
    const removedBy = c.req.query('removedBy');
    
    if (!removedBy) {
      return c.json({
        success: false,
        error: 'Missing query parameter: removedBy'
      }, 400);
    }
    
    // Check if remover has permission
    const canDelete = await TeamCollab.hasPermission(teamId, removedBy, 'canDelete');
    if (!canDelete) {
      return c.json({
        success: false,
        error: 'You do not have permission to remove members'
      }, 403);
    }
    
    await TeamCollab.removeMemberFromTeam(teamId, userId, removedBy);
    
    console.log(`✅ [Teams] Member removed: ${userId}`);
    
    return c.json({
      success: true,
      data: { message: 'Member removed successfully' }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error removing member:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// COMMENTS
// ============================================

// Add comment
app.post('/teams/:teamId/comments', async (c) => {
  const teamId = c.req.param('teamId');
  console.log(`👥 [Teams] POST /teams/${teamId}/comments`);
  
  try {
    const body = await c.req.json();
    const { targetType, targetId, userId, userName, content, mentions } = body;
    
    if (!targetType || !targetId || !userId || !content) {
      return c.json({
        success: false,
        error: 'Missing required fields: targetType, targetId, userId, content'
      }, 400);
    }
    
    // Check if user has permission to comment
    const canComment = await TeamCollab.hasPermission(teamId, userId, 'canComment');
    if (!canComment) {
      return c.json({
        success: false,
        error: 'You do not have permission to comment'
      }, 403);
    }
    
    const comment = await TeamCollab.addComment(
      teamId,
      targetType,
      targetId,
      userId,
      userName || userId,
      content,
      mentions || []
    );
    
    console.log(`✅ [Teams] Comment added: ${comment.id}`);
    
    // ✅ NEW: Send mention emails
    if (mentions && mentions.length > 0) {
      await sendMentionNotifications({
        teamId: comment.teamId,
        mentionedUserIds: comment.mentions,
        mentionedByUserId: comment.userId,
        mentionedByName: comment.userName,
        targetType: comment.targetType,
        targetId: comment.targetId,
        comment: comment.content,
      });
    }
    
    return c.json({
      success: true,
      data: { comment }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error adding comment:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get comments
app.get('/teams/:teamId/comments/:targetType/:targetId', async (c) => {
  const teamId = c.req.param('teamId');
  const targetType = c.req.param('targetType') as 'generation' | 'board' | 'project';
  const targetId = c.req.param('targetId');
  console.log(`👥 [Teams] GET /teams/${teamId}/comments/${targetType}/${targetId}`);
  
  try {
    const comments = await TeamCollab.getComments(targetType, targetId);
    
    return c.json({
      success: true,
      data: { comments }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error fetching comments:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Resolve comment
app.patch('/teams/:teamId/comments/:commentId/resolve', async (c) => {
  const commentId = c.req.param('commentId');
  console.log(`👥 [Teams] PATCH /teams/.../comments/${commentId}/resolve`);
  
  try {
    await TeamCollab.resolveComment(commentId);
    
    return c.json({
      success: true,
      data: { message: 'Comment resolved' }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error resolving comment:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// APPROVAL WORKFLOWS
// ============================================

// Create approval request
app.post('/teams/:teamId/approvals', async (c) => {
  const teamId = c.req.param('teamId');
  console.log(`👥 [Teams] POST /teams/${teamId}/approvals`);
  
  try {
    const body = await c.req.json();
    const { generationId, requestedBy, approvers, boardId } = body;
    
    if (!generationId || !requestedBy || !approvers || approvers.length === 0) {
      return c.json({
        success: false,
        error: 'Missing required fields: generationId, requestedBy, approvers'
      }, 400);
    }
    
    const approval = await TeamCollab.createApprovalRequest(
      teamId,
      generationId,
      requestedBy,
      approvers,
      boardId
    );
    
    console.log(`✅ [Teams] Approval request created: ${approval.id}`);
    
    // ✅ NEW: Send approval request email
    await sendApprovalRequests(approval);
    
    return c.json({
      success: true,
      data: { approval }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error creating approval:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update approval status
app.patch('/teams/:teamId/approvals/:requestId', async (c) => {
  const requestId = c.req.param('requestId');
  console.log(`👥 [Teams] PATCH /teams/.../approvals/${requestId}`);
  
  try {
    const body = await c.req.json();
    const { status, decidedBy, comment } = body;
    
    if (!status || !decidedBy) {
      return c.json({
        success: false,
        error: 'Missing required fields: status, decidedBy'
      }, 400);
    }
    
    const approval = await TeamCollab.updateApprovalStatus(
      requestId,
      decidedBy,
      status,
      comment
    );
    
    console.log(`✅ [Teams] Approval ${status}: ${requestId}`);
    
    // ✅ NEW: Send approval decision email
    await sendApprovalDecisionNotification(approval);
    
    return c.json({
      success: true,
      data: { approval }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error updating approval:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// ACTIVITY FEED
// ============================================

// Get team activities
app.get('/teams/:teamId/activities', async (c) => {
  const teamId = c.req.param('teamId');
  const limit = parseInt(c.req.query('limit') || '50');
  console.log(`👥 [Teams] GET /teams/${teamId}/activities`);
  
  try {
    const activities = await TeamCollab.getTeamActivities(teamId, limit);
    
    return c.json({
      success: true,
      data: { activities }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error fetching activities:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// SHARED WORKSPACES
// ============================================

// Share project with team
app.post('/teams/:teamId/projects/:projectId/share', async (c) => {
  const teamId = c.req.param('teamId');
  const projectId = c.req.param('projectId');
  console.log(`👥 [Teams] POST /teams/${teamId}/projects/${projectId}/share`);
  
  try {
    const body = await c.req.json();
    const { sharedBy } = body;
    
    if (!sharedBy) {
      return c.json({
        success: false,
        error: 'Missing required field: sharedBy'
      }, 400);
    }
    
    // Check if user has permission
    const canShare = await TeamCollab.hasPermission(teamId, sharedBy, 'canEdit');
    if (!canShare) {
      return c.json({
        success: false,
        error: 'You do not have permission to share projects'
      }, 403);
    }
    
    await TeamCollab.shareProjectWithTeam(projectId, teamId, sharedBy);
    
    console.log(`✅ [Teams] Project shared: ${projectId}`);
    
    return c.json({
      success: true,
      data: { message: 'Project shared successfully' }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error sharing project:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get team projects
app.get('/teams/:teamId/projects', async (c) => {
  const teamId = c.req.param('teamId');
  console.log(`👥 [Teams] GET /teams/${teamId}/projects`);
  
  try {
    const projectIds = await TeamCollab.getTeamProjects(teamId);
    
    return c.json({
      success: true,
      data: { projectIds }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error fetching team projects:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// PENDING APPROVALS COUNT (for badge)
// ============================================

// Get pending approvals count for current user
app.get('/teams/:teamId/approvals/pending', async (c) => {
  const teamId = c.req.param('teamId');
  const userId = c.req.query('userId');
  console.log(`👥 [Teams] GET /teams/${teamId}/approvals/pending?userId=${userId}`);
  
  try {
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get all approval requests for this team
    const allApprovals = await TeamCollab.getTeamApprovals(teamId);
    
    // Filter for requests where user is an approver and status is pending
    const pendingForUser = allApprovals.filter((approval: any) => 
      approval.approvers.includes(userId) && 
      approval.status === 'pending'
    );
    
    console.log(`✅ [Teams] Pending approvals for ${userId}: ${pendingForUser.length}`);
    
    return c.json({
      success: true,
      data: { 
        count: pendingForUser.length,
        approvals: pendingForUser // Optional: return the approvals too
      }
    });
    
  } catch (error) {
    console.error('❌ [Teams] Error fetching pending approvals:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;