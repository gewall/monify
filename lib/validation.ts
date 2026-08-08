import * as v from "valibot";

/**
 * Valibot validation adapter for Formik
 */
export function validateWithValibot<T extends Record<string, unknown>>(
  schema: v.GenericSchema<T>,
  values: T
): Record<string, string> {
  const result = v.safeParse(schema, values);
  if (result.success) {
    return {};
  }

  const errors: Record<string, string> = {};
  for (const issue of result.issues) {
    const path = issue.path?.[0]?.key as string;
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

// 1. Income Validation Schema
export const IncomeSchema = v.object({
  title: v.pipe(
    v.string("Judul wajib diisi."),
    v.minLength(2, "Judul minimal 2 karakter.")
  ),
  amount: v.pipe(
    v.number("Jumlah harus berupa angka."),
    v.minValue(1, "Jumlah harus lebih besar dari 0.")
  ),
  sourceType: v.string("Kategori sumber wajib dipilih."),
  frequency: v.string("Frekuensi wajib dipilih."),
});

// 2. Fixed Expenditure Validation Schema
export const RecurringSchema = v.object({
  title: v.pipe(
    v.string("Judul wajib diisi."),
    v.minLength(2, "Judul minimal 2 karakter.")
  ),
  amount: v.pipe(
    v.number("Jumlah harus berupa angka."),
    v.minValue(1, "Jumlah harus lebih besar dari 0.")
  ),
  category: v.string("Kategori wajib dipilih."),
  billingCycle: v.string("Siklus pembayaran wajib dipilih."),
  dueDayOfMonth: v.optional(v.number()),
});

// 3. Daily Spending Validation Schema
export const DailySchema = v.object({
  title: v.pipe(
    v.string("Judul wajib diisi."),
    v.minLength(2, "Judul minimal 2 karakter.")
  ),
  amount: v.pipe(
    v.number("Jumlah harus berupa angka."),
    v.minValue(1, "Jumlah harus lebih besar dari 0.")
  ),
  category: v.string("Kategori wajib dipilih."),
  notes: v.optional(v.string()),
});

// 4. Wishlist Goal Validation Schema
export const WishlistSchema = v.object({
  title: v.pipe(
    v.string("Judul wajib diisi."),
    v.minLength(2, "Judul minimal 2 karakter.")
  ),
  targetPrice: v.pipe(
    v.number("Harga target harus berupa angka."),
    v.minValue(1, "Harga target harus lebih besar dari 0.")
  ),
  priority: v.string("Prioritas wajib dipilih."),
});

// 5. Auth Schemas
export const LoginSchema = v.object({
  email: v.pipe(
    v.string("Email wajib diisi."),
    v.email("Masukkan alamat email yang valid.")
  ),
  password: v.pipe(
    v.string("Password wajib diisi."),
    v.minLength(6, "Password minimal 6 karakter.")
  ),
});

export const RegisterSchema = v.object({
  name: v.pipe(
    v.string("Nama lengkap wajib diisi."),
    v.minLength(2, "Nama lengkap minimal 2 karakter.")
  ),
  email: v.pipe(
    v.string("Email wajib diisi."),
    v.email("Masukkan alamat email yang valid.")
  ),
  password: v.pipe(
    v.string("Password wajib diisi."),
    v.minLength(6, "Password minimal 6 karakter.")
  ),
});
