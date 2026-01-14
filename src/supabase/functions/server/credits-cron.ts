/**
 * CREDITS CRON - Monthly Credits Reset System
 * 
 * This endpoint should be called by a cron job on the 1st of each month at 00:00 UTC
 * 
 * Setup:
 * - Use Supabase Edge Functions cron (pg_cron extension)
 * - Or external service like cron-job.org, EasyCron, etc.
 * - Schedule: "0 0 1 * *" (first day of month at midnight)
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface CreditResetLog {
  userId: string;
  previousFree: number;
  newFree: number;
  resetDate: string;
  month: string; // "2026-01"
}

// ============================================================================
// MONTHLY RESET ENDPOINT
// ============================================================================

/**
 * POST /credits/monthly-reset
 * Reset all users' free credits to 25
 * Protection: Only resets once per month via last_reset_month check
 */
app.post('/monthly-reset', async (c) => {
  try {
    console.log('🔄 Starting monthly credits reset...');
    
    const currentMonth = getCurrentMonth(); // "2026-01"
    const resetDate = new Date().toISOString();
    
    // Get all user profiles
    const allProfiles = await kv.getByPrefix('user:profile:') || [];
    
    if (!allProfiles || allProfiles.length === 0) {
      console.log('⚠️ No user profiles found');
      return c.json({
        success: true,
        message: 'No users to reset',
        count: 0,
        month: currentMonth
      });
    }
    
    let resetCount = 0;
    let skippedCount = 0;
    const resetLogs: CreditResetLog[] = [];
    
    for (const profile of allProfiles) {
      try {
        const userId = profile.userId;
        
        // Check if already reset this month
        const lastResetMonth = await kv.get(`credits:reset:${userId}:last_month`);
        
        if (lastResetMonth === currentMonth) {
          console.log(`⏭️ User ${userId} already reset this month`);
          skippedCount++;
          continue;
        }
        
        // Get current credits
        const previousFree = profile.freeCredits || 0;
        
        // Reset free credits to 25
        profile.freeCredits = 25;
        profile.updatedAt = resetDate;
        
        // Save updated profile
        await kv.set(`user:profile:${userId}`, profile);
        
        // Mark as reset for this month
        await kv.set(`credits:reset:${userId}:last_month`, currentMonth);
        
        // Log the reset
        const resetLog: CreditResetLog = {
          userId,
          previousFree,
          newFree: 25,
          resetDate,
          month: currentMonth
        };
        resetLogs.push(resetLog);
        
        // Save reset log
        const logsKey = `credits:reset:logs:${currentMonth}`;
        const existingLogs = await kv.get(logsKey) || [];
        existingLogs.push(resetLog);
        await kv.set(logsKey, existingLogs);
        
        resetCount++;
        
        console.log(`✅ Reset user ${userId}: ${previousFree} → 25 free credits`);
        
      } catch (error) {
        console.error(`❌ Error resetting user ${profile.userId}:`, error);
      }
    }
    
    // Save global reset stats
    const resetStats = {
      month: currentMonth,
      date: resetDate,
      totalUsers: allProfiles.length,
      resetCount,
      skippedCount,
      logs: resetLogs
    };
    
    await kv.set(`credits:reset:stats:${currentMonth}`, resetStats);
    
    console.log(`🎉 Monthly reset completed: ${resetCount} users reset, ${skippedCount} skipped`);
    
    return c.json({
      success: true,
      message: `Monthly credits reset completed`,
      stats: {
        month: currentMonth,
        totalUsers: allProfiles.length,
        resetCount,
        skippedCount
      },
      resetLogs: resetLogs.slice(0, 10) // Return first 10 for preview
    });
    
  } catch (error) {
    console.error('❌ Monthly reset error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset credits'
    }, 500);
  }
});

// ============================================================================
// CHECK RESET STATUS
// ============================================================================

/**
 * GET /credits/reset-status/:month
 * Check reset status for a specific month
 */
app.get('/reset-status/:month', async (c) => {
  try {
    const month = c.req.param('month') || getCurrentMonth();
    
    const stats = await kv.get(`credits:reset:stats:${month}`);
    
    if (!stats) {
      return c.json({
        success: false,
        message: 'No reset stats found for this month',
        month
      }, 404);
    }
    
    return c.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Check status error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check status'
    }, 500);
  }
});

// ============================================================================
// MANUAL RESET FOR SPECIFIC USER
// ============================================================================

/**
 * POST /credits/reset-user/:userId
 * Manually reset a specific user's free credits (admin only)
 */
app.post('/reset-user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'userId required'
      }, 400);
    }
    
    // Get user profile
    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'User profile not found'
      }, 404);
    }
    
    const previousFree = profile.freeCredits || 0;
    
    // Reset free credits to 25
    profile.freeCredits = 25;
    profile.updatedAt = new Date().toISOString();
    
    await kv.set(`user:profile:${userId}`, profile);
    
    console.log(`✅ Manual reset user ${userId}: ${previousFree} → 25 free credits`);
    
    return c.json({
      success: true,
      message: 'User credits reset successfully',
      userId,
      previousFree,
      newFree: 25
    });
    
  } catch (error) {
    console.error('❌ Manual reset error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset user'
    }, 500);
  }
});

// ============================================================================
// HELPERS
// ============================================================================

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default app;
