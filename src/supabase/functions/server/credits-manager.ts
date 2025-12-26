/**
 * CREDITS MANAGER
 * 
 * Gère la déduction et le suivi des crédits utilisateurs
 */

import * as kv from './kv_store.tsx';

export interface CreditTransaction {
  userId: string;
  amount: number;
  type: 'free' | 'paid';
  operation: 'deduct' | 'refund';
  reason: string;
  metadata?: any;
  timestamp: number;
}

export interface UserCredits {
  userId: string;
  free: number;
  paid: number;
  lastUpdated: number;
}

/**
 * Get user credits
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  const key = `credits:${userId}`;
  const stored = await kv.get(key);
  
  if (!stored) {
    // Initialize new user with 25 free credits
    const initial: UserCredits = {
      userId,
      free: 25,
      paid: 0,
      lastUpdated: Date.now()
    };
    await kv.set(key, initial);
    return initial;
  }
  
  return stored as UserCredits;
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; remaining: UserCredits; error?: string }> {
  console.log(`💳 Deducting ${amount} credits from user ${userId}: ${reason}`);
  
  const credits = await getUserCredits(userId);
  
  // Check if user has enough credits
  const totalAvailable = credits.paid + credits.free;
  if (totalAvailable < amount) {
    console.error(`❌ Insufficient credits: need ${amount}, have ${totalAvailable}`);
    return {
      success: false,
      remaining: credits,
      error: `Insufficient credits. Need ${amount}, have ${totalAvailable}.`
    };
  }
  
  // Deduct from paid first, then free
  let remaining = amount;
  let paidDeducted = 0;
  let freeDeducted = 0;
  
  if (credits.paid >= remaining) {
    // Deduct all from paid
    paidDeducted = remaining;
    credits.paid -= remaining;
    remaining = 0;
  } else {
    // Deduct what we can from paid, rest from free
    paidDeducted = credits.paid;
    credits.paid = 0;
    remaining -= paidDeducted;
    
    freeDeducted = remaining;
    credits.free -= remaining;
    remaining = 0;
  }
  
  credits.lastUpdated = Date.now();
  
  // Save updated credits
  await kv.set(`credits:${userId}`, credits);
  
  // Log transaction for paid credits
  if (paidDeducted > 0) {
    const transaction: CreditTransaction = {
      userId,
      amount: paidDeducted,
      type: 'paid',
      operation: 'deduct',
      reason,
      metadata,
      timestamp: Date.now()
    };
    await logTransaction(transaction);
  }
  
  // Log transaction for free credits
  if (freeDeducted > 0) {
    const transaction: CreditTransaction = {
      userId,
      amount: freeDeducted,
      type: 'free',
      operation: 'deduct',
      reason,
      metadata,
      timestamp: Date.now()
    };
    await logTransaction(transaction);
  }
  
  console.log(`✅ Credits deducted: ${paidDeducted} paid + ${freeDeducted} free. Remaining: ${credits.paid} paid + ${credits.free} free`);
  
  return {
    success: true,
    remaining: credits
  };
}

/**
 * Refund credits to user (in case of generation failure)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  originalType: 'free' | 'paid',
  reason: string,
  metadata?: any
): Promise<UserCredits> {
  console.log(`💰 Refunding ${amount} ${originalType} credits to user ${userId}: ${reason}`);
  
  const credits = await getUserCredits(userId);
  
  // Refund to the original type
  if (originalType === 'paid') {
    credits.paid += amount;
  } else {
    credits.free += amount;
  }
  
  credits.lastUpdated = Date.now();
  
  // Save updated credits
  await kv.set(`credits:${userId}`, credits);
  
  // Log refund transaction
  const transaction: CreditTransaction = {
    userId,
    amount,
    type: originalType,
    operation: 'refund',
    reason,
    metadata,
    timestamp: Date.now()
  };
  await logTransaction(transaction);
  
  console.log(`✅ Credits refunded. New balance: ${credits.paid} paid + ${credits.free} free`);
  
  return credits;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
  userId: string,
  required: number
): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return (credits.paid + credits.free) >= required;
}

/**
 * Calculate cost for a generation
 */
export function calculateGenerationCost(
  model: string,
  params: any
): number {
  // Image generation costs
  if (model === 'flux-2-pro') {
    const resolution = params.resolution || '1K';
    const baseCost = resolution === '2K' ? 2 : 1;
    const refImagesCost = Math.min(params.referenceImages?.length || 0, 8);
    return baseCost + refImagesCost;
  }
  
  if (model === 'flux-2-flex') {
    const resolution = params.resolution || '1K';
    const baseCost = resolution === '2K' ? 6 : 3;
    const refImagesCost = Math.min(params.referenceImages?.length || 0, 8);
    return baseCost + refImagesCost;
  }
  
  // Video generation costs
  if (model === 'veo-3.1-fast') {
    const duration = params.duration || 5;
    return Math.ceil(duration / 5) * 2; // 2 credits per 5 seconds
  }
  
  // Free tier models (flux-schnell, etc.)
  if (model === 'flux-schnell' || model === 'flux-1-schnell') {
    return 0; // Free with Together AI
  }
  
  // Default cost
  return 1;
}

/**
 * Log credit transaction for audit trail
 */
async function logTransaction(transaction: CreditTransaction): Promise<void> {
  const key = `credit_tx:${transaction.userId}:${transaction.timestamp}`;
  await kv.set(key, transaction);
  
  console.log(`📝 Transaction logged: ${transaction.operation} ${transaction.amount} ${transaction.type} credits`);
}

/**
 * Get user transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const prefix = `credit_tx:${userId}:`;
  const transactions = await kv.getByPrefix(prefix);
  
  // Sort by timestamp (newest first) and limit
  return transactions
    .sort((a: any, b: any) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Add paid credits to user account (for purchases)
 */
export async function addPaidCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<UserCredits> {
  console.log(`💎 Adding ${amount} paid credits to user ${userId}: ${reason}`);
  
  const credits = await getUserCredits(userId);
  credits.paid += amount;
  credits.lastUpdated = Date.now();
  
  await kv.set(`credits:${userId}`, credits);
  
  // Log transaction
  const transaction: CreditTransaction = {
    userId,
    amount,
    type: 'paid',
    operation: 'deduct', // Negative deduction = addition
    reason,
    timestamp: Date.now()
  };
  await logTransaction(transaction);
  
  console.log(`✅ Paid credits added. New balance: ${credits.paid} paid + ${credits.free} free`);
  
  return credits;
}
