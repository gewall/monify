import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getUserFinancialOverview, processCronSchedules } from "@/lib/financial/actions";
import { sendFinancialDigestEmail } from "@/lib/email/transporter";

export async function GET(req: NextRequest) {
  // Authorization check for Vercel Cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Process all scheduled income additions & fixed cost deductions
    await processCronSchedules();

    // 2. Send email digests to all registered users
    const allUsers = await db.select({ id: users.id, email: users.email }).from(users);

    let sentCount = 0;

    for (const user of allUsers) {
      if (!user.email) continue;
      try {
        const overview = await getUserFinancialOverview(user.id);
        await sendFinancialDigestEmail(user.email, overview.summary, overview.suggestions);
        sentCount++;
      } catch (err) {
        console.error(`Failed to send digest to ${user.email}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed schedules & dispatched weekly digests to ${sentCount} user(s).`,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
