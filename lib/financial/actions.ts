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
import { auth } from "@/auth";
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
    const existing = await db.select({ id: users.id, balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
    if (existing.length === 0) {
      await db
        .insert(users)
        .values({
          id: userId,
          email: `${userId}@monify.app`,
          name: "Monify User",
          balance: "0.00",
        })
        .onConflictDoNothing();
    }
  } catch (err) {
    console.error("ensureUserExists Error:", err);
  }
}

/**
 * Resolves the authenticated user ID reliably from Server Session or database lookup.
 */
async function resolveUserId(requestedUserId?: string): Promise<string> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      return session.user.id;
    }
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return existing[0].id;
      }
      const [inserted] = await db
        .insert(users)
        .values({
          email,
          name: session.user.name || email.split("@")[0],
          image: session.user.image,
          balance: "0.00",
        })
        .returning({ id: users.id });
      return inserted.id;
    }
  } catch (err) {
    console.error("resolveUserId session error:", err);
  }

  if (requestedUserId && requestedUserId !== "demo-user") {
    await ensureUserExists(requestedUserId);
    return requestedUserId;
  }

  await ensureUserExists("demo-user");
  return "demo-user";
}

/**
 * Process scheduled income additions and recurring fixed cost deductions based on set dates and frequencies.
 */
export async function processCronSchedules() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  try {
    // 1. Process Income Schedules
    const allIncomes = await db.select().from(incomeSources);
    for (const income of allIncomes) {
      const amount = Number(income.amount) || 0;
      const lastProc = income.lastProcessedAt ? new Date(income.lastProcessedAt) : null;
      let shouldProcess = false;

      if (income.frequency === "monthly") {
        const incomeDate = income.date ? new Date(income.date).getDate() : 1;
        const isProcThisMonth = lastProc && lastProc.getFullYear() === currentYear && lastProc.getMonth() === currentMonth;
        if (currentDate >= incomeDate && !isProcThisMonth) {
          shouldProcess = true;
        }
      } else if (income.frequency === "weekly") {
        if (!lastProc || now.getTime() - lastProc.getTime() >= 7 * 24 * 60 * 60 * 1000) {
          shouldProcess = true;
        }
      } else if (income.frequency === "annual") {
        const incomeMonth = income.date ? new Date(income.date).getMonth() : 0;
        const incomeDate = income.date ? new Date(income.date).getDate() : 1;
        const isProcThisYear = lastProc && lastProc.getFullYear() === currentYear;
        if (currentMonth >= incomeMonth && currentDate >= incomeDate && !isProcThisYear) {
          shouldProcess = true;
        }
      }

      if (shouldProcess) {
        // Fetch current balance
        const [userRow] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, income.userId)).limit(1);
        const curBal = Number(userRow?.balance || 0);
        const newBal = curBal + amount;

        await db.update(users).set({ balance: newBal.toString() }).where(eq(users.id, income.userId));
        await db.update(incomeSources).set({ lastProcessedAt: now }).where(eq(incomeSources.id, income.id));
        await db.insert(actionLogs).values({
          userId: income.userId,
          actionType: "CRON_INCOME_ADDED",
          description: `Scheduled income "${income.title}" (+Rp ${amount}) added to balance on schedule.`,
        });
      }
    }

    // 2. Process Recurring Expenditure Schedules
    const allRecurring = await db.select().from(recurringExpenditures);
    for (const rec of allRecurring) {
      const amount = Number(rec.amount) || 0;
      const lastProc = rec.lastProcessedAt ? new Date(rec.lastProcessedAt) : null;
      const dueDay = rec.dueDayOfMonth || 1;
      let shouldProcess = false;

      if (rec.billingCycle === "monthly") {
        const isProcThisMonth = lastProc && lastProc.getFullYear() === currentYear && lastProc.getMonth() === currentMonth;
        if (currentDate >= dueDay && !isProcThisMonth) {
          shouldProcess = true;
        }
      } else if (rec.billingCycle === "quarterly") {
        const isProcRecently = lastProc && now.getTime() - lastProc.getTime() < 90 * 24 * 60 * 60 * 1000;
        if (currentDate >= dueDay && !isProcRecently) {
          shouldProcess = true;
        }
      } else if (rec.billingCycle === "annual") {
        const isProcThisYear = lastProc && lastProc.getFullYear() === currentYear;
        if (currentDate >= dueDay && !isProcThisYear) {
          shouldProcess = true;
        }
      }

      if (shouldProcess) {
        const [userRow] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, rec.userId)).limit(1);
        const curBal = Number(userRow?.balance || 0);
        const newBal = curBal - amount;

        await db.update(users).set({ balance: newBal.toString() }).where(eq(users.id, rec.userId));
        await db.update(recurringExpenditures).set({ lastProcessedAt: now }).where(eq(recurringExpenditures.id, rec.id));
        await db.insert(actionLogs).values({
          userId: rec.userId,
          actionType: "CRON_FIXED_COST_DEDUCTED",
          description: `Scheduled recurring cost "${rec.title}" (-Rp ${amount}) deducted from balance.`,
        });
      }
    }

    return { success: true };
  } catch (err) {
    console.error("processCronSchedules Error:", err);
    return { success: false, error: "Failed to process cron schedules." };
  }
}

/**
 * Fetches all financial data for a user including balance, metrics & smart suggestions
 */
export async function getUserFinancialOverview(requestedUserId?: string) {
  const userId = await resolveUserId(requestedUserId);

  // Automatically trigger cron schedule check on overview fetch
  await processCronSchedules();

  try {
    const [userRow] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userBalance = Number(userRow?.balance || 0);

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
      userBalance,
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
 * Manually update/adjust user account balance
 */
export async function updateUserBalance(requestedUserId: string, newBalance: number) {
  const userId = await resolveUserId(requestedUserId);

  try {
    await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId));

    await db.insert(actionLogs).values({
      userId,
      actionType: "BALANCE_ADJUSTED",
      description: `Diubah saldo rekening menjadi Rp ${newBalance}.`,
    });

    return { success: true, newBalance };
  } catch (err) {
    console.error("updateUserBalance Error:", err);
    return { success: false, error: "Failed to update balance." };
  }
}

/**
 * Add a new income stream.
 * If frequency is 'one_time', immediately add to user's balance.
 */
export async function addIncomeSource(
  requestedUserId: string,
  data: {
    title: string;
    amount: number;
    sourceType: string;
    frequency: string;
  }
) {
  const userId = await resolveUserId(requestedUserId);

  try {
    const isOneTime = data.frequency === "one_time";
    const [inserted] = await db
      .insert(incomeSources)
      .values({
        userId,
        title: data.title,
        amount: data.amount.toString(),
        sourceType: data.sourceType,
        frequency: data.frequency,
        lastProcessedAt: isOneTime ? new Date() : null,
      })
      .returning();

    // If one_time, add to balance immediately
    if (isOneTime) {
      const [userRow] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
      const curBal = Number(userRow?.balance || 0);
      const newBal = curBal + data.amount;
      await db.update(users).set({ balance: newBal.toString() }).where(eq(users.id, userId));
    }

    await db.insert(actionLogs).values({
      userId,
      actionType: "INCOME_ADDED",
      description: `Ditambahkan penghasilan "${data.title}" (Rp ${data.amount} / ${data.frequency}).${
        isOneTime ? " Ditambahkan ke saldo kas." : ""
      }`,
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
export async function deleteIncomeSource(requestedUserId: string, incomeId: string) {
  const userId = await resolveUserId(requestedUserId);
  try {
    const [inc] = await db
      .select({ title: incomeSources.title })
      .from(incomeSources)
      .where(and(eq(incomeSources.id, incomeId), eq(incomeSources.userId, userId)))
      .limit(1);

    await db
      .delete(incomeSources)
      .where(and(eq(incomeSources.id, incomeId), eq(incomeSources.userId, userId)));

    await db.insert(actionLogs).values({
      userId,
      actionType: "INCOME_DELETED",
      description: `Dihapus sumber penghasilan "${inc?.title || "Penghasilan"}".`,
    });

    return { success: true };
  } catch (err) {
    console.error("deleteIncomeSource Error:", err);
    return { success: false, error: "Failed to delete income." };
  }
}

/**
 * Add recurring fixed expenditure
 */
export async function addRecurringExpenditure(
  requestedUserId: string,
  data: {
    title: string;
    amount: number;
    category: string;
    billingCycle: string;
    dueDayOfMonth?: number;
  }
) {
  const userId = await resolveUserId(requestedUserId);

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
      description: `Ditambahkan pengeluaran tetap "${data.title}" (Rp ${data.amount} / ${data.billingCycle}).`,
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
export async function deleteRecurringExpenditure(requestedUserId: string, expenseId: string) {
  const userId = await resolveUserId(requestedUserId);
  try {
    const [rec] = await db
      .select({ title: recurringExpenditures.title })
      .from(recurringExpenditures)
      .where(and(eq(recurringExpenditures.id, expenseId), eq(recurringExpenditures.userId, userId)))
      .limit(1);

    await db
      .delete(recurringExpenditures)
      .where(and(eq(recurringExpenditures.id, expenseId), eq(recurringExpenditures.userId, userId)));

    await db.insert(actionLogs).values({
      userId,
      actionType: "RECURRING_EXPENSE_DELETED",
      description: `Dihapus pengeluaran tetap "${rec?.title || "Pengeluaran Tetap"}".`,
    });

    return { success: true };
  } catch (err) {
    console.error("deleteRecurringExpenditure Error:", err);
    return { success: false, error: "Failed to delete recurring expense." };
  }
}

/**
 * Add daily expense.
 * Immediately deducts amount from user's balance.
 */
export async function addDailyExpenditure(
  requestedUserId: string,
  data: {
    title: string;
    amount: number;
    category: string;
    notes?: string;
  }
) {
  const userId = await resolveUserId(requestedUserId);

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

    // Deduct amount from user's balance
    const [userRow] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
    const curBal = Number(userRow?.balance || 0);
    const newBal = curBal - data.amount;
    await db.update(users).set({ balance: newBal.toString() }).where(eq(users.id, userId));

    await db.insert(actionLogs).values({
      userId,
      actionType: "DAILY_EXPENSE_ADDED",
      description: `Dicatat pengeluaran harian "${data.title}" (-Rp ${data.amount}). Saldo dipotong.`,
    });

    return { success: true, data: inserted };
  } catch (err) {
    console.error("addDailyExpenditure Error:", err);
    return { success: false, error: "Failed to log daily expense." };
  }
}

/**
 * Delete daily expense.
 * Refunds the amount back to user's balance.
 */
export async function deleteDailyExpenditure(requestedUserId: string, expenseId: string) {
  const userId = await resolveUserId(requestedUserId);
  try {
    const [exp] = await db
      .select({ amount: dailyExpenditures.amount, title: dailyExpenditures.title })
      .from(dailyExpenditures)
      .where(and(eq(dailyExpenditures.id, expenseId), eq(dailyExpenditures.userId, userId)))
      .limit(1);

    if (exp) {
      const amount = Number(exp.amount) || 0;
      // Refund amount to balance
      const [userRow] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
      const curBal = Number(userRow?.balance || 0);
      const newBal = curBal + amount;
      await db.update(users).set({ balance: newBal.toString() }).where(eq(users.id, userId));
    }

    await db
      .delete(dailyExpenditures)
      .where(and(eq(dailyExpenditures.id, expenseId), eq(dailyExpenditures.userId, userId)));

    await db.insert(actionLogs).values({
      userId,
      actionType: "DAILY_EXPENSE_DELETED",
      description: `Dihapus pengeluaran harian "${exp?.title || "Pengeluaran Harian"}". Saldo dikembalikan.`,
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
  requestedUserId: string,
  data: {
    title: string;
    targetPrice: number;
    priority?: string;
  }
) {
  const userId = await resolveUserId(requestedUserId);

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
      description: `Dibuat target impian "${data.title}" (Rp ${data.targetPrice}).`,
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
export async function updateWishlistStatus(requestedUserId: string, itemId: string, status: string) {
  const userId = await resolveUserId(requestedUserId);
  try {
    const [updated] = await db
      .update(wishlistItems)
      .set({ status })
      .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)))
      .returning();

    await db.insert(actionLogs).values({
      userId,
      actionType: "WISHLIST_UPDATED",
      description: `Diubah status target "${updated.title}" menjadi ${status}.`,
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
export async function deleteWishlistItem(requestedUserId: string, itemId: string) {
  const userId = await resolveUserId(requestedUserId);
  try {
    const [wish] = await db
      .select({ title: wishlistItems.title })
      .from(wishlistItems)
      .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)))
      .limit(1);

    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)));

    await db.insert(actionLogs).values({
      userId,
      actionType: "WISHLIST_DELETED",
      description: `Dihapus target impian "${wish?.title || "Target Impian"}".`,
    });

    return { success: true };
  } catch (err) {
    console.error("deleteWishlistItem Error:", err);
    return { success: false, error: "Failed to delete wishlist item." };
  }
}
