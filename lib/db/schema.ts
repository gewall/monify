import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  primaryKey,
} from "drizzle-orm/pg-core";

// 1. Users Table (Hybrid Auth)
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  passwordHash: text("password_hash"),
  image: text("image"),
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 2. OAuth Accounts Table (Auth.js)
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

// 3. Sessions Table (Auth.js Database Sessions)
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// 4. Verification Tokens Table (Email Verification)
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  ]
);

// 5. Password Reset Tokens Table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 6. Income Sources Table
export const incomeSources = pgTable("income_sources", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  sourceType: text("source_type").notNull(), // salary | freelance | payout | investment | side_hustle | other
  frequency: text("frequency").notNull(), // monthly | one_time | weekly | annual
  date: timestamp("date", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 7. Recurring Expenditures Table (Rent, Bills, Subscriptions, etc.)
export const recurringExpenditures = pgTable("recurring_expenditures", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(), // rent | bills | subscriptions | insurance | loan | other
  billingCycle: text("billing_cycle").notNull(), // monthly | quarterly | annual
  dueDayOfMonth: integer("due_day_of_month").default(1),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 8. Daily Expenditures Table (Food, Transport, Shopping, etc.)
export const dailyExpenditures = pgTable("daily_expenditures", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(), // food | transport | shopping | entertainment | healthcare | other
  date: timestamp("date", { mode: "date" }).defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 9. Wishlist Items Table
export const wishlistItems = pgTable("wishlist_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetPrice: numeric("target_price", { precision: 12, scale: 2 }).notNull(),
  priority: text("priority").default("medium").notNull(), // low | medium | high
  status: text("status").default("saving").notNull(), // saving | achieved | cancelled
  targetDate: timestamp("target_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 10. Action Logs Table (Audit History)
export const actionLogs = pgTable("action_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(), // e.g. EXPENSE_ADDED, WISHLIST_CREATED, PASSWORD_CHANGED
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON stringified context payload
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
