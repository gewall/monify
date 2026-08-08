/**
 * Formats a number as Indonesian Rupiah (Rp)
 * Example: 50000 -> "Rp 50.000" or 50000.5 -> "Rp 50.000,50"
 */
export function formatRupiah(amount: number | string, includeDecimal: boolean = false): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) || 0 : amount || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: includeDecimal ? 2 : 0,
    maximumFractionDigits: includeDecimal ? 2 : 0,
  }).format(numericAmount);
}
