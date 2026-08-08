"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getUserFinancialOverview } from "@/lib/financial/actions";
import { formatRupiah } from "@/lib/currency";
import { FinancialOverviewData } from "@/types/financial";
import { Button } from "@/components/ui/button";
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
  Sparkles,
  AlertTriangle,
  Info,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";

export default function OverviewPage() {
  const { data: session, status: authStatus } = useSession();
  const userId = session?.user?.id || "demo-user";

  const [data, setData] = useState<FinancialOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

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
    { name: "Penghasilan", amount: summary.totalMonthlyIncome, fill: "#0d9488" },
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
            Analisis arus kas real-time dan rekomendasi keuangan pintar.
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

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Penghasilan Bulanan"
          amount={summary.totalMonthlyIncome}
          subtitle={`Dari ${data?.incomes?.length || 0} sumber penghasilan`}
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
          subtitle={`${summary.fixedCostRatioPercentage}% dari total penghasilan`}
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
          subtitle="Total pengeluaran harian dicatat"
          href="/dashboard/daily"
          icon={
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-500">
              <ShoppingBag className="h-4 w-4" />
            </div>
          }
        />

        <SummaryCard
          title="Tabungan Bersih Bulanan"
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
            <h2 className="text-base font-bold tracking-tight">Analisis Arus Kas Bulanan</h2>
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
