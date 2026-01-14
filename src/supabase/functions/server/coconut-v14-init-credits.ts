/**
 * COCONUT V14 - INITIALIZE DEMO USER CREDITS
 * Give demo user initial credits for testing
 */

import * as kv from './kv_store.tsx';

/**
 * Initialize demo user with credits
 */
export async function initDemoUserCredits(userId: string = 'demo-user', freeCredits: number = 500): Promise<void> {
  try {
    console.log(`💰 Initializing ${userId} with ${freeCredits} credits...`);
    
    // Check existing credits
    const existing = await kv.get(`user:${userId}:credits`);
    
    if (existing) {
      console.log(`ℹ️ User already has credits:`, existing);
      // Don't overwrite, just add more if needed
      const currentTotal = (existing as any).free + (existing as any).paid;
      if (currentTotal < freeCredits) {
        (existing as any).free += (freeCredits - currentTotal);
        await kv.set(`user:${userId}:credits`, existing);
        console.log(`✅ Added credits. New total: ${(existing as any).free + (existing as any).paid}`);
      } else {
        console.log(`✅ User already has sufficient credits (${currentTotal})`);
      }
    } else {
      // Initialize new credits
      const credits = {
        free: freeCredits,
        paid: 0,
      };
      await kv.set(`user:${userId}:credits`, credits);
      console.log(`✅ Initialized ${userId} with ${freeCredits} free credits`);
    }
    
  } catch (error) {
    console.error('❌ Error initializing credits:', error);
    throw error;
  }
}

/**
 * Get user credits
 */
export async function getUserCredits(userId: string): Promise<{ free: number; paid: number; total: number }> {
  // ✅ PRIORITY: Check user profile first (has freeCredits/paidCredits)
  const userProfile = await kv.get(`user:profile:${userId}`);
  
  if (userProfile && (userProfile as any).freeCredits !== undefined) {
    const free = (userProfile as any).freeCredits || 0;
    const paid = (userProfile as any).paidCredits || 0;
    return {
      free,
      paid,
      total: free + paid,
    };
  }
  
  // ✅ FALLBACK: Check credits storage (might have free/paid OR freeCredits/paidCredits)
  const credits = await kv.get(`user:${userId}:credits`) || { free: 0, paid: 0 };
  
  // Handle both naming conventions
  const free = (credits as any).free ?? (credits as any).freeCredits ?? 0;
  const paid = (credits as any).paid ?? (credits as any).paidCredits ?? 0;
  
  return {
    free,
    paid,
    total: free + paid,
  };
}

/**
 * Add credits to user
 */
export async function addCredits(userId: string, amount: number, type: 'free' | 'paid' = 'free'): Promise<void> {
  const credits = await kv.get(`user:${userId}:credits`) || { free: 0, paid: 0 };
  
  if (type === 'free') {
    (credits as any).free += amount;
  } else {
    (credits as any).paid += amount;
  }
  
  await kv.set(`user:${userId}:credits`, credits);
  console.log(`✅ Added ${amount} ${type} credits to ${userId}. New total: ${(credits as any).free + (credits as any).paid}`);
}