"use client";

import { useFormik } from "formik";
import { validateWithValibot, RecurringSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, CreditCard, DollarSign, Calendar, Tag } from "lucide-react";

interface RecurringFormProps {
  onSubmit: (data: {
    title: string;
    amount: number;
    category: string;
    billingCycle: string;
    dueDayOfMonth?: number;
  }) => Promise<void>;
}

export function RecurringForm({ onSubmit }: RecurringFormProps) {
  const formik = useFormik({
    initialValues: {
      title: "",
      amount: 0,
      category: "bills",
      billingCycle: "monthly",
      dueDayOfMonth: 1,
    },
    validate: (values) => validateWithValibot(RecurringSchema, values),
    onSubmit: async (values, { resetForm }) => {
      await onSubmit({
        title: values.title,
        amount: Number(values.amount),
        category: values.category,
        billingCycle: values.billingCycle,
        dueDayOfMonth: Number(values.dueDayOfMonth) || 1,
      });
      resetForm();
    },
  });

  return (
    <Card className="border-rose-500/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-rose-500" />
          <span>Tambah Pengeluaran Tetap</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <FieldGroup>
            {/* Field: Title */}
            <Field invalid={Boolean(formik.touched.title && formik.errors.title)}>
              <FieldLabel htmlFor="title" className="flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>Judul Pengeluaran</span>
              </FieldLabel>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="cth. Sewa Kontrakan / Netflix"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FieldError>{formik.touched.title && formik.errors.title}</FieldError>
            </Field>

            {/* Field: Amount */}
            <Field invalid={Boolean(formik.touched.amount && formik.errors.amount)}>
              <FieldLabel htmlFor="amount" className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>Jumlah (Rp)</span>
              </FieldLabel>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="1000"
                placeholder="1500000"
                value={formik.values.amount || ""}
                onChange={(e) => formik.setFieldValue("amount", parseFloat(e.target.value) || 0)}
                onBlur={formik.handleBlur}
              />
              <FieldError>{formik.touched.amount && formik.errors.amount}</FieldError>
            </Field>

            {/* Field: Category */}
            <Field>
              <FieldLabel className="flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>Kategori</span>
              </FieldLabel>
              <Select
                value={formik.values.category}
                onValueChange={(value) => formik.setFieldValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Sewa (Rent / Tempat Tinggal)</SelectItem>
                  <SelectItem value="bills">Tagihan Air & Listrik</SelectItem>
                  <SelectItem value="subscriptions">Langganan Digital (Subscriptions)</SelectItem>
                  <SelectItem value="insurance">Asuransi & Kesehatan</SelectItem>
                  <SelectItem value="loan">Cicilan & Pinjaman</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Field: Billing Cycle */}
            <Field>
              <FieldLabel className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Siklus Pembayaran</span>
              </FieldLabel>
              <Select
                value={formik.values.billingCycle}
                onValueChange={(value) => formik.setFieldValue("billingCycle", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siklus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="quarterly">Per 3 Bulan</SelectItem>
                  <SelectItem value="annual">Tahunan</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Sistem Cron akan memotong Saldo otomatis sesuai tanggal jatuh tempo setiap siklus.
              </FieldDescription>
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {formik.isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran Tetap"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
