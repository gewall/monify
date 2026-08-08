"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserFinancialOverview, addRecurringExpenditure, deleteRecurringExpenditure } from "@/lib/financial/actions";
import { formatRupiah } from "@/lib/currency";
import { RecurringRecord } from "@/types/financial";
import { toast } from "sonner";
import { RecurringForm } from "@/components/dashboard/recurring-form";
import { RecurringList } from "@/components/dashboard/recurring-list";
import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function RecurringPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "demo-user";

  const [recurring, setRecurring] = useState<RecurringRecord[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async (uid: string) => {
    try {
      const res = await getUserFinancialOverview(uid);
      setRecurring((res.recurring || []) as unknown as RecurringRecord[]);
      setTotalMonthly(res.summary?.totalMonthlyFixedCosts || 0);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat pengeluaran tetap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getUserFinancialOverview(userId)
      .then((res) => {
        if (active) {
          setRecurring((res.recurring || []) as unknown as RecurringRecord[]);
          setTotalMonthly(res.summary?.totalMonthlyFixedCosts || 0);
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
  }, [userId]);

  const handleAdd = async (data: {
    title: string;
    amount: number;
    category: string;
    billingCycle: string;
    dueDayOfMonth?: number;
  }) => {
    const res = await addRecurringExpenditure(userId, data);
    if (res.success) {
      toast.success(`Pengeluaran tetap "${data.title}" berhasil ditambahkan!`);
      await fetchOverview(userId);
    } else {
      toast.error(res.error || "Gagal menambahkan pengeluaran tetap.");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteRecurringExpenditure(userId, id);
    if (res.success) {
      toast.success("Pengeluaran tetap berhasil dihapus.");
      await fetchOverview(userId);
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
            <CreditCard className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-black tracking-tight">Pengeluaran Tetap Bulanan</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sewa rumah, tagihan listrik, langganan, asuransi, dan cicilan.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Total Pengeluaran Tetap</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatRupiah(totalMonthly)}/bln
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecurringForm onSubmit={handleAdd} />
        <div className="lg:col-span-2">
          <RecurringList recurring={recurring} loading={loading} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
