"use client";

import { useFormik } from "formik";
import { validateWithValibot, WishlistSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle>Buat Target Tabungan / Impian</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul Target / Barang</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="cth. Laptop M4 Pro / Liburan"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-xs text-destructive font-medium mt-1">{formik.errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="targetPrice">Harga Target (Rp)</Label>
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
            {formik.touched.targetPrice && formik.errors.targetPrice && (
              <p className="text-xs text-destructive font-medium mt-1">{formik.errors.targetPrice}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">Prioritas</Label>
            <Select
              id="priority"
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="low">Rendah (Low)</option>
              <option value="medium">Sedang (Medium)</option>
              <option value="high">Tinggi (High)</option>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full font-semibold bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> {formik.isSubmitting ? "Menambahkan..." : "Tambah Target Impian"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
