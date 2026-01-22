/**
 * ENTERPRISE SUBSCRIPTION SYSTEM
 * 
 * Coconut V14 Enterprise Pricing:
 * - Monthly subscription: $999/month for 10,000 credits (resets every 30 days from subscription date)
 * - Add-on credits: $0.09 per credit (Enterprise discount, never expire, minimum 1000 credits = $90)
 * 
 * ✅ CRITICAL SECURITY RULES:
 * 1. Credits reset 30 days after subscription start (NOT on 1st of month)
 * 2. Add-on credits can ONLY be used if subscription is ACTIVE
 * 3. If subscription expires/canceled, user CANNOT access Coconut V14 even with add-on credits
 * 
 * Credit Usage Order:
 * 1. Use subscription credits first (monthly pool)
 * 2. Then use add-on credits (only if subscription active)
 * 
 * Stripe Integration:
 * - Monthly subscription via Stripe Subscriptions
 * - Add-on credits via one-time Stripe Checkout
 */

import * as kv from './kv_store.tsx';

// ============================================================================
// TYPES
// ============================================================================

export interface EnterpriseSubscription {
  userId: string;
  
  // Subscription
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'unpaid';
  
  // Monthly Credits (reset on 1st of each month)
  monthlyCredits: 10000;
  subscriptionCreditsUsed: number; // Resets to 0 on 1st of month
  subscriptionCreditsRemaining: number; // monthlyCredits - subscriptionCreditsUsed
  
  // Add-on Credits (never expire)
  addOnCredits: number; // Purchased extra credits
  
  // Total available
  totalCredits: number; // subscriptionCreditsRemaining + addOnCredits
  
  // Billing
  nextResetDate: string; // ISO date string (1st of next month)
  currentPeriodStart: string; // ISO date string
  currentPeriodEnd: string; // ISO date string
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // Positive = credit, Negative = debit
  type: 'subscription_reset' | 'addon_purchase' | 'usage' | 'refund';
  creditType: 'subscription' | 'addon'; // Which pool was used
  reason?: string;
  projectId?: string;
  timestamp: string;
  balanceBefore: {
    subscription: number;
    addon: number;
    total: number;
  };
  balanceAfter: {
    subscription: number;
    addon: number;
    total: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MONTHLY_CREDITS = 10000;
const ADDON_PRICE_PER_CREDIT = 0.09; // $0.09 per credit (Enterprise discount)
const ADDON_MIN_PURCHASE = 1000; // Minimum 1,000 credits ($90)

// ============================================================================
// GET SUBSCRIPTION
// ============================================================================

/**
 * Get or create enterprise subscription for user
 */
export async function getEnterpriseSubscription(
  userId: string
): Promise<EnterpriseSubscription | null> {
  try {
    const key = `enterprise:subscription:${userId}`;
    const sub = await kv.get<EnterpriseSubscription>(key);
    
    if (!sub) {
      return null;
    }
    
    // ✅ Read add-on credits with fallback logic
    // Try new key first, then fallback to old admin KV format
    let addOnCredits = 0;
    
    // Try: credits:${userId}:paid (new format)
    const kvPaidCreditsNew = await kv.get(`credits:${userId}:paid`);
    if (kvPaidCreditsNew !== null && kvPaidCreditsNew !== undefined) {
      addOnCredits = Number(kvPaidCreditsNew);
      console.log(`💳 [getEnterpriseSubscription] Found credits in NEW format (credits:${userId}:paid): ${addOnCredits}`);
    } else {
      // Fallback: user:${userId}:credits (admin KV format)
      const userCredits = await kv.get(`user:${userId}:credits`) as any;
      if (userCredits && userCredits.paid !== undefined) {
        addOnCredits = Number(userCredits.paid);
        console.log(`💳 [getEnterpriseSubscription] Found credits in ADMIN KV format (user:${userId}:credits.paid): ${addOnCredits}`);
        
        // ✅ MIGRATE: Copy to new format for future reads
        await kv.set(`credits:${userId}:paid`, addOnCredits);
        console.log(`✅ [getEnterpriseSubscription] Migrated credits to new format`);
      } else {
        console.log(`⚠️ [getEnterpriseSubscription] No paid credits found in either format`);
      }
    }
    
    sub.addOnCredits = addOnCredits;
    
    console.log(`💳 [getEnterpriseSubscription] userId: ${userId}`);
    console.log(`💳 [getEnterpriseSubscription] Add-on credits set to: ${sub.addOnCredits}`);
    
    // Check if monthly reset is needed
    await checkAndResetMonthlyCredits(userId, sub);
    
    // Recalculate totals
    sub.subscriptionCreditsRemaining = MONTHLY_CREDITS - sub.subscriptionCreditsUsed;
    sub.totalCredits = sub.subscriptionCreditsRemaining + sub.addOnCredits;
    
    console.log(`💳 [getEnterpriseSubscription] Final totals - Monthly: ${sub.subscriptionCreditsRemaining}, Add-on: ${sub.addOnCredits}, Total: ${sub.totalCredits}`);
    
    return sub;
  } catch (error) {
    console.error(`❌ Error getting enterprise subscription:`, error);
    return null;
  }
}

/**
 * Create new enterprise subscription
 */
export async function createEnterpriseSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<EnterpriseSubscription> {
  const now = new Date();
  
  // ✅ FIXED: Reset date is 30 days from subscription start, NOT 1st of month
  const nextResetDate = new Date(now);
  nextResetDate.setDate(nextResetDate.getDate() + 30); // +30 days
  
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30); // Subscription period = 30 days
  
  // ✅ NEW: Migrate existing paid credits to add-on credits
  const existingPaidCredits = await kv.get(`credits:${userId}:paid`) || 0;
  const initialAddOnCredits = Number(existingPaidCredits);
  
  if (initialAddOnCredits > 0) {
    console.log(`📦 [Enterprise] Migrating ${initialAddOnCredits} existing paid credits to add-on credits for ${userId}`);
  }
  
  const subscription: EnterpriseSubscription = {
    userId,
    stripeSubscriptionId,
    stripeCustomerId,
    subscriptionStatus: 'active',
    
    monthlyCredits: MONTHLY_CREDITS,
    subscriptionCreditsUsed: 0,
    subscriptionCreditsRemaining: MONTHLY_CREDITS,
    
    addOnCredits: initialAddOnCredits, // ✅ Migrate existing paid credits
    totalCredits: MONTHLY_CREDITS + initialAddOnCredits, // ✅ Include migrated credits
    
    nextResetDate: nextResetDate.toISOString(),
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  
  const key = `enterprise:subscription:${userId}`;
  await kv.set(key, subscription);
  
  // Log initial grant
  await logEnterpriseTransaction({
    id: crypto.randomUUID(),
    userId,
    amount: MONTHLY_CREDITS,
    type: 'subscription_reset',
    creditType: 'subscription',
    reason: 'Initial subscription grant',
    timestamp: now.toISOString(),
    balanceBefore: {
      subscription: 0,
      addon: 0,
      total: 0,
    },
    balanceAfter: {
      subscription: MONTHLY_CREDITS,
      addon: initialAddOnCredits,
      total: MONTHLY_CREDITS + initialAddOnCredits,
    },
  });
  
  // ✅ NEW: Log migration if credits were migrated
  if (initialAddOnCredits > 0) {
    await logEnterpriseTransaction({
      id: crypto.randomUUID(),
      userId,
      amount: initialAddOnCredits,
      type: 'addon_purchase',
      creditType: 'addon',
      reason: 'Migrated from existing paid credits',
      timestamp: now.toISOString(),
      balanceBefore: {
        subscription: MONTHLY_CREDITS,
        addon: 0,
        total: MONTHLY_CREDITS,
      },
      balanceAfter: {
        subscription: MONTHLY_CREDITS,
        addon: initialAddOnCredits,
        total: MONTHLY_CREDITS + initialAddOnCredits,
      },
    });
  }
  
  console.log(`✅ Enterprise subscription created for ${userId}: ${MONTHLY_CREDITS} monthly + ${initialAddOnCredits} add-on = ${MONTHLY_CREDITS + initialAddOnCredits} total credits`);
  
  return subscription;
}

// ============================================================================
// CHECK AND RESET MONTHLY CREDITS
// ============================================================================

/**
 * Check if we need to reset monthly credits (30 days after subscription start)
 * ✅ FIXED: Reset is based on subscription date + 30 days, NOT 1st of month
 */
async function checkAndResetMonthlyCredits(
  userId: string,
  subscription: EnterpriseSubscription
): Promise<void> {
  const now = new Date();
  const resetDate = new Date(subscription.nextResetDate);
  
  // ✅ If we've passed the reset date, reset credits
  if (now >= resetDate) {
    console.log(`🔄 Resetting monthly credits for ${userId} (30 days elapsed)`);
    
    const balanceBefore = {
      subscription: MONTHLY_CREDITS - subscription.subscriptionCreditsUsed,
      addon: subscription.addOnCredits,
      total: subscription.totalCredits,
    };
    
    // Reset subscription credits
    subscription.subscriptionCreditsUsed = 0;
    subscription.subscriptionCreditsRemaining = MONTHLY_CREDITS;
    subscription.totalCredits = MONTHLY_CREDITS + subscription.addOnCredits;
    
    // ✅ FIXED: Calculate next reset date (+30 days from now, NOT 1st of month)
    const nextResetDate = new Date(now);
    nextResetDate.setDate(nextResetDate.getDate() + 30);
    subscription.nextResetDate = nextResetDate.toISOString();
    
    // Update period dates
    subscription.currentPeriodStart = now.toISOString();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);
    subscription.currentPeriodEnd = periodEnd.toISOString();
    
    subscription.updatedAt = now.toISOString();
    
    // Save
    const key = `enterprise:subscription:${userId}`;
    await kv.set(key, subscription);
    
    // Log transaction
    await logEnterpriseTransaction({
      id: crypto.randomUUID(),
      userId,
      amount: MONTHLY_CREDITS,
      type: 'subscription_reset',
      creditType: 'subscription',
      reason: '30-day subscription reset',
      timestamp: now.toISOString(),
      balanceBefore,
      balanceAfter: {
        subscription: MONTHLY_CREDITS,
        addon: subscription.addOnCredits,
        total: subscription.totalCredits,
      },
    });
    
    console.log(`✅ Monthly credits reset for ${userId}: ${MONTHLY_CREDITS} credits (next reset: ${nextResetDate.toISOString()})`);
  }
}

// ============================================================================
// GET CREDIT BALANCE
// ============================================================================

/**
 * Get enterprise user's credit balance
 * Returns total available credits
 */
export async function getEnterpriseBalance(userId: string): Promise<number> {
  const sub = await getEnterpriseSubscription(userId);
  return sub?.totalCredits || 0;
}

/**
 * Get detailed credit breakdown
 */
export async function getEnterpriseBalanceDetails(userId: string): Promise<{
  subscription: number;
  addon: number;
  total: number;
  nextResetDate: string;
} | null> {
  const sub = await getEnterpriseSubscription(userId);
  
  if (!sub) return null;
  
  return {
    subscription: sub.subscriptionCreditsRemaining,
    addon: sub.addOnCredits,
    total: sub.totalCredits,
    nextResetDate: sub.nextResetDate,
  };
}

// ============================================================================
// DEDUCT CREDITS
// ============================================================================

/**
 * Deduct credits from enterprise subscription
 * ✅ CRITICAL: Uses subscription credits first, then add-on credits
 * ✅ SECURITY: Add-on credits can ONLY be used if subscription is active
 */
export async function deductEnterpriseCredits(
  userId: string,
  amount: number,
  reason?: string,
  projectId?: string
): Promise<void> {
  const sub = await getEnterpriseSubscription(userId);
  
  if (!sub) {
    throw new Error('No enterprise subscription found');
  }
  
  // ✅ CRITICAL SECURITY: Check subscription is active
  if (sub.subscriptionStatus !== 'active') {
    throw new Error(
      `Cannot use credits: subscription status is "${sub.subscriptionStatus}". Please renew your subscription.`
    );
  }
  
  // ✅ IMPORTANT: Check if subscription period has ended
  const now = new Date();
  const periodEnd = new Date(sub.currentPeriodEnd);
  
  if (now > periodEnd) {
    throw new Error(
      `Subscription period expired on ${periodEnd.toLocaleDateString()}. Please renew your subscription to continue using Coconut V14.`
    );
  }
  
  if (sub.totalCredits < amount) {
    throw new Error(
      `Insufficient credits. Required: ${amount}, Available: ${sub.totalCredits}`
    );
  }
  
  const balanceBefore = {
    subscription: sub.subscriptionCreditsRemaining,
    addon: sub.addOnCredits,
    total: sub.totalCredits,
  };
  
  let remaining = amount;
  let usedFromSubscription = 0;
  let usedFromAddon = 0;
  
  // 1. Use subscription credits first
  if (sub.subscriptionCreditsRemaining > 0) {
    const takeFromSub = Math.min(remaining, sub.subscriptionCreditsRemaining);
    sub.subscriptionCreditsUsed += takeFromSub;
    sub.subscriptionCreditsRemaining -= takeFromSub;
    usedFromSubscription = takeFromSub;
    remaining -= takeFromSub;
  }
  
  // 2. ✅ Use add-on credits from KV store (only if subscription is active)
  if (remaining > 0) {
    const currentPaidCredits = await kv.get(`credits:${userId}:paid`) || 0;
    const newPaidCredits = Number(currentPaidCredits) - remaining;
    
    await kv.set(`credits:${userId}:paid`, newPaidCredits);
    
    usedFromAddon = remaining;
    sub.addOnCredits = newPaidCredits; // Update local copy
    remaining = 0;
  }
  
  // Update totals
  sub.totalCredits = sub.subscriptionCreditsRemaining + sub.addOnCredits;
  sub.updatedAt = new Date().toISOString();
  
  // Save subscription (only monthly credits tracking)
  const key = `enterprise:subscription:${userId}`;
  await kv.set(key, sub);
  
  // Log transaction(s)
  if (usedFromSubscription > 0) {
    await logEnterpriseTransaction({
      id: crypto.randomUUID(),
      userId,
      amount: -usedFromSubscription,
      type: 'usage',
      creditType: 'subscription',
      reason: reason || 'Coconut usage',
      projectId,
      timestamp: new Date().toISOString(),
      balanceBefore,
      balanceAfter: {
        subscription: sub.subscriptionCreditsRemaining,
        addon: sub.addOnCredits,
        total: sub.totalCredits,
      },
    });
  }
  
  if (usedFromAddon > 0) {
    await logEnterpriseTransaction({
      id: crypto.randomUUID(),
      userId,
      amount: -usedFromAddon,
      type: 'usage',
      creditType: 'addon',
      reason: reason || 'Coconut usage',
      projectId,
      timestamp: new Date().toISOString(),
      balanceBefore: {
        subscription: sub.subscriptionCreditsRemaining + usedFromSubscription,
        addon: sub.addOnCredits + usedFromAddon,
        total: sub.totalCredits + amount,
      },
      balanceAfter: {
        subscription: sub.subscriptionCreditsRemaining,
        addon: sub.addOnCredits,
        total: sub.totalCredits,
      },
    });
  }
  
  console.log(`💳 Deducted ${amount} credits from ${userId} (sub: ${usedFromSubscription}, addon: ${usedFromAddon})`);
}

// ============================================================================
// ADD ADD-ON CREDITS
// ============================================================================

/**
 * Add add-on credits (purchased via Stripe)
 * ✅ Adds directly to KV store credits:${userId}:paid
 */
export async function addEnterpriseAddonCredits(
  userId: string,
  credits: number,
  stripePaymentId?: string
): Promise<void> {
  const sub = await getEnterpriseSubscription(userId);
  
  if (!sub) {
    throw new Error('No enterprise subscription found');
  }
  
  const balanceBefore = {
    subscription: sub.subscriptionCreditsRemaining,
    addon: sub.addOnCredits,
    total: sub.totalCredits,
  };
  
  // ✅ Add to KV store directly (same as regular paid credits)
  const currentPaidCredits = await kv.get(`credits:${userId}:paid`) || 0;
  const newPaidCredits = Number(currentPaidCredits) + credits;
  await kv.set(`credits:${userId}:paid`, newPaidCredits);
  
  console.log(`💎 [Enterprise] Added ${credits} add-on credits to ${userId}: ${currentPaidCredits} → ${newPaidCredits}`);
  
  // Log transaction
  await logEnterpriseTransaction({
    id: crypto.randomUUID(),
    userId,
    amount: credits,
    type: 'addon_purchase',
    creditType: 'addon',
    reason: stripePaymentId ? `Add-on purchase (${stripePaymentId})` : 'Add-on purchase',
    timestamp: new Date().toISOString(),
    balanceBefore,
    balanceAfter: {
      subscription: sub.subscriptionCreditsRemaining,
      addon: newPaidCredits,
      total: sub.subscriptionCreditsRemaining + newPaidCredits,
    },
  });
  
  console.log(`✅ Added ${credits} add-on credits to ${userId}`);
}

// ============================================================================
// CANCEL SUBSCRIPTION
// ============================================================================

/**
 * Cancel enterprise subscription (at period end)
 */
export async function cancelEnterpriseSubscription(
  userId: string
): Promise<void> {
  const sub = await getEnterpriseSubscription(userId);
  
  if (!sub) {
    throw new Error('No enterprise subscription found');
  }
  
  sub.subscriptionStatus = 'canceled';
  sub.updatedAt = new Date().toISOString();
  
  const key = `enterprise:subscription:${userId}`;
  await kv.set(key, sub);
  
  console.log(`❌ Cancelled enterprise subscription for ${userId}`);
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Log enterprise credit transaction
 */
async function logEnterpriseTransaction(
  transaction: CreditTransaction
): Promise<void> {
  const key = `enterprise:transaction:${transaction.userId}:${transaction.id}`;
  await kv.set(key, transaction);
}

/**
 * Get transaction history
 */
export async function getEnterpriseTransactions(
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const prefix = `enterprise:transaction:${userId}:`;
  const transactions = await kv.getByPrefix<CreditTransaction>(prefix);
  
  if (!transactions) return [];
  
  // Sort by timestamp descending
  return transactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// ============================================================================
// PRICING HELPERS
// ============================================================================

export function calculateAddonPrice(credits: number): number {
  return credits * ADDON_PRICE_PER_CREDIT;
}

export function getMinimumAddonPurchase(): { credits: number; price: number } {
  return {
    credits: ADDON_MIN_PURCHASE,
    price: calculateAddonPrice(ADDON_MIN_PURCHASE),
  };
}

export function getMonthlyCredits(): number {
  return MONTHLY_CREDITS;
}

// ============================================================================
// ACCESS CHECK
// ============================================================================

/**
 * ✅ SECURITY: Check if user has active subscription and can access Coconut V14
 * Returns { hasAccess: boolean, reason?: string }
 */
export async function checkEnterpriseAccess(userId: string): Promise<{
  hasAccess: boolean;
  reason?: string;
  subscription?: EnterpriseSubscription;
}> {
  const sub = await getEnterpriseSubscription(userId);
  
  if (!sub) {
    return {
      hasAccess: false,
      reason: 'No enterprise subscription found. Subscribe to access Coconut V14.',
    };
  }
  
  if (sub.subscriptionStatus !== 'active') {
    return {
      hasAccess: false,
      reason: `Subscription is ${sub.subscriptionStatus}. Please renew to continue.`,
      subscription: sub,
    };
  }
  
  const now = new Date();
  const periodEnd = new Date(sub.currentPeriodEnd);
  
  if (now > periodEnd) {
    return {
      hasAccess: false,
      reason: `Subscription period expired on ${periodEnd.toLocaleDateString()}. Please renew.`,
      subscription: sub,
    };
  }
  
  return {
    hasAccess: true,
    subscription: sub,
  };
}