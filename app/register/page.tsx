"use client";

import { useState } from "react";
import { useFormik } from "formik";
import Link from "next/link";
import { registerUser } from "@/lib/auth/actions";
import { validateWithValibot, RegisterSchema } from "@/lib/validation";
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

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: (values) => validateWithValibot(RegisterSchema, values),
    onSubmit: async (values) => {
      setError("");
      setMessage("");

      try {
        const res = await registerUser(values);
        if (!res.success) {
          setError(res.error || "Pendaftaran gagal.");
          toast.error(res.error || "Pendaftaran gagal.");
        } else {
          const msg = res.message || "Pendaftaran berhasil! Silakan periksa email Anda.";
          setMessage(msg);
          toast.success(msg);
          formik.resetForm();
        }
      } catch {
        setError("Terjadi kesalahan tidak terduga.");
        toast.error("Terjadi kesalahan tidak terduga.");
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-teal-500/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold">Buat Akun Monify</CardTitle>
          <CardDescription>Mulai kelola penghasilan, pengeluaran & target tabungan Anda</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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

          <form onSubmit={formik.handleSubmit}>
            <FieldGroup>
              <Field invalid={Boolean(formik.touched.name && formik.errors.name)}>
                <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError>{formik.touched.name && formik.errors.name}</FieldError>
              </Field>

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
                <FieldLabel htmlFor="password">Password (minimal 6 karakter)</FieldLabel>
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
                {formik.isSubmitting ? "Mendaftar..." : "Daftar Akun"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-center text-xs text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
