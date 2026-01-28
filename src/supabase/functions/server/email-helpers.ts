/**
 * EMAIL HELPERS - Wrapper functions for email service
 * 
 * These helpers handle:
 * - Data transformation from DB objects to email interfaces
 * - Error handling (don't fail request if email fails)
 * - Logging
 * - Team member lookups
 */

import * as TeamCollab from './team-collaboration.tsx';
import {
  sendTeamInviteEmail,
  sendMentionEmail,
  sendApprovalRequestEmail,
  sendApprovalDecisionEmail,
  type TeamInviteEmailData,
  type MentionEmailData,
  type ApprovalRequestEmailData,
  type ApprovalDecisionEmailData,
} from './email-service.ts';

/**
 * Send team invitation email
 */
export async function sendTeamInvitation(params: {
  teamId: string;
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer' | 'client';
  invitedBy: string;
}) {
  try {
    // Get team info
    const team = await TeamCollab.getTeam(params.teamId);
    if (!team) {
      console.warn(`❌ [Email] Team ${params.teamId} not found`);
      return;
    }
    
    // Get inviter info
    const teamMembers = await TeamCollab.getTeamMembers(params.teamId);
    const inviter = teamMembers.find(m => m.userId === params.invitedBy);
    
    // Generate invite link
    const inviteToken = generateInviteToken();
    const inviteLink = `https://cortexia.ai/join-team/${params.teamId}?token=${inviteToken}`;
    
    const emailData: TeamInviteEmailData = {
      toEmail: params.email,
      toName: params.displayName,
      teamName: team.name,
      inviterName: inviter?.displayName || 'A team member',
      role: params.role,
      inviteLink,
      expiresIn: '7 days',
    };
    
    await sendTeamInviteEmail(emailData);
    console.log(`✅ [Email] Team invite sent to ${params.email}`);
  } catch (error) {
    console.error(`❌ [Email] Failed to send team invite to ${params.email}:`, error);
    // Don't throw - email failure shouldn't fail the request
  }
}

/**
 * Send @mention notification emails to all mentioned users
 */
export async function sendMentionNotifications(params: {
  teamId: string;
  mentionedUserIds: string[];
  mentionedByUserId: string;
  mentionedByName: string;
  targetType: 'generation' | 'board' | 'project';
  targetId: string;
  comment: string;
}) {
  try {
    // Get team members to lookup emails
    const teamMembers = await TeamCollab.getTeamMembers(params.teamId);
    
    // Get team name
    const team = await TeamCollab.getTeam(params.teamId);
    if (!team) {
      console.warn(`❌ [Email] Team ${params.teamId} not found`);
      return;
    }
    
    // Send email to each mentioned user
    for (const mentionedUserId of params.mentionedUserIds) {
      const member = teamMembers.find(m => m.userId === mentionedUserId);
      
      if (!member) {
        console.warn(`⚠️ [Email] User ${mentionedUserId} not found in team`);
        continue;
      }
      
      const viewLink = `https://cortexia.ai/team/${params.teamId}/${params.targetType}/${params.targetId}#comment`;
      
      const emailData: MentionEmailData = {
        toEmail: member.email,
        toName: member.displayName,
        mentionedBy: params.mentionedByName,
        projectName: `${params.targetType} ${params.targetId}`, // TODO: Get real project name
        comment: params.comment,
        viewLink,
      };
      
      await sendMentionEmail(emailData);
      console.log(`✅ [Email] @mention sent to ${member.email}`);
    }
  } catch (error) {
    console.error('❌ [Email] Failed to send mention notifications:', error);
    // Don't throw - email failure shouldn't fail the request
  }
}

/**
 * Send approval request emails to all approvers
 */
export async function sendApprovalRequests(params: {
  teamId: string;
  approverUserIds: string[];
  requesterUserId: string;
  requesterName: string;
  generationId: string;
  generationTitle: string;
  generationImageUrl: string;
  approvalRequestId: string;
}) {
  try {
    // Get team members to lookup emails
    const teamMembers = await TeamCollab.getTeamMembers(params.teamId);
    
    // Send email to each approver
    for (const approverUserId of params.approverUserIds) {
      const member = teamMembers.find(m => m.userId === approverUserId);
      
      if (!member) {
        console.warn(`⚠️ [Email] Approver ${approverUserId} not found in team`);
        continue;
      }
      
      const approveLink = `https://cortexia.ai/approve/${params.approvalRequestId}`;
      
      const emailData: ApprovalRequestEmailData = {
        toEmail: member.email,
        toName: member.displayName,
        requesterName: params.requesterName,
        generationTitle: params.generationTitle,
        generationImageUrl: params.generationImageUrl,
        approveLink,
      };
      
      await sendApprovalRequestEmail(emailData);
      console.log(`✅ [Email] Approval request sent to ${member.email}`);
    }
  } catch (error) {
    console.error('❌ [Email] Failed to send approval request:', error);
    // Don't throw - email failure shouldn't fail the request
  }
}

/**
 * Send approval decision email to requester
 */
export async function sendApprovalDecisionNotification(params: {
  teamId: string;
  requesterUserId: string;
  approverUserId: string;
  approverName: string;
  generationId: string;
  generationTitle: string;
  generationImageUrl: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  comment?: string;
}) {
  try {
    // Get team members to lookup requester email
    const teamMembers = await TeamCollab.getTeamMembers(params.teamId);
    const requester = teamMembers.find(m => m.userId === params.requesterUserId);
    
    if (!requester) {
      console.warn(`⚠️ [Email] Requester ${params.requesterUserId} not found in team`);
      return;
    }
    
    const viewLink = `https://cortexia.ai/generation/${params.generationId}`;
    
    const emailData: ApprovalDecisionEmailData = {
      toEmail: requester.email,
      toName: requester.displayName,
      approverName: params.approverName,
      generationTitle: params.generationTitle,
      generationImageUrl: params.generationImageUrl,
      decision: params.decision,
      comment: params.comment,
      viewLink,
    };
    
    await sendApprovalDecisionEmail(emailData);
    console.log(`✅ [Email] Approval decision sent to ${requester.email}`);
  } catch (error) {
    console.error('❌ [Email] Failed to send approval decision:', error);
    // Don't throw - email failure shouldn't fail the request
  }
}

/**
 * Generate a secure invite token (placeholder - use crypto in production)
 */
function generateInviteToken(): string {
  return `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}