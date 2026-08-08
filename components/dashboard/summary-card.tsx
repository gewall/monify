import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { ArrowRight } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  valueClassName?: string;
}

export function SummaryCard({
  title,
  amount,
  subtitle,
  href,
  icon,
  valueClassName = "text-foreground",
}: SummaryCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="p-5 space-y-2 group-hover:border-teal-500/50 transition-all">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
        </div>
        <div className={`text-2xl font-extrabold ${valueClassName}`}>
          {formatRupiah(amount)}
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-between">
          <span>{subtitle}</span>
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </p>
      </Card>
    </Link>
  );
}
