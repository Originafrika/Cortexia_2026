// Credit System Types - Dual Currency (Free + Paid)
// Free credits: 25/month renewable
// Paid credits: Purchased, never expire

export interface UserCredits {
  free: number;        // Free credits (max 25, renews monthly)
  paid: number;        // Paid credits (purchased)
  freeRenewDate: Date; // When free credits renew
  totalUsed: number;   // Lifetime credits used (analytics)
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'generation' | 'purchase' | 'renewal' | 'refund';
  amount: number;      // Positive = add, negative = deduct
  creditType: 'free' | 'paid';
  balance: {
    free: number;
    paid: number;
  };
  metadata?: {
    modelUsed?: string;
    templateId?: string;
    referenceImages?: number;
    enhancementUsed?: boolean;
    generationId?: string;
  };
  timestamp: Date;
}

export interface CreditCost {
  total: number;
  breakdown: {
    base: number;            // 1 credit base
    referenceImages: number; // +1 per reference image
    enhancement: number;     // +1 if enhancement enabled
  };
  willUse: 'free' | 'paid';  // Which credits will be used
}

// Credit pricing constants
export const CREDIT_PRICING = {
  USD_PER_CREDIT: 0.1,  // 1 credit = $0.10
  
  // Free tier
  FREE_MONTHLY_CREDITS: 25,
  
  // Paid packages
  PACKAGES: [
    { credits: 10, price: 0.99, bonus: 0 },      // $0.99 for 10 credits ($0.099/credit)
    { credits: 50, price: 4.49, bonus: 5 },      // $4.49 for 55 credits ($0.082/credit)
    { credits: 100, price: 7.99, bonus: 15 },    // $7.99 for 115 credits ($0.069/credit)
    { credits: 250, price: 17.99, bonus: 50 },   // $17.99 for 300 credits ($0.060/credit)
    { credits: 500, price: 29.99, bonus: 150 }   // $29.99 for 650 credits ($0.046/credit)
  ]
} as const;

// Generation costs
export const GENERATION_COSTS = {
  BASE: 1,                    // Base cost per generation
  PER_REFERENCE_IMAGE: 1,     // +1 per reference image
  ENHANCEMENT: 1,             // +1 if enhancement mode
  
  // Free models (Pollinations) - 0 credits if rate limit OK
  POLLINATIONS_SEEDREAM: 0,
  POLLINATIONS_NANOBANANA: 0,
  
  // Free fallback (Together AI) - 1 free credit
  FLUX_SCHNELL_FREE: 1,
  
  // Paid models - 1+ paid credits
  FLUX_2_PRO: 1,             // Base only
  FLUX_2_PRO_MULTI_REF: 1,   // +1 per ref image
  
  // Video (future)
  VIDEO_5SEC: 5,
  VIDEO_10SEC: 10
} as const;

/**
 * Calculate credit cost for a generation
 */
export function calculateCreditCost(params: {
  modelId: string;
  referenceImageCount?: number;
  enhancementEnabled?: boolean;
  userCredits: UserCredits;
}): CreditCost {
  const { modelId, referenceImageCount = 0, enhancementEnabled = false, userCredits } = params;
  
  // Free models (Pollinations) - 0 cost
  if (modelId === 'seedream' || modelId === 'nanobanana') {
    return {
      total: 0,
      breakdown: { base: 0, referenceImages: 0, enhancement: 0 },
      willUse: 'free'
    };
  }
  
  // Calculate breakdown
  const base = GENERATION_COSTS.BASE;
  const refCost = referenceImageCount * GENERATION_COSTS.PER_REFERENCE_IMAGE;
  const enhanceCost = enhancementEnabled ? GENERATION_COSTS.ENHANCEMENT : 0;
  const total = base + refCost + enhanceCost;
  
  // Determine which credits will be used
  // Priority: Paid credits first, then free credits
  const willUsePaid = userCredits.paid >= total;
  
  return {
    total,
    breakdown: {
      base,
      referenceImages: refCost,
      enhancement: enhanceCost
    },
    willUse: willUsePaid ? 'paid' : 'free'
  };
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(
  cost: CreditCost,
  userCredits: UserCredits
): { 
  canAfford: boolean; 
  creditType: 'free' | 'paid' | 'both' | 'none';
  shortage?: number;
} {
  const { total, willUse } = cost;
  
  // Free models - always affordable
  if (total === 0) {
    return { canAfford: true, creditType: 'free' };
  }
  
  // Check paid credits first (priority)
  if (userCredits.paid >= total) {
    return { canAfford: true, creditType: 'paid' };
  }
  
  // Check free credits
  if (userCredits.free >= total) {
    return { canAfford: true, creditType: 'free' };
  }
  
  // Check combined
  const combined = userCredits.paid + userCredits.free;
  if (combined >= total) {
    return { canAfford: true, creditType: 'both' };
  }
  
  // Not enough
  return { 
    canAfford: false, 
    creditType: 'none',
    shortage: total - combined
  };
}

/**
 * Deduct credits from user balance
 * Priority: Paid credits first, then free credits
 */
export function deductCredits(
  amount: number,
  userCredits: UserCredits
): { 
  success: boolean; 
  newBalance: UserCredits;
  deductedFrom: 'paid' | 'free' | 'both';
} {
  let remainingToDeduct = amount;
  let newPaid = userCredits.paid;
  let newFree = userCredits.free;
  let deductedFrom: 'paid' | 'free' | 'both' = 'paid';
  
  // Deduct from paid first
  if (newPaid >= remainingToDeduct) {
    newPaid -= remainingToDeduct;
    remainingToDeduct = 0;
  } else {
    remainingToDeduct -= newPaid;
    newPaid = 0;
    
    // Deduct remainder from free
    if (newFree >= remainingToDeduct) {
      newFree -= remainingToDeduct;
      remainingToDeduct = 0;
      deductedFrom = userCredits.paid > 0 ? 'both' : 'free';
    } else {
      // Not enough credits total
      return {
        success: false,
        newBalance: userCredits,
        deductedFrom: 'paid'
      };
    }
  }
  
  return {
    success: true,
    newBalance: {
      ...userCredits,
      paid: newPaid,
      free: newFree,
      totalUsed: userCredits.totalUsed + amount
    },
    deductedFrom
  };
}

/**
 * Check if free credits need renewal (monthly)
 */
export function shouldRenewFreeCredits(userCredits: UserCredits): boolean {
  const now = new Date();
  return now >= userCredits.freeRenewDate;
}

/**
 * Renew free credits (monthly)
 */
export function renewFreeCredits(userCredits: UserCredits): UserCredits {
  const now = new Date();
  const nextRenew = new Date(now);
  nextRenew.setMonth(nextRenew.getMonth() + 1);
  
  return {
    ...userCredits,
    free: CREDIT_PRICING.FREE_MONTHLY_CREDITS,
    freeRenewDate: nextRenew
  };
}

/**
 * Format credits display
 */
export function formatCredits(amount: number, type: 'free' | 'paid' | 'total' = 'total'): string {
  if (type === 'total') {
    return `${amount} ${amount === 1 ? 'credit' : 'credits'}`;
  }
  return `${amount} ${type} ${amount === 1 ? 'credit' : 'credits'}`;
}

/**
 * Format USD value
 */
export function creditsToUSD(credits: number): string {
  const usd = credits * CREDIT_PRICING.USD_PER_CREDIT;
  return `$${usd.toFixed(2)}`;
}
