/**
 * COCONUT V14 - CREDITS ROUTES
 * Routes for managing user credits
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import { getUserCredits } from './credits-manager.ts'; // ✅ Import credits manager

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
    
    // ✅ Use getUserCredits() which handles priority logic
    const userCredits = await getUserCredits(userId);
    
    console.log(`📊 [Credits Route] getUserCredits returned:`, JSON.stringify(userCredits, null, 2));
    
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