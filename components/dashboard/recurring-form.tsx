"use client";

import { useFormik } from "formik";
import { validateWithValibot, RecurringSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pengeluaran Tetap</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul Pengeluaran</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="cth. Sewa Rumah / Netflix"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-xs text-destructive font-medium mt-1">{formik.errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Jumlah (Rp)</Label>
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
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-xs text-destructive font-medium mt-1">{formik.errors.amount}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="rent">Sewa (Rent)</option>
              <option value="bills">Tagihan & Listrik</option>
              <option value="subscriptions">Langganan (Subscriptions)</option>
              <option value="insurance">Asuransi</option>
              <option value="loan">Cicilan / Pinjaman</option>
              <option value="other">Lainnya</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="billingCycle">Siklus Pembayaran</Label>
            <Select
              id="billingCycle"
              name="billingCycle"
              value={formik.values.billingCycle}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="monthly">Bulanan</option>
              <option value="quarterly">Per 3 Bulan</option>
              <option value="annual">Tahunan</option>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full font-semibold bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> {formik.isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran Tetap"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
