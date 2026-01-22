/**
 * MIGRATION ROUTES - Temporary Admin Routes for Data Migration
 * ⚠️ Should be removed after migration is complete
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { 
  migrateProjectsToUnified, 
  verifyMigration, 
  rollbackMigration,
  MIGRATION_INFO,
  type MigrationResult 
} from './migrate-projects-to-unified.ts';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// ============================================================================
// ADMIN AUTH MIDDLEWARE (Simple token-based)
// ============================================================================

const ADMIN_TOKEN = Deno.env.get('ADMIN_MIGRATION_TOKEN') || 'migration-secret-token-2026';

async function requireAdminAuth(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  console.log('🔐 [Migration Auth] Token received:', token?.substring(0, 10) + '...');
  console.log('🔐 [Migration Auth] Expected token:', ADMIN_TOKEN.substring(0, 10) + '...');
  
  if (token !== ADMIN_TOKEN) {
    console.error('❌ [Migration Auth] Invalid token');
    return c.json({
      success: false,
      error: 'Unauthorized - Invalid admin token'
    }, 401);
  }
  
  console.log('✅ [Migration Auth] Authorized');
  await next();
}

// Apply auth to all routes
app.use('*', requireAdminAuth);

// ============================================================================
// MIGRATION ROUTES
// ============================================================================

/**
 * GET /migration/status
 * Get current migration status (lightweight check)
 */
app.get('/status', async (c) => {
  try {
    console.log('📊 [Migration Status] Checking status...');
    
    // Simple status check - just verify migration was run
    const result = await verifyMigration();
    
    return c.json({
      success: true,
      data: {
        migrationComplete: result.valid,
        lastRun: result.valid ? new Date().toISOString() : null,
        issues: result.issues.length,
        summary: {
          total: result.unifiedCount || 0,
          legacy: result.legacyCount || 0,
          valid: result.valid
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [Migration Status] Error:', error);
    
    return c.json({
      success: false,
      error: 'Failed to check status',
      message: error.message
    }, 500);
  }
});

/**
 * GET /migration/info
 * Get migration information
 */
app.get('/info', (c) => {
  return c.json({
    success: true,
    data: MIGRATION_INFO
  });
});

/**
 * POST /migration/run
 * Run the complete migration
 */
app.post('/run', async (c) => {
  console.log('🚀 Migration triggered via API');
  
  try {
    const result = await migrateProjectsToUnified();
    
    return c.json({
      success: result.success,
      data: result,
      message: result.success 
        ? `Migration completed successfully. Migrated ${result.migrated} items.`
        : 'Migration failed with errors'
    });
    
  } catch (error) {
    console.error('❌ Migration API error:', error);
    
    return c.json({
      success: false,
      error: 'Migration failed',
      message: error.message,
      details: error.stack
    }, 500);
  }
});

/**
 * POST /migration/verify
 * Verify migration integrity
 */
app.post('/verify', async (c) => {
  console.log('🔍 Verification triggered via API');
  
  try {
    const result = await verifyMigration();
    
    return c.json({
      success: result.valid,
      data: result,
      message: result.valid
        ? 'Migration verified successfully'
        : `Verification found ${result.issues.length} issues`
    });
    
  } catch (error) {
    console.error('❌ Verification API error:', error);
    
    return c.json({
      success: false,
      error: 'Verification failed',
      message: error.message
    }, 500);
  }
});

/**
 * POST /migration/rollback
 * Rollback migration (DANGEROUS!)
 */
app.post('/rollback', async (c) => {
  console.log('⚠️  ROLLBACK triggered via API');
  
  // Double confirmation required
  const body = await c.req.json().catch(() => ({}));
  
  if (body.confirm !== 'YES_DELETE_ALL_UNIFIED_DATA') {
    return c.json({
      success: false,
      error: 'Confirmation required',
      message: 'To rollback, send { "confirm": "YES_DELETE_ALL_UNIFIED_DATA" } in request body'
    }, 400);
  }
  
  try {
    await rollbackMigration();
    
    return c.json({
      success: true,
      message: 'Rollback completed - all unified data deleted'
    });
    
  } catch (error) {
    console.error('❌ Rollback API error:', error);
    
    return c.json({
      success: false,
      error: 'Rollback failed',
      message: error.message
    }, 500);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'migration-api',
      version: MIGRATION_INFO.version,
      timestamp: new Date().toISOString()
    }
  });
});

// ============================================================================
// 404 HANDLER
// ============================================================================

app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: `Migration route ${c.req.path} not found`
  }, 404);
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.onError((err, c) => {
  console.error('❌ Migration API error:', err);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  }, 500);
});

export default app;