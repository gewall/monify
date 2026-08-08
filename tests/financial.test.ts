import { describe, it, expect } from "vitest";
import {
  calculateTotalMonthlyIncome,
  calculateTotalMonthlyFixedCosts,
  calculateTotalDailyExpenses,
  calculateFinancialSummary,
  calculateWishlistFeasibility,
  generateFinancialSuggestions,
  IncomeItem,
  RecurringExpenditureItem,
  DailyExpenditureItem,
  WishlistItem,
} from "../lib/financial/calculator";

describe("Financial Calculator Engine", () => {
  it("should calculate total monthly income from multiple streams correctly", () => {
    const incomes: IncomeItem[] = [
      { title: "Primary Salary", amount: 4000, sourceType: "salary", frequency: "monthly" },
      { title: "Freelance Project", amount: 500, sourceType: "freelance", frequency: "monthly" },
      { title: "Weekly Payout", amount: 100, sourceType: "payout", frequency: "weekly" }, // ~433/mo
      { title: "Annual Bonus", amount: 1200, sourceType: "other", frequency: "annual" }, // 100/mo
    ];

    const totalIncome = calculateTotalMonthlyIncome(incomes);
    expect(Math.round(totalIncome)).toBe(5033);
  });

  it("should calculate total monthly fixed costs (rent, bills, subscriptions) correctly", () => {
    const fixedExpenses: RecurringExpenditureItem[] = [
      { title: "Apartment Rent", amount: 1200, category: "rent", billingCycle: "monthly" },
      { title: "Electricity & Internet", amount: 150, category: "bills", billingCycle: "monthly" },
      { title: "Netflix & Spotify", amount: 30, category: "subscriptions", billingCycle: "monthly" },
      { title: "Car Insurance", amount: 1200, category: "insurance", billingCycle: "annual" }, // 100/mo
    ];

    const totalFixed = calculateTotalMonthlyFixedCosts(fixedExpenses);
    expect(totalFixed).toBe(1480);
  });

  it("should calculate daily expenditures sum correctly", () => {
    const daily: DailyExpenditureItem[] = [
      { title: "Groceries", amount: 85.50, category: "food", date: "2026-08-01" },
      { title: "Subway Ride", amount: 4.50, category: "transport", date: "2026-08-01" },
      { title: "Coffee & Snacks", amount: 10.00, category: "food", date: "2026-08-02" },
    ];

    const totalDaily = calculateTotalDailyExpenses(daily);
    expect(totalDaily).toBe(100);
  });

  it("should compute complete financial summary with correct net savings and rates", () => {
    const incomes: IncomeItem[] = [
      { title: "Salary", amount: 5000, sourceType: "salary", frequency: "monthly" },
    ];
    const recurring: RecurringExpenditureItem[] = [
      { title: "Rent", amount: 1500, category: "rent", billingCycle: "monthly" },
      { title: "Utilities", amount: 200, category: "bills", billingCycle: "monthly" },
    ];
    const daily: DailyExpenditureItem[] = [
      { title: "Groceries", amount: 300, category: "food", date: "2026-08-05" },
    ];

    const summary = calculateFinancialSummary(incomes, recurring, daily);

    expect(summary.totalMonthlyIncome).toBe(5000);
    expect(summary.totalMonthlyFixedCosts).toBe(1700);
    expect(summary.totalDailyExpenses).toBe(300);
    expect(summary.totalMonthlyExpenditure).toBe(2000);
    expect(summary.netMonthlySavings).toBe(3000);
    expect(summary.savingsRatePercentage).toBe(60);
    expect(summary.fixedCostRatioPercentage).toBe(34);
  });

  it("should calculate wishlist purchase feasibility correctly", () => {
    const netSavings = 500; // $500/month net savings
    const targetPrice = 1500; // $1500 laptop

    const result = calculateWishlistFeasibility(targetPrice, netSavings);

    expect(result.isAchievable).toBe(true);
    expect(result.monthsRequired).toBe(3);
    expect(result.daysRequired).toBe(90);
  });

  it("should return unachievable wishlist feasibility when net savings is negative or zero", () => {
    const result = calculateWishlistFeasibility(1000, -100);
    expect(result.isAchievable).toBe(false);
  });

  it("should generate financial suggestions based on financial metrics", () => {
    const summary = calculateFinancialSummary(
      [{ title: "Salary", amount: 2000, sourceType: "salary", frequency: "monthly" }],
      [
        { title: "Rent", amount: 1200, category: "rent", billingCycle: "monthly" }, // 60% of income (>50%)
        { title: "Streaming Bundle", amount: 200, category: "subscriptions", billingCycle: "monthly" }, // 10% of income (>8%)
      ],
      [{ title: "Dining Out", amount: 700, category: "food", date: "2026-08-01" }] // Total expenditures = 2100 > 2000
    );

    const wishlist: WishlistItem[] = [
      { title: "New Camera", targetPrice: 600, priority: "high", status: "saving" },
    ];

    const suggestions = generateFinancialSuggestions(summary, wishlist);

    expect(suggestions.some((s) => s.id === "negative_savings")).toBe(true);
    expect(suggestions.some((s) => s.id === "high_fixed_costs")).toBe(true);
    expect(suggestions.some((s) => s.id === "subscriptions_audit")).toBe(true);
  });
});
