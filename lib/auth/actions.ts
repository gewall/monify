"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users, verificationTokens, passwordResetTokens, actionLogs } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email/transporter";

export async function registerUser(formData: { email: string; password: string; name?: string }) {
  const email = formData.email.toLowerCase().trim();
  const password = formData.password;
  const name = formData.name?.trim() || email.split("@")[0];

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please provide a valid email address." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    // 1. Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return { success: false, error: "An account with this email address already exists." };
    }

    // 2. Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // 3. Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
      })
      .returning();

    // 4. Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    // 5. Send verification email via Gmail SMTP
    await sendVerificationEmail(email, token);

    // 6. Log action
    await db.insert(actionLogs).values({
      userId: newUser.id,
      actionType: "USER_REGISTERED",
      description: `Registered new account (${email}). Verification email dispatched.`,
    });

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "Failed to register account. Please try again." };
  }
}

export async function verifyEmailToken(token: string) {
  if (!token) {
    return { success: false, error: "Missing verification token." };
  }

  try {
    // 1. Find valid non-expired token
    const now = new Date();
    const tokenRecords = await db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), gt(verificationTokens.expires, now)))
      .limit(1);

    if (tokenRecords.length === 0) {
      return { success: false, error: "Invalid or expired verification token." };
    }

    const vt = tokenRecords[0];

    // 2. Mark user email as verified
    const [user] = await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, vt.identifier))
      .returning();

    // 3. Remove used token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    if (user) {
      await db.insert(actionLogs).values({
        userId: user.id,
        actionType: "EMAIL_VERIFIED",
        description: `Verified email address (${vt.identifier}).`,
      });
    }

    return { success: true, message: "Email verified successfully! You can now log in." };
  } catch (error) {
    console.error("Verify Email Error:", error);
    return { success: false, error: "Failed to verify email." };
  }
}

export async function requestPasswordReset(emailInput: string) {
  const email = emailInput.toLowerCase().trim();
  if (!email) return { success: false, error: "Please enter your email." };

  try {
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length === 0) {
      // Return success to avoid email enumeration
      return { success: true, message: "If an account exists, a reset link has been sent to your email." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      email,
      token,
      expires,
    });

    await sendPasswordResetEmail(email, token);

    return { success: true, message: "If an account exists, a reset link has been sent to your email." };
  } catch (error) {
    console.error("Request Password Reset Error:", error);
    return { success: false, error: "An error occurred while requesting password reset." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const now = new Date();
    const records = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, token), gt(passwordResetTokens.expires, now)))
      .limit(1);

    if (records.length === 0) {
      return { success: false, error: "Invalid or expired password reset token." };
    }

    const prt = records[0];
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    const [updatedUser] = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, prt.email))
      .returning();

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));

    if (updatedUser) {
      await db.insert(actionLogs).values({
        userId: updatedUser.id,
        actionType: "PASSWORD_RESET",
        description: `Successfully reset password for ${updatedUser.email}.`,
      });
    }

    return { success: true, message: "Password updated successfully! You can now log in with your new password." };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return { success: false, error: "Failed to reset password." };
  }
}
