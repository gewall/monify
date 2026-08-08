"use client";

import { useState, useEffect } from "react";
import { getUserFinancialOverview, addDailyExpenditure, deleteDailyExpenditure } from "@/lib/financial/actions";
import { formatRupiah } from "@/lib/currency";
import { DailyRecord } from "@/types/financial";
import { toast } from "sonner";
import { DailyForm } from "@/components/dashboard/daily-form";
import { DailyList } from "@/components/dashboard/daily-list";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function DailyPage() {
  const [daily, setDaily] = useState<DailyRecord[]>([]);
  const [totalDaily, setTotalDaily] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await getUserFinancialOverview();
      setDaily((res.daily || []) as unknown as DailyRecord[]);
      setTotalDaily(res.summary?.totalDailyExpenses || 0);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat pengeluaran harian.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getUserFinancialOverview()
      .then((res) => {
        if (active) {
          setDaily((res.daily || []) as unknown as DailyRecord[]);
          setTotalDaily(res.summary?.totalDailyExpenses || 0);
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
    amount: number;
    category: string;
    notes?: string;
  }) => {
    const res = await addDailyExpenditure(data);
    if (res.success) {
      toast.success(`Pengeluaran harian "${data.title}" berhasil dicatat!`);
      await fetchOverview();
    } else {
      toast.error(res.error || "Gagal mencatat pengeluaran.");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteDailyExpenditure(id);
    if (res.success) {
      toast.success("Pengeluaran harian berhasil dihapus.");
      await fetchOverview();
    } else {
      toast.error(res.error || "Gagal menghapus pengeluaran.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-black tracking-tight">Pencatatan Pengeluaran Harian</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Catat makanan, transportasi, belanja, hiburan, dan pengeluaran harian.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Total Pengeluaran Harian</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatRupiah(totalDaily)}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DailyForm onSubmit={handleAdd} />
        <div className="lg:col-span-2">
          <DailyList daily={daily} loading={loading} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
