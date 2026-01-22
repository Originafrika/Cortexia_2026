/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CORTEXIA CREDITS ROUTES V3
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Clean, professional API routes for credit operations.
 * Uses the unified credits system as single source of truth.
 */

import { Hono } from 'npm:hono';
import * as CreditsSystem from './unified-credits-system.ts';

const app = new Hono();

// ═══════════════════════════════════════════════════════════════════════════
// GET CREDITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /credits/:userId
 * Get user credit balance
 */
app.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log(`📊 [GET /credits/${userId}] Fetching balance...`);
    
    // Auto-migrate from legacy if needed
    await CreditsSystem.migrateUserCredits(userId);
    
    // Get credits
    const balance = await CreditsSystem.getCredits(userId);
    
    // Format response
    const response = {
      success: true,
      credits: balance,
      balance: balance.total,
      formatted: `${balance.total.toLocaleString()} credits`,
    };
    
    // Add days until reset for Enterprise
    if (balance.isEnterprise && balance.nextResetDate) {
      const now = new Date();
      const resetDate = new Date(balance.nextResetDate);
      const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      (response as any).daysUntilReset = daysUntilReset;
    }
    
    console.log(`✅ [GET /credits/${userId}] Balance: ${balance.total} (Enterprise: ${balance.isEnterprise})`);
    
    return c.json(response);
    
  } catch (error) {
    console.error('❌ [GET /credits] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch credits'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DEDUCT CREDITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /credits/:userId/deduct
 * Deduct credits from user
 * 
 * Body: { amount: number, reason: string, metadata?: any }
 */
app.post('/:userId/deduct', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { amount, reason, metadata } = await c.req.json();
    
    console.log(`💳 [POST /credits/${userId}/deduct] Amount: ${amount}, Reason: ${reason}`);
    
    // Validate
    if (!amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid amount'
      }, 400);
    }
    
    if (!reason) {
      return c.json({
        success: false,
        error: 'Reason is required'
      }, 400);
    }
    
    // Deduct credits
    const result = await CreditsSystem.deductCredits(userId, amount, reason, metadata);
    
    if (!result.success) {
      console.error(`❌ [POST /credits/${userId}/deduct] Failed: ${result.error}`);
      return c.json({
        success: false,
        error: result.error
      }, 402); // 402 Payment Required
    }
    
    console.log(`✅ [POST /credits/${userId}/deduct] Success. New balance: ${result.balance.total}`);
    
    return c.json({
      success: true,
      balance: result.balance,
      message: `${amount} credits deducted`
    });
    
  } catch (error) {
    console.error('❌ [POST /credits/deduct] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deduct credits'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADD CREDITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /credits/:userId/add
 * Add paid credits to user (after Stripe purchase)
 * 
 * Body: { amount: number, reason: string, metadata?: any }
 */
app.post('/:userId/add', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { amount, reason, metadata } = await c.req.json();
    
    console.log(`💰 [POST /credits/${userId}/add] Amount: ${amount}, Reason: ${reason}`);
    
    // Validate
    if (!amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid amount'
      }, 400);
    }
    
    // Add credits
    const balance = await CreditsSystem.addPaidCredits(userId, amount, reason, metadata);
    
    console.log(`✅ [POST /credits/${userId}/add] Success. New balance: ${balance.total}`);
    
    return c.json({
      success: true,
      balance,
      message: `${amount} credits added`
    });
    
  } catch (error) {
    console.error('❌ [POST /credits/add] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add credits'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// REFUND CREDITS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /credits/:userId/refund
 * Refund credits (when generation fails)
 * 
 * Body: { amount: number, reason: string, metadata?: any }
 */
app.post('/:userId/refund', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { amount, reason, metadata } = await c.req.json();
    
    console.log(`🔄 [POST /credits/${userId}/refund] Amount: ${amount}, Reason: ${reason}`);
    
    // Validate
    if (!amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid amount'
      }, 400);
    }
    
    // Refund credits
    const balance = await CreditsSystem.refundCredits(userId, amount, reason, metadata);
    
    console.log(`✅ [POST /credits/${userId}/refund] Success. New balance: ${balance.total}`);
    
    return c.json({
      success: true,
      balance,
      message: `${amount} credits refunded`
    });
    
  } catch (error) {
    console.error('❌ [POST /credits/refund] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund credits'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION HISTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /credits/:userId/history
 * Get transaction history
 */
app.get('/:userId/history', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '20');
    
    console.log(`📜 [GET /credits/${userId}/history] Limit: ${limit}`);
    
    const transactions = await CreditsSystem.getTransactionHistory(userId, limit);
    
    console.log(`✅ [GET /credits/${userId}/history] Found ${transactions.length} transactions`);
    
    return c.json({
      success: true,
      transactions,
      count: transactions.length
    });
    
  } catch (error) {
    console.error('❌ [GET /credits/history] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch history'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /credits/admin/set
 * Admin: Set user credits
 * 
 * Body: { userId: string, free: number, paid: number, reason: string }
 */
app.post('/admin/set', async (c) => {
  try {
    const { userId, free, paid, reason } = await c.req.json();
    
    console.log(`🔧 [POST /credits/admin/set] User: ${userId}, Free: ${free}, Paid: ${paid}`);
    
    // Validate
    if (!userId || free < 0 || paid < 0) {
      return c.json({
        success: false,
        error: 'Invalid parameters'
      }, 400);
    }
    
    // Set credits
    const balance = await CreditsSystem.adminSetCredits(userId, free, paid, reason || 'Admin action');
    
    console.log(`✅ [POST /credits/admin/set] Success. New balance: ${balance.total}`);
    
    return c.json({
      success: true,
      balance,
      message: 'Credits updated'
    });
    
  } catch (error) {
    console.error('❌ [POST /credits/admin/set] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set credits'
    }, 500);
  }
});

export default app;
