"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateWithValibot, LoginSchema } from "@/lib/validation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => validateWithValibot(LoginSchema, values),
    onSubmit: async (values) => {
      setAuthError("");
      try {
        const res = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (res?.error) {
          const msg = "Email atau password tidak valid. Silakan coba lagi.";
          setAuthError(msg);
          toast.error(msg);
        } else {
          toast.success("Berhasil masuk! Mengalihkan ke dashboard...");
          router.push("/dashboard");
          router.refresh();
        }
      } catch {
        const msg = "Terjadi kesalahan tidak terduga.";
        setAuthError(msg);
        toast.error(msg);
      }
    },
  });

  const handleOAuth = (provider: "google" | "github") => {
    toast.info(`Menghubungkan ke ${provider === "google" ? "Google" : "GitHub"}...`);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-teal-500/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold">Selamat Datang di Monify</CardTitle>
          <CardDescription>Masuk untuk mengelola penghasilan, pengeluaran & tabungan Anda</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {authError && (
            <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
              {authError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <FieldGroup>
              <Field invalid={Boolean(formik.touched.email && formik.errors.email)}>
                <FieldLabel htmlFor="email">Alamat Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError>{formik.touched.email && formik.errors.email}</FieldError>
              </Field>

              <Field invalid={Boolean(formik.touched.password && formik.errors.password)}>
                <div className="flex items-center justify-between mb-1">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError>{formik.touched.password && formik.errors.password}</FieldError>
              </Field>

              <Button type="submit" className="w-full font-semibold bg-teal-600 hover:bg-teal-700 text-white" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? "Masuk..." : "Masuk dengan Email"}
              </Button>
            </FieldGroup>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-2 text-xs uppercase text-muted-foreground">Atau lanjutkan dengan</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => handleOAuth("google")} className="w-full">
              Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuth("github")} className="w-full">
              GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-center text-xs text-muted-foreground">
            Belum memiliki akun?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
