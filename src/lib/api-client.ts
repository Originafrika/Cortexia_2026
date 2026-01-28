/**
 * API CLIENT - Centralized API calls for Cortexia Creation Hub
 * 
 * Provides type-safe API client for all backend routes
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API] ${endpoint} failed:`, data);
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error(`[API] ${endpoint} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// DEVELOPER API
// ============================================

export const developerAPI = {
  // API Keys
  getApiKeys: (userId: string) =>
    fetchAPI(`/developer/api-keys?userId=${userId}`),
  
  createApiKey: (userId: string, name: string, scopes: string[]) =>
    fetchAPI(`/developer/api-keys`, {
      method: 'POST',
      body: JSON.stringify({ userId, name, scopes }),
    }),
  
  deleteApiKey: (keyId: string, userId: string) =>
    fetchAPI(`/developer/api-keys/${keyId}?userId=${userId}`, {
      method: 'DELETE',
    }),

  // Usage
  getUsage: (userId: string) =>
    fetchAPI(`/developer/usage?userId=${userId}`),

  // Webhooks
  getWebhooks: (userId: string) =>
    fetchAPI(`/developer/webhooks?userId=${userId}`),
  
  createWebhook: (userId: string, url: string, events: string[], secret?: string) =>
    fetchAPI(`/developer/webhooks`, {
      method: 'POST',
      body: JSON.stringify({ userId, url, events, secret }),
    }),
  
  updateWebhook: (webhookId: string, userId: string, updates: any) =>
    fetchAPI(`/developer/webhooks/${webhookId}`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, ...updates }),
    }),
  
  deleteWebhook: (webhookId: string, userId: string) =>
    fetchAPI(`/developer/webhooks/${webhookId}?userId=${userId}`, {
      method: 'DELETE',
    }),
  
  testWebhook: (webhookId: string, userId: string) =>
    fetchAPI(`/developer/webhooks/${webhookId}/test`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

// ============================================
// CREATOR SYSTEM API
// ============================================

export const creatorSystemAPI = {
  // Watermarks
  getWatermarks: (userId: string) =>
    fetchAPI(`/creator-system/watermarks?userId=${userId}`),
  
  createWatermark: (watermark: any) =>
    fetchAPI(`/creator-system/watermarks`, {
      method: 'POST',
      body: JSON.stringify(watermark),
    }),
  
  updateWatermark: (id: string, userId: string, updates: any) =>
    fetchAPI(`/creator-system/watermarks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, ...updates }),
    }),
  
  deleteWatermark: (id: string, userId: string) =>
    fetchAPI(`/creator-system/watermarks/${id}?userId=${userId}`, {
      method: 'DELETE',
    }),

  // Tracking
  getTracking: (userId: string, period?: string) =>
    fetchAPI(`/creator-system/tracking?userId=${userId}${period ? `&period=${period}` : ''}`),
  
  getAnalytics: (userId: string) =>
    fetchAPI(`/creator-system/analytics?userId=${userId}`),
  
  trackImpression: (userId: string, contentId: string, platform?: string, type?: string) =>
    fetchAPI(`/creator-system/track-impression`, {
      method: 'POST',
      body: JSON.stringify({ userId, contentId, platform, type }),
    }),
};

// ============================================
// REFERRAL SYSTEM API
// ============================================

export const referralAPI = {
  getDashboard: (userId: string) =>
    fetchAPI(`/referral-system/dashboard?userId=${userId}`),
  
  trackReferral: (referralCode: string, newUserId: string, email?: string, name?: string) =>
    fetchAPI(`/referral-system/track`, {
      method: 'POST',
      body: JSON.stringify({ referralCode, newUserId, email, name }),
    }),
  
  convertReferral: (userId: string) =>
    fetchAPI(`/referral-system/convert`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

// ============================================
// ENHANCED FEED API
// ============================================

export const feedAPI = {
  getFeed: (userId: string, page = 1, limit = 20, type?: string, status?: string) => {
    const params = new URLSearchParams({
      userId,
      page: page.toString(),
      limit: limit.toString(),
    });
    if (type && type !== 'all') params.append('type', type);
    if (status && status !== 'all') params.append('status', status);
    
    return fetchAPI(`/enhanced-feed?${params.toString()}`);
  },
  
  bulkAction: (action: string, itemIds: string[], userId: string) =>
    fetchAPI(`/enhanced-feed/bulk-action`, {
      method: 'POST',
      body: JSON.stringify({ action, itemIds, userId }),
    }),
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  getNotifications: (userId: string) =>
    fetchAPI(`/notifications?userId=${userId}`),
  
  markAsRead: (notificationId: string, userId: string) =>
    fetchAPI(`/notifications/${notificationId}/read?userId=${userId}`, {
      method: 'POST',
    }),
  
  markAllAsRead: (userId: string) =>
    fetchAPI(`/notifications/read-all?userId=${userId}`, {
      method: 'POST',
    }),
  
  deleteNotification: (notificationId: string, userId: string) =>
    fetchAPI(`/notifications/${notificationId}?userId=${userId}`, {
      method: 'DELETE',
    }),
};

// ============================================
// TEAM API
// ============================================

export const teamAPI = {
  // Team Management
  createTeam: (enterpriseAccountId: string, name: string, userId: string, description?: string) =>
    fetchAPI(`/team/teams/create`, {
      method: 'POST',
      body: JSON.stringify({ enterpriseAccountId, name, userId, description }),
    }),
  
  getTeam: (teamId: string) =>
    fetchAPI(`/team/teams/${teamId}`),
  
  updateTeam: (teamId: string, updates: any) =>
    fetchAPI(`/team/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Members
  inviteMember: (teamId: string, userId: string, email: string, displayName: string, role: string, invitedBy: string) =>
    fetchAPI(`/team/teams/${teamId}/members/invite`, {
      method: 'POST',
      body: JSON.stringify({ userId, email, displayName, role, invitedBy }),
    }),
  
  getMembers: (teamId: string) =>
    fetchAPI(`/team/teams/${teamId}/members`),
  
  updateMemberRole: (teamId: string, userId: string, role: string, updatedBy: string) =>
    fetchAPI(`/team/teams/${teamId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, updatedBy }),
    }),
  
  removeMember: (teamId: string, userId: string, removedBy: string) =>
    fetchAPI(`/team/teams/${teamId}/members/${userId}?removedBy=${removedBy}`, {
      method: 'DELETE',
    }),

  // Comments
  addComment: (teamId: string, targetType: string, targetId: string, userId: string, userName: string, content: string, mentions?: string[]) =>
    fetchAPI(`/team/teams/${teamId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, userId, userName, content, mentions }),
    }),
  
  getComments: (teamId: string, targetType: string, targetId: string) =>
    fetchAPI(`/team/teams/${teamId}/comments/${targetType}/${targetId}`),
  
  resolveComment: (teamId: string, commentId: string) =>
    fetchAPI(`/team/teams/${teamId}/comments/${commentId}/resolve`, {
      method: 'PATCH',
    }),

  // Approvals
  createApproval: (teamId: string, generationId: string, requestedBy: string, approvers: string[], boardId?: string) =>
    fetchAPI(`/team/teams/${teamId}/approvals`, {
      method: 'POST',
      body: JSON.stringify({ generationId, requestedBy, approvers, boardId }),
    }),
  
  updateApproval: (teamId: string, requestId: string, status: string, decidedBy: string, comment?: string) =>
    fetchAPI(`/team/teams/${teamId}/approvals/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, decidedBy, comment }),
    }),
  
  getPendingApprovals: (teamId: string, userId: string) =>
    fetchAPI(`/team/teams/${teamId}/approvals/pending?userId=${userId}`),

  // Activities
  getActivities: (teamId: string, limit = 50) =>
    fetchAPI(`/team/teams/${teamId}/activities?limit=${limit}`),

  // Projects
  shareProject: (teamId: string, projectId: string, sharedBy: string) =>
    fetchAPI(`/team/teams/${teamId}/projects/${projectId}/share`, {
      method: 'POST',
      body: JSON.stringify({ sharedBy }),
    }),
  
  getProjects: (teamId: string) =>
    fetchAPI(`/team/teams/${teamId}/projects`),
};

export default {
  developer: developerAPI,
  creatorSystem: creatorSystemAPI,
  referral: referralAPI,
  feed: feedAPI,
  notifications: notificationsAPI,
  team: teamAPI,
};
