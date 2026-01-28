/**
 * MOCK DATA INITIALIZER - Populate backend with demo data
 * 
 * Run this to populate the backend with realistic demo data
 */

import * as kv from './kv_store.tsx';
import { nanoid } from 'npm:nanoid';

const DEMO_USER_ID = 'demo-user-enterprise';

export async function initializeMockData() {
  console.log('🎭 [MockData] Initializing demo data...');
  
  try {
    // Check if already initialized
    const existing = await kv.get(`mock-data-initialized:${DEMO_USER_ID}`);
    if (existing) {
      console.log('✅ [MockData] Demo data already initialized');
      return;
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================
    const notifications = [
      {
        id: nanoid(16),
        type: 'success',
        title: 'Generation Complete',
        message: 'Your AI generation "Summer Campaign" is ready to view',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: nanoid(16),
        type: 'team',
        title: 'Approval Request',
        message: 'Sarah requested approval for the new product design',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: nanoid(16),
        type: 'info',
        title: 'New Feature Available',
        message: 'Batch generation is now available for Enterprise users',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ];
    await kv.set(`notifications:${DEMO_USER_ID}`, notifications);
    console.log('✅ [MockData] Notifications created');

    // ============================================
    // API KEYS
    // ============================================
    const apiKeys = [
      {
        id: nanoid(16),
        name: 'Production',
        key: `crtx_${nanoid(32)}`,
        scopes: ['read', 'write', 'generate'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        usageCount: 1247,
        status: 'active',
      },
      {
        id: nanoid(16),
        name: 'Development',
        key: `crtx_${nanoid(32)}`,
        scopes: ['read', 'generate'],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        usageCount: 89,
        status: 'active',
      },
    ];
    await kv.set(`developer:api-keys:${DEMO_USER_ID}`, apiKeys);
    console.log('✅ [MockData] API keys created');

    // ============================================
    // WEBHOOKS
    // ============================================
    const webhooks = [
      {
        id: nanoid(16),
        url: 'https://api.example.com/webhooks/cortexia',
        events: ['generation.complete', 'generation.failed'],
        secret: nanoid(32),
        status: 'active',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        deliveryCount: 523,
        failureCount: 2,
      },
    ];
    await kv.set(`developer:webhooks:${DEMO_USER_ID}`, webhooks);
    console.log('✅ [MockData] Webhooks created');

    // ============================================
    // USAGE STATS
    // ============================================
    const usageStats = {
      totalRequests: 1336,
      totalImages: 845,
      totalVideos: 123,
      totalCredits: 4200,
      requestsByDay: [],
      requestsByEndpoint: {
        '/generate': 890,
        '/analyze': 346,
        '/upload': 100,
      },
      averageResponseTime: 1.8,
    };
    await kv.set(`developer:usage:${DEMO_USER_ID}`, usageStats);
    console.log('✅ [MockData] Usage stats created');

    // ============================================
    // WATERMARKS
    // ============================================
    const watermarks = [
      {
        id: nanoid(16),
        name: 'Default Brand',
        type: 'text',
        text: '© Cortexia 2026',
        imageUrl: '',
        position: 'bottom-right',
        opacity: 0.7,
        size: 'medium',
        isDefault: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    await kv.set(`creator:watermarks:${DEMO_USER_ID}`, watermarks);
    console.log('✅ [MockData] Watermarks created');

    // ============================================
    // TRACKING DATA
    // ============================================
    const trackingData = {
      totalImpressions: 12543,
      totalClicks: 892,
      totalShares: 234,
      byPlatform: {
        twitter: { impressions: 5234, clicks: 423, shares: 123 },
        instagram: { impressions: 4523, clicks: 312, shares: 89 },
        facebook: { impressions: 2786, clicks: 157, shares: 22 },
      },
      byContent: {},
      timeline: [],
    };
    await kv.set(`creator:tracking:${DEMO_USER_ID}`, trackingData);
    console.log('✅ [MockData] Tracking data created');

    // ============================================
    // CREATOR ANALYTICS
    // ============================================
    const creatorAnalytics = {
      totalRevenue: 3420,
      totalGenerations: 234,
      totalLikes: 1523,
      totalFollowers: 456,
      revenueByMonth: [
        { month: 'Aug', revenue: 420 },
        { month: 'Sep', revenue: 580 },
        { month: 'Oct', revenue: 720 },
        { month: 'Nov', revenue: 850 },
        { month: 'Dec', revenue: 920 },
        { month: 'Jan', revenue: 930 },
      ],
      topContent: [],
      engagement: {
        averageLikes: 32,
        averageShares: 12,
        engagementRate: 4.2,
      },
    };
    await kv.set(`creator:analytics:${DEMO_USER_ID}`, creatorAnalytics);
    console.log('✅ [MockData] Creator analytics created');

    // ============================================
    // REFERRAL DATA
    // ============================================
    const referralCode = nanoid(10).toUpperCase();
    const referralData = {
      referralCode,
      userId: DEMO_USER_ID,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      totalReferrals: 12,
      activeReferrals: 8,
      pendingReferrals: 4,
      totalEarnings: 400,
      pendingEarnings: 200,
      currentTier: 'Gold',
      referrals: [
        {
          id: nanoid(16),
          userId: nanoid(16),
          email: 'alice@example.com',
          name: 'Alice Brown',
          status: 'converted',
          signupDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          convertedDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
          earnings: 50,
        },
        {
          id: nanoid(16),
          userId: nanoid(16),
          email: 'bob@example.com',
          name: 'Bob Wilson',
          status: 'pending',
          signupDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          earnings: 50,
        },
      ],
    };
    await kv.set(`referral:data:${DEMO_USER_ID}`, referralData);
    await kv.set(`referral:code:${referralCode}`, DEMO_USER_ID);
    console.log('✅ [MockData] Referral data created');

    // Mark as initialized
    await kv.set(`mock-data-initialized:${DEMO_USER_ID}`, {
      initialized: true,
      timestamp: new Date().toISOString(),
    });

    console.log('🎉 [MockData] All demo data initialized successfully!');
    
  } catch (error) {
    console.error('❌ [MockData] Error initializing demo data:', error);
    throw error;
  }
}

// Auto-initialize on import (run once at startup)
// initializeMockData().catch(console.error);
