/**
 * COCONUT V14 - DASHBOARD & STATS ROUTES
 * Routes for dashboard statistics, user settings, and transactions
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono@4.0.2/cors';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * GET /make-server-e55aa214/coconut/stats
 * Returns dashboard statistics for user
 */
app.get('/make-server-e55aa214/coconut/stats', async (c) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    // TODO: Get userId from auth
    const userId = 'demo-user';
    
    // Get all projects for user
    const projectsKey = `coconut:projects:${userId}`;
    const projects = await kv.getByPrefix(projectsKey) || [];
    
    // Calculate stats
    const totalGenerations = projects.length;
    const completedProjects = projects.filter((p: any) => p.status === 'completed');
    const failedProjects = projects.filter((p: any) => p.status === 'error');
    
    const totalCreditsUsed = completedProjects.reduce((sum: number, p: any) => {
      return sum + (p.creditsUsed || 115); // Default 115 for Flux 2 Pro
    }, 0);
    
    const successRate = totalGenerations > 0 
      ? (completedProjects.length / totalGenerations) * 100 
      : 0;
    
    // Count by type
    const imagesGenerated = completedProjects.filter((p: any) => 
      p.mode === 'image' || !p.mode
    ).length;
    
    const videosGenerated = completedProjects.filter((p: any) => 
      p.mode === 'video'
    ).length;
    
    // Calculate sparkline data (last 7 days)
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sparklineData = [];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i * oneDayMs);
      const dayEnd = dayStart + oneDayMs;
      
      const dayCredits = completedProjects
        .filter((p: any) => {
          const pTime = new Date(p.createdAt).getTime();
          return pTime >= dayStart && pTime < dayEnd;
        })
        .reduce((sum: number, p: any) => sum + (p.creditsUsed || 115), 0);
      
      sparklineData.push(dayCredits);
    }
    
    // Average credits per day (last 7 days)
    const averageCreditsPerDay = Math.round(
      sparklineData.reduce((a, b) => a + b, 0) / 7
    );
    
    const stats = {
      totalGenerations,
      totalCreditsUsed,
      successRate: parseFloat(successRate.toFixed(1)),
      averageCreditsPerDay,
      imagesGenerated,
      videosGenerated,
      sparklineData,
      
      // Credits info (will be replaced by actual credits context)
      creditsRemaining: 2500, // Placeholder
      creditsTotal: 5000,     // Placeholder
    };
    
    console.log('✅ Stats calculated:', stats);
    
    return c.json({
      success: true,
      stats,
    });
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }, 500);
  }
});

// ============================================
// GENERATION HISTORY
// ============================================

/**
 * GET /make-server-e55aa214/coconut/projects/history
 * Returns generation history with pagination
 */
app.get('/make-server-e55aa214/coconut/projects/history', async (c) => {
  try {
    console.log('📜 Fetching generation history...');
    
    // TODO: Get userId from auth
    const userId = 'demo-user';
    
    // Pagination params
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    
    // Get all projects for user
    const projectsKey = `coconut:projects:${userId}`;
    const allProjects = await kv.getByPrefix(projectsKey) || [];
    
    // Sort by createdAt desc (newest first)
    const sortedProjects = allProjects.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Paginate
    const paginatedProjects = sortedProjects.slice(skip, skip + pageSize);
    
    // Transform to frontend format
    const generations = paginatedProjects.map((p: any) => ({
      id: p.projectId,
      type: p.mode || 'image',
      prompt: p.intent || p.briefDetails?.userIntent || 'No prompt',
      model: 'Flux 2 Pro',
      status: p.status === 'completed' ? 'completed' : 
              p.status === 'error' ? 'failed' : 
              'pending',
      credits: p.creditsUsed || 115,
      createdAt: p.createdAt,
      thumbnail: p.results?.[0]?.url || p.finalImageUrl,
    }));
    
    console.log(`✅ Fetched ${generations.length} generations (page ${page})`);
    
    return c.json({
      success: true,
      generations,
      pagination: {
        page,
        pageSize,
        total: sortedProjects.length,
        totalPages: Math.ceil(sortedProjects.length / pageSize),
      },
    });
    
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch history',
    }, 500);
  }
});

// ============================================
// CREDITS TRANSACTIONS
// ============================================

/**
 * GET /make-server-e55aa214/credits/transactions
 * Returns credit transaction history
 */
app.get('/make-server-e55aa214/credits/transactions', async (c) => {
  try {
    console.log('💳 Fetching credit transactions...');
    
    // TODO: Get userId from auth
    const userId = 'demo-user';
    
    // Pagination
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    
    // Get all projects (usage transactions)
    const projectsKey = `coconut:projects:${userId}`;
    const projects = await kv.getByPrefix(projectsKey) || [];
    
    // Transform to transaction format
    const usageTransactions = projects
      .filter((p: any) => p.status === 'completed')
      .map((p: any) => ({
        id: `usage-${p.projectId}`,
        type: 'usage',
        description: `${p.mode === 'video' ? 'Video' : 'Image'} generation - Flux 2 Pro`,
        credits: -(p.creditsUsed || 115),
        date: p.createdAt,
        status: 'completed',
      }));
    
    // TODO: Get actual purchase transactions from KV store
    // For now, create a mock purchase if no transactions
    const purchaseTransactions = [];
    if (usageTransactions.length > 0) {
      purchaseTransactions.push({
        id: 'purchase-initial',
        type: 'purchase',
        description: 'Pro Package - 5000 credits + 500 bonus',
        credits: 5500,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      });
    }
    
    // Combine and sort
    const allTransactions = [...purchaseTransactions, ...usageTransactions]
      .sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    
    // Paginate
    const paginatedTransactions = allTransactions.slice(skip, skip + pageSize);
    
    console.log(`✅ Fetched ${paginatedTransactions.length} transactions (page ${page})`);
    
    return c.json({
      success: true,
      transactions: paginatedTransactions,
      pagination: {
        page,
        pageSize,
        total: allTransactions.length,
        totalPages: Math.ceil(allTransactions.length / pageSize),
      },
    });
    
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    }, 500);
  }
});

// ============================================
// USER SETTINGS
// ============================================

/**
 * GET /make-server-e55aa214/user/settings
 * Returns user settings
 */
app.get('/make-server-e55aa214/user/settings', async (c) => {
  try {
    console.log('⚙️ Fetching user settings...');
    
    // TODO: Get userId from auth
    const userId = 'demo-user';
    
    const settingsKey = `user:settings:${userId}`;
    const settings = await kv.get(settingsKey);
    
    // Default settings if none exist
    const defaultSettings = {
      // Account
      username: 'demo-user',
      email: 'user@example.com',
      displayName: 'Demo User',
      
      // Preferences
      language: 'en',
      timezone: 'utc',
      theme: 'purple',
      
      // Notifications
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      
      // Privacy
      profileVisibility: 'private',
      showActivity: false,
    };
    
    console.log('✅ Settings loaded');
    
    return c.json({
      success: true,
      settings: settings || defaultSettings,
    });
    
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch settings',
    }, 500);
  }
});

/**
 * PUT /make-server-e55aa214/user/settings
 * Saves user settings
 */
app.put('/make-server-e55aa214/user/settings', async (c) => {
  try {
    console.log('💾 Saving user settings...');
    
    // TODO: Get userId from auth
    const userId = 'demo-user';
    
    const settings = await c.req.json();
    
    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return c.json({
        success: false,
        error: 'Invalid settings format',
      }, 400);
    }
    
    // Save to KV store
    const settingsKey = `user:settings:${userId}`;
    await kv.set(settingsKey, settings);
    
    console.log('✅ Settings saved successfully');
    
    return c.json({
      success: true,
      message: 'Settings saved successfully',
    });
    
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save settings',
    }, 500);
  }
});

// ============================================
// USAGE ANALYTICS
// ============================================

/**
 * GET /make-server-e55aa214/coconut/analytics
 * Returns detailed usage analytics
 */
app.get('/make-server-e55aa214/coconut/analytics', async (c) => {
  try {
    console.log('📈 Fetching analytics...');
    
    // TODO: Get userId from auth
    const userId = 'demo-user';
    
    // Get all projects
    const projectsKey = `coconut:projects:${userId}`;
    const projects = await kv.getByPrefix(projectsKey) || [];
    
    // Calculate analytics
    const totalPurchased = 12500; // TODO: Get from transactions
    const totalUsed = projects
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + (p.creditsUsed || 115), 0);
    
    const remaining = totalPurchased - totalUsed;
    const avgPerDay = Math.round(totalUsed / 7); // Last 7 days
    
    // Most used model
    const modelCounts = projects.reduce((acc: any, p: any) => {
      const model = p.model || 'Flux 2 Pro';
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});
    
    const mostUsedModel = Object.entries(modelCounts)
      .sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 'Flux 2 Pro';
    
    const analytics = {
      totalPurchased,
      totalUsed,
      remaining,
      avgPerDay,
      mostUsedModel,
      imagesGenerated: projects.filter((p: any) => p.mode === 'image').length,
      videosGenerated: projects.filter((p: any) => p.mode === 'video').length,
    };
    
    console.log('✅ Analytics calculated');
    
    return c.json({
      success: true,
      analytics,
    });
    
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics',
    }, 500);
  }
});

export default app;
