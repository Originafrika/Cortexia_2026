/**
 * EMAIL SERVICE - Resend Integration
 * 
 * Handles all email notifications for Team Collaboration
 * 
 * Email Types:
 * 1. Team Invitations
 * 2. @Mention Notifications
 * 3. Approval Requests
 * 4. Approval Decisions
 * 5. Comment Replies
 * 6. Daily Digest (future)
 */

import { Resend } from 'npm:resend@^2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Email sender - MUST be verified domain
const FROM_EMAIL = 'Cortexia Notifications <notifications@cortexia.ai>';
const FROM_NAME = 'Cortexia Team';

// ============================================
// TYPES
// ============================================

export interface TeamInviteEmailData {
  toEmail: string;
  toName: string;
  teamName: string;
  inviterName: string;
  role: 'admin' | 'editor' | 'viewer' | 'client';
  inviteLink: string;
  expiresIn?: string;
}

export interface MentionEmailData {
  toEmail: string;
  toName: string;
  mentionedBy: string;
  projectName: string;
  comment: string;
  viewLink: string;
}

export interface ApprovalRequestEmailData {
  toEmail: string;
  toName: string;
  requesterName: string;
  generationTitle: string;
  generationImageUrl: string;
  approveLink: string;
}

export interface ApprovalDecisionEmailData {
  toEmail: string;
  toName: string;
  approverName: string;
  generationTitle: string;
  generationImageUrl: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  comment?: string;
  viewLink: string;
}

export interface CommentReplyEmailData {
  toEmail: string;
  toName: string;
  replierName: string;
  projectName: string;
  originalComment: string;
  replyComment: string;
  viewLink: string;
}

// ============================================
// EMAIL TEMPLATES (HTML)
// ============================================

/**
 * Generate HTML for Team Invite Email
 */
function renderTeamInviteEmail(data: TeamInviteEmailData): string {
  const rolePermissions = {
    admin: ['Generate & edit designs', 'Comment & approve', 'Invite & manage members', 'Full access'],
    editor: ['Generate & edit designs', 'Comment on content', 'View all projects'],
    viewer: ['View all content', 'Comment on content', 'No editing access'],
    client: ['View assigned content', 'Comment & approve', 'Download finals'],
  };
  
  const permissions = rolePermissions[data.role];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited to join ${data.teamName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f9fc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { padding: 40px; text-align: center; background: linear-gradient(135deg, #6B5D4F 0%, #6B8E70 100%); }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .content { padding: 40px; }
    .role-badge { display: inline-block; padding: 8px 16px; background: #FFF3E0; color: #6B5D4F; border-radius: 20px; font-weight: 600; margin: 16px 0; }
    .permissions { background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 24px 0; }
    .permission-item { padding: 8px 0; }
    .permission-item::before { content: '✓'; color: #6B8E70; font-weight: bold; margin-right: 8px; }
    .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6B5D4F 0%, #6B8E70 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .button:hover { opacity: 0.9; }
    .footer { padding: 40px; text-align: center; color: #666; font-size: 14px; background: #F9FAFB; }
    .footer a { color: #6B5D4F; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 You're Invited!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.toName},</p>
      
      <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.teamName}</strong> on Cortexia.</p>
      
      <div class="role-badge">Your role: ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</div>
      
      <div class="permissions">
        <p style="margin-top: 0; font-weight: 600; color: #6B5D4F;">With this role, you can:</p>
        ${permissions.map(p => `<div class="permission-item">${p}</div>`).join('')}
      </div>
      
      <div style="text-align: center;">
        <a href="${data.inviteLink}" class="button">Accept Invitation</a>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 24px;">
        Or copy this link: <br>
        <code style="background: #F5F5F5; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${data.inviteLink}</code>
      </p>
      
      ${data.expiresIn ? `<p style="color: #999; font-size: 12px;">This invitation expires in ${data.expiresIn}.</p>` : ''}
    </div>
    
    <div class="footer">
      <p>Questions? Reply to this email or visit our <a href="https://cortexia.ai/help">Help Center</a></p>
      <p style="margin-top: 16px; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Cortexia AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for @Mention Email
 */
function renderMentionEmail(data: MentionEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.mentionedBy} mentioned you</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f9fc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { padding: 40px; text-align: center; background: linear-gradient(135deg, #D4A574 0%, #6B8E70 100%); }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .content { padding: 40px; }
    .comment-box { background: #F5F5F5; border-left: 4px solid #6B5D4F; padding: 16px; margin: 24px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6B5D4F 0%, #6B8E70 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .footer { padding: 40px; text-align: center; color: #666; font-size: 14px; background: #F9FAFB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 @Mention</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.toName},</p>
      
      <p><strong>${data.mentionedBy}</strong> mentioned you in a comment on <strong>${data.projectName}</strong>:</p>
      
      <div class="comment-box">
        "${data.comment}"
      </div>
      
      <div style="text-align: center;">
        <a href="${data.viewLink}" class="button">View Comment</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Cortexia AI</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for Approval Request Email
 */
function renderApprovalRequestEmail(data: ApprovalRequestEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Approval Request: ${data.generationTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f9fc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { padding: 40px; text-align: center; background: linear-gradient(135deg, #6B5D4F 0%, #6B8E70 100%); }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .content { padding: 40px; }
    .preview { border-radius: 12px; overflow: hidden; margin: 24px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .preview img { width: 100%; height: auto; display: block; }
    .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6B5D4F 0%, #6B8E70 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .footer { padding: 40px; text-align: center; color: #666; font-size: 14px; background: #F9FAFB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Approval Request</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.toName},</p>
      
      <p><strong>${data.requesterName}</strong> has submitted <strong>"${data.generationTitle}"</strong> for your approval.</p>
      
      <div class="preview">
        <img src="${data.generationImageUrl}" alt="${data.generationTitle}">
      </div>
      
      <div style="text-align: center;">
        <a href="${data.approveLink}" class="button">Review & Approve</a>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 24px;">
        You can approve, reject, or request changes.
      </p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Cortexia AI</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for Approval Decision Email
 */
function renderApprovalDecisionEmail(data: ApprovalDecisionEmailData): string {
  const decisionConfig = {
    approved: {
      icon: '✅',
      title: 'Design Approved!',
      color: '#4CAF50',
      message: 'Good news! Your design has been approved.',
    },
    rejected: {
      icon: '❌',
      title: 'Design Rejected',
      color: '#F44336',
      message: 'Your design has been rejected.',
    },
    changes_requested: {
      icon: '💬',
      title: 'Changes Requested',
      color: '#FF9800',
      message: 'Changes have been requested for your design.',
    },
  };
  
  const config = decisionConfig[data.decision];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f9fc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { padding: 40px; text-align: center; background: ${config.color}; }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .content { padding: 40px; }
    .preview { border-radius: 12px; overflow: hidden; margin: 24px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .preview img { width: 100%; height: auto; display: block; }
    .comment-box { background: #F5F5F5; border-left: 4px solid ${config.color}; padding: 16px; margin: 24px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 16px 32px; background: ${config.color}; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .footer { padding: 40px; text-align: center; color: #666; font-size: 14px; background: #F9FAFB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.icon} ${config.title}</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.toName},</p>
      
      <p>${config.message}</p>
      
      <p><strong>${data.approverName}</strong> has ${data.decision === 'approved' ? 'approved' : data.decision === 'rejected' ? 'rejected' : 'requested changes to'} <strong>"${data.generationTitle}"</strong>.</p>
      
      <div class="preview">
        <img src="${data.generationImageUrl}" alt="${data.generationTitle}">
      </div>
      
      ${data.comment ? `
      <div class="comment-box">
        <p style="margin: 0; font-weight: 600; color: ${config.color};">Feedback:</p>
        <p style="margin: 8px 0 0 0;">"${data.comment}"</p>
      </div>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="${data.viewLink}" class="button">${data.decision === 'approved' ? 'View Final' : 'View & Edit'}</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Cortexia AI</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send Team Invitation Email
 */
export async function sendTeamInviteEmail(data: TeamInviteEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.toEmail,
      subject: `You've been invited to join ${data.teamName} on Cortexia`,
      html: renderTeamInviteEmail(data),
    });
    
    if (error) {
      console.error('Failed to send team invite email:', error);
      throw error;
    }
    
    console.log('✅ Team invite email sent:', result?.id);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

/**
 * Send @Mention Notification Email
 */
export async function sendMentionEmail(data: MentionEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.toEmail,
      subject: `[@Mention] ${data.mentionedBy} mentioned you in ${data.projectName}`,
      html: renderMentionEmail(data),
    });
    
    if (error) {
      console.error('Failed to send mention email:', error);
      throw error;
    }
    
    console.log('✅ Mention email sent:', result?.id);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

/**
 * Send Approval Request Email
 */
export async function sendApprovalRequestEmail(data: ApprovalRequestEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.toEmail,
      subject: `[Approval Request] ${data.generationTitle} needs your review`,
      html: renderApprovalRequestEmail(data),
    });
    
    if (error) {
      console.error('Failed to send approval request email:', error);
      throw error;
    }
    
    console.log('✅ Approval request email sent:', result?.id);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

/**
 * Send Approval Decision Email
 */
export async function sendApprovalDecisionEmail(data: ApprovalDecisionEmailData) {
  try {
    const decisionLabels = {
      approved: 'approved',
      rejected: 'rejected',
      changes_requested: 'requested changes to',
    };
    
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.toEmail,
      subject: `[Decision] Your design "${data.generationTitle}" was ${decisionLabels[data.decision]}`,
      html: renderApprovalDecisionEmail(data),
    });
    
    if (error) {
      console.error('Failed to send approval decision email:', error);
      throw error;
    }
    
    console.log('✅ Approval decision email sent:', result?.id);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

/**
 * Send Comment Reply Email
 */
export async function sendCommentReplyEmail(data: CommentReplyEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.toEmail,
      subject: `[Reply] ${data.replierName} replied to your comment`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #6B5D4F; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>💬 New Reply</h2>
    <p>Hi ${data.toName},</p>
    <p><strong>${data.replierName}</strong> replied to your comment on <strong>${data.projectName}</strong>.</p>
    <div style="background: #F5F5F5; padding: 16px; margin: 16px 0; border-radius: 8px;">
      <p><strong>Your comment:</strong></p>
      <p>"${data.originalComment}"</p>
      <p><strong>Their reply:</strong></p>
      <p>"${data.replyComment}"</p>
    </div>
    <a href="${data.viewLink}" class="button">View Conversation</a>
  </div>
</body>
</html>
      `,
    });
    
    if (error) {
      console.error('Failed to send comment reply email:', error);
      throw error;
    }
    
    console.log('✅ Comment reply email sent:', result?.id);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}
