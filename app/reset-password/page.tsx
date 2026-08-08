"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, newPassword);
      if (!res.success) {
        setError(res.error || "Failed to reset password.");
      } else {
        setMessage(res.message || "Password reset successful! You can now log in.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Enter a new secure password for your account</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {message && (
        <div className="space-y-4">
          <div className="rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
            {message}
          </div>
          <Link href="/login">
            <Button className="w-full font-semibold">Proceed to Sign In</Button>
          </Link>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={loading}>
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Back to{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
