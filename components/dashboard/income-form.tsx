"use client";

import { useFormik } from "formik";
import { validateWithValibot, IncomeSchema } from "@/lib/validation";
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
import { Plus, Wallet, DollarSign, Tag, Clock } from "lucide-react";

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
    <Card className="border-emerald-500/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-emerald-500" />
          <span>Tambah Sumber Penghasilan</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <FieldGroup>
            {/* Field: Title */}
            <Field invalid={Boolean(formik.touched.title && formik.errors.title)}>
              <FieldLabel htmlFor="title" className="flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>Judul / Sumber</span>
              </FieldLabel>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="cth. Gaji Utama / Side Project"
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
                placeholder="10000000"
                value={formik.values.amount || ""}
                onChange={(e) => formik.setFieldValue("amount", parseFloat(e.target.value) || 0)}
                onBlur={formik.handleBlur}
              />
              <FieldError>{formik.touched.amount && formik.errors.amount}</FieldError>
            </Field>

            {/* Field: Source Type */}
            <Field>
              <FieldLabel className="flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>Kategori Sumber</span>
              </FieldLabel>
              <Select
                value={formik.values.sourceType}
                onValueChange={(value) => formik.setFieldValue("sourceType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Gaji Utama (Salary)</SelectItem>
                  <SelectItem value="freelance">Freelance / Proyek</SelectItem>
                  <SelectItem value="payout">Bonus / Payout</SelectItem>
                  <SelectItem value="investment">Dividen / Investasi</SelectItem>
                  <SelectItem value="side_hustle">Usaha Sampingan</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Field: Frequency */}
            <Field>
              <FieldLabel className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Frekuensi Pembayaran</span>
              </FieldLabel>
              <Select
                value={formik.values.frequency}
                onValueChange={(value) => formik.setFieldValue("frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih frekuensi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Bulanan (Rutinan)</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="one_time">Sekali Bayar (Langsung Masuk Saldo)</SelectItem>
                  <SelectItem value="annual">Tahunan</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Penghasilan &quot;Sekali Bayar&quot; akan langsung menambahkan Saldo Rekening saat ini.
              </FieldDescription>
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {formik.isSubmitting ? "Menyimpan..." : "Simpan Penghasilan"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
