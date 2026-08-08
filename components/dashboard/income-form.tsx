"use client";

import { useFormik } from "formik";
import { validateWithValibot, IncomeSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface IncomeFormProps {
  onSubmit: (data: {
    title: string;
    amount: number;
    sourceType: string;
    frequency: string;
  }) => Promise<void>;
}

export function IncomeForm({ onSubmit }: IncomeFormProps) {
  const formik = useFormik({
    initialValues: {
      title: "",
      amount: 0,
      sourceType: "salary",
      frequency: "monthly",
    },
    validate: (values) => validateWithValibot(IncomeSchema, values),
    onSubmit: async (values, { resetForm }) => {
      await onSubmit({
        title: values.title,
        amount: Number(values.amount),
        sourceType: values.sourceType,
        frequency: values.frequency,
      });
      resetForm();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Sumber Penghasilan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul / Sumber</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="cth. Gaji Utama"
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
              placeholder="10000000"
              value={formik.values.amount || ""}
              onChange={(e) => formik.setFieldValue("amount", parseFloat(e.target.value) || 0)}
              onBlur={formik.handleBlur}
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-xs text-destructive font-medium mt-1">{formik.errors.amount}</p>
            )}
          </div>

          <div>
            <Label htmlFor="sourceType">Kategori Sumber</Label>
            <Select
              id="sourceType"
              name="sourceType"
              value={formik.values.sourceType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="salary">Gaji (Salary)</option>
              <option value="freelance">Freelance</option>
              <option value="payout">Bonus / Payout</option>
              <option value="investment">Investasi</option>
              <option value="side_hustle">Usaha Sampingan</option>
              <option value="other">Lainnya</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="frequency">Frekuensi</Label>
            <Select
              id="frequency"
              name="frequency"
              value={formik.values.frequency}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="monthly">Bulanan</option>
              <option value="weekly">Mingguan</option>
              <option value="one_time">Sekali Pembayaran</option>
              <option value="annual">Tahunan</option>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> {formik.isSubmitting ? "Menyimpan..." : "Simpan Penghasilan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
