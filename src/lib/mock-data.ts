/**
 * MOCK DATA - Demo data for Cortexia Creation Hub
 * 
 * Provides realistic mock data for all features
 */

import { nanoid } from 'npm:nanoid';

// ============================================
// MOCK NOTIFICATIONS
// ============================================

export function generateMockNotifications(count = 10) {
  const types = ['success', 'info', 'warning', 'team', 'system'] as const;
  const templates = [
    { type: 'success', title: 'Generation Complete', message: 'Your AI generation is ready to view' },
    { type: 'info', title: 'New Feature', message: 'Batch generation is now available for Enterprise users' },
    { type: 'warning', title: 'Credits Low', message: 'You have 50 credits remaining' },
    { type: 'team', title: 'Team Invitation', message: 'John invited you to join Marketing Team' },
    { type: 'system', title: 'Maintenance', message: 'Scheduled maintenance on Jan 30th' },
    { type: 'success', title: 'Webhook Delivered', message: 'generation.complete webhook sent successfully' },
    { type: 'team', title: 'Approval Request', message: 'Sarah requested approval for campaign design' },
    { type: 'info', title: 'API Key Created', message: 'New API key "Production" was created' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length];
    return {
      id: nanoid(16),
      type: template.type,
      title: template.title,
      message: template.message,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: Math.random() > 0.4,
    };
  });
}

// ============================================
// MOCK API KEYS
// ============================================

export function generateMockApiKeys(count = 3) {
  const names = ['Production', 'Development', 'Staging', 'Testing', 'Mobile App'];
  const scopes = ['read', 'write', 'generate', 'webhook'];

  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(16),
    name: names[i % names.length],
    key: `crtx_${nanoid(32)}`,
    scopes: scopes.slice(0, Math.floor(Math.random() * 4) + 1),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
    usageCount: Math.floor(Math.random() * 5000),
    status: 'active',
  }));
}

// ============================================
// MOCK WEBHOOKS
// ============================================

export function generateMockWebhooks(count = 2) {
  const urls = [
    'https://api.example.com/webhooks/cortexia',
    'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
    'https://webhook.site/unique-id',
  ];
  
  const events = [
    ['generation.complete', 'generation.failed'],
    ['generation.complete'],
    ['generation.complete', 'generation.started', 'generation.failed'],
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(16),
    url: urls[i % urls.length],
    events: events[i % events.length],
    secret: nanoid(32),
    status: 'active',
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggered: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString() : null,
    deliveryCount: Math.floor(Math.random() * 1000),
    failureCount: Math.floor(Math.random() * 10),
  }));
}

// ============================================
// MOCK WATERMARKS
// ============================================

export function generateMockWatermarks(count = 2) {
  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(16),
    name: i === 0 ? 'Default Watermark' : 'Brand Logo',
    type: i === 0 ? 'text' : 'image',
    text: i === 0 ? '© Cortexia 2026' : '',
    imageUrl: i === 1 ? 'https://via.placeholder.com/200x50' : '',
    position: ['bottom-right', 'bottom-left', 'top-right'][i % 3],
    opacity: 0.7,
    size: 'medium',
    isDefault: i === 0,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

// ============================================
// MOCK TEAM MEMBERS
// ============================================

export function generateMockTeamMembers(count = 5) {
  const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez'];
  const roles = ['owner', 'admin', 'member', 'member', 'viewer'];
  const emails = ['john@example.com', 'sarah@example.com', 'mike@example.com', 'emily@example.com', 'alex@example.com'];

  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(16),
    userId: nanoid(16),
    displayName: names[i % names.length],
    email: emails[i % emails.length],
    role: roles[i % roles.length],
    status: 'active',
    joinedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

// ============================================
// MOCK APPROVALS
// ============================================

export function generateMockApprovals(count = 3) {
  const statuses = ['pending', 'approved', 'rejected'];

  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(16),
    generationId: nanoid(16),
    teamId: nanoid(16),
    requestedBy: nanoid(16),
    requestedByName: 'John Smith',
    approvers: [nanoid(16), nanoid(16)],
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    decidedAt: i > 0 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : null,
    decidedBy: i > 0 ? nanoid(16) : null,
    comment: i === 2 ? 'Please update the color scheme' : null,
  }));
}

// ============================================
// MOCK REFERRALS
// ============================================

export function generateMockReferrals(count = 5) {
  const statuses = ['pending', 'converted', 'converted', 'pending', 'converted'];
  const names = ['Alice Brown', 'Bob Wilson', 'Carol Martinez', 'David Lee', 'Eva Garcia'];

  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(16),
    userId: nanoid(16),
    name: names[i],
    email: `${names[i].split(' ')[0].toLowerCase()}@example.com`,
    status: statuses[i],
    signupDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    convertedDate: statuses[i] === 'converted' ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : null,
    earnings: statuses[i] === 'converted' ? 50 : 0,
  }));
}

// ============================================
// MOCK FEED ITEMS
// ============================================

export function generateMockFeedItems(count = 20) {
  const types = ['image', 'video', 'design', 'text'];
  const statuses = ['published', 'draft', 'archived'];

  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(16),
    type: types[i % types.length],
    title: `Generation ${i + 1}`,
    imageUrl: `https://picsum.photos/seed/${i}/800/600`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    likes: Math.floor(Math.random() * 200),
    views: Math.floor(Math.random() * 1000),
    tags: ['AI', 'Generated', 'Creative'].slice(0, Math.floor(Math.random() * 3) + 1),
    isLiked: Math.random() > 0.7,
  }));
}

// ============================================
// MOCK USAGE STATS
// ============================================

export function generateMockUsageStats() {
  const days = 30;
  const requestsByDay = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requests: Math.floor(Math.random() * 100) + 20,
    success: Math.floor(Math.random() * 90) + 10,
    errors: Math.floor(Math.random() * 5),
  }));

  return {
    totalRequests: requestsByDay.reduce((sum, day) => sum + day.requests, 0),
    totalImages: Math.floor(Math.random() * 500) + 100,
    totalVideos: Math.floor(Math.random() * 200) + 50,
    totalCredits: Math.floor(Math.random() * 10000) + 2000,
    requestsByDay,
    requestsByEndpoint: {
      '/generate': Math.floor(Math.random() * 1000) + 500,
      '/analyze': Math.floor(Math.random() * 500) + 200,
      '/upload': Math.floor(Math.random() * 300) + 100,
    },
    averageResponseTime: Math.random() * 2 + 1, // 1-3 seconds
  };
}

// ============================================
// MOCK CREATOR ANALYTICS
// ============================================

export function generateMockCreatorAnalytics() {
  return {
    totalRevenue: Math.floor(Math.random() * 5000) + 1000,
    totalGenerations: Math.floor(Math.random() * 500) + 100,
    totalLikes: Math.floor(Math.random() * 2000) + 500,
    totalFollowers: Math.floor(Math.random() * 1000) + 200,
    revenueByMonth: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.floor(Math.random() * 1000) + 200,
    })),
    topContent: Array.from({ length: 5 }, (_, i) => ({
      id: nanoid(16),
      title: `Top Content ${i + 1}`,
      likes: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 200) + 50,
    })),
    engagement: {
      averageLikes: Math.floor(Math.random() * 50) + 10,
      averageShares: Math.floor(Math.random() * 20) + 5,
      engagementRate: (Math.random() * 5 + 2).toFixed(1), // 2-7%
    },
  };
}

// ============================================
// EXPORT ALL
// ============================================

export const mockData = {
  notifications: generateMockNotifications,
  apiKeys: generateMockApiKeys,
  webhooks: generateMockWebhooks,
  watermarks: generateMockWatermarks,
  teamMembers: generateMockTeamMembers,
  approvals: generateMockApprovals,
  referrals: generateMockReferrals,
  feedItems: generateMockFeedItems,
  usageStats: generateMockUsageStats,
  creatorAnalytics: generateMockCreatorAnalytics,
};

export default mockData;
