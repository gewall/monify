"use client";

import { useFormik } from "formik";
import { validateWithValibot, DailySchema } from "@/lib/validation";
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
import { Plus, ShoppingBag, DollarSign, Tag, FileText } from "lucide-react";

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
    <Card className="border-amber-500/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center space-x-2">
          <ShoppingBag className="h-4 w-4 text-amber-500" />
          <span>Catat Pengeluaran Harian</span>
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
                placeholder="cth. Makan Siang / Belanja Pasar"
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
                step="500"
                placeholder="35000"
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
                  <SelectItem value="food">Makanan & Minuman</SelectItem>
                  <SelectItem value="transport">Transportasi & BBM</SelectItem>
                  <SelectItem value="shopping">Belanja Harian</SelectItem>
                  <SelectItem value="entertainment">Hiburan & Rekreasi</SelectItem>
                  <SelectItem value="healthcare">Kesehatan & Obat</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Pengeluaran harian akan langsung mengurangi Saldo Rekening saat dicatat.
              </FieldDescription>
            </Field>

            {/* Field: Notes */}
            <Field>
              <FieldLabel htmlFor="notes" className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>Catatan (Opsional)</span>
              </FieldLabel>
              <Input
                id="notes"
                name="notes"
                type="text"
                placeholder="Catatan tambahan..."
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full font-semibold bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {formik.isSubmitting ? "Mencatat..." : "Catat Pengeluaran"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
