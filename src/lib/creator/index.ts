// Creator Economy exports
export {
  getRuleOf60Status,
  recordGeneration,
  recordPost,
  recordCreditPurchase,
  getStreakInfo,
  updateStreak,
  calculateCommission,
  addCommission,
  getOriginsBalance,
  requestWithdrawal,
  runMonthEndProcessing,
  RULE_OF_60,
  STREAK_MULTIPLIERS,
  calculateStreakMultiplier,
} from './rule-of-60';

export type {
  RuleOf60Status,
  StreakInfo,
  OriginsBalance,
} from './rule-of-60';

export {
  getDashboardStats,
  getReferralInfo,
  generateReferralCode,
  applyReferralCode,
  getMonthlyLeaderboard,
  getGenerationHistory,
} from './dashboard-api';

export type {
  DashboardStats,
  ReferralInfo,
} from './dashboard-api';
