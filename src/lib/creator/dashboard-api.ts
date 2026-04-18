/**
 * CREATOR DASHBOARD API
 * Endpoints for Creator Economy dashboard
 */

import * as RuleOf60 from '../creator/rule-of-60';
import * as Credits from '../credits/service';
import { redis } from '../redis';

export interface DashboardStats {
  // Rule of 60 Progress
  ruleOf60: {
    generationsCount: number;
    generationsTarget: number;
    generationsPercentage: number;
    postsPublished: number;
    postsTarget: number;
    postsPercentage: number;
    creditsPurchased: number;
    creditsTarget: number;
    creditsPercentage: number;
    isEligible: boolean;
    daysRemaining: number;
  };
  
  // Streak Info
  streak: {
    current: number;
    longest: number;
    multiplier: number;
    nextMultiplier: number;
    monthsToNext: number;
  };
  
  // Origins (Commissions)
  origins: {
    available: number;
    pending: number;
    totalEarned: number;
    referralCount: number;
    canWithdraw: boolean;
    minWithdrawal: number;
  };
  
  // Credits
  credits: {
    premium: number;
    free: number;
    total: number;
    freeGenerationsToday: number;
    freeGenerationsRemaining: number;
  };
  
  // Coconut Access
  coconut: {
    hasAccess: boolean;
    grantedAt?: Date;
    expiresAt?: Date;
  };
}

export interface ReferralInfo {
  code: string;
  referrals: Array<{
    userId: string;
    email: string;
    joinedAt: Date;
    totalPurchased: number;
    commissionsEarned: number;
  }>;
  totalCommissions: number;
}

// Constants
const RULE_OF_60_TARGETS = {
  generations: 60,
  posts: 5,
  credits: 35,
  minWithdrawal: 50,
};

/**
 * Get full dashboard stats for a creator
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Get Rule of 60 status
  const ruleOf60Status = await RuleOf60.getRuleOf60Status(userId);
  const streakInfo = await RuleOf60.getStreakInfo(userId);
  
  // Get Origins balance
  const originsBalance = await RuleOf60.getOriginsBalance(userId);
  
  // Get credit balance
  const creditBalance = await Credits.getCreditBalance(userId);
  
  // Get free generations status
  const freeGenStatus = await import('../ai/pollinations').then(m => 
    m.checkFreeGenerationsRemaining(userId, redis)
  );
  
  // Get user info for Coconut access
  const { db } = await import('../db');
  const { users } = await import('../db/schema');
  const { eq } = await import('drizzle-orm');
  
  const [user] = await db
    .select({
      hasCoconutAccess: users.hasCoconutAccess,
      coconutAccessGrantedAt: users.coconutAccessGrantedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  // Calculate days remaining in month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((lastDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate percentages
  const generationsPct = Math.min(100, (ruleOf60Status.generationsCount / RULE_OF_60_TARGETS.generations) * 100);
  const postsPct = Math.min(100, (ruleOf60Status.postsPublished / RULE_OF_60_TARGETS.posts) * 100);
  const creditsPct = Math.min(100, (ruleOf60Status.creditsPurchased / RULE_OF_60_TARGETS.credits) * 100);
  
  // Calculate next multiplier
  const monthsToNext = streakInfo.currentStreak < 5 ? (5 - streakInfo.currentStreak) : 0;
  const nextMultiplier = monthsToNext > 0 
    ? RuleOf60.calculateStreakMultiplier(streakInfo.currentStreak + 1)
    : streakInfo.multiplier;
  
  return {
    ruleOf60: {
      generationsCount: ruleOf60Status.generationsCount,
      generationsTarget: RULE_OF_60_TARGETS.generations,
      generationsPercentage: generationsPct,
      postsPublished: ruleOf60Status.postsPublished,
      postsTarget: RULE_OF_60_TARGETS.posts,
      postsPercentage: postsPct,
      creditsPurchased: ruleOf60Status.creditsPurchased,
      creditsTarget: RULE_OF_60_TARGETS.credits,
      creditsPercentage: creditsPct,
      isEligible: ruleOf60Status.isEligible,
      daysRemaining,
    },
    streak: {
      current: streakInfo.currentStreak,
      longest: streakInfo.longestStreak,
      multiplier: streakInfo.multiplier,
      nextMultiplier,
      monthsToNext,
    },
    origins: {
      available: originsBalance.available,
      pending: originsBalance.pending,
      totalEarned: originsBalance.totalEarned,
      referralCount: originsBalance.referralCount,
      canWithdraw: originsBalance.available >= RULE_OF_60_TARGETS.minWithdrawal,
      minWithdrawal: RULE_OF_60_TARGETS.minWithdrawal,
    },
    credits: {
      premium: creditBalance.premium,
      free: creditBalance.free,
      total: creditBalance.premium + creditBalance.free,
      freeGenerationsToday: freeGenStatus.used,
      freeGenerationsRemaining: freeGenStatus.remaining,
    },
    coconut: {
      hasAccess: user?.hasCoconutAccess || false,
      grantedAt: user?.coconutAccessGrantedAt,
      expiresAt: user?.hasCoconutAccess 
        ? new Date(now.getFullYear(), now.getMonth() + 1, 1) // Expires end of month
        : undefined,
    },
  };
}

/**
 * Get referral information for a user
 */
export async function getReferralInfo(userId: string): Promise<ReferralInfo> {
  const { db } = await import('../db');
  const { users, creatorCommissions } = await import('../db/schema');
  const { eq, sql } = await import('drizzle-orm');
  
  // Get user's referral code
  const [user] = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  // Get all referrals (users who were referred by this user)
  const referrals = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.referredBy, userId));
  
  // Get commissions for each referral
  const referralData = await Promise.all(
    referrals.map(async (ref) => {
      const commissions = await db
        .select({
          total: sql`SUM(${creatorCommissions.commissionAmount})`.mapWith(Number),
        })
        .from(creatorCommissions)
        .where(eq(creatorCommissions.referredId, ref.id));
      
      const totalPurchased = await db
        .select({
          total: sql`SUM(${creatorCommissions.amount})`.mapWith(Number),
        })
        .from(creatorCommissions)
        .where(eq(creatorCommissions.referredId, ref.id));
      
      return {
        userId: ref.id,
        email: ref.email,
        joinedAt: ref.createdAt,
        totalPurchased: totalPurchased[0]?.total || 0,
        commissionsEarned: commissions[0]?.total || 0,
      };
    })
  );
  
  // Calculate total commissions
  const totalCommissions = referralData.reduce((sum, ref) => sum + ref.commissionsEarned, 0);
  
  return {
    code: user?.referralCode || '',
    referrals: referralData,
    totalCommissions,
  };
}

/**
 * Generate a referral code for a user
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const { db } = await import('../db');
  const { users } = await import('../db/schema');
  const { eq } = await import('drizzle-orm');
  
  // Check if user already has a code
  const [existing] = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (existing?.referralCode) {
    return existing.referralCode;
  }
  
  // Generate new code: First 4 chars of userId + random 4 chars
  const prefix = userId.slice(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${prefix}${random}`;
  
  // Save to database
  await db
    .update(users)
    .set({ referralCode: code })
    .where(eq(users.id, userId));
  
  return code;
}

/**
 * Apply a referral code (when new user signs up)
 */
export async function applyReferralCode(
  newUserId: string, 
  referralCode: string
): Promise<{ success: boolean; referrerId?: string; error?: string }> {
  const { db } = await import('../db');
  const { users } = await import('../db/schema');
  const { eq } = await import('drizzle-orm');
  
  // Find referrer by code
  const [referrer] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, referralCode.toUpperCase()))
    .limit(1);
  
  if (!referrer) {
    return { success: false, error: 'Invalid referral code' };
  }
  
  // Can't refer yourself
  if (referrer.id === newUserId) {
    return { success: false, error: 'Cannot use your own referral code' };
  }
  
  // Update new user with referrer
  await db
    .update(users)
    .set({ 
      referredBy: referrer.id,
      updatedAt: new Date(),
    })
    .where(eq(users.id, newUserId));
  
  // Increment referrer's referral count
  await db
    .update(users)
    .set({ 
      referralCount: sql`${users.referralCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, referrer.id));
  
  return { success: true, referrerId: referrer.id };
}

/**
 * Get monthly leaderboard (Top Creators)
 */
export async function getMonthlyLeaderboard(
  year: number, 
  month: number,
  limit: number = 10
): Promise<Array<{
  rank: number;
  userId: string;
  email: string;
  generations: number;
  posts: number;
  isEligible: boolean;
  streak: number;
}>> {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  
  const { db } = await import('../db');
  const { users, creatorStats } = await import('../db/schema');
  const { eq, and, gte, desc } = await import('drizzle-orm');
  
  // Get top creators for the month
  const topCreators = await db
    .select({
      userId: creatorStats.userId,
      generations: creatorStats.generationsCount,
      posts: creatorStats.postsPublished,
      credits: creatorStats.creditsPurchased,
    })
    .from(creatorStats)
    .where(and(
      eq(creatorStats.month, monthStr),
      gte(creatorStats.generationsCount, 1)
    ))
    .orderBy(desc(creatorStats.generationsCount))
    .limit(limit);
  
  // Get user details and streak info
  const leaderboard = await Promise.all(
    topCreators.map(async (creator, index) => {
      const [user] = await db
        .select({
          email: users.email,
          currentStreak: users.currentStreak,
        })
        .from(users)
        .where(eq(users.id, creator.userId))
        .limit(1);
      
      return {
        rank: index + 1,
        userId: creator.userId,
        email: user?.email || 'Unknown',
        generations: creator.generations,
        posts: creator.posts,
        isEligible: 
          creator.generations >= RULE_OF_60_TARGETS.generations &&
          creator.posts >= RULE_OF_60_TARGETS.posts &&
          creator.credits >= RULE_OF_60_TARGETS.credits,
        streak: user?.currentStreak || 0,
      };
    })
  );
  
  return leaderboard;
}

/**
 * Get generation history for a user
 */
export async function getGenerationHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  type: string;
  model: string;
  prompt: string;
  status: string;
  cost: number;
  createdAt: Date;
  completedAt?: Date;
  resultUrl?: string;
}>> {
  const { db } = await import('../db');
  const { generationJobs } = await import('../db/schema');
  const { eq, desc } = await import('drizzle-orm');
  
  const jobs = await db
    .select({
      id: generationJobs.id,
      type: generationJobs.type,
      model: generationJobs.model,
      prompt: generationJobs.prompt,
      status: generationJobs.status,
      cost: generationJobs.cost,
      createdAt: generationJobs.createdAt,
      completedAt: generationJobs.completedAt,
      resultUrl: generationJobs.resultUrl,
    })
    .from(generationJobs)
    .where(eq(generationJobs.userId, userId))
    .orderBy(desc(generationJobs.createdAt))
    .limit(limit);
  
  return jobs;
}

// Import sql helper
import { sql } from 'drizzle-orm';
