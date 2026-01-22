/**
 * STORAGE CLEANUP CRON ROUTES
 * Automatic daily cleanup of temporary files
 * 
 * CRON SCHEDULE: Every day at midnight (00:00 UTC)
 * 
 * Setup in Supabase:
 * 1. Go to Database → Extensions → pg_cron
 * 2. Run SQL:
 *    SELECT cron.schedule(
 *      'storage-cleanup-daily',
 *      '0 0 * * *', -- Every day at midnight
 *      $$
 *      SELECT net.http_post(
 *        url := 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup/run',
 *        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
 *        body := '{}'::jsonb
 *      ) as request_id;
 *      $$
 *    );
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { cleanupExpiredFiles, dryRunCleanup } from './storage-cleanup-service.ts';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// ============================================================================
// CRON TRIGGER (called by pg_cron or external scheduler)
// ============================================================================

/**
 * POST /storage-cleanup/run
 * Run the actual cleanup (deletes files)
 */
app.post('/run', async (c) => {
  try {
    console.log('\n🚀 [CLEANUP CRON] Starting scheduled cleanup...');
    console.log(`📅 [CLEANUP CRON] Time: ${new Date().toISOString()}`);
    
    const stats = await cleanupExpiredFiles();
    
    // Log cleanup to KV store for tracking
    await logCleanupRun(stats);
    
    return c.json({
      success: true,
      message: 'Cleanup completed successfully',
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [CLEANUP CRON] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Cleanup failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /storage-cleanup/dry-run
 * Test cleanup without deleting (safe to run anytime)
 */
app.post('/dry-run', async (c) => {
  try {
    console.log('\n🧪 [CLEANUP DRY RUN] Starting test run...');
    
    const stats = await dryRunCleanup();
    
    return c.json({
      success: true,
      message: 'Dry run completed (no files deleted)',
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [CLEANUP DRY RUN] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Dry run failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /storage-cleanup/status
 * Get cleanup history and next scheduled run
 */
app.get('/status', async (c) => {
  try {
    const history = await getCleanupHistory();
    const lastRun = history.length > 0 ? history[0] : null;
    
    // Calculate next run (midnight UTC)
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(24, 0, 0, 0); // Next midnight
    
    return c.json({
      success: true,
      data: {
        lastRun,
        nextRun: nextRun.toISOString(),
        history: history.slice(0, 10), // Last 10 runs
        config: {
          enabled: true,
          schedule: 'Daily at 00:00 UTC',
          retention: '24 hours',
          protected: [
            'Feed posts (permanent)',
            'Enterprise files (permanent)'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [CLEANUP STATUS] Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * POST /storage-cleanup/manual
 * Manual trigger (requires admin confirmation)
 */
app.post('/manual', async (c) => {
  try {
    // Check admin auth
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Simple token check (you can enhance this)
    const ADMIN_TOKEN = Deno.env.get('ADMIN_MIGRATION_TOKEN') || 'migration-secret-token-2026';
    
    if (token !== ADMIN_TOKEN) {
      return c.json({
        success: false,
        error: 'Unauthorized - Admin token required'
      }, 401);
    }
    
    console.log('\n🔧 [MANUAL CLEANUP] Admin triggered cleanup...');
    
    const stats = await cleanupExpiredFiles();
    
    // Log manual cleanup
    await logCleanupRun(stats, 'manual');
    
    return c.json({
      success: true,
      message: 'Manual cleanup completed',
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [MANUAL CLEANUP] Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================================================
// HELPER: Log cleanup runs
// ============================================================================

import * as kv from './kv_store.tsx';

async function logCleanupRun(stats: any, trigger: 'cron' | 'manual' = 'cron') {
  try {
    const runId = `cleanup-run:${Date.now()}`;
    
    await kv.set(runId, {
      id: runId,
      timestamp: new Date().toISOString(),
      trigger,
      stats,
      success: true
    });
    
    console.log(`✅ [CLEANUP LOG] Run logged: ${runId}`);
  } catch (error) {
    console.error('❌ [CLEANUP LOG] Failed to log run:', error);
  }
}

async function getCleanupHistory(): Promise<any[]> {
  try {
    const runs = await kv.getByPrefix('cleanup-run:');
    
    // getByPrefix peut retourner null/undefined si aucun résultat
    if (!runs || !Array.isArray(runs)) {
      console.log('ℹ️  [CLEANUP HISTORY] No runs found');
      return [];
    }
    
    // Filter out any invalid entries
    const validRuns = runs.filter((run: any) => {
      return run && run.timestamp && run.stats;
    });
    
    // Sort by timestamp descending
    return validRuns.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('❌ [CLEANUP HISTORY] Error:', error);
    return [];
  }
}

export default app;