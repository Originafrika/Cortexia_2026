// credits.tsx - Credit management system with user choice (free vs paid)

import * as kv from "./kv_store.tsx";

export interface UserCredits {
  free: number;
  paid: number;
  lastReset: string; // ISO date
}

export interface CreditDeductionResult {
  success: boolean;
  remaining: {
    free: number;
    paid: number;
  };
  used: number;
  type: 'free' | 'paid';
  error?: string;
}

/**
 * Get user credits (free + paid)
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  try {
    const freeCredits = await kv.get(`credits:${userId}:free`);
    const paidCredits = await kv.get(`credits:${userId}:paid`);
    const lastReset = await kv.get(`credits:${userId}:lastReset`);
    
    console.log(`[Credits] Raw KV data for ${userId}:`, {
      freeCredits,
      paidCredits,
      lastReset
    });
    
    return {
      free: Number(freeCredits || 0),
      paid: Number(paidCredits || 0),
      lastReset: String(lastReset || new Date().toISOString())
    };
  } catch (error) {
    console.error(`[Credits] Error getting credits for ${userId}:`, error);
    // Return defaults on error
    return {
      free: 0,
      paid: 0,
      lastReset: new Date().toISOString()
    };
  }
}

/**
 * Initialize new user with default free credits
 */
export async function initializeUserCredits(userId: string): Promise<void> {
  const existing = await getUserCredits(userId);
  
  // Only initialize if no credits exist
  if (existing.free === 0 && existing.paid === 0) {
    await kv.set(`credits:${userId}:free`, 25);
    await kv.set(`credits:${userId}:paid`, 100); // ✅ Initialize with 100 paid credits for testing
    await kv.set(`credits:${userId}:lastReset`, new Date().toISOString());
    
    console.log(`✅ Initialized ${userId} with 25 free credits and 100 paid credits`);
  }
}

/**
 * Check if monthly reset is needed (30 days since last reset)
 */
export async function checkAndResetFreeCredits(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId);
  const lastResetDate = new Date(credits.lastReset);
  const now = new Date();
  const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Reset if 30+ days have passed
  if (daysSinceReset >= 30) {
    await kv.set(`credits:${userId}:free`, 25);
    await kv.set(`credits:${userId}:lastReset`, now.toISOString());
    
    console.log(`🔄 Reset free credits for ${userId} (${daysSinceReset} days since last reset)`);
    return true;
  }
  
  return false;
}

/**
 * Deduct credits based on user choice
 * User can choose to use 'free' or 'paid' credits
 */
export async function deductCredits(
  userId: string,
  cost: number,
  creditType: 'free' | 'paid'
): Promise<CreditDeductionResult> {
  // Check if reset needed
  await checkAndResetFreeCredits(userId);
  
  // Get current credits
  const credits = await getUserCredits(userId);
  
  // Validate sufficient credits
  const availableCredits = creditType === 'free' ? credits.free : credits.paid;
  
  if (availableCredits < cost) {
    return {
      success: false,
      remaining: {
        free: credits.free,
        paid: credits.paid
      },
      used: 0,
      type: creditType,
      error: `Insufficient ${creditType} credits. Need ${cost}, have ${availableCredits}`
    };
  }
  
  // Deduct credits
  const newAmount = availableCredits - cost;
  await kv.set(`credits:${userId}:${creditType}`, newAmount);
  
  console.log(`💎 Deducted ${cost} ${creditType} credits from ${userId}: ${availableCredits} → ${newAmount}`);
  
  return {
    success: true,
    remaining: {
      free: creditType === 'free' ? newAmount : credits.free,
      paid: creditType === 'paid' ? newAmount : credits.paid
    },
    used: cost,
    type: creditType
  };
}

/**
 * Add paid credits (for purchases)
 */
export async function addPaidCredits(
  userId: string,
  amount: number
): Promise<UserCredits> {
  const credits = await getUserCredits(userId);
  const newPaidCredits = credits.paid + amount;
  
  await kv.set(`credits:${userId}:paid`, newPaidCredits);
  
  console.log(`💰 Added ${amount} paid credits to ${userId}: ${credits.paid} → ${newPaidCredits}`);
  
  return {
    free: credits.free,
    paid: newPaidCredits,
    lastReset: credits.lastReset
  };
}

/**
 * Refund credits (when generation fails)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  creditType: 'free' | 'paid'
): Promise<UserCredits> {
  const credits = await getUserCredits(userId);
  const currentAmount = creditType === 'free' ? credits.free : credits.paid;
  const newAmount = currentAmount + amount;
  
  await kv.set(`credits:${userId}:${creditType}`, newAmount);
  
  console.log(`🔄 Refunded ${amount} ${creditType} credits to ${userId}: ${currentAmount} → ${newAmount}`);
  
  return {
    free: creditType === 'free' ? newAmount : credits.free,
    paid: creditType === 'paid' ? newAmount : credits.paid,
    lastReset: credits.lastReset
  };
}

/**
 * Get days until next free credit reset
 */
export async function getDaysUntilReset(userId: string): Promise<number> {
  const credits = await getUserCredits(userId);
  const lastResetDate = new Date(credits.lastReset);
  const now = new Date();
  const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, 30 - daysSinceReset);
}

/**
 * Admin: Manually reset user credits (for testing or support)
 */
export async function adminResetCredits(userId: string, free: number = 25, paid?: number): Promise<UserCredits> {
  await kv.set(`credits:${userId}:free`, free);
  
  if (paid !== undefined) {
    await kv.set(`credits:${userId}:paid`, paid);
  }
  
  await kv.set(`credits:${userId}:lastReset`, new Date().toISOString());
  
  console.log(`🔧 Admin reset credits for ${userId}: free=${free}, paid=${paid || 'unchanged'}`);
  
  return getUserCredits(userId);
}

/**
 * Get credit type recommendation based on quality
 */
export function recommendCreditType(quality: 'standard' | 'premium'): 'free' | 'paid' {
  return quality === 'premium' ? 'paid' : 'free';
}

/**
 * Validate if user can afford generation
 */
export async function canAffordGeneration(
  userId: string,
  cost: number,
  preferredCreditType: 'free' | 'paid'
): Promise<{ canAfford: boolean; availableType?: 'free' | 'paid'; error?: string }> {
  const credits = await getUserCredits(userId);
  
  // Check preferred type first
  if (preferredCreditType === 'free' && credits.free >= cost) {
    return { canAfford: true, availableType: 'free' };
  }
  
  if (preferredCreditType === 'paid' && credits.paid >= cost) {
    return { canAfford: true, availableType: 'paid' };
  }
  
  // Check alternative type
  if (preferredCreditType === 'free' && credits.paid >= cost) {
    return { 
      canAfford: true, 
      availableType: 'paid',
      error: 'Insufficient free credits, but paid credits available'
    };
  }
  
  if (preferredCreditType === 'paid' && credits.free >= cost) {
    return { 
      canAfford: true, 
      availableType: 'free',
      error: 'Insufficient paid credits, but free credits available'
    };
  }
  
  // Cannot afford with either type
  return { 
    canAfford: false,
    error: `Insufficient credits. Need ${cost}, have ${credits.free} free and ${credits.paid} paid`
  };
}