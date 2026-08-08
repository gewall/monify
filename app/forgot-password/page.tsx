"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await requestPasswordReset(email);
      if (!res.success) {
        setError(res.error || "Failed to request password reset.");
      } else {
        setMessage(res.message || "Reset link dispatched to your email address.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your account email address to receive a secure password reset link.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={loading}>
            {loading ? "Sending Reset Link..." : "Send Password Reset Link"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
