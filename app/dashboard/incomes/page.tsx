"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserFinancialOverview, addIncomeSource, deleteIncomeSource } from "@/lib/financial/actions";
import { formatRupiah } from "@/lib/currency";
import { IncomeRecord } from "@/types/financial";
import { toast } from "sonner";
import { IncomeForm } from "@/components/dashboard/income-form";
import { IncomeList } from "@/components/dashboard/income-list";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function IncomesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "demo-user";

  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async (uid: string) => {
    try {
      const res = await getUserFinancialOverview(uid);
      setIncomes((res.incomes || []) as unknown as IncomeRecord[]);
      setTotalMonthly(res.summary?.totalMonthlyIncome || 0);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data penghasilan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getUserFinancialOverview(userId)
      .then((res) => {
        if (active) {
          setIncomes((res.incomes || []) as unknown as IncomeRecord[]);
          setTotalMonthly(res.summary?.totalMonthlyIncome || 0);
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
    sourceType: string;
    frequency: string;
  }) => {
    const res = await addIncomeSource(userId, data);
    if (res.success) {
      toast.success(`Penghasilan "${data.title}" berhasil ditambahkan!`);
      await fetchOverview(userId);
    } else {
      toast.error(res.error || "Gagal menambahkan penghasilan.");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteIncomeSource(userId, id);
    if (res.success) {
      toast.success("Sumber penghasilan berhasil dihapus.");
      await fetchOverview(userId);
    } else {
      toast.error(res.error || "Gagal menghapus penghasilan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-black tracking-tight">Manajemen Penghasilan</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola gaji, freelance, investasi, dan usaha sampingan Anda.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Total Bulanan Disetara</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatRupiah(totalMonthly)}/bln
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <IncomeForm onSubmit={handleAdd} />
        <div className="lg:col-span-2">
          <IncomeList incomes={incomes} loading={loading} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
