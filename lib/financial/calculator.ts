export interface IncomeItem {
  id?: string;
  title: string;
  amount: number;
  sourceType: "salary" | "freelance" | "payout" | "investment" | "side_hustle" | "other";
  frequency: "monthly" | "one_time" | "weekly" | "annual";
  date?: Date | string;
}

export interface RecurringExpenditureItem {
  id?: string;
  title: string;
  amount: number;
  category: "rent" | "bills" | "subscriptions" | "insurance" | "loan" | "other";
  billingCycle: "monthly" | "quarterly" | "annual";
  dueDayOfMonth?: number;
}

export interface DailyExpenditureItem {
  id?: string;
  title: string;
  amount: number;
  category: "food" | "transport" | "shopping" | "entertainment" | "healthcare" | "other";
  date: Date | string;
  notes?: string;
}

export interface WishlistItem {
  id?: string;
  title: string;
  targetPrice: number;
  priority: "low" | "medium" | "high";
  status: "saving" | "achieved" | "cancelled";
  targetDate?: Date | string;
}

export interface FinancialSummary {
  totalMonthlyIncome: number;
  totalMonthlyFixedCosts: number;
  totalDailyExpenses: number;
  totalMonthlyExpenditure: number;
  netMonthlySavings: number;
  savingsRatePercentage: number;
  fixedCostRatioPercentage: number;
  subscriptionsMonthlyTotal: number;
}

export interface FinancialSuggestion {
  id: string;
  type: "warning" | "tip" | "goal" | "info";
  title: string;
  description: string;
  category: "subscriptions" | "fixed_costs" | "daily_spending" | "savings" | "wishlist";
}

/**
 * Calculates normalized monthly income from various streams (salary, freelance, payout, etc.)
 */
export function calculateTotalMonthlyIncome(incomes: IncomeItem[]): number {
  return incomes.reduce((total, item) => {
    const val = Number(item.amount) || 0;
    switch (item.frequency) {
      case "weekly":
        return total + val * 4.33;
      case "annual":
        return total + val / 12;
      case "one_time":
      case "monthly":
      default:
        return total + val;
    }
  }, 0);
}

/**
 * Calculates normalized monthly fixed costs (rent, bills, subscriptions, etc.)
 */
export function calculateTotalMonthlyFixedCosts(expenses: RecurringExpenditureItem[]): number {
  return expenses.reduce((total, item) => {
    const val = Number(item.amount) || 0;
    switch (item.billingCycle) {
      case "quarterly":
        return total + val / 3;
      case "annual":
        return total + val / 12;
      case "monthly":
      default:
        return total + val;
    }
  }, 0);
}

/**
 * Calculates total daily expenditure sum
 */
export function calculateTotalDailyExpenses(expenses: DailyExpenditureItem[]): number {
  return expenses.reduce((total, item) => total + (Number(item.amount) || 0), 0);
}

/**
 * Calculates total subscriptions costs
 */
export function calculateSubscriptionsTotal(expenses: RecurringExpenditureItem[]): number {
  return expenses
    .filter((e) => e.category === "subscriptions")
    .reduce((total, item) => {
      const val = Number(item.amount) || 0;
      return item.billingCycle === "annual" ? total + val / 12 : total + val;
    }, 0);
}

/**
 * Computes full financial summary
 */
export function calculateFinancialSummary(
  incomes: IncomeItem[],
  recurring: RecurringExpenditureItem[],
  daily: DailyExpenditureItem[]
): FinancialSummary {
  const totalMonthlyIncome = calculateTotalMonthlyIncome(incomes);
  const totalMonthlyFixedCosts = calculateTotalMonthlyFixedCosts(recurring);
  const totalDailyExpenses = calculateTotalDailyExpenses(daily);
  const subscriptionsMonthlyTotal = calculateSubscriptionsTotal(recurring);

  const totalMonthlyExpenditure = totalMonthlyFixedCosts + totalDailyExpenses;
  const netMonthlySavings = totalMonthlyIncome - totalMonthlyExpenditure;

  const savingsRatePercentage =
    totalMonthlyIncome > 0 ? Math.max(0, (netMonthlySavings / totalMonthlyIncome) * 100) : 0;

  const fixedCostRatioPercentage =
    totalMonthlyIncome > 0 ? (totalMonthlyFixedCosts / totalMonthlyIncome) * 100 : 0;

  return {
    totalMonthlyIncome: Math.round(totalMonthlyIncome * 100) / 100,
    totalMonthlyFixedCosts: Math.round(totalMonthlyFixedCosts * 100) / 100,
    totalDailyExpenses: Math.round(totalDailyExpenses * 100) / 100,
    totalMonthlyExpenditure: Math.round(totalMonthlyExpenditure * 100) / 100,
    netMonthlySavings: Math.round(netMonthlySavings * 100) / 100,
    savingsRatePercentage: Math.round(savingsRatePercentage * 10) / 10,
    fixedCostRatioPercentage: Math.round(fixedCostRatioPercentage * 10) / 10,
    subscriptionsMonthlyTotal: Math.round(subscriptionsMonthlyTotal * 100) / 100,
  };
}

/**
 * Computes wishlist purchase feasibility based on net savings rate
 */
export function calculateWishlistFeasibility(
  targetPrice: number,
  netMonthlySavings: number
): {
  isAchievable: boolean;
  monthsRequired: number;
  daysRequired: number;
  message: string;
} {
  const price = Number(targetPrice) || 0;
  const savings = Number(netMonthlySavings) || 0;

  if (price <= 0) {
    return { isAchievable: true, monthsRequired: 0, daysRequired: 0, message: "Target price reached!" };
  }

  if (savings <= 0) {
    return {
      isAchievable: false,
      monthsRequired: Infinity,
      daysRequired: Infinity,
      message: "Net monthly savings must be positive to estimate timeline.",
    };
  }

  const monthsRequired = price / savings;
  const daysRequired = Math.ceil(monthsRequired * 30);

  return {
    isAchievable: true,
    monthsRequired: Math.round(monthsRequired * 10) / 10,
    daysRequired,
    message: `Estimated timeline: ~${daysRequired} days (${Math.round(monthsRequired * 10) / 10} months) at current savings rate.`,
  };
}

/**
 * Generates smart financial advice and cost reduction suggestions
 */
export function generateFinancialSuggestions(
  summary: FinancialSummary,
  wishlist: WishlistItem[] = []
): FinancialSuggestion[] {
  const suggestions: FinancialSuggestion[] = [];

  // 1. Negative Cash Flow Warning
  if (summary.netMonthlySavings < 0) {
    suggestions.push({
      id: "negative_savings",
      type: "warning",
      title: "Expenditures Exceed Income",
      description: `You are spending $${Math.abs(summary.netMonthlySavings).toFixed(
        2
      )} more than your income this month. Review non-essential expenses immediately.`,
      category: "savings",
    });
  }

  // 2. High Fixed Costs Warning (>50% of income)
  if (summary.fixedCostRatioPercentage > 50) {
    suggestions.push({
      id: "high_fixed_costs",
      type: "warning",
      title: "High Fixed Costs Ratio",
      description: `Your fixed recurring expenses (rent, bills, subscriptions) consume ${summary.fixedCostRatioPercentage.toFixed(
        1
      )}% of your income. The 50/30/20 rule recommends keeping fixed costs under 50%.`,
      category: "fixed_costs",
    });
  }

  // 3. Subscriptions Audit Tip
  if (summary.subscriptionsMonthlyTotal > 0 && summary.totalMonthlyIncome > 0) {
    const subRatio = (summary.subscriptionsMonthlyTotal / summary.totalMonthlyIncome) * 100;
    if (subRatio > 8) {
      suggestions.push({
        id: "subscriptions_audit",
        type: "tip",
        title: "Optimize Monthly Subscriptions",
        description: `You spend $${summary.subscriptionsMonthlyTotal.toFixed(
          2
        )}/month (${subRatio.toFixed(1)}% of income) on recurring subscriptions. Consider canceling underused services.`,
        category: "subscriptions",
      });
    }
  }

  // 4. Healthy Savings Target Tip
  if (summary.netMonthlySavings > 0 && summary.savingsRatePercentage < 20) {
    suggestions.push({
      id: "savings_target",
      type: "tip",
      title: "Aim for 20% Savings Rate",
      description: `Your current savings rate is ${summary.savingsRatePercentage}%. Increasing savings to 20% ($${(
        summary.totalMonthlyIncome * 0.2
      ).toFixed(2)}) will accelerate your financial goals.`,
      category: "savings",
    });
  } else if (summary.savingsRatePercentage >= 20) {
    suggestions.push({
      id: "great_savings",
      type: "info",
      title: "Excellent Savings Discipline",
      description: `Great job! You are saving ${summary.savingsRatePercentage}% of your income, exceeding standard financial recommendations.`,
      category: "savings",
    });
  }

  // 5. Wishlist Feasibility Highlights
  const pendingWishlist = wishlist.filter((w) => w.status === "saving");
  if (pendingWishlist.length > 0 && summary.netMonthlySavings > 0) {
    const topGoal = pendingWishlist[0];
    const feasibility = calculateWishlistFeasibility(topGoal.targetPrice, summary.netMonthlySavings);
    if (feasibility.isAchievable) {
      suggestions.push({
        id: `wishlist_goal_${topGoal.id || "top"}`,
        type: "goal",
        title: `Goal Target: ${topGoal.title}`,
        description: `With your current net savings of $${summary.netMonthlySavings.toFixed(
          2
        )}/month, you can achieve "${topGoal.title}" ($${topGoal.targetPrice}) in approximately ${feasibility.daysRequired} days!`,
        category: "wishlist",
      });
    }
  }

  return suggestions;
}
