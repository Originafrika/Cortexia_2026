/**
 * DEBUG ROUTES
 * Development endpoints for testing and debugging
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { getUserCredits } from './credits-manager.ts';

const app = new Hono();

// ✅ REMOVED: /credits/:userId route - this is mounted at /debug, so it would be /debug/credits/:userId
// Use /credits/:userId from coconut-v14-credits-routes.ts instead

/**
 * POST /init-credits/:userId
 * Initialize credits for a user (DEBUG ONLY)
 */
app.post('/init-credits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const free = body.free ?? 25;
    const paid = body.paid ?? 0;
    
    console.log(`💳 [Debug] Initializing credits for ${userId}: free=${free}, paid=${paid}`);
    
    // Store credits directly
    await kv.set(`user:credits:${userId}`, {
      free,
      paid,
      lastReset: new Date().toISOString()
    });
    
    const credits = await getUserCredits(userId);
    
    console.log(`✅ [Debug] Credits initialized: ${JSON.stringify(credits)}`);
    
    return c.json({
      success: true,
      userId,
      credits,
      message: `Initialized ${userId} with ${free} free + ${paid} paid credits`
    });
  } catch (error: any) {
    console.error('❌ [Debug] Init credits error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * DELETE /delete-credits/:userId
 * Delete credits for a user
 */
app.delete('/delete-credits/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log(`🗑️ [Debug] Deleting credits for: ${userId}`);
    
    await kv.del(`user:credits:${userId}`);
    
    return c.json({
      success: true,
      userId,
      message: `Credits deleted for ${userId}`
    });
  } catch (error: any) {
    console.error('❌ [Debug] Delete credits error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /all-credits
 * List all credits in the DB
 */
app.get('/all-credits', async (c) => {
  try {
    const allCredits = await kv.getByPrefix('user:credits:');
    
    return c.json({
      success: true,
      count: allCredits.length,
      credits: allCredits
    });
  } catch (error: any) {
    console.error('❌ [Debug] Get all credits error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /user/:userId
 * Retrieve all data for a user
 */
app.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const credits = await kv.get(`user:credits:${userId}`);
    const profile = await kv.get(`user:profile:${userId}`);
    const stats = await kv.get(`user:stats:${userId}`);
    
    return c.json({
      success: true,
      userId,
      data: {
        credits,
        profile,
        stats
      }
    });
  } catch (error: any) {
    console.error('❌ [Debug] Get user error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * POST /fix-all-users
 * Synchronize credits for all existing users
 */
app.post('/fix-all-users', async (c) => {
  try {
    const allProfiles = await kv.getByPrefix('user:profile:');
    
    let fixed = 0;
    for (const profile of allProfiles) {
      const userId = profile.value?.userId;
      if (userId) {
        // Initialize credits if not exist
        const existing = await kv.get(`user:credits:${userId}`);
        if (!existing) {
          await kv.set(`user:credits:${userId}`, {
            free: 25,
            paid: 0,
            lastReset: new Date().toISOString()
          });
          fixed++;
        }
      }
    }
    
    return c.json({
      success: true,
      message: `Fixed ${fixed} users`,
      count: fixed
    });
  } catch (error: any) {
    console.error('❌ [Debug] Fix all users error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;