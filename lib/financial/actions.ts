"use server";

import { db } from "@/lib/db";
import {
  users,
  incomeSources,
  recurringExpenditures,
  dailyExpenditures,
  wishlistItems,
  actionLogs,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  calculateFinancialSummary,
  generateFinancialSuggestions,
  IncomeItem,
  RecurringExpenditureItem,
  DailyExpenditureItem,
  WishlistItem,
} from "@/lib/financial/calculator";
import {
  IncomeSourceType,
  IncomeFrequency,
  RecurringCategory,
  BillingCycle,
  DailyCategory,
  WishlistPriority,
  WishlistStatus,
} from "@/types/financial";

/**
 * Ensures user record exists in users table to satisfy foreign keys
 */
async function ensureUserExists(userId: string) {
  if (!userId) return;
  try {
    const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existing.length === 0) {
      await db
        .insert(users)
        .values({
          id: userId,
          email: `${userId}@monify.app`,
          name: "Monify User",
        })
        .onConflictDoNothing();
    }
  } catch (err) {
    console.error("ensureUserExists Error:", err);
  }
}

/**
 * Fetches all financial data for a user and calculates metrics & smart suggestions
 */
export async function getUserFinancialOverview(userId: string) {
  if (!userId) throw new Error("Unauthorized");
  await ensureUserExists(userId);

  try {
    const incomesData = await db
      .select()
      .from(incomeSources)
      .where(eq(incomeSources.userId, userId))
      .orderBy(desc(incomeSources.createdAt));

    const recurringData = await db
      .select()
      .from(recurringExpenditures)
      .where(eq(recurringExpenditures.userId, userId))
      .orderBy(desc(recurringExpenditures.createdAt));

    const dailyData = await db
      .select()
      .from(dailyExpenditures)
      .where(eq(dailyExpenditures.userId, userId))
      .orderBy(desc(dailyExpenditures.createdAt));

    const wishlistData = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt));

    const logsData = await db
      .select()
      .from(actionLogs)
      .where(eq(actionLogs.userId, userId))
      .orderBy(desc(actionLogs.createdAt))
      .limit(20);

    const incomes: IncomeItem[] = incomesData.map((item) => ({
      id: item.id,
      title: item.title,
      amount: Number(item.amount),
      sourceType: item.sourceType as IncomeSourceType,
      frequency: item.frequency as IncomeFrequency,
      date: item.date,
    }));

    const recurring: RecurringExpenditureItem[] = recurringData.map((item) => ({
      id: item.id,
      title: item.title,
      amount: Number(item.amount),
      category: item.category as RecurringCategory,
      billingCycle: item.billingCycle as BillingCycle,
      dueDayOfMonth: item.dueDayOfMonth ?? 1,
    }));

    const daily: DailyExpenditureItem[] = dailyData.map((item) => ({
      id: item.id,
      title: item.title,
      amount: Number(item.amount),
      category: item.category as DailyCategory,
      date: item.date,
      notes: item.notes ?? undefined,
    }));

    const wishlist: WishlistItem[] = wishlistData.map((item) => ({
      id: item.id,
      title: item.title,
      targetPrice: Number(item.targetPrice),
      priority: item.priority as WishlistPriority,
      status: item.status as WishlistStatus,
      targetDate: item.targetDate ?? undefined,
    }));

    const summary = calculateFinancialSummary(incomes, recurring, daily);
    const suggestions = generateFinancialSuggestions(summary, wishlist);

    return {
      incomes: incomesData,
      recurring: recurringData,
      daily: dailyData,
      wishlist: wishlistData,
      logs: logsData,
      summary,
      suggestions,
    };
  } catch (error) {
    console.error("getUserFinancialOverview Error:", error);
    throw new Error("Failed to load financial data.");
  }
}

/**
 * Add a new income stream (salary, freelance, payout, etc.)
 */
export async function addIncomeSource(
  userId: string,
  data: {
    title: string;
    amount: number;
    sourceType: string;
    frequency: string;
  }
) {
  if (!userId) return { success: false, error: "Unauthorized" };
  await ensureUserExists(userId);

  try {
    const [inserted] = await db
      .insert(incomeSources)
      .values({
        userId,
        title: data.title,
        amount: data.amount.toString(),
        sourceType: data.sourceType,
        frequency: data.frequency,
      })
      .returning();

    await db.insert(actionLogs).values({
      userId,
      actionType: "INCOME_ADDED",
      description: `Added income source "${data.title}" (Rp ${data.amount} / ${data.frequency}).`,
    });

    return { success: true, data: inserted };
  } catch (err) {
    console.error("addIncomeSource Error:", err);
    return { success: false, error: "Failed to add income source." };
  }
}

/**
 * Delete income stream
 */
export async function deleteIncomeSource(userId: string, incomeId: string) {
  await ensureUserExists(userId);
  try {
    await db
      .delete(incomeSources)
      .where(and(eq(incomeSources.id, incomeId), eq(incomeSources.userId, userId)));

    await db.insert(actionLogs).values({
      userId,
      actionType: "INCOME_DELETED",
      description: `Removed income source ID ${incomeId}.`,
    });

    return { success: true };
  } catch (err) {
    console.error("deleteIncomeSource Error:", err);
    return { success: false, error: "Failed to delete income." };
  }
}

/**
 * Add recurring fixed expenditure (Rent, bills, subscriptions, insurance)
 */
export async function addRecurringExpenditure(
  userId: string,
  data: {
    title: string;
    amount: number;
    category: string;
    billingCycle: string;
    dueDayOfMonth?: number;
  }
) {
  if (!userId) return { success: false, error: "Unauthorized" };
  await ensureUserExists(userId);

  try {
    const [inserted] = await db
      .insert(recurringExpenditures)
      .values({
        userId,
        title: data.title,
        amount: data.amount.toString(),
        category: data.category,
        billingCycle: data.billingCycle,
        dueDayOfMonth: data.dueDayOfMonth ?? 1,
      })
      .returning();

    await db.insert(actionLogs).values({
      userId,
      actionType: "RECURRING_EXPENSE_ADDED",
      description: `Added recurring cost "${data.title}" (Rp ${data.amount} / ${data.billingCycle}).`,
    });

    return { success: true, data: inserted };
  } catch (err) {
    console.error("addRecurringExpenditure Error:", err);
    return { success: false, error: "Failed to add recurring cost." };
  }
}

/**
 * Delete recurring fixed expenditure
 */
export async function deleteRecurringExpenditure(userId: string, expenseId: string) {
  await ensureUserExists(userId);
  try {
    await db
      .delete(recurringExpenditures)
      .where(and(eq(recurringExpenditures.id, expenseId), eq(recurringExpenditures.userId, userId)));

    await db.insert(actionLogs).values({
      userId,
      actionType: "RECURRING_EXPENSE_DELETED",
      description: `Removed recurring expense ID ${expenseId}.`,
    });

    return { success: true };
  } catch (err) {
    console.error("deleteRecurringExpenditure Error:", err);
    return { success: false, error: "Failed to delete recurring expense." };
  }
}

/**
 * Add daily expense
 */
export async function addDailyExpenditure(
  userId: string,
  data: {
    title: string;
    amount: number;
    category: string;
    notes?: string;
  }
) {
  if (!userId) return { success: false, error: "Unauthorized" };
  await ensureUserExists(userId);

  try {
    const [inserted] = await db
      .insert(dailyExpenditures)
      .values({
        userId,
        title: data.title,
        amount: data.amount.toString(),
        category: data.category,
        notes: data.notes,
      })
      .returning();

    await db.insert(actionLogs).values({
      userId,
      actionType: "DAILY_EXPENSE_ADDED",
      description: `Logged daily expense "${data.title}" (Rp ${data.amount}).`,
    });

    return { success: true, data: inserted };
  } catch (err) {
    console.error("addDailyExpenditure Error:", err);
    return { success: false, error: "Failed to log daily expense." };
  }
}

/**
 * Delete daily expense
 */
export async function deleteDailyExpenditure(userId: string, expenseId: string) {
  await ensureUserExists(userId);
  try {
    await db
      .delete(dailyExpenditures)
      .where(and(eq(dailyExpenditures.id, expenseId), eq(dailyExpenditures.userId, userId)));

    await db.insert(actionLogs).values({
      userId,
      actionType: "DAILY_EXPENSE_DELETED",
      description: `Deleted daily expense ID ${expenseId}.`,
    });

    return { success: true };
  } catch (err) {
    console.error("deleteDailyExpenditure Error:", err);
    return { success: false, error: "Failed to delete daily expense." };
  }
}

/**
 * Add Wishlist Item
 */
export async function addWishlistItem(
  userId: string,
  data: {
    title: string;
    targetPrice: number;
    priority?: string;
  }
) {
  if (!userId) return { success: false, error: "Unauthorized" };
  await ensureUserExists(userId);

  try {
    const [inserted] = await db
      .insert(wishlistItems)
      .values({
        userId,
        title: data.title,
        targetPrice: data.targetPrice.toString(),
        priority: data.priority || "medium",
        status: "saving",
      })
      .returning();

    await db.insert(actionLogs).values({
      userId,
      actionType: "WISHLIST_CREATED",
      description: `Created wishlist target "${data.title}" (Rp ${data.targetPrice}).`,
    });

    return { success: true, data: inserted };
  } catch (err) {
    console.error("addWishlistItem Error:", err);
    return { success: false, error: "Failed to add wishlist item." };
  }
}

/**
 * Update Wishlist Status
 */
export async function updateWishlistStatus(userId: string, itemId: string, status: string) {
  await ensureUserExists(userId);
  try {
    const [updated] = await db
      .update(wishlistItems)
      .set({ status })
      .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)))
      .returning();

    await db.insert(actionLogs).values({
      userId,
      actionType: "WISHLIST_UPDATED",
      description: `Updated status of "${updated.title}" to ${status}.`,
    });

    return { success: true };
  } catch (err) {
    console.error("updateWishlistStatus Error:", err);
    return { success: false, error: "Failed to update wishlist status." };
  }
}

/**
 * Delete Wishlist Item
 */
export async function deleteWishlistItem(userId: string, itemId: string) {
  await ensureUserExists(userId);
  try {
    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)));

    return { success: true };
  } catch (err) {
    console.error("deleteWishlistItem Error:", err);
    return { success: false, error: "Failed to delete wishlist item." };
  }
}
