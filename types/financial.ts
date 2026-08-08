export type IncomeSourceType = "salary" | "freelance" | "payout" | "investment" | "side_hustle" | "other";
export type IncomeFrequency = "monthly" | "one_time" | "weekly" | "annual";

export type RecurringCategory = "rent" | "bills" | "subscriptions" | "insurance" | "loan" | "other";
export type BillingCycle = "monthly" | "quarterly" | "annual";

export type DailyCategory = "food" | "transport" | "shopping" | "entertainment" | "healthcare" | "other";

export type WishlistPriority = "low" | "medium" | "high";
export type WishlistStatus = "saving" | "achieved" | "cancelled";

export interface IncomeRecord {
  id: string;
  userId: string;
  title: string;
  amount: string | number;
  sourceType: IncomeSourceType;
  frequency: IncomeFrequency;
  date: Date;
  createdAt: Date;
}

export interface RecurringRecord {
  id: string;
  userId: string;
  title: string;
  amount: string | number;
  category: RecurringCategory;
  billingCycle: BillingCycle;
  dueDayOfMonth?: number | null;
  createdAt: Date;
}

export interface DailyRecord {
  id: string;
  userId: string;
  title: string;
  amount: string | number;
  category: DailyCategory;
  date: Date;
  notes?: string | null;
  createdAt: Date;
}

export interface WishlistRecord {
  id: string;
  userId: string;
  title: string;
  targetPrice: string | number;
  priority: WishlistPriority;
  status: WishlistStatus;
  targetDate?: Date | null;
  createdAt: Date;
}

export interface ActionLogRecord {
  id: string;
  userId: string;
  actionType: string;
  description: string;
  metadata?: string | null;
  createdAt: Date;
}

export interface FinancialOverviewData {
  incomes: IncomeRecord[];
  recurring: RecurringRecord[];
  daily: DailyRecord[];
  wishlist: WishlistRecord[];
  logs: ActionLogRecord[];
  summary: {
    totalMonthlyIncome: number;
    totalMonthlyFixedCosts: number;
    totalDailyExpenses: number;
    totalMonthlyExpenditure: number;
    netMonthlySavings: number;
    savingsRatePercentage: number;
    fixedCostRatioPercentage: number;
    subscriptionsMonthlyTotal: number;
  };
  suggestions: Array<{
    id: string;
    type: "warning" | "tip" | "goal" | "info";
    title: string;
    description: string;
    category: string;
  }>;
}
