import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Target,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BarChart3,
  Mail,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Monify
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold text-sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart Financial Advice & Feasibility Engine</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-foreground">
            Master Your Money with <br />
            <span className="bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              Precision & Intelligence
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track multi-stream incomes, automate fixed recurring costs, monitor daily spending, calculate wishlist purchase timelines, and receive AI-driven financial suggestions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/25">
                Start Free Trial <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 font-bold">
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Feature Cards Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Built for Complete Financial Control
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Everything you need to analyze cash flow, eliminate unnecessary subscriptions, and reach your savings goals faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 hover:border-teal-500/50 transition-all">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500 w-fit">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Multi-Stream Income</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Aggregate salaries, freelance contracts, dividends, and side hustles with automatic monthly normalization.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 hover:border-teal-500/50 transition-all">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 w-fit">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Fixed Expenditures</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track rent, utilities, and recurring subscriptions. Get automated alerts when fixed costs exceed 50% of income.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 hover:border-teal-500/50 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 w-fit">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Wishlist Feasibility</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Calculate exact days required to afford big purchases based on your live net monthly savings rate.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 hover:border-teal-500/50 transition-all">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 w-fit">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Visual Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive Recharts cash flow visualizers and expenditure category breakdowns for effortless insights.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 hover:border-teal-500/50 transition-all">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 w-fit">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Automated Email Digests</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Weekly financial reports and savings recommendations dispatched automatically via Gmail SMTP.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 hover:border-teal-500/50 transition-all">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Security & Audit Logs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hybrid OAuth 2.0 and encrypted password auth with complete audit history for all sensitive financial actions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
        <p>© 2026 Monify Money Management. All rights reserved.</p>
      </footer>
    </div>
  );
}
