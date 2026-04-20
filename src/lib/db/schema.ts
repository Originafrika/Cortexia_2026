import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, varchar, index, date, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================
// USERS (from Neon Auth + extended)
// ============================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // From neon_auth.users
  email: text("email").notNull().unique(),
  name: text("name"),
  
  // Account type
  type: text("type").notNull().default("individual"), 
  // 'individual' | 'dev' | 'enterprise_member' | 'enterprise_admin'
  
  // Organization (optional for enterprise)
  organizationId: uuid("organization_id"),
  
  // Payment provider
  paymentProvider: text("payment_provider"), 
  // 'fedapay' | 'stripe' | null
  
  // ═══════════════════════════════════════════════════════════
  // RULE OF 25: Credit balances
  // ═══════════════════════════════════════════════════════════
  premiumBalance: integer("premium_balance").default(0),     // Purchased credits (Fedapay)
  freeBalance: integer("free_balance").default(25),         // 25/month reset
  freeBalanceResetAt: timestamp("free_balance_reset_at"),   // Last reset date (1st of month)
  
  // Creator metadata
  isCreator: boolean("is_creator").default(false),
  creatorSince: timestamp("creator_since"),
  
  // Stats for eligibility (Rule of 3)
  currentMonthGenerations: integer("current_month_generations").default(0),
  currentMonthPublications: integer("current_month_publications").default(0),
  statsMonth: text("stats_month"), // '2024-01' format
  
  // Fedapay Creator
  fedapayCustomerId: text("fedapay_customer_id"),
  fedapayPhoneNumber: text("fedapay_phone_number"),
  fedapayCountry: text("fedapay_country").default("CI"),
  
  // Free tier daily limit tracking
  freeGenerationsToday: integer("free_generations_today").default(0),
  freeGenerationsDate: date("free_generations_date"),
  
  // Referral system (Rule of 25/35)
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  orgIdx: index("users_org_idx").on(table.organizationId),
  typeIdx: index("users_type_idx").on(table.type),
}));

// ============================================
// ORGANIZATIONS (Enterprise Stripe)
// ============================================
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  
  // Stripe only
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // Plan
  plan: text("plan").default("free"), 
  // 'free' | 'starter' | 'pro' | 'enterprise'
  
  // Credits (shared pool)
  creditsBalance: integer("credits_balance").default(0),
  
  // Limits
  maxUsers: integer("max_users").default(3),
  currentUserCount: integer("current_user_count").default(0),
  
  // Features
  features: jsonb("features").default({
    apiAccess: false,
    customModel: false,
    prioritySupport: false,
    dedicatedInfra: false,
  }),
  
  status: text("status").default("active"), // active | suspended | canceled
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  stripeCustomerIdx: index("org_stripe_customer_idx").on(table.stripeCustomerId),
}));

// ============================================
// COCOBOARD JOBS (Unified for all users)
// ============================================
export const cocoboardJobs = pgTable("cocoboard_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Owner (polymorphic)
  ownerType: text("owner_type").notNull(), // 'user' | 'organization'
  ownerId: uuid("owner_id").notNull(),
  
  // Input
  mode: text("mode").notNull(), // 'image' | 'video' | 'campaign'
  intent: text("intent").notNull(),
  assets: jsonb("assets").default([]),
  
  // Generated cocoboard (with steps[] and referenceIds[])
  cocoboard: jsonb("cocoboard"),
  
  // ═══════════════════════════════════════════════════════════
  // NODE CANVAS: Atomic execution tracking
  // ═══════════════════════════════════════════════════════════
  nodes: jsonb("nodes").default([]), // BlendNode[] with status
  nodeExecutionOrder: text("node_execution_order").array(),
  
  // Status per node (for Infinite Space UI)
  nodeStatuses: jsonb("node_statuses").default({}),
  nodeOutputs: jsonb("node_outputs").default({}),
  nodeCreditsConsumed: jsonb("node_credits_consumed").default({}),
  
  // Safeguard: Iteration limits
  maxIterations: integer("max_iterations").default(4),
  actualIterations: integer("actual_iterations").default(0),
  
  // Final outputs
  blendOutputs: jsonb("blend_outputs").default({}),
  finalOutputUrl: text("final_output_url"),
  
  // Global status
  status: text("status").default("pending"),
  // 'pending' | 'analyzing' | 'awaiting_validation' | 'blending' | 'node_processing' | 'done' | 'failed'
  
  errorMessage: text("error_message"),
  
  // Credits
  creditsCocoboard: integer("credits_cocoboard").default(100),
  creditsGenerationEstimated: integer("credits_generation_estimated").default(0),
  creditsGenerationActual: integer("credits_generation_actual").default(0),
  
  // Infinite Space
  infiniteSpaceEnabled: boolean("infinite_space_enabled").default(true),
  canvasViewport: jsonb("canvas_viewport").default({ x: 0, y: 0, zoom: 1 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  ownerIdx: index("jobs_owner_idx").on(table.ownerType, table.ownerId),
  statusIdx: index("jobs_status_idx").on(table.status),
  createdAtIdx: index("jobs_created_at_idx").on(table.createdAt),
}));

// ============================================
// QSTASH JOBS (Async job tracking)
// ============================================
export const qstashJobs = pgTable("qstash_jobs", {
  id: text("id").primaryKey(), // QStash message ID
  cocoboardJobId: uuid("cocoboard_job_id").notNull(),
  
  // Extended type
  type: text("type").notNull(),
  // 'analyze' | 'blend_node' | 'blend_batch' | 'retry_node'
  
  // Specific node (for atomicity)
  targetNodeId: text("target_node_id"),
  
  status: text("status").default("pending"),
  // 'pending' | 'processing' | 'done' | 'failed'
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobIdx: index("qstash_job_idx").on(table.cocoboardJobId),
  typeIdx: index("qstash_type_idx").on(table.type),
}));

// ============================================
// CREDIT TRANSACTIONS (Audit trail)
// ============================================
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Owner
  ownerType: text("owner_type").notNull(), // 'user' | 'organization'
  ownerId: uuid("owner_id").notNull(),
  
  // Amount (negative=debit, positive=credit)
  amount: integer("amount").notNull(),
  
  // Type
  type: text("type").notNull(),
  // 'cocoboard' | 'generation' | 'modification' 
  // | 'purchase_fedapay' | 'refund_generation_failed'
  // | 'free_monthly_reset' | 'commission_bonus'
  
  // Credit source (Rule of 25)
  source: text("source").notNull().default("premium"),
  // 'premium' | 'free' | 'commission'
  
  // Context
  reason: text("reason").notNull(),
  jobId: uuid("job_id"),
  nodeId: text("node_id"), // For Node Canvas
  
  // Payment reference
  paymentId: text("payment_id"), // Fedapay transaction ID or Stripe payment intent
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  ownerIdx: index("transactions_owner_idx").on(table.ownerType, table.ownerId),
  jobIdx: index("transactions_job_idx").on(table.jobId),
  typeIdx: index("transactions_type_idx").on(table.type),
}));

// ============================================
// CREATOR COMMISSIONS (Rule of 3)
// ============================================
export const creatorCommissions = pgTable("creator_commissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  
  // Eligibility period
  month: text("month").notNull(), // '2024-01'
  
  // Conditions met?
  generationsCount: integer("generations_count").notNull(), // >= 60?
  publicationsCount: integer("publications_count").notNull(), // >= 5?
  isEligible: boolean("is_eligible").notNull(), // Calculated: gen>=60 && pub>=5
  
  // Calculated commission
  amountXOF: integer("amount_xof").notNull(), // In FCFA
  calculationBasis: jsonb("calculation_basis").notNull(),
  
  // Status (Rule of 3: pending → cleared on 3rd of month)
  status: text("status").notNull().default("pending"),
  // 'pending' | 'cleared' | 'withdrawn' | 'cancelled'
  
  clearedAt: timestamp("cleared_at"),
  withdrawnAt: timestamp("withdrawn_at"),
  withdrawalTransactionId: text("withdrawal_transaction_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("commissions_user_idx").on(table.userId),
  monthIdx: index("commissions_month_idx").on(table.month),
  statusIdx: index("commissions_status_idx").on(table.status),
}));

// ============================================
// FEDAPAY TRANSACTIONS (Individual purchases)
// ============================================
export const fedapayTransactions = pgTable("fedapay_transactions", {
  id: text("id").primaryKey(), // Fedapay transaction ID
  userId: uuid("user_id").notNull(),
  
  // Purchase details
  packType: text("pack_type").notNull(),
  // 'starter_50' | 'pro_200' | 'ultimate_1000'
  creditsAmount: integer("credits_amount").notNull(),
  priceXOF: integer("price_xof").notNull(), // Price in FCFA
  
  // Status
  status: text("status").default("pending"),
  // 'pending' | 'processing' | 'completed' | 'failed'
  
  // Payment
  paymentMethod: text("payment_method"), // 'mobile_money' | 'card'
  phoneNumber: text("phone_number"),
  
  // Callback data
  fedapayCallbackData: jsonb("fedapay_callback_data"),
  
  // Links
  creditTransactionId: uuid("credit_transaction_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("fedapay_user_idx").on(table.userId),
  statusIdx: index("fedapay_status_idx").on(table.status),
}));

// Packs available
export const FEDAPAY_PACKS = {
  STARTER_50: { credits: 50, priceXOF: 5000, name: "Starter" },
  PRO_200: { credits: 200, priceXOF: 15000, name: "Pro" },
  ULTIMATE_1000: { credits: 1000, priceXOF: 50000, name: "Ultimate" },
} as const;

// ============================================
// CREATOR COCONUT USAGE (3 CocoBoards/month limit)
// ============================================
export const creatorCoconutUsage = pgTable("creator_coconut_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  
  monthYear: text("month_year").notNull(), // '2024-01'
  
  // Coconut V14 access count
  cocoBoardCount: integer("cocoboard_count").default(0),
  maxAllowed: integer("max_allowed").default(3), // 3 per month for creators
  
  // How they became creator
  creatorOrigin: text("creator_origin").default("rule_of_60"), 
  // 'rule_of_60' | 'purchased_1000' | 'admin_granted'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userMonthIdx: index("creator_usage_user_month_idx").on(table.userId, table.monthYear),
}));

// ============================================
// CREATOR STATS (Monthly stats for Rule of 60)
export const creatorStats = pgTable("creator_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  month: text("month").notNull(),
  generationsCount: integer("generations_count").default(0),
  postsPublished: integer("posts_published").default(0),
  creditsPurchased: integer("credits_purchased").default(0),
  creditsSpent: integer("credits_spent").default(0),
  earningsXOF: integer("earnings_xof").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userMonthIdx: index("creator_stats_user_month_idx").on(table.userId, table.month),
}));

// ============================================
// GENERATION JOBS (Image/Video/Cocoboard generation tracking)
export const generationJobs = pgTable("generation_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull(),
  model: text("model"),
  prompt: text("prompt"),
  status: text("status").default("pending"),
  cost: integer("cost").default(0),
  creditsUsed: integer("credits_used").default(0),
  resultUrl: text("result_url"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("generation_jobs_user_idx").on(table.userId),
  statusIdx: index("generation_jobs_status_idx").on(table.status),
}));

// ============================================
// ENTERPRISE WALLETS (Credit packs tracking)
// ============================================
export const enterpriseWallets = pgTable("enterprise_wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().unique(),
  
  // Monthly credits (from subscription)
  monthlyCredits: integer("monthly_credits").default(10000),
  monthlyCreditsConsumed: integer("monthly_credits_consumed").default(0),
  monthlyResetAt: timestamp("monthly_reset_at"),
  
  // Pack credits (purchased add-ons)
  packCredits: integer("pack_credits").default(0),
  packCreditsConsumed: integer("pack_credits_consumed").default(0),
  
  // Total consumed (for analytics)
  totalConsumed: integer("total_consumed").default(0),
  
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  orgIdx: index("enterprise_wallet_org_idx").on(table.organizationId),
}));

// ============================================
// ENTERPRISE CREDIT PACK PURCHASES
// ============================================
export const enterpriseCreditPackPurchases = pgTable("enterprise_credit_pack_purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  
  packType: text("pack_type").notNull(),
  // 'PACK_1000' | 'PACK_5000' | 'PACK_10000'
  
  creditsAmount: integer("credits_amount").notNull(),
  priceEUR: integer("price_eur").notNull(),
  
  // Stripe
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  
  status: text("status").default("completed"),
  
  // Expiration (12 months)
  purchasedAt: timestamp("purchased_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  orgIdx: index("pack_purchase_org_idx").on(table.organizationId),
}));

// ============================================
// STRIPE SUBSCRIPTIONS (Enterprise)
// ============================================
export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: text("id").primaryKey(), // Stripe sub ID
  organizationId: uuid("organization_id").notNull(),
  
  status: text("status").notNull(),
  // 'active' | 'canceled' | 'past_due' | 'unpaid'
  
  plan: text("plan").notNull(), // starter | pro | enterprise
  priceId: text("price_id").notNull(),
  
  // Period
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  
  // Usage
  creditsConsumedThisPeriod: integer("credits_consumed_this_period").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  orgIdx: index("stripe_sub_org_idx").on(table.organizationId),
  statusIdx: index("stripe_sub_status_idx").on(table.status),
}));

// Plans
export const STRIPE_PLANS = {
  STARTER: { 
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder', 
    credits: 1000, 
    users: 3, 
    priceEUR: 99,
    name: "Starter" 
  },
  PRO: { 
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder', 
    credits: 5000, 
    users: 10, 
    priceEUR: 299,
    name: "Pro" 
  },
  ENTERPRISE: { 
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder', 
    credits: 10000, // 10,000 credits per month
    users: -1, 
    priceEUR: 900, // $900 per month
    name: "Enterprise" 
  },
} as const;

// ============================================
// ENTERPRISE CREDIT PACKS (Add-ons)
// ============================================
export const ENTERPRISE_CREDIT_PACKS = {
  PACK_1000: { credits: 1000, priceEUR: 90, discount: 0.10 },
  PACK_5000: { credits: 5000, priceEUR: 425, discount: 0.15 },
  PACK_10000: { credits: 10000, priceEUR: 800, discount: 0.20 },
} as const;

// ============================================
// USAGE STATS (Analytics)
// ============================================
export const usageStats = pgTable("usage_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Owner
  ownerType: text("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  
  // Period
  period: text("period").notNull(), // '2024-01'
  
  // Stats
  cocoboardsCreated: integer("cocoboards_created").default(0),
  generationsCompleted: integer("generations_completed").default(0),
  creditsConsumed: integer("credits_consumed").default(0),
  
  // Detail by type
  byType: jsonb("by_type").default({
    image: 0,
    video: 0,
    campaign: 0,
  }),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  ownerPeriodIdx: index("stats_owner_period_idx").on(table.ownerType, table.ownerId, table.period),
}));

// ============================================
// TYPES EXPORTS
// ============================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type CocoboardJob = typeof cocoboardJobs.$inferSelect;
export type NewCocoboardJob = typeof cocoboardJobs.$inferInsert;

export type QstashJob = typeof qstashJobs.$inferSelect;
export type NewQstashJob = typeof qstashJobs.$inferInsert;

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;

export type CreatorCommission = typeof creatorCommissions.$inferSelect;
export type NewCreatorCommission = typeof creatorCommissions.$inferInsert;

export type FedapayTransaction = typeof fedapayTransactions.$inferSelect;
export type NewFedapayTransaction = typeof fedapayTransactions.$inferInsert;

export type StripeSubscription = typeof stripeSubscriptions.$inferSelect;
export type NewStripeSubscription = typeof stripeSubscriptions.$inferInsert;

export type UsageStat = typeof usageStats.$inferSelect;
export type NewUsageStat = typeof usageStats.$inferInsert;

export type CreatorCoconutUsage = typeof creatorCoconutUsage.$inferSelect;
export type NewCreatorCoconutUsage = typeof creatorCoconutUsage.$inferInsert;

export type EnterpriseWallet = typeof enterpriseWallets.$inferSelect;
export type NewEnterpriseWallet = typeof enterpriseWallets.$inferInsert;

export type EnterpriseCreditPackPurchase = typeof enterpriseCreditPackPurchases.$inferSelect;
export type NewEnterpriseCreditPackPurchase = typeof enterpriseCreditPackPurchases.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
export type NewOrganizationInvitation = typeof organizationInvitations.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type ContentReport = typeof contentReports.$inferSelect;
export type NewContentReport = typeof contentReports.$inferInsert;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;

export type CreatorStats = typeof creatorStats.$inferSelect;
export type NewCreatorStats = typeof creatorStats.$inferInsert;

export type GenerationJob = typeof generationJobs.$inferSelect;
export type NewGenerationJob = typeof generationJobs.$inferInsert;

// ============================================
// USER SESSIONS (JWT tokens)
// ============================================
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(),
  refreshToken: text("refresh_token"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
}, (table) => ({
  userIdx: index("sessions_user_idx").on(table.userId),
  tokenIdx: index("sessions_token_idx").on(table.token),
}));

// ============================================
// PASSWORD RESETS
// ============================================
export const passwordResets = pgTable("password_resets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(),
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
}, (table) => ({
  userIdx: index("pwd_reset_user_idx").on(table.userId),
  tokenIdx: index("pwd_reset_token_idx").on(table.token),
}));

// ============================================
// EMAIL VERIFICATIONS
// ============================================
export const emailVerifications = pgTable("email_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
}, (table) => ({
  userIdx: index("email_verif_user_idx").on(table.userId),
  tokenIdx: index("email_verif_token_idx").on(table.token),
}));

// ============================================
// API KEYS (Enterprise API Access)
// ============================================
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  createdBy: uuid("created_by").notNull(),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  permissions: jsonb("permissions").default({ read: true, write: true }),
  rateLimitPerHour: integer("rate_limit_per_hour").default(1000),
  active: boolean("active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
}, (table) => ({
  orgIdx: index("api_keys_org_idx").on(table.organizationId),
}));

// ============================================
// ORGANIZATION INVITATIONS
// ============================================
export const organizationInvitations = pgTable("organization_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  inviterId: uuid("inviter_id").notNull(),
  email: text("email").notNull(),
  role: text("role").default("member"),
  token: text("token").notNull().unique(),
  status: text("status").default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
}, (table) => ({
  orgIdx: index("invites_org_idx").on(table.organizationId),
  emailIdx: index("invites_email_idx").on(table.email),
}));

// ============================================
// NOTIFICATIONS
// ============================================
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default({}),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.userId, table.read),
}));

// ============================================
// CONTENT REPORTS (Feed moderation)
// ============================================
export const contentReports = pgTable("content_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  reporterId: uuid("reporter_id").notNull(),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  reviewedBy: uuid("reviewed_by"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => ({
  contentIdx: index("reports_content_idx").on(table.contentType, table.contentId),
  reporterIdx: index("reports_reporter_idx").on(table.reporterId),
}));

// ============================================
// SUPPORT TICKETS
// ============================================
export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  organizationId: uuid("organization_id"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").default("normal"),
  status: text("status").default("open"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => ({
  userIdx: index("tickets_user_idx").on(table.userId),
  statusIdx: index("tickets_status_idx").on(table.status),
}));
