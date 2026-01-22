/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CORTEXIA UNIFIED CREDITS SYSTEM V3
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Single source of truth for ALL credit operations across Cortexia.
 * Handles Individual, Enterprise, and Developer users with consistent logic.
 * 
 * @author Cortexia Team
 * @version 3.0.0
 * @date 2026-01-20
 */

import * as kv from './kv_store.tsx';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User type classification
 */
export type UserType = 'individual' | 'enterprise' | 'developer';

/**
 * Credit balance for all user types
 */
export interface CreditBalance {
  // Common fields
  free: number;           // Free credits (0 for Enterprise)
  paid: number;           // Paid credits (never expire)
  total: number;          // Total available credits
  
  // Enterprise-specific fields (null for Individual/Developer)
  isEnterprise: boolean;
  monthlyCredits?: number;              // 10,000 for Enterprise
  monthlyCreditsRemaining?: number;     // Remaining this month
  monthlyCreditsUsed?: number;          // Used this month
  addOnCredits?: number;                // Add-on credits (paid)
  nextResetDate?: string;               // ISO date of next reset
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'unpaid';
}

/**
 * Enterprise subscription data
 */
interface EnterpriseSubscription {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'unpaid';
  
  // Monthly credits
  monthlyCredits: number;                // Always 10,000
  subscriptionCreditsUsed: number;       // Used this period
  subscriptionCreditsRemaining: number;  // Remaining this period
  
  // Add-on credits (stored separately in credits:${userId}:paid)
  addOnCredits: number;
  
  // Total
  totalCredits: number;
  
  // Billing cycle
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextResetDate: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Credit transaction log
 */
interface CreditTransaction {
  id: string;
  userId: string;
  type: 'usage' | 'purchase' | 'refund' | 'reset' | 'migration';
  amount: number;           // Positive for add, negative for deduct
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  metadata?: any;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// KV STORE KEYS (SINGLE SOURCE OF TRUTH)
// ═══════════════════════════════════════════════════════════════════════════

const KEYS = {
  // NEW UNIFIED SYSTEM (use this everywhere)
  creditsFree: (userId: string) => `credits:${userId}:free`,
  creditsPaid: (userId: string) => `credits:${userId}:paid`,
  creditsLastReset: (userId: string) => `credits:${userId}:lastReset`,
  
  // Enterprise subscription
  enterpriseSubscription: (userId: string) => `enterprise:subscription:${userId}`,
  
  // Transaction logs
  transactionLog: (transactionId: string) => `credits:transaction:${transactionId}`,
  userTransactions: (userId: string) => `credits:transactions:${userId}`,
  
  // LEGACY KEYS (for migration only, DO NOT USE)
  legacyCredits: (userId: string) => `user:${userId}:credits`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user credit balance
 * Handles both Individual/Developer and Enterprise users automatically
 */
export async function getCredits(userId: string): Promise<CreditBalance> {
  // Check if Enterprise user
  const enterpriseSub = await getEnterpriseSubscription(userId);
  
  if (enterpriseSub) {
    // Enterprise user
    return {
      free: 0, // Enterprise users have no free credits
      paid: enterpriseSub.addOnCredits,
      total: enterpriseSub.totalCredits,
      
      isEnterprise: true,
      monthlyCredits: enterpriseSub.monthlyCredits,
      monthlyCreditsRemaining: enterpriseSub.subscriptionCreditsRemaining,
      monthlyCreditsUsed: enterpriseSub.subscriptionCreditsUsed,
      addOnCredits: enterpriseSub.addOnCredits,
      nextResetDate: enterpriseSub.nextResetDate,
      subscriptionStatus: enterpriseSub.subscriptionStatus,
    };
  }
  
  // Individual/Developer user
  const free = await kv.get(KEYS.creditsFree(userId)) || 0;
  const paid = await kv.get(KEYS.creditsPaid(userId)) || 0;
  
  return {
    free: Number(free),
    paid: Number(paid),
    total: Number(free) + Number(paid),
    isEnterprise: false,
  };
}

/**
 * Deduct credits from user
 * Automatically handles Individual vs Enterprise logic
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
  console.log(`💳 [Credits] Deduct ${amount} credits from ${userId}: ${reason}`);
  
  // Get current balance
  const balance = await getCredits(userId);
  
  // Check sufficient credits
  if (balance.total < amount) {
    console.error(`❌ [Credits] Insufficient credits: ${balance.total} < ${amount}`);
    return {
      success: false,
      balance,
      error: `Insufficient credits. Required: ${amount}, Available: ${balance.total}`,
    };
  }
  
  // Deduct based on user type
  if (balance.isEnterprise) {
    return await deductEnterpriseCredits(userId, amount, reason, metadata);
  } else {
    return await deductIndividualCredits(userId, amount, reason, metadata);
  }
}

/**
 * Add paid credits to user
 * Used after Stripe purchase
 */
export async function addPaidCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<CreditBalance> {
  console.log(`💰 [Credits] Add ${amount} paid credits to ${userId}: ${reason}`);
  
  const currentPaid = await kv.get(KEYS.creditsPaid(userId)) || 0;
  const newPaid = Number(currentPaid) + amount;
  
  await kv.set(KEYS.creditsPaid(userId), newPaid);
  
  // Log transaction
  await logTransaction({
    userId,
    type: 'purchase',
    amount,
    balanceBefore: Number(currentPaid),
    balanceAfter: newPaid,
    reason,
    metadata,
  });
  
  console.log(`✅ [Credits] Paid credits updated: ${currentPaid} → ${newPaid}`);
  
  return await getCredits(userId);
}

/**
 * Refund credits to user
 * Used when generation fails
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<CreditBalance> {
  console.log(`🔄 [Credits] Refund ${amount} credits to ${userId}: ${reason}`);
  
  // For refunds, we add back to paid credits (most recent deduction)
  const currentPaid = await kv.get(KEYS.creditsPaid(userId)) || 0;
  const newPaid = Number(currentPaid) + amount;
  
  await kv.set(KEYS.creditsPaid(userId), newPaid);
  
  await logTransaction({
    userId,
    type: 'refund',
    amount,
    balanceBefore: Number(currentPaid),
    balanceAfter: newPaid,
    reason,
    metadata,
  });
  
  console.log(`✅ [Credits] Refund completed: ${currentPaid} → ${newPaid}`);
  
  return await getCredits(userId);
}

// ═══════════════════════════════════════════════════════════════════════════
// INDIVIDUAL/DEVELOPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Deduct credits from Individual/Developer user
 * Priority: Free credits first, then paid credits
 */
async function deductIndividualCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
  const currentFree = await kv.get(KEYS.creditsFree(userId)) || 0;
  const currentPaid = await kv.get(KEYS.creditsPaid(userId)) || 0;
  
  let remaining = amount;
  let newFree = Number(currentFree);
  let newPaid = Number(currentPaid);
  
  // 1. Use free credits first
  if (newFree > 0) {
    const takeFromFree = Math.min(remaining, newFree);
    newFree -= takeFromFree;
    remaining -= takeFromFree;
  }
  
  // 2. Use paid credits
  if (remaining > 0) {
    newPaid -= remaining;
  }
  
  // Save new balances
  await kv.set(KEYS.creditsFree(userId), newFree);
  await kv.set(KEYS.creditsPaid(userId), newPaid);
  
  // Log transaction
  await logTransaction({
    userId,
    type: 'usage',
    amount: -amount,
    balanceBefore: Number(currentFree) + Number(currentPaid),
    balanceAfter: newFree + newPaid,
    reason,
    metadata,
  });
  
  console.log(`✅ [Credits] Individual deduction: ${Number(currentFree) + Number(currentPaid)} → ${newFree + newPaid}`);
  
  const balance = await getCredits(userId);
  return { success: true, balance };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get Enterprise subscription
 * Returns null if user is not Enterprise
 */
export async function getEnterpriseSubscription(
  userId: string
): Promise<EnterpriseSubscription | null> {
  const sub = await kv.get(KEYS.enterpriseSubscription(userId));
  
  if (!sub) return null;
  
  // Read add-on credits (stored separately)
  const addOnCredits = await kv.get(KEYS.creditsPaid(userId)) || 0;
  (sub as any).addOnCredits = Number(addOnCredits);
  
  // Check if monthly reset is needed
  const needsReset = await checkMonthlyReset(userId, sub as EnterpriseSubscription);
  if (needsReset) {
    // Refresh subscription data after reset
    return await kv.get(KEYS.enterpriseSubscription(userId));
  }
  
  // Recalculate totals
  const subscription = sub as EnterpriseSubscription;
  subscription.subscriptionCreditsRemaining = 10000 - subscription.subscriptionCreditsUsed;
  subscription.totalCredits = subscription.subscriptionCreditsRemaining + subscription.addOnCredits;
  
  return subscription;
}

/**
 * Check if monthly credits need reset
 */
async function checkMonthlyReset(
  userId: string,
  subscription: EnterpriseSubscription
): Promise<boolean> {
  const now = new Date();
  const resetDate = new Date(subscription.nextResetDate);
  
  if (now >= resetDate) {
    console.log(`🔄 [Enterprise] Resetting monthly credits for ${userId}`);
    
    // Reset monthly credits
    subscription.subscriptionCreditsUsed = 0;
    subscription.subscriptionCreditsRemaining = 10000;
    subscription.currentPeriodStart = now.toISOString();
    subscription.currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    subscription.nextResetDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    subscription.updatedAt = now.toISOString();
    
    await kv.set(KEYS.enterpriseSubscription(userId), subscription);
    
    await logTransaction({
      userId,
      type: 'reset',
      amount: 10000,
      balanceBefore: 0,
      balanceAfter: 10000,
      reason: 'Monthly credits reset',
      metadata: { resetDate: now.toISOString() },
    });
    
    console.log(`✅ [Enterprise] Monthly credits reset to 10,000`);
    return true;
  }
  
  return false;
}

/**
 * Deduct credits from Enterprise user
 * Priority: Monthly credits first, then add-on credits
 * SECURITY: Add-on credits can only be used if subscription is active
 */
async function deductEnterpriseCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
  const subscription = await getEnterpriseSubscription(userId);
  
  if (!subscription) {
    return {
      success: false,
      balance: await getCredits(userId),
      error: 'No Enterprise subscription found',
    };
  }
  
  // SECURITY CHECK: Subscription must be active
  if (subscription.subscriptionStatus !== 'active') {
    return {
      success: false,
      balance: await getCredits(userId),
      error: 'Subscription not active. Please update payment method.',
    };
  }
  
  let remaining = amount;
  
  // 1. Use monthly credits first
  if (subscription.subscriptionCreditsRemaining > 0) {
    const takeFromMonthly = Math.min(remaining, subscription.subscriptionCreditsRemaining);
    subscription.subscriptionCreditsUsed += takeFromMonthly;
    subscription.subscriptionCreditsRemaining -= takeFromMonthly;
    remaining -= takeFromMonthly;
  }
  
  // 2. Use add-on credits (only if subscription active)
  if (remaining > 0) {
    const currentAddOn = await kv.get(KEYS.creditsPaid(userId)) || 0;
    const newAddOn = Number(currentAddOn) - remaining;
    
    if (newAddOn < 0) {
      return {
        success: false,
        balance: await getCredits(userId),
        error: 'Insufficient credits',
      };
    }
    
    await kv.set(KEYS.creditsPaid(userId), newAddOn);
    subscription.addOnCredits = newAddOn;
  }
  
  // Update subscription
  subscription.totalCredits = subscription.subscriptionCreditsRemaining + subscription.addOnCredits;
  subscription.updatedAt = new Date().toISOString();
  
  await kv.set(KEYS.enterpriseSubscription(userId), subscription);
  
  // Log transaction
  await logTransaction({
    userId,
    type: 'usage',
    amount: -amount,
    balanceBefore: subscription.totalCredits + amount,
    balanceAfter: subscription.totalCredits,
    reason,
    metadata,
  });
  
  console.log(`✅ [Enterprise] Deduction: Monthly ${subscription.subscriptionCreditsRemaining}, Add-on ${subscription.addOnCredits}`);
  
  const balance = await getCredits(userId);
  return { success: true, balance };
}

/**
 * Create Enterprise subscription
 * Called after successful Stripe subscription
 */
export async function createEnterpriseSubscription(
  userId: string,
  stripeSubscriptionId: string,
  stripeCustomerId: string
): Promise<EnterpriseSubscription> {
  const now = new Date();
  const nextReset = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const subscription: EnterpriseSubscription = {
    userId,
    stripeSubscriptionId,
    stripeCustomerId,
    subscriptionStatus: 'active',
    
    monthlyCredits: 10000,
    subscriptionCreditsUsed: 0,
    subscriptionCreditsRemaining: 10000,
    addOnCredits: 0,
    totalCredits: 10000,
    
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: nextReset.toISOString(),
    nextResetDate: nextReset.toISOString(),
    
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  
  await kv.set(KEYS.enterpriseSubscription(userId), subscription);
  
  console.log(`✅ [Enterprise] Subscription created for ${userId}`);
  
  return subscription;
}

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATION & UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Migrate user from legacy system to new system
 * Automatically called when legacy data is detected
 */
export async function migrateUserCredits(userId: string): Promise<boolean> {
  const legacyCredits = await kv.get(KEYS.legacyCredits(userId));
  
  if (!legacyCredits) return false;
  
  const legacy = legacyCredits as any;
  const free = Number(legacy.free || legacy.freeCredits || 0);
  const paid = Number(legacy.paid || legacy.paidCredits || 0);
  
  if (free === 0 && paid === 0) return false;
  
  console.log(`🔄 [Migration] Migrating credits for ${userId}: free=${free}, paid=${paid}`);
  
  // Set new format
  await kv.set(KEYS.creditsFree(userId), free);
  await kv.set(KEYS.creditsPaid(userId), paid);
  
  // Log migration
  await logTransaction({
    userId,
    type: 'migration',
    amount: free + paid,
    balanceBefore: 0,
    balanceAfter: free + paid,
    reason: 'Migrated from legacy system',
    metadata: { legacy: legacyCredits },
  });
  
  console.log(`✅ [Migration] Credits migrated successfully`);
  
  return true;
}

/**
 * Log credit transaction
 */
async function logTransaction(data: Omit<CreditTransaction, 'id' | 'timestamp'>): Promise<void> {
  const transaction: CreditTransaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  // Store transaction
  await kv.set(KEYS.transactionLog(transaction.id), transaction);
  
  // Add to user's transaction list
  const userTxns = await kv.get(KEYS.userTransactions(data.userId)) || [];
  (userTxns as string[]).unshift(transaction.id);
  
  // Keep only last 100 transactions
  if ((userTxns as string[]).length > 100) {
    (userTxns as string[]).pop();
  }
  
  await kv.set(KEYS.userTransactions(data.userId), userTxns);
}

/**
 * Get user transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 20
): Promise<CreditTransaction[]> {
  const txnIds = await kv.get(KEYS.userTransactions(userId)) || [];
  const limitedIds = (txnIds as string[]).slice(0, limit);
  
  const transactions: CreditTransaction[] = [];
  for (const id of limitedIds) {
    const txn = await kv.get(KEYS.transactionLog(id));
    if (txn) transactions.push(txn as CreditTransaction);
  }
  
  return transactions;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Admin: Set user credits
 * For testing and support
 */
export async function adminSetCredits(
  userId: string,
  free: number,
  paid: number,
  reason: string
): Promise<CreditBalance> {
  console.log(`🔧 [Admin] Set credits for ${userId}: free=${free}, paid=${paid}`);
  
  await kv.set(KEYS.creditsFree(userId), free);
  await kv.set(KEYS.creditsPaid(userId), paid);
  
  await logTransaction({
    userId,
    type: 'purchase',
    amount: free + paid,
    balanceBefore: 0,
    balanceAfter: free + paid,
    reason: `Admin: ${reason}`,
    metadata: { admin: true },
  });
  
  return await getCredits(userId);
}

/**
 * Export public API
 */
export const CreditsSystem = {
  // Core operations
  getCredits,
  deductCredits,
  addPaidCredits,
  refundCredits,
  
  // Enterprise
  getEnterpriseSubscription,
  createEnterpriseSubscription,
  
  // Utilities
  migrateUserCredits,
  getTransactionHistory,
  
  // Admin
  adminSetCredits,
};

export default CreditsSystem;
