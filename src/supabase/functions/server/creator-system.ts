/**
 * CREATOR SYSTEM - Complete Implementation
 * 
 * Features:
 * 1. Become Creator: Pay 1000 credits OR meet conditions
 * 2. Streak multipliers: x1.0 → x1.1 → x1.2 → x1.3 → x1.4 → x1.5
 * 3. Monthly reset (calendar month)
 * 4. Auto-promotion/demotion
 */
function calculateStreakMultiplier(streakMonths: number): number {
  if (streakMonths >= 6) return 1.5;  // 15%
  if (streakMonths >= 5) return 1.4;  // 14%
  if (streakMonths >= 4) return 1.3;  // 13%
  if (streakMonths >= 3) return 1.2;  // 12%
  if (streakMonths >= 2) return 1.1;  // 11%
  return 1.0;  // 10%
}

// Streak (calculé rétrospectivement le 1er du mois)
creatorStreakMonths: number;
lastStreakUpdate: string;
streakMultiplier: number;         // 1.0 → 1.5 (progressive)