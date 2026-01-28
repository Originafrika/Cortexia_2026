/**
 * REFERRAL SYSTEM ROUTES
 * 
 * API endpoints for referral program
 * 
 * Routes:
 * - GET /referral-system/dashboard - Get referral dashboard data
 * - POST /referral-system/track - Track referral signup
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { nanoid } from 'npm:nanoid';

const app = new Hono();

console.log('🎁 Referral System routes module loaded');

// ============================================
// REFERRAL DASHBOARD
// ============================================

// Get referral dashboard data
app.get('/dashboard', async (c) => {
  console.log('🎁 [ReferralSystem] GET /referral-system/dashboard');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get or create referral code
    let referralData = await kv.get(`referral:data:${userId}`);
    
    if (!referralData) {
      // Create new referral data
      const referralCode = nanoid(10).toUpperCase();
      referralData = {
        referralCode,
        userId,
        createdAt: new Date().toISOString(),
        totalReferrals: 0,
        activeReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        currentTier: 'Bronze',
        referrals: []
      };
      
      await kv.set(`referral:data:${userId}`, referralData);
      await kv.set(`referral:code:${referralCode}`, userId);
    }
    
    // Calculate tier and progress
    const tiers = [
      { name: 'Bronze', required: 0 },
      { name: 'Silver', required: 5 },
      { name: 'Gold', required: 10 },
      { name: 'Platinum', required: 25 },
      { name: 'Diamond', required: 50 },
    ];
    
    let currentTier = tiers[0];
    let nextTier = tiers[1];
    
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (referralData.totalReferrals >= tiers[i].required) {
        currentTier = tiers[i];
        nextTier = i < tiers.length - 1 ? tiers[i + 1] : null;
        break;
      }
    }
    
    const nextTierProgress = nextTier 
      ? ((referralData.totalReferrals - currentTier.required) / (nextTier.required - currentTier.required)) * 100
      : 100;
    
    // Get leaderboard
    const allReferralData = await kv.getByPrefix('referral:data:') || [];
    const leaderboard = allReferralData
      .map((data: any, index: number) => ({
        rank: index + 1,
        userId: data.userId,
        name: `User ${data.userId.substring(0, 8)}`,
        referrals: data.totalReferrals,
        earnings: data.totalEarnings,
        isCurrentUser: data.userId === userId
      }))
      .sort((a: any, b: any) => b.referrals - a.referrals)
      .map((entry: any, index: number) => ({ ...entry, rank: index + 1 }))
      .slice(0, 10);
    
    const stats = {
      totalReferrals: referralData.totalReferrals,
      activeReferrals: referralData.activeReferrals,
      pendingReferrals: referralData.pendingReferrals,
      totalEarnings: referralData.totalEarnings,
      pendingEarnings: referralData.pendingEarnings,
      currentTier: currentTier.name,
      nextTierProgress
    };
    
    console.log(`✅ [ReferralSystem] Dashboard data retrieved for ${userId}`);
    
    return c.json({
      success: true,
      data: {
        referralCode: referralData.referralCode,
        referralLink: `https://cortexia.app/signup?ref=${referralData.referralCode}`,
        stats,
        referrals: referralData.referrals || [],
        leaderboard
      }
    });
    
  } catch (error) {
    console.error('❌ [ReferralSystem] Error fetching dashboard:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// TRACK REFERRAL
// ============================================

// Track referral signup
app.post('/track', async (c) => {
  console.log('🎁 [ReferralSystem] POST /referral-system/track');
  
  try {
    const body = await c.req.json();
    const { referralCode, newUserId, email, name } = body;
    
    if (!referralCode || !newUserId) {
      return c.json({
        success: false,
        error: 'Missing required fields: referralCode, newUserId'
      }, 400);
    }
    
    // Get referrer user ID from code
    const referrerId = await kv.get(`referral:code:${referralCode}`);
    
    if (!referrerId) {
      return c.json({
        success: false,
        error: 'Invalid referral code'
      }, 404);
    }
    
    // Get referral data
    const referralData = await kv.get(`referral:data:${referrerId}`);
    
    if (!referralData) {
      return c.json({
        success: false,
        error: 'Referral data not found'
      }, 404);
    }
    
    // Check if this user was already referred
    const existingReferral = referralData.referrals.find((r: any) => r.userId === newUserId);
    
    if (existingReferral) {
      console.log(`⚠️ [ReferralSystem] User ${newUserId} already referred`);
      return c.json({
        success: true,
        data: { message: 'User already tracked' }
      });
    }
    
    // Add new referral
    const newReferral = {
      id: nanoid(16),
      userId: newUserId,
      email: email || '',
      name: name || '',
      status: 'pending',
      signupDate: new Date().toISOString(),
      earnings: 50 // Base reward
    };
    
    referralData.referrals.push(newReferral);
    referralData.totalReferrals++;
    referralData.pendingReferrals++;
    referralData.pendingEarnings += 50;
    
    // Save updated data
    await kv.set(`referral:data:${referrerId}`, referralData);
    
    console.log(`✅ [ReferralSystem] Referral tracked: ${newUserId} → ${referrerId}`);
    
    return c.json({
      success: true,
      data: { message: 'Referral tracked successfully' }
    });
    
  } catch (error) {
    console.error('❌ [ReferralSystem] Error tracking referral:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// CONVERT REFERRAL (when user subscribes)
// ============================================

app.post('/convert', async (c) => {
  console.log('🎁 [ReferralSystem] POST /referral-system/convert');
  
  try {
    const body = await c.req.json();
    const { userId } = body;
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing required field: userId'
      }, 400);
    }
    
    // Find which referrer referred this user
    const allReferralData = await kv.getByPrefix('referral:data:') || [];
    
    for (const referralData of allReferralData) {
      const referral = referralData.referrals.find((r: any) => r.userId === userId);
      
      if (referral && referral.status === 'pending') {
        // Convert referral
        referral.status = 'converted';
        referral.convertedDate = new Date().toISOString();
        
        // Update stats
        referralData.pendingReferrals--;
        referralData.activeReferrals++;
        referralData.pendingEarnings -= referral.earnings;
        referralData.totalEarnings += referral.earnings;
        
        // Save
        await kv.set(`referral:data:${referralData.userId}`, referralData);
        
        console.log(`✅ [ReferralSystem] Referral converted: ${userId}`);
        
        return c.json({
          success: true,
          data: { message: 'Referral converted successfully' }
        });
      }
    }
    
    console.log(`⚠️ [ReferralSystem] No pending referral found for ${userId}`);
    
    return c.json({
      success: true,
      data: { message: 'No pending referral found' }
    });
    
  } catch (error) {
    console.error('❌ [ReferralSystem] Error converting referral:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
