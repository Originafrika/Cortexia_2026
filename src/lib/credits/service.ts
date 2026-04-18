import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users, creditTransactions, type CreditTransaction } from "../db/schema";

export interface DebitResult {
  success: boolean;
  debitedFrom: "premium" | "free" | null;
  remainingPremium: number;
  remainingFree: number;
  error?: string;
}

export interface CreditContext {
  jobId: string;
  nodeId?: string;
  reason: string;
}

/**
 * Debit credits according to Rule of 25:
 * 1. Premium first
 * 2. Free if premium = 0
 * 3. Fail if both = 0
 */
export async function debitCredits(
  userId: string,
  amount: number,
  context: CreditContext
): Promise<DebitResult> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return {
      success: false,
      debitedFrom: null,
      remainingPremium: 0,
      remainingFree: 0,
      error: "User not found",
    };
  }

  // 1. Try premium first
  if (user.premiumBalance >= amount) {
    await db
      .update(users)
      .set({ premiumBalance: user.premiumBalance - amount })
      .where(eq(users.id, userId));

    // Record transaction
    await db.insert(creditTransactions).values({
      ownerType: "user",
      ownerId: userId,
      amount: -amount,
      type: "generation",
      source: "premium",
      reason: context.reason,
      jobId: context.jobId,
      nodeId: context.nodeId,
    });

    return {
      success: true,
      debitedFrom: "premium",
      remainingPremium: user.premiumBalance - amount,
      remainingFree: user.freeBalance,
    };
  }

  // 2. Try free
  if (user.freeBalance >= amount) {
    await db
      .update(users)
      .set({ freeBalance: user.freeBalance - amount })
      .where(eq(users.id, userId));

    await db.insert(creditTransactions).values({
      ownerType: "user",
      ownerId: userId,
      amount: -amount,
      type: "generation",
      source: "free",
      reason: context.reason,
      jobId: context.jobId,
      nodeId: context.nodeId,
    });

    return {
      success: true,
      debitedFrom: "free",
      remainingPremium: user.premiumBalance,
      remainingFree: user.freeBalance - amount,
    };
  }

  // 3. Fail
  return {
    success: false,
    debitedFrom: null,
    remainingPremium: user.premiumBalance,
    remainingFree: user.freeBalance,
    error: "Insufficient credits",
  };
}

/**
 * Automatic refund if generation fails
 */
export async function refundCredits(
  userId: string,
  amount: number,
  originalSource: "premium" | "free",
  context: CreditContext
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return;

  if (originalSource === "premium") {
    await db
      .update(users)
      .set({ premiumBalance: user.premiumBalance + amount })
      .where(eq(users.id, userId));
  } else {
    await db
      .update(users)
      .set({ freeBalance: user.freeBalance + amount })
      .where(eq(users.id, userId));
  }

  await db.insert(creditTransactions).values({
    ownerType: "user",
    ownerId: userId,
    amount: +amount,
    type: "refund_generation_failed",
    source: originalSource,
    reason: `Refund: ${context.reason}`,
    jobId: context.jobId,
    nodeId: context.nodeId,
  });
}

/**
 * Add credits to user (e.g., after purchase)
 */
export async function addCredits(
  userId: string,
  amount: number,
  source: "purchase_fedapay" | "free_monthly_reset" | "commission_bonus",
  paymentId?: string
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return;

  await db
    .update(users)
    .set({ premiumBalance: user.premiumBalance + amount })
    .where(eq(users.id, userId));

  await db.insert(creditTransactions).values({
    ownerType: "user",
    ownerId: userId,
    amount: +amount,
    type: source,
    source: "premium",
    reason: `Credit added: ${source}`,
    paymentId,
  });
}

/**
 * Reset free credits on 1st of month (25 credits)
 */
export async function resetMonthlyFreeCredits(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      freeBalance: 25,
      freeBalanceResetAt: new Date(),
      freeGenerationsToday: 0,
      freeGenerationsDate: new Date(),
    })
    .where(eq(users.id, userId));

  await db.insert(creditTransactions).values({
    ownerType: "user",
    ownerId: userId,
    amount: +25,
    type: "free_monthly_reset",
    source: "free",
    reason: "Monthly free credit reset (Rule of 25)",
  });
}

/**
 * Get user credit balance
 */
export async function getCreditBalance(userId: string): Promise<{
  premium: number;
  free: number;
  total: number;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      premiumBalance: true,
      freeBalance: true,
    },
  });

  if (!user) {
    return { premium: 0, free: 0, total: 0 };
  }

  return {
    premium: user.premiumBalance,
    free: user.freeBalance,
    total: user.premiumBalance + user.freeBalance,
  };
}
