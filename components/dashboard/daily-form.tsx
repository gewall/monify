"use client";

import { useFormik } from "formik";
import { validateWithValibot, DailySchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface DailyFormProps {
  onSubmit: (data: {
    title: string;
    amount: number;
    category: string;
    notes?: string;
  }) => Promise<void>;
}

export function DailyForm({ onSubmit }: DailyFormProps) {
  const formik = useFormik({
    initialValues: {
      title: "",
      amount: 0,
      category: "food",
      notes: "",
    },
    validate: (values) => validateWithValibot(DailySchema, values),
    onSubmit: async (values, { resetForm }) => {
      await onSubmit({
        title: values.title,
        amount: Number(values.amount),
        category: values.category,
        notes: values.notes,
      });
      resetForm();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catat Pengeluaran Harian</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul Pengeluaran</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="cth. Belanja Bulanan / Kopi"
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
              step="500"
              placeholder="50000"
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
              <option value="food">Makanan & Minuman</option>
              <option value="transport">Transportasi</option>
              <option value="shopping">Belanja</option>
              <option value="entertainment">Hiburan</option>
              <option value="healthcare">Kesehatan</option>
              <option value="other">Lainnya</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Input
              id="notes"
              name="notes"
              type="text"
              placeholder="Detail tambahan..."
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full font-semibold bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> {formik.isSubmitting ? "Mencatat..." : "Catat Pengeluaran"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
