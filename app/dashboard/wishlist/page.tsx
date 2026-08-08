"use client";

import { useState, useEffect } from "react";
import { getUserFinancialOverview, addWishlistItem, updateWishlistStatus, deleteWishlistItem } from "@/lib/financial/actions";
import { formatRupiah } from "@/lib/currency";
import { WishlistRecord } from "@/types/financial";
import { toast } from "sonner";
import { WishlistForm } from "@/components/dashboard/wishlist-form";
import { WishlistCard } from "@/components/dashboard/wishlist-card";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistRecord[]>([]);
  const [netSavings, setNetSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await getUserFinancialOverview();
      setWishlist((res.wishlist || []) as unknown as WishlistRecord[]);
      setNetSavings(res.summary?.netMonthlySavings || 0);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat target impian.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getUserFinancialOverview()
      .then((res) => {
        if (active) {
          setWishlist((res.wishlist || []) as unknown as WishlistRecord[]);
          setNetSavings(res.summary?.netMonthlySavings || 0);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (data: {
    title: string;
    targetPrice: number;
    priority: string;
  }) => {
    const res = await addWishlistItem(data);
    if (res.success) {
      toast.success(`Target impian "${data.title}" berhasil dibuat!`);
      await fetchOverview();
    } else {
      toast.error(res.error || "Gagal membuat target impian.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "saving" ? "achieved" : "saving";
    const res = await updateWishlistStatus(id, nextStatus);
    if (res.success) {
      toast.success(
        nextStatus === "achieved"
          ? "Selamat! Target impian berhasil dicapai 🎉"
          : "Status target impian dibuka kembali."
      );
      await fetchOverview();
    } else {
      toast.error(res.error || "Gagal memperbarui status.");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteWishlistItem(id);
    if (res.success) {
      toast.success("Target impian berhasil dihapus.");
      await fetchOverview();
    } else {
      toast.error(res.error || "Gagal menghapus target.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-teal-500" />
            <h1 className="text-2xl font-black tracking-tight">Wishlist & Target Impian</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tetapkan target tabungan dan hitung estimasi kelayakan berdasarkan tabungan bersih bulanan.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Tabungan Bersih Bulanan Saat Ini</p>
          <p className={`text-2xl font-black ${netSavings >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600"}`}>
            {formatRupiah(netSavings)}/bln
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WishlistForm onSubmit={handleAdd} />
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold tracking-tight">Target Impian & Estimasi Kelayakan</h2>
          {loading ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Memuat target impian...</p>
          ) : wishlist.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              Belum ada target impian dibuat. Tambahkan satu untuk melihat estimasi waktu pencapaian secara real-time!
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  netSavings={netSavings}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
