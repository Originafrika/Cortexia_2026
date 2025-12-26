// Credit System - Calculation & Management
// Handles credit deduction, cost calculation, and priority logic

import type { 
  UserCredits, 
  CreditDeduction, 
  GenerationParams, 
  CostCalculation,
  ModelConfig 
} from './types';
import { CREDIT_CONSTANTS } from './config';

/**
 * Calculate total cost for a generation
 */
export function calculateGenerationCost(
  params: GenerationParams,
  model: ModelConfig
): CostCalculation {
  
  let baseGeneration = model.costPerGeneration;
  let referenceImages = 0;
  let enhancement = 0;
  let duration = 0;
  
  // Reference images cost
  if (params.referenceImages && params.referenceImages.length > 0) {
    referenceImages = params.referenceImages.length * model.costPerReferenceImage;
  }
  
  // Enhancement bonus
  if (params.isEnhancement) {
    enhancement = model.enhancementBonus;
  }
  
  // Video duration cost (for video models)
  if (params.type === 'video' && params.duration) {
    duration = params.duration * model.costPerGeneration; // 1 credit per second
  }
  
  const total = baseGeneration + referenceImages + enhancement + duration;
  const usd = total * CREDIT_CONSTANTS.CREDIT_TO_USD;
  
  return {
    baseGeneration,
    referenceImages,
    enhancement,
    duration,
    total,
    usd
  };
}

/**
 * Deduct credits from user balance
 * PRIORITY: Paid credits FIRST, then free credits
 */
export function deductCredits(
  cost: number,
  currentBalance: UserCredits
): CreditDeduction {
  
  // Check if user has enough total credits
  const totalAvailable = currentBalance.paid + currentBalance.free;
  
  if (totalAvailable < cost) {
    return {
      success: false,
      paidCreditsUsed: 0,
      freeCreditsUsed: 0,
      newBalance: currentBalance,
      error: `Insufficient credits. Need ${cost}, have ${totalAvailable}`
    };
  }
  
  // Deduct from PAID credits first
  let remaining = cost;
  let paidUsed = 0;
  let freeUsed = 0;
  
  if (currentBalance.paid >= remaining) {
    // Can pay entirely with paid credits
    paidUsed = remaining;
    remaining = 0;
  } else {
    // Use all paid credits, then dip into free
    paidUsed = currentBalance.paid;
    remaining = remaining - currentBalance.paid;
  }
  
  // Use free credits for remainder (if any)
  if (remaining > 0) {
    freeUsed = remaining;
    remaining = 0;
  }
  
  // Calculate new balance
  const newBalance: UserCredits = {
    paid: currentBalance.paid - paidUsed,
    free: currentBalance.free - freeUsed,
    total: (currentBalance.paid - paidUsed) + (currentBalance.free - freeUsed)
  };
  
  return {
    success: true,
    paidCreditsUsed: paidUsed,
    freeCreditsUsed: freeUsed,
    newBalance
  };
}

/**
 * Check if user can afford generation
 */
export function canAffordGeneration(
  cost: number,
  balance: UserCredits
): boolean {
  return balance.total >= cost;
}

/**
 * Get credits needed to purchase
 */
export function getCreditsNeeded(
  cost: number,
  balance: UserCredits
): number {
  const shortfall = cost - balance.total;
  return Math.max(0, shortfall);
}

/**
 * Preview credit deduction (without actually deducting)
 */
export function previewCreditDeduction(
  cost: number,
  balance: UserCredits
): {
  canAfford: boolean;
  paidUsed: number;
  freeUsed: number;
  remaining: UserCredits;
  shortfall: number;
} {
  
  const canAfford = balance.total >= cost;
  
  if (!canAfford) {
    return {
      canAfford: false,
      paidUsed: 0,
      freeUsed: 0,
      remaining: balance,
      shortfall: cost - balance.total
    };
  }
  
  // Calculate what would be used
  let paidUsed = Math.min(balance.paid, cost);
  let freeUsed = Math.max(0, cost - paidUsed);
  
  return {
    canAfford: true,
    paidUsed,
    freeUsed,
    remaining: {
      paid: balance.paid - paidUsed,
      free: balance.free - freeUsed,
      total: (balance.paid - paidUsed) + (balance.free - freeUsed)
    },
    shortfall: 0
  };
}

/**
 * Format credit deduction for display
 */
export function formatCreditDeduction(deduction: CreditDeduction): string {
  if (!deduction.success) {
    return deduction.error || 'Deduction failed';
  }
  
  const parts: string[] = [];
  
  if (deduction.paidCreditsUsed > 0) {
    parts.push(`${deduction.paidCreditsUsed} paid`);
  }
  
  if (deduction.freeCreditsUsed > 0) {
    parts.push(`${deduction.freeCreditsUsed} free`);
  }
  
  return parts.join(' + ') + ' credits used';
}

/**
 * Get time until free credits reset (monthly)
 */
export function getTimeUntilMonthlyReset(): {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
} {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, CREDIT_CONSTANTS.RENEWAL_DAY, 0, 0, 0, 0);
  
  const diff = nextMonth.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes, totalMs: diff };
}

/**
 * Get time until Pollinations daily reset
 */
export function getTimeUntilPollinationsReset(): {
  hours: number;
  minutes: number;
  totalMs: number;
} {
  const now = new Date();
  const nextReset = new Date();
  nextReset.setUTCHours(CREDIT_CONSTANTS.POLLINATIONS_RESET_HOUR, 0, 0, 0);
  
  // If reset time already passed today, set to tomorrow
  if (nextReset.getTime() <= now.getTime()) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }
  
  const diff = nextReset.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, totalMs: diff };
}

/**
 * Format time until reset
 */
export function formatTimeUntilReset(time: { days?: number; hours: number; minutes: number }): string {
  const parts: string[] = [];
  
  if (time.days && time.days > 0) {
    parts.push(`${time.days}d`);
  }
  
  if (time.hours > 0) {
    parts.push(`${time.hours}h`);
  }
  
  if (time.minutes > 0 || parts.length === 0) {
    parts.push(`${time.minutes}m`);
  }
  
  return parts.join(' ');
}

/**
 * Check if user should be prompted to upgrade
 */
export function shouldPromptUpgrade(balance: UserCredits): boolean {
  // Prompt if low on total credits
  return balance.total < 5;
}

/**
 * Get recommended credit package based on usage
 */
export function getRecommendedPackage(
  averageGenerationsPerDay: number
): number {
  // Estimate monthly usage
  const monthlyUsage = averageGenerationsPerDay * 30;
  
  if (monthlyUsage <= 10) return 10;
  if (monthlyUsage <= 50) return 50;
  if (monthlyUsage <= 100) return 100;
  return 500;
}
