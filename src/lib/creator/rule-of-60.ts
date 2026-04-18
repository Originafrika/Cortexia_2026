/**
 * CREATOR ECONOMY - RULE OF 60 TRACKING SERVICE
 * 
 * Eligibility requirements for Top Creator status:
 * - 60+ generations in the month
 * - 5+ publications on the feed
 * - Buy 35+ premium credits (25 free + 35 bought = 60 credits → 60 generations)
 * 
 * Commission structure with streak multipliers:
 * - Month 1: ×1.0 (10%)
 * - Month 2: ×1.1 (11%)
 * - Month 3: ×1.2 (12%)
 * - Month 4: ×1.3 (13%)
 * - Month 5+: ×1.5 (15% max)
 */

import { db } from '../db';
import { creatorStats, creatorCommissions, creditTransactions, users } from '../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export interface RuleOf60Status {
  userId: string;
  month: string; // YYYY-MM format
  generationsCount: number;
  postsPublished: number;
  postsWithMinLikes: number;
  creditsPurchased: number;
  meetsGenerations: boolean;
  meetsPosts: boolean;
  meetsCredits: boolean;
  isEligible: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
  lastEligibleMonth: string | null;
}

export interface OriginsBalance {
  available: number;
  pending: number;
  totalEarned: number;
  referralCount: number;
}

// Constants for Rule of 60
const RULE_OF_60 = {
  MIN_GENERATIONS: 60,
  MIN_POSTS: 5,
  MIN_POST_LIKES: 5,
  MIN_CREDITS_PURCHASED: 35,
  MIN_WITHDRAWAL: 10, // $10 USD minimum (Fedapay only for individuals)
  WITHDRAWAL_FEE_RATE: 0.029, // 2.9%
  WITHDRAWAL_FEE_FIXED: 0.30, // $0.30
} as const;

// Streak multipliers
const STREAK_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.0,
  2: 1.1,
  3: 1.2,
  4: 1.3,
  5: 1.5, // Max at 5+ months
};

/**
 * Calculate streak multiplier based on consecutive eligible months
 */
export function calculateStreakMultiplier(streak: number): number {
  if (streak >= 5) return STREAK_MULTIPLIERS[5];
  return STREAK_MULTIPLIERS[streak] || 1.0;
}

/**
 * Get current month's Rule of 60 status for a user
 */
export async function getRuleOf60Status(userId: string): Promise<RuleOf60Status> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Get stats from database
  const [stats] = await db
    .select()
    .from(creatorStats)
    .where(and(
      eq(creatorStats.userId, userId),
      eq(creatorStats.month, month)
    ))
    .limit(1);
  
  if (!stats) {
    return {
      userId,
      month,
      generationsCount: 0,
      postsPublished: 0,
      postsWithMinLikes: 0,
      creditsPurchased: 0,
      meetsGenerations: false,
      meetsPosts: false,
      meetsCredits: false,
      isEligible: false,
    };
  }
  
  const meetsGenerations = stats.generationsCount >= RULE_OF_60.MIN_GENERATIONS;
  const meetsPosts = stats.postsPublished >= RULE_OF_60.MIN_POSTS;
  const meetsCredits = stats.creditsPurchased >= RULE_OF_60.MIN_CREDITS_PURCHASED;
  
  return {
    userId,
    month,
    generationsCount: stats.generationsCount,
    postsPublished: stats.postsPublished,
    postsWithMinLikes: stats.postsWithMinLikes,
    creditsPurchased: stats.creditsPurchased,
    meetsGenerations,
    meetsPosts,
    meetsCredits,
    isEligible: meetsGenerations && meetsPosts && meetsCredits,
  };
}

/**
 * Record a generation for Rule of 60 tracking
 */
export async function recordGeneration(
  userId: string,
  metadata?: { type: string; model: string }
): Promise<void> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Try to update existing record
  const [existing] = await db
    .select({ count: creatorStats.generationsCount })
    .from(creatorStats)
    .where(and(
      eq(creatorStats.userId, userId),
      eq(creatorStats.month, month)
    ))
    .limit(1);
  
  if (existing) {
    await db
      .update(creatorStats)
      .set({
        generationsCount: sql`${creatorStats.generationsCount} + 1`,
        updatedAt: now,
      })
      .where(and(
        eq(creatorStats.userId, userId),
        eq(creatorStats.month, month)
      ));
  } else {
    await db.insert(creatorStats).values({
      id: crypto.randomUUID(),
      userId,
      month,
      generationsCount: 1,
      postsPublished: 0,
      postsWithMinLikes: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalDownloads: 0,
      creditsPurchased: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  console.log(`[RuleOf60] Recorded generation for ${userId}, month: ${month}`);
}

/**
 * Record a post publication
 */
export async function recordPost(
  userId: string,
  postId: string
): Promise<void> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [existing] = await db
    .select({ posts: creatorStats.postsPublished })
    .from(creatorStats)
    .where(and(
      eq(creatorStats.userId, userId),
      eq(creatorStats.month, month)
    ))
    .limit(1);
  
  if (existing) {
    await db
      .update(creatorStats)
      .set({
        postsPublished: sql`${creatorStats.postsPublished} + 1`,
        updatedAt: now,
      })
      .where(and(
        eq(creatorStats.userId, userId),
        eq(creatorStats.month, month)
      ));
  } else {
    await db.insert(creatorStats).values({
      id: crypto.randomUUID(),
      userId,
      month,
      generationsCount: 0,
      postsPublished: 1,
      postsWithMinLikes: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalDownloads: 0,
      creditsPurchased: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Record credit purchase for Rule of 60
 */
export async function recordCreditPurchase(
  userId: string,
  creditsAmount: number,
  amountUsd: number
): Promise<void> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [existing] = await db
    .select({ credits: creatorStats.creditsPurchased })
    .from(creatorStats)
    .where(and(
      eq(creatorStats.userId, userId),
      eq(creatorStats.month, month)
    ))
    .limit(1);
  
  if (existing) {
    await db
      .update(creatorStats)
      .set({
        creditsPurchased: sql`${creatorStats.creditsPurchased} + ${creditsAmount}`,
        updatedAt: now,
      })
      .where(and(
        eq(creatorStats.userId, userId),
        eq(creatorStats.month, month)
      ));
  } else {
    await db.insert(creatorStats).values({
      id: crypto.randomUUID(),
      userId,
      month,
      generationsCount: 0,
      postsPublished: 0,
      postsWithMinLikes: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalDownloads: 0,
      creditsPurchased: creditsAmount,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Get streak information for a user
 */
export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  // Get user's streak info from database
  const [user] = await db
    .select({
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
      lastTopCreatorMonth: users.lastTopCreatorMonth,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      multiplier: 1.0,
      lastEligibleMonth: null,
    };
  }
  
  const multiplier = calculateStreakMultiplier(user.currentStreak || 0);
  
  return {
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    multiplier,
    lastEligibleMonth: user.lastTopCreatorMonth,
  };
}

/**
 * Update streak after month-end calculation
 */
export async function updateStreak(
  userId: string,
  wasEligible: boolean,
  month: string
): Promise<StreakInfo> {
  const [user] = await db
    .select({
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
      lastTopCreatorMonth: users.lastTopCreatorMonth,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user) throw new Error('User not found');
  
  let newStreak = 0;
  
  if (wasEligible) {
    // Check if last eligible month was consecutive
    const lastMonth = user.lastTopCreatorMonth;
    if (lastMonth) {
      const lastDate = new Date(lastMonth + '-01');
      const currentDate = new Date(month + '-01');
      const diffMonths = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - lastDate.getMonth());
      
      if (diffMonths === 1) {
        // Consecutive month
        newStreak = (user.currentStreak || 0) + 1;
      } else {
        // Gap, start new streak
        newStreak = 1;
      }
    } else {
      // First time eligible
      newStreak = 1;
    }
  } else {
    // Not eligible, streak breaks
    newStreak = 0;
  }
  
  const newLongest = Math.max(user.longestStreak || 0, newStreak);
  const multiplier = calculateStreakMultiplier(newStreak);
  
  await db
    .update(users)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastTopCreatorMonth: wasEligible ? month : user.lastTopCreatorMonth,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    multiplier,
    lastEligibleMonth: wasEligible ? month : user.lastTopCreatorMonth,
  };
}

/**
 * Calculate commission for a referral purchase
 */
export async function calculateCommission(
  referrerId: string,
  purchaseAmount: number
): Promise<{ commission: number; multiplier: number; rate: number }> {
  const streak = await getStreakInfo(referrerId);
  const rate = 0.10 * streak.multiplier; // Base 10% × multiplier
  const commission = purchaseAmount * rate;
  
  return {
    commission: Math.round(commission * 100) / 100, // Round to 2 decimals
    multiplier: streak.multiplier,
    rate: Math.round(rate * 1000) / 10, // As percentage (e.g., 12.0%)
  };
}

/**
 * Add Origins (commission) to referrer's balance
 */
export async function addCommission(
  referrerId: string,
  referredId: string,
  purchaseAmount: number,
  commissionAmount: number,
  transactionId: string
): Promise<void> {
  await db.insert(creatorCommissions).values({
    id: crypto.randomUUID(),
    referrerId,
    referredId,
    transactionId,
    amount: purchaseAmount,
    commissionAmount,
    status: 'cleared',
    createdAt: new Date(),
    clearedAt: new Date(),
  });
  
  // Update user's referral earnings
  await db
    .update(users)
    .set({
      originsBalance: sql`${users.originsBalance} + ${commissionAmount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, referrerId));
  
  console.log(`[RuleOf60] Added ${commissionAmount} Origins to ${referrerId} from ${referredId}`);
}

/**
 * Get Origins balance for withdrawal
 */
export async function getOriginsBalance(userId: string): Promise<OriginsBalance> {
  const [user] = await db
    .select({
      originsBalance: users.originsBalance,
      originsPending: users.originsPending,
      originsTotalEarned: users.originsTotalEarned,
      referralCount: users.referralCount,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user) {
    return {
      available: 0,
      pending: 0,
      totalEarned: 0,
      referralCount: 0,
    };
  }
  
  return {
    available: user.originsBalance || 0,
    pending: user.originsPending || 0,
    totalEarned: user.originsTotalEarned || 0,
    referralCount: user.referralCount || 0,
  };
}

/**
 * Request withdrawal of Origins
 */
export async function requestWithdrawal(
  userId: string,
  amount: number
): Promise<{ success: boolean; payoutId?: string; fee?: number; netAmount?: number; error?: string }> {
  // Check minimum
  if (amount < RULE_OF_60.MIN_WITHDRAWAL) {
    return {
      success: false,
      error: `Minimum withdrawal is ${RULE_OF_60.MIN_WITHDRAWAL} Origins`,
    };
  }
  
  // Check balance
  const balance = await getOriginsBalance(userId);
  if (balance.available < amount) {
    return {
      success: false,
      error: 'Insufficient Origins balance',
    };
  }
  
  // Calculate fees
  const fee = (amount * RULE_OF_60.WITHDRAWAL_FEE_RATE) + RULE_OF_60.WITHDRAWAL_FEE_FIXED;
  const netAmount = amount - fee;
  
  // TODO: Integrate with Stripe Connect for actual payout
  // For now, create a pending withdrawal record
  
  // Deduct from available
  await db
    .update(users)
    .set({
      originsBalance: sql`${users.originsBalance} - ${amount}`,
      originsPending: sql`${users.originsPending} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  return {
    success: true,
    payoutId: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fee: Math.round(fee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}

/**
 * Run month-end processing for all users
 * - Calculate eligibility
 * - Update streaks
 * - Grant Coconut access to eligible creators
 */
export async function runMonthEndProcessing(year: number, month: number): Promise<void> {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  console.log(`[RuleOf60] Running month-end processing for ${monthStr}`);
  
  // Get all creators with activity this month
  const activeCreators = await db
    .select({ userId: creatorStats.userId })
    .from(creatorStats)
    .where(eq(creatorStats.month, monthStr));
  
  for (const { userId } of activeCreators) {
    const status = await getRuleOf60Status(userId);
    const streak = await updateStreak(userId, status.isEligible, monthStr);
    
    if (status.isEligible) {
      // Grant Coconut access for next month
      await db
        .update(users)
        .set({
          hasCoconutAccess: true,
          coconutAccessGrantedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      console.log(`[RuleOf60] ✅ User ${userId} qualified as Top Creator for ${monthStr}`);
      console.log(`[RuleOf60]    Streak: ${streak.currentStreak} months, Multiplier: ${streak.multiplier}x`);
    } else {
      // Revoke Coconut access if not eligible
      await db
        .update(users)
        .set({
          hasCoconutAccess: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      console.log(`[RuleOf60] ❌ User ${userId} did not qualify for ${monthStr}`);
    }
  }
  
  console.log(`[RuleOf60] Month-end processing complete for ${monthStr}`);
}

// Export constants for use in other modules
export { RULE_OF_60, STREAK_MULTIPLIERS };
