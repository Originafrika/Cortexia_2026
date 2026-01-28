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
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system

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
    
    // ✅ NEW: Get all users from unified credits system (credits:*:free keys)
    const allFreeCreditsKeys = await kv.getByPrefix('credits:') || [];
    const userIds = new Set<string>();
    
    // Extract unique userIds from credits keys
    for (const key of allFreeCreditsKeys) {
      if (typeof key === 'string') {
        const match = key.match(/^credits:([^:]+):free$/);
        if (match) {
          userIds.add(match[1]);
        }
      } else if (key && typeof key === 'object' && 'key' in key) {
        // Handle case where getByPrefix returns objects with a 'key' property
        const keyStr = String(key.key || '');
        const match = keyStr.match(/^credits:([^:]+):free$/);
        if (match) {
          userIds.add(match[1]);
        }
      }
    }
    
    if (userIds.size === 0) {
      console.log('⚠️ No users found with credits');
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
    
    for (const userId of userIds) {
      try {
        // Check if already reset this month
        const lastResetMonth = await kv.get(`credits:reset:${userId}:last_month`);
        
        if (lastResetMonth === currentMonth) {
          console.log(`⏭️ User ${userId} already reset this month`);
          skippedCount++;
          continue;
        }
        
        // ✅ NEW: Use unified credits system
        const currentBalance = await CreditsSystem.getCredits(userId);
        const previousFree = currentBalance.free;
        
        // ✅ Reset free credits to 25 using unified system
        await kv.set(`credits:${userId}:free`, 25);
        
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
        console.error(`❌ Error resetting user ${userId}:`, error);
      }
    }
    
    // Save global reset stats
    const resetStats = {
      month: currentMonth,
      date: resetDate,
      totalUsers: userIds.size,
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
        totalUsers: userIds.size,
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
    
    // ✅ NEW: Use unified credits system
    const currentBalance = await CreditsSystem.getCredits(userId);
    const previousFree = currentBalance.free;
    
    // ✅ Reset free credits to 25 using unified system
    await kv.set(`credits:${userId}:free`, 25);
    
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