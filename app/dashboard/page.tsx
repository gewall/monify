"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getUserFinancialOverview, updateUserBalance } from "@/lib/financial/actions";
import { formatRupiah } from "@/lib/currency";
import { FinancialOverviewData } from "@/types/financial";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Wallet,
  Sparkles,
  AlertTriangle,
  Info,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit2,
  Check,
  X,
} from "lucide-react";

export default function OverviewPage() {
  const { data: session, status: authStatus } = useSession();
  const userId = session?.user?.id || "demo-user";

  const [data, setData] = useState<FinancialOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit balance state
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  const loadOverview = async (uid: string) => {
    try {
      const res = await getUserFinancialOverview(uid);
      setData(res as unknown as FinancialOverviewData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    if (authStatus !== "loading") {
      getUserFinancialOverview(userId)
        .then((res) => {
          if (active) {
            setData(res as unknown as FinancialOverviewData);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (active) {
            console.error(err);
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
    };
  }, [userId, authStatus]);

  const handleSaveBalance = async () => {
    const num = Number(balanceInput);
    if (isNaN(num) || num < 0) {
      toast.error("Masukkan nominal saldo yang valid.");
      return;
    }

    const res = await updateUserBalance(userId, num);
    if (res.success) {
      toast.success("Saldo berhasil diperbarui!");
      setIsEditingBalance(false);
      await loadOverview(userId);
    } else {
      toast.error(res.error || "Gagal memperbarui saldo.");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs text-muted-foreground">Memuat analisis keuangan...</p>
        </div>
      </div>
    );
  }

  const userBalance = data?.userBalance ?? 0;
  const summary = data?.summary || {
    totalMonthlyIncome: 0,
    totalMonthlyFixedCosts: 0,
    totalDailyExpenses: 0,
    totalMonthlyExpenditure: 0,
    netMonthlySavings: 0,
    savingsRatePercentage: 0,
    fixedCostRatioPercentage: 0,
    subscriptionsMonthlyTotal: 0,
  };

  const cashFlowChartData = [
    { name: "Saldo Saat Ini", amount: userBalance, fill: "#0d9488" },
    { name: "Penghasilan", amount: summary.totalMonthlyIncome, fill: "#10b981" },
    { name: "Biaya Tetap", amount: summary.totalMonthlyFixedCosts, fill: "#e11d48" },
    { name: "Harian", amount: summary.totalDailyExpenses, fill: "#f59e0b" },
    { name: "Tabungan", amount: Math.max(0, summary.netMonthlySavings), fill: "#3b82f6" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-teal-900/40 via-card to-card border border-teal-500/20">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Ringkasan Kesehatan Keuangan</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Saldo kas real-time, jadwal income/biaya otomatis & rekomendasi pintar.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/incomes">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Tambah Penghasilan
            </Button>
          </Link>
          <Link href="/dashboard/daily">
            <Button size="sm" variant="outline" className="font-semibold">
              <Plus className="h-4 w-4 mr-1" /> Catat Pengeluaran
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards Grid Including Saldo Rekening */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* User Balance Card with Inline Edit */}
        <Card className="p-4 flex flex-col justify-between space-y-2 border-teal-500/30 bg-teal-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Saldo Rekening
            </span>
            <div className="p-1 rounded-md bg-teal-500/10 text-teal-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>

          {isEditingBalance ? (
            <div className="space-y-2 pt-1">
              <Input
                type="number"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="Nominal Saldo (Rp)"
                className="h-8 text-xs font-bold"
              />
              <div className="flex items-center space-x-1">
                <Button size="xs" onClick={handleSaveBalance} className="h-7 text-xs px-2 bg-teal-600 hover:bg-teal-700">
                  <Check className="h-3 w-3 mr-1" /> Simpan
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setIsEditingBalance(false)} className="h-7 text-xs px-2">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline space-x-2">
                <p className="text-xl font-black text-teal-600 dark:text-teal-400">
                  {formatRupiah(userBalance)}
                </p>
                <button
                  onClick={() => {
                    setBalanceInput(userBalance.toString());
                    setIsEditingBalance(true);
                  }}
                  className="text-muted-foreground hover:text-teal-500 transition-colors"
                  title="Edit Saldo"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Diproses otomatis via Cron</p>
            </div>
          )}
        </Card>

        <SummaryCard
          title="Penghasilan Bulanan"
          amount={summary.totalMonthlyIncome}
          subtitle={`Dari ${data?.incomes?.length || 0} sumber`}
          href="/dashboard/incomes"
          icon={
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          }
        />

        <SummaryCard
          title="Biaya Tetap Bulanan"
          amount={summary.totalMonthlyFixedCosts}
          subtitle={`${summary.fixedCostRatioPercentage}% dari penghasilan`}
          href="/dashboard/recurring"
          icon={
            <div className="p-1 rounded-md bg-rose-500/10 text-rose-500">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          }
        />

        <SummaryCard
          title="Pengeluaran Harian"
          amount={summary.totalDailyExpenses}
          subtitle="Mengurangi saldo kas"
          href="/dashboard/daily"
          icon={
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-500">
              <ShoppingBag className="h-4 w-4" />
            </div>
          }
        />

        <SummaryCard
          title="Tabungan Bersih"
          amount={summary.netMonthlySavings}
          subtitle={`${summary.savingsRatePercentage}% Savings Rate`}
          href="/dashboard/wishlist"
          valueClassName={summary.netMonthlySavings >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600"}
          icon={
            <div className="p-1 rounded-md bg-teal-500/10 text-teal-500">
              <Sparkles className="h-4 w-4" />
            </div>
          }
        />
      </div>

      {/* Visual Charts & Financial Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Bar Chart */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Analisis Saldo & Arus Kas</h2>
            <span className="text-xs text-muted-foreground">Indonesian Rupiah (Rp)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                  formatter={(val: unknown) => [formatRupiah(Number(val)), "Jumlah"]}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {cashFlowChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Smart Financial Advice & Suggestions */}
        <Card className="p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-teal-500" />
              <h2 className="text-base font-bold tracking-tight">Rekomendasi Keuangan Pintar</h2>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {data?.suggestions?.length === 0 ? (
                <div className="p-4 rounded-lg bg-muted text-center text-xs text-muted-foreground">
                  Tambahkan penghasilan dan pengeluaran untuk mendapatkan rekomendasi pintar.
                </div>
              ) : (
                data?.suggestions?.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      item.type === "warning"
                        ? "bg-destructive/10 border-destructive/20 text-foreground"
                        : item.type === "tip"
                        ? "bg-teal-500/10 border-teal-500/20 text-foreground"
                        : "bg-blue-500/10 border-blue-500/20 text-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold">
                      {item.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : item.type === "tip" ? (
                        <Sparkles className="h-4 w-4 text-teal-500" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Langganan Bulanan</span>
            <span className="font-bold text-foreground">
              {formatRupiah(summary.subscriptionsMonthlyTotal)}/bln
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
