import { pgTable, uuid, text, integer, timestamp, json, decimal } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  walletBalance: decimal("wallet_balance", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generations = pgTable("generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  prompt: text("prompt").notNull(),
  model: text("model").notNull(),
  type: text("type", { enum: ["text", "image", "audio", "video"] }).notNull(),
  params: json("params").default({}),
  fileUrl: text("file_url"),
  cost: decimal("cost", { precision: 10, scale: 4 }).notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type", { enum: ["top_up", "spend"] }).notNull(),
  provider: text("provider", { enum: ["fedapay", "stripe"] }),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
