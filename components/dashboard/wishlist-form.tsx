"use client";

import { useFormik } from "formik";
import { validateWithValibot, WishlistSchema } from "@/lib/validation";
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
import { Plus, Target, DollarSign, Flag } from "lucide-react";

interface WishlistFormProps {
  onSubmit: (data: {
    title: string;
    targetPrice: number;
    priority: string;
  }) => Promise<void>;
}

export function WishlistForm({ onSubmit }: WishlistFormProps) {
  const formik = useFormik({
    initialValues: {
      title: "",
      targetPrice: 0,
      priority: "medium",
    },
    validate: (values) => validateWithValibot(WishlistSchema, values),
    onSubmit: async (values, { resetForm }) => {
      await onSubmit({
        title: values.title,
        targetPrice: Number(values.targetPrice),
        priority: values.priority,
      });
      resetForm();
    },
  });

  return (
    <Card className="border-teal-500/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center space-x-2">
          <Target className="h-4 w-4 text-teal-500" />
          <span>Buat Target Impian</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <FieldGroup>
            {/* Field: Title */}
            <Field invalid={Boolean(formik.touched.title && formik.errors.title)}>
              <FieldLabel htmlFor="title" className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>Judul Target / Barang</span>
              </FieldLabel>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="cth. Laptop M4 Pro / Dana Darurat"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <FieldError>{formik.touched.title && formik.errors.title}</FieldError>
            </Field>

            {/* Field: Target Price */}
            <Field invalid={Boolean(formik.touched.targetPrice && formik.errors.targetPrice)}>
              <FieldLabel htmlFor="targetPrice" className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>Harga Target (Rp)</span>
              </FieldLabel>
              <Input
                id="targetPrice"
                name="targetPrice"
                type="number"
                step="10000"
                placeholder="25000000"
                value={formik.values.targetPrice || ""}
                onChange={(e) => formik.setFieldValue("targetPrice", parseFloat(e.target.value) || 0)}
                onBlur={formik.handleBlur}
              />
              <FieldError>{formik.touched.targetPrice && formik.errors.targetPrice}</FieldError>
            </Field>

            {/* Field: Priority */}
            <Field>
              <FieldLabel className="flex items-center space-x-1">
                <Flag className="h-3 w-3" />
                <span>Prioritas</span>
              </FieldLabel>
              <Select
                value={formik.values.priority}
                onValueChange={(value) => formik.setFieldValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah (Low Priority)</SelectItem>
                  <SelectItem value="medium">Sedang (Medium Priority)</SelectItem>
                  <SelectItem value="high">Tinggi (High Priority)</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Estimasi kelayakan waktu pencapaian dihitung otomatis berdasarkan tabungan bersih bulanan.
              </FieldDescription>
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full font-semibold bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {formik.isSubmitting ? "Menambahkan..." : "Tambah Target Impian"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
