/**
 * COCONUT V14 - CREDITS ROUTES
 * Routes for managing user credits
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import { getUserCredits } from './credits-manager.ts'; // ✅ Import credits manager
import { getEnterpriseSubscription } from './enterprise-subscription.ts'; // ✅ FIXED: Import from correct file

const app = new Hono();

console.log('💰 Credits routes module loaded');

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// ✅ DEBUG: Test endpoint to verify route is working
app.get('/credits/test', async (c) => {
  console.log('✅ TEST ENDPOINT HIT!');
  
  // Also try to get credits for a test user to verify getUserCredits works
  const testUserId = 'test-user-123';
  const testCredits = await getUserCredits(testUserId);
  
  return c.json({ 
    success: true, 
    message: 'Credits routes are working!',
    timestamp: new Date().toISOString(),
    testCredits // Show what getUserCredits returns for a test user
  });
});

// ✅ DEBUG: Direct DB check for a specific user
app.get('/credits/debug/:userId', async (c) => {
  try {
    const rawUserId = c.req.param('userId');
    const userId = decodeURIComponent(rawUserId);
    
    console.log(`🔍 [DEBUG] Checking DB for userId: "${userId}"`);
    
    // Check both storage keys
    const profile = await kv.get(`user:profile:${userId}`);
    const credits = await kv.get(`user:${userId}:credits`);
    
    console.log(`🔍 [DEBUG] Profile:`, profile);
    console.log(`🔍 [DEBUG] Credits:`, credits);
    
    return c.json({
      success: true,
      userId,
      rawUserId,
      profile: profile || null,
      credits: credits || null,
      profileType: typeof profile,
      creditsType: typeof credits,
      profileKeys: profile ? Object.keys(profile) : [],
      creditsKeys: credits ? Object.keys(credits) : []
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, 500);
  }
});

/**
 * POST /credits/migrate
 * Migrate paid credits from one userId to another
 * ⚠️ ADMIN ONLY - Used to fix userId mismatches
 */
app.post('/credits/migrate', async (c) => {
  try {
    const { fromUserId, toUserId } = await c.req.json();
    
    if (!fromUserId || !toUserId) {
      return c.json({
        success: false,
        error: 'Missing fromUserId or toUserId'
      }, 400);
    }
    
    console.log(`🔄 [MIGRATION] Starting credit migration: ${fromUserId} → ${toUserId}`);
    
    // Get source credits
    const sourceKey = `credits:${fromUserId}:paid`;
    const sourcePaidCredits = await kv.get(sourceKey) || 0;
    
    console.log(`📦 [MIGRATION] Source (${fromUserId}): ${sourcePaidCredits} paid credits`);
    
    if (Number(sourcePaidCredits) === 0) {
      return c.json({
        success: false,
        error: `No paid credits found for user ${fromUserId}`,
        sourceCredits: sourcePaidCredits
      }, 400);
    }
    
    // Get destination credits
    const destKey = `credits:${toUserId}:paid`;
    const destPaidCredits = await kv.get(destKey) || 0;
    
    console.log(`📦 [MIGRATION] Destination (${toUserId}): ${destPaidCredits} paid credits (before migration)`);
    
    // Add source credits to destination
    const newDestCredits = Number(destPaidCredits) + Number(sourcePaidCredits);
    await kv.set(destKey, newDestCredits);
    
    // Clear source credits
    await kv.set(sourceKey, 0);
    
    console.log(`✅ [MIGRATION] Migrated ${sourcePaidCredits} credits: ${fromUserId} → ${toUserId}`);
    console.log(`✅ [MIGRATION] New balance for ${toUserId}: ${newDestCredits} paid credits`);
    
    return c.json({
      success: true,
      migration: {
        from: fromUserId,
        to: toUserId,
        creditsMigrated: Number(sourcePaidCredits),
        oldBalance: Number(destPaidCredits),
        newBalance: newDestCredits
      },
      message: `Successfully migrated ${sourcePaidCredits} credits from ${fromUserId} to ${toUserId}`
    });
    
  } catch (error: any) {
    console.error('❌ [MIGRATION] Error:', error);
    return c.json({
      success: false,
      error: 'Migration failed',
      message: error.message
    }, 500);
  }
});

// ============================================
// ROUTES
// ============================================

/**
 * GET /credits/:userId
 * Get user credit balance
 */
app.get('/credits/:userId', async (c) => {
  try {
    // ✅ Decode userId to handle URL-encoded characters
    const rawUserId = c.req.param('userId');
    const userId = decodeURIComponent(rawUserId);
    
    console.log(`📊 [Credits Route] ====== START GET CREDITS ======`);
    console.log(`📊 [Credits Route] Raw userId param: "${rawUserId}"`);
    console.log(`📊 [Credits Route] Decoded userId: "${userId}"`);
    
    // ✅ CHECK: Is this user Enterprise?
    const enterpriseSub = await getEnterpriseSubscription(userId);
    
    if (enterpriseSub) {
      // ✅ ENTERPRISE USER: Return monthly + add-on credits
      console.log(`💼 [Credits Route] Enterprise user detected`);
      console.log(`📊 [Credits Route] Monthly: ${enterpriseSub.subscriptionCreditsRemaining}, Add-on: ${enterpriseSub.addOnCredits}, Total: ${enterpriseSub.totalCredits}`);
      
      const result = {
        success: true,
        credits: {
          free: 0,
          paid: enterpriseSub.addOnCredits, // ✅ Keep compatibility: paid = add-on for Enterprise
          
          // ✅ NEW: Enterprise-specific fields
          isEnterprise: true,
          monthlyCredits: enterpriseSub.monthlyCredits,
          monthlyCreditsRemaining: enterpriseSub.subscriptionCreditsRemaining,
          addOnCredits: enterpriseSub.addOnCredits,
          nextResetDate: enterpriseSub.currentPeriodEnd,
        },
        balance: enterpriseSub.totalCredits,
        daysUntilReset: Math.ceil((new Date(enterpriseSub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        formatted: `${enterpriseSub.totalCredits.toLocaleString()} crédits`
      };
      
      console.log(`📊 [Credits Route] Returning Enterprise result:`, JSON.stringify(result));
      console.log(`📊 [Credits Route] ====== END GET CREDITS ======`);
      
      return c.json(result);
    }
    
    // ✅ REGULAR USER: Use getUserCredits() which handles priority logic
    const userCredits = await getUserCredits(userId);
    
    console.log(`📊 [Credits Route] Regular user - getUserCredits returned:`, JSON.stringify(userCredits, null, 2));
    
    const balance = userCredits.free + userCredits.paid;
    
    console.log(`📊 [Credits Route] Calculated balance: ${balance} (free: ${userCredits.free}, paid: ${userCredits.paid})`);
    
    const result = {
      success: true,
      credits: {
        free: userCredits.free || 0,
        paid: userCredits.paid || 0,
        expiresAt: null
      },
      balance,
      daysUntilReset: 30,
      formatted: `${balance.toLocaleString()} crédits`
    };
    
    console.log(`📊 [Credits Route] Returning result:`, JSON.stringify(result));
    console.log(`📊 [Credits Route] ====== END GET CREDITS ======`);
    
    return c.json(result);
  } catch (error: any) {
    console.error('❌ [Credits Route] Get credits error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch credits',
      message: error.message
    }, 500);
  }
});

/**
 * POST /credits/:userId/add
 * Add credits to user (for testing/admin)
 */
app.post('/credits/:userId/add', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { amount, type = 'free' } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid amount'
      }, 400);
    }
    
    const userCredits = await kv.get(`user:${userId}:credits`) || { free: 0, paid: 0 };
    
    if (type === 'free') {
      (userCredits as any).free += amount;
    } else {
      (userCredits as any).paid += amount;
    }
    
    await kv.set(`user:${userId}:credits`, userCredits);
    
    return c.json({
      success: true,
      credits: userCredits
    });

  } catch (error) {
    console.error('❌ Error adding credits:', error);
    return c.json({
      success: false,
      error: 'Failed to add credits'
    }, 500);
  }
});

export default app;