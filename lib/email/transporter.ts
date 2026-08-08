import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const emailFrom = process.env.EMAIL_FROM || `Monify <${smtpUser}>`;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const appBaseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Sends email verification token to user
 */
export async function sendVerificationEmail(toEmail: string, token: string) {
  const verifyUrl = `${appBaseUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0d9488; text-align: center;">Welcome to Monify! 💰</h2>
      <p>Please verify your email address to complete registration and unlock your money management dashboard.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">Or copy and paste this link in your browser: <br><a href="${verifyUrl}">${verifyUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin-top: 30px;">
      <p style="font-size: 11px; color: #999; text-align: center;">Monify Money Management • Automated Security Notification</p>
    </div>
  `;

  if (!smtpUser || !smtpPass) {
    console.log(`[Email Mock] Verification link for ${toEmail}: ${verifyUrl}`);
    return { mock: true, url: verifyUrl };
  }

  return transporter.sendMail({
    from: emailFrom,
    to: toEmail,
    subject: "Verify Your Email Address - Monify",
    html,
  });
}

/**
 * Sends password reset token to user
 */
export async function sendPasswordResetEmail(toEmail: string, token: string) {
  const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #e11d48; text-align: center;">Password Reset Request</h2>
      <p>We received a request to reset your password for your Monify account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; color: #555;">This link will expire in 1 hour for security reasons. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin-top: 30px;">
      <p style="font-size: 11px; color: #999; text-align: center;">Monify Security System</p>
    </div>
  `;

  if (!smtpUser || !smtpPass) {
    console.log(`[Email Mock] Password reset link for ${toEmail}: ${resetUrl}`);
    return { mock: true, url: resetUrl };
  }

  return transporter.sendMail({
    from: emailFrom,
    to: toEmail,
    subject: "Reset Your Monify Password",
    html,
  });
}

/**
 * Sends financial digest & automated suggestions email
 */
export async function sendFinancialDigestEmail(
  toEmail: string,
  summary: {
    totalMonthlyIncome: number;
    totalMonthlyFixedCosts: number;
    totalDailyExpenses: number;
    netMonthlySavings: number;
    savingsRatePercentage: number;
  },
  suggestions: Array<{ title: string; description: string }>
) {
  const suggestionsHtml = suggestions
    .map(
      (s) => `
      <div style="background-color: #f8fafc; padding: 12px; margin-bottom: 10px; border-left: 4px solid #0d9488; border-radius: 4px;">
        <strong style="color: #0f172a;">${s.title}</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">${s.description}</p>
      </div>
    `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0f172a; text-align: center;">📊 Your Monify Weekly Financial Report</h2>
      <p>Here is your financial summary and tailored suggestions for this week:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Metric</th>
          <th style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Total Monthly Income</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold; color: #16a34a;">$${summary.totalMonthlyIncome.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Fixed Recurring Costs (Rent, Bills)</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0; color: #dc2626;">$${summary.totalMonthlyFixedCosts.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Daily Expenditures</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0; color: #dc2626;">$${summary.totalDailyExpenses.toFixed(2)}</td>
        </tr>
        <tr style="background-color: #f0fdf4;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Net Monthly Savings</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold; color: #0d9488;">$${summary.netMonthlySavings.toFixed(2)} (${summary.savingsRatePercentage}%)</td>
        </tr>
      </table>

      <h3 style="color: #0f172a; margin-top: 25px;">💡 Financial Insights & Suggestions</h3>
      ${suggestionsHtml || "<p style='color: #64748b;'>No warnings. You are maintaining great financial health!</p>"}

      <div style="text-align: center; margin-top: 30px;">
        <a href="${appBaseUrl}/dashboard" style="background-color: #0f172a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Open Monify Dashboard</a>
      </div>
    </div>
  `;

  if (!smtpUser || !smtpPass) {
    console.log(`[Email Mock] Financial Digest sent to ${toEmail}`);
    return { mock: true };
  }

  return transporter.sendMail({
    from: emailFrom,
    to: toEmail,
    subject: "📊 Monify Weekly Financial Digest & Smart Suggestions",
    html,
  });
}
