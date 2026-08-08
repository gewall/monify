"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailToken } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email token...");

  useEffect(() => {
    let isSubscribed = true;

    async function performVerification() {
      if (!token) {
        if (isSubscribed) {
          setStatus("error");
          setMessage("Invalid or missing verification token.");
        }
        return;
      }

      const res = await verifyEmailToken(token);
      if (isSubscribed) {
        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(res.error || "Failed to verify email.");
        }
      }
    }

    performVerification();

    return () => {
      isSubscribed = false;
    };
  }, [token]);

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 text-center shadow-xl">
      <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>

      {status === "loading" && <p className="text-sm text-muted-foreground">{message}</p>}

      {status === "success" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-emerald-500/15 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {message}
          </div>
          <Link href="/login">
            <Button className="w-full font-semibold">Proceed to Sign In</Button>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-destructive/15 p-4 text-sm font-medium text-destructive border border-destructive/20">
            {message}
          </div>
          <Link href="/register">
            <Button variant="outline" className="w-full">
              Back to Register
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
