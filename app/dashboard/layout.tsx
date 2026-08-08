"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  PieChart as PieChartIcon,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Target,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: PieChartIcon },
  { href: "/dashboard/incomes", label: "Income Streams", icon: TrendingUp },
  { href: "/dashboard/recurring", label: "Fixed Costs", icon: CreditCard },
  { href: "/dashboard/daily", label: "Daily Spending", icon: ShoppingBag },
  { href: "/dashboard/wishlist", label: "Wishlist Goals", icon: Target },
  { href: "/dashboard/logs", label: "Audit Logs", icon: ShieldCheck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Monify</h1>
              <p className="text-xs text-muted-foreground">Smart Money Management System</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold">{session?.user?.name || "Member User"}</p>
            <p className="text-[11px] text-muted-foreground">{session?.user?.email || "user@monify.app"}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Bar for Sub-routes */}
        <nav className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-border">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Route Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
