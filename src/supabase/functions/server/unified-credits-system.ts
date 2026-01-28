/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED CREDITS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Single source of truth for all credit operations across Cortexia.
 * Handles Individual, Enterprise, and Developer accounts.
 * 
 * PRIORITY SYSTEM:
 * - PAID credits first (premium models: Flux Pro, Replicate, etc.)
 * - FREE credits second (Pollinations fallback only)
 */

import * as kv from './kv_store.tsx';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreditBalance {
  free: number;
  paid: number;
  total: number;
  isEnterprise: boolean;
  enterpriseMonthly?: number;
  enterpriseAddOn?: number;
  nextResetDate?: string;
}

export interface Transaction {
  userId: string;
  type: 'purchase' | 'usage' | 'refund' | 'grant' | 'reset';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  metadata?: any;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const KEYS = {
  creditsFree: (userId: string) => `credits:${userId}:free`,
  creditsPaid: (userId: string) => `credits:${userId}:paid`,
  enterpriseSubscription: (userId: string) => `enterprise:subscription:${userId}`,
  transaction: (userId: string, txId: string) => `credits:tx:${userId}:${txId}`,
  transactionList: (userId: string) => `credits:tx:${userId}:list`,
  
  // Legacy keys for migration
  legacyProfile: (userId: string) => `user:profile:${userId}`,
  legacyCredits: (userId: string) => `user:credits:${userId}`,
  legacyOldFormat: (userId: string) => `user:${userId}:credits`,
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user credit balance
 */
export async function getCredits(userId: string): Promise<CreditBalance> {
  // Get Individual/Developer credits
  const free = Number(await kv.get(KEYS.creditsFree(userId)) || 0);
  const paid = Number(await kv.get(KEYS.creditsPaid(userId)) || 0);
  
  // Check Enterprise subscription
  const enterpriseSub = await kv.get(KEYS.enterpriseSubscription(userId)) as any;
  const isEnterprise = !!(enterpriseSub && enterpriseSub.status === 'active');
  
  let enterpriseMonthly = 0;
  let enterpriseAddOn = 0;
  let nextResetDate: string | undefined;
  
  if (isEnterprise && enterpriseSub) {
    enterpriseMonthly = Number(enterpriseSub.monthlyCredits || 0);
    enterpriseAddOn = Number(enterpriseSub.addOnCredits || 0);
    nextResetDate = enterpriseSub.currentPeriodEnd;
  }
  
  const total = free + paid + enterpriseMonthly + enterpriseAddOn;
  
  // Auto-initialize new users
  if (total === 0 && !isEnterprise) {
    await kv.set(KEYS.creditsFree(userId), 25); // ✅ FIXED: 25 free credits for new Individual users (monthly reset)
    return {
      free: 25,
      paid: 0,
      total: 25,
      isEnterprise: false
    };
  }
  
  return {
    free,
    paid,
    total,
    isEnterprise,
    enterpriseMonthly,
    enterpriseAddOn,
    nextResetDate
  };
}

/**
 * Alias for getCredits() - for compatibility
 */
export async function getUserCredits(userId: string): Promise<CreditBalance> {
  return getCredits(userId);
}

/**
 * Add paid credits
 */
export async function addPaidCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<CreditBalance> {
  console.log(`💰 [Credits] Adding ${amount} PAID credits to ${userId}`);
  
  const current = await getCredits(userId);
  const newPaid = current.paid + amount;
  
  await kv.set(KEYS.creditsPaid(userId), newPaid);
  
  await logTransaction({
    userId,
    type: 'purchase',
    amount,
    balanceBefore: current.total,
    balanceAfter: current.total + amount,
    reason,
    metadata,
    timestamp: Date.now()
  });
  
  const newBalance = await getCredits(userId);
  console.log(`✅ [Credits] Added: ${current.total} → ${newBalance.total}`);
  
  return newBalance;
}

/**
 * Add free credits
 */
export async function addFreeCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<CreditBalance> {
  console.log(`🆓 [Credits] Adding ${amount} FREE credits to ${userId}`);
  
  const current = await getCredits(userId);
  const newFree = current.free + amount;
  
  await kv.set(KEYS.creditsFree(userId), newFree);
  
  await logTransaction({
    userId,
    type: 'purchase',
    amount,
    balanceBefore: current.total,
    balanceAfter: current.total + amount,
    reason,
    metadata,
    timestamp: Date.now()
  });
  
  const newBalance = await getCredits(userId);
  console.log(`✅ [Credits] Added: ${current.total} → ${newBalance.total}`);
  
  return newBalance;
}

/**
 * Deduct ONLY free credits
 */
export async function deductFreeCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
  console.log(`🆓 [Credits] Deducting ${amount} FREE credits from ${userId}: ${reason}`);
  
  const current = await getCredits(userId);
  
  // Check sufficient free credits
  if (current.free < amount) {
    console.error(`❌ [Credits] Insufficient FREE credits: need ${amount}, have ${current.free}`);
    return {
      success: false,
      balance: current,
      error: `Insufficient free credits. Need ${amount}, have ${current.free}.`
    };
  }
  
  // Deduct from free credits
  const newFree = current.free - amount;
  await kv.set(KEYS.creditsFree(userId), newFree);
  
  // Log transaction
  await logTransaction({
    userId,
    type: 'usage',
    amount: -amount,
    balanceBefore: current.total,
    balanceAfter: current.total - amount,
    reason,
    metadata: { ...metadata, creditType: 'free' },
    timestamp: Date.now()
  });
  
  const newBalance = await getCredits(userId);
  console.log(`✅ [Credits] FREE deduction complete: ${current.total} → ${newBalance.total}`);
  
  return { success: true, balance: newBalance };
}

/**
 * Deduct ONLY paid credits
 */
export async function deductPaidCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
  console.log(`💳 [Credits] Deducting ${amount} PAID credits from ${userId}: ${reason}`);
  
  const current = await getCredits(userId);
  
  // Check sufficient paid credits
  if (current.paid < amount) {
    console.error(`❌ [Credits] Insufficient PAID credits: need ${amount}, have ${current.paid}`);
    return {
      success: false,
      balance: current,
      error: `Insufficient paid credits. Need ${amount}, have ${current.paid}.`
    };
  }
  
  // Deduct from paid credits
  const newPaid = current.paid - amount;
  await kv.set(KEYS.creditsPaid(userId), newPaid);
  
  // Log transaction
  await logTransaction({
    userId,
    type: 'usage',
    amount: -amount,
    balanceBefore: current.total,
    balanceAfter: current.total - amount,
    reason,
    metadata: { ...metadata, creditType: 'paid' },
    timestamp: Date.now()
  });
  
  const newBalance = await getCredits(userId);
  console.log(`✅ [Credits] PAID deduction complete: ${current.total} → ${newBalance.total}`);
  
  return { success: true, balance: newBalance };
}

/**
 * Deduct credits with priority: PAID → FREE (or Enterprise)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
  console.log(`💳 [Credits] Deducting ${amount} from ${userId}: ${reason}`);
  
  const current = await getCredits(userId);
  
  // Check sufficient balance
  if (current.total < amount) {
    console.error(`❌ [Credits] Insufficient: need ${amount}, have ${current.total}`);
    return {
      success: false,
      balance: current,
      error: `Insufficient credits. Need ${amount}, have ${current.total}.`
    };
  }
  
  let remaining = amount;
  const usage = { paid: 0, free: 0, enterpriseMonthly: 0, enterpriseAddOn: 0 };
  
  // Priority 1: PAID credits (premium models)
  if (current.paid > 0 && remaining > 0) {
    const take = Math.min(remaining, current.paid);
    usage.paid = take;
    remaining -= take;
    await kv.set(KEYS.creditsPaid(userId), current.paid - take);
    console.log(`💳 [Credits] Used ${take} PAID credits`);
  }
  
  // Priority 2: FREE credits (Pollinations fallback)
  if (current.free > 0 && remaining > 0) {
    const take = Math.min(remaining, current.free);
    usage.free = take;
    remaining -= take;
    await kv.set(KEYS.creditsFree(userId), current.free - take);
    console.log(`🆓 [Credits] Used ${take} FREE credits`);
  }
  
  // Priority 3: Enterprise add-on credits
  if (current.isEnterprise && current.enterpriseAddOn && current.enterpriseAddOn > 0 && remaining > 0) {
    const take = Math.min(remaining, current.enterpriseAddOn);
    usage.enterpriseAddOn = take;
    remaining -= take;
    
    const enterpriseSub = await kv.get(KEYS.enterpriseSubscription(userId)) as any;
    enterpriseSub.addOnCredits = current.enterpriseAddOn - take;
    await kv.set(KEYS.enterpriseSubscription(userId), enterpriseSub);
    console.log(`💼 [Credits] Used ${take} ENTERPRISE ADD-ON credits`);
  }
  
  // Priority 4: Enterprise monthly credits
  if (current.isEnterprise && current.enterpriseMonthly && current.enterpriseMonthly > 0 && remaining > 0) {
    const take = Math.min(remaining, current.enterpriseMonthly);
    usage.enterpriseMonthly = take;
    remaining -= take;
    
    const enterpriseSub = await kv.get(KEYS.enterpriseSubscription(userId)) as any;
    enterpriseSub.monthlyCredits = current.enterpriseMonthly - take;
    await kv.set(KEYS.enterpriseSubscription(userId), enterpriseSub);
    console.log(`💼 [Credits] Used ${take} ENTERPRISE MONTHLY credits`);
  }
  
  // Log transaction
  await logTransaction({
    userId,
    type: 'usage',
    amount: -amount,
    balanceBefore: current.total,
    balanceAfter: current.total - amount,
    reason,
    metadata: { ...metadata, usage },
    timestamp: Date.now()
  });
  
  const newBalance = await getCredits(userId);
  console.log(`✅ [Credits] Deduction complete: ${current.total} → ${newBalance.total}`);
  
  return { success: true, balance: newBalance };
}

/**
 * Refund credits (when generation fails)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<CreditBalance> {
  console.log(`🔄 [Credits] Refunding ${amount} credits to ${userId}`);
  
  const current = await getCredits(userId);
  
  // Refund to paid credits (assumption: most refunds are from paid operations)
  const newPaid = current.paid + amount;
  await kv.set(KEYS.creditsPaid(userId), newPaid);
  
  await logTransaction({
    userId,
    type: 'refund',
    amount,
    balanceBefore: current.total,
    balanceAfter: current.total + amount,
    reason,
    metadata,
    timestamp: Date.now()
  });
  
  const newBalance = await getCredits(userId);
  console.log(`✅ [Credits] Refunded: ${current.total} → ${newBalance.total}`);
  
  return newBalance;
}

/**
 * Admin: Set credits directly
 */
export async function adminSetCredits(
  userId: string,
  free: number,
  paid: number,
  reason: string
): Promise<CreditBalance> {
  console.log(`🔧 [Credits] Admin setting credits for ${userId}: free=${free}, paid=${paid}`);
  
  const current = await getCredits(userId);
  
  await kv.set(KEYS.creditsFree(userId), free);
  await kv.set(KEYS.creditsPaid(userId), paid);
  
  await logTransaction({
    userId,
    type: 'grant',
    amount: (free + paid) - (current.free + current.paid),
    balanceBefore: current.total,
    balanceAfter: free + paid + (current.enterpriseMonthly || 0) + (current.enterpriseAddOn || 0),
    reason,
    metadata: { admin: true },
    timestamp: Date.now()
  });
  
  return await getCredits(userId);
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 20
): Promise<Transaction[]> {
  const listKey = KEYS.transactionList(userId);
  const txIds = (await kv.get(listKey) as string[]) || [];
  
  const recentTxIds = txIds.slice(-limit).reverse();
  
  const transactions: Transaction[] = [];
  for (const txId of recentTxIds) {
    const tx = await kv.get(KEYS.transaction(userId, txId));
    if (tx) {
      transactions.push(tx as Transaction);
    }
  }
  
  return transactions;
}

/**
 * Log a transaction
 */
async function logTransaction(tx: Transaction): Promise<void> {
  const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Store transaction
  await kv.set(KEYS.transaction(tx.userId, txId), tx);
  
  // Add to list
  const listKey = KEYS.transactionList(tx.userId);
  const existingList = (await kv.get(listKey) as string[]) || [];
  existingList.push(txId);
  
  // Keep only last 100 transactions
  if (existingList.length > 100) {
    existingList.shift();
  }
  
  await kv.set(listKey, existingList);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const CREDITS_SYSTEM_INFO = {
  version: '3.0.0',
  status: 'active',
  features: {
    individualCredits: true,
    enterpriseCredits: true,
    transactionHistory: true,
    refunds: true,
    adminTools: true
  }
};

console.log('✅ Unified Credits System loaded (v3.0.0)');