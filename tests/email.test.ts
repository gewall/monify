import { describe, it, expect } from "vitest";
import { sendVerificationEmail, sendPasswordResetEmail, sendFinancialDigestEmail } from "../lib/email/transporter";

describe("Email Transporter & Template Generators", () => {
  it("should generate email verification URL and handle mock mode", async () => {
    const res = await sendVerificationEmail("user@example.com", "test-token-123");
    expect(res).toBeDefined();
    if ("mock" in res) {
      expect(res.mock).toBe(true);
      expect(res.url).toContain("/verify-email?token=test-token-123");
    }
  });

  it("should generate password reset URL and handle mock mode", async () => {
    const res = await sendPasswordResetEmail("user@example.com", "reset-token-456");
    expect(res).toBeDefined();
    if ("mock" in res) {
      expect(res.mock).toBe(true);
      expect(res.url).toContain("/reset-password?token=reset-token-456");
    }
  });

  it("should format financial digest email report correctly", async () => {
    const summary = {
      totalMonthlyIncome: 5000,
      totalMonthlyFixedCosts: 1500,
      totalDailyExpenses: 500,
      netMonthlySavings: 3000,
      savingsRatePercentage: 60,
    };
    const suggestions = [
      { title: "Great Savings", description: "You saved 60% of your income this month!" },
    ];

    const res = await sendFinancialDigestEmail("user@example.com", summary, suggestions);
    expect(res).toBeDefined();
  });
});
