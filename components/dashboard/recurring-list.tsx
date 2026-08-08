import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { RecurringRecord } from "@/types/financial";
import { Trash2 } from "lucide-react";

interface RecurringListProps {
  recurring: RecurringRecord[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function RecurringList({ recurring, loading, onDelete }: RecurringListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pengeluaran Tetap</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground py-8 text-center">Memuat pengeluaran tetap...</p>
        ) : recurring.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Belum ada pengeluaran tetap dicatat.</p>
        ) : (
          <div className="divide-y divide-border">
            {recurring.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{rec.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {rec.category} • {rec.billingCycle}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">
                    -{formatRupiah(rec.amount)}
                  </span>
                  <button
                    onClick={() => onDelete(rec.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
