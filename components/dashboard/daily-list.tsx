import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { DailyRecord } from "@/types/financial";
import { Trash2 } from "lucide-react";

interface DailyListProps {
  daily: DailyRecord[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function DailyList({ daily, loading, onDelete }: DailyListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengeluaran Harian Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground py-8 text-center">Memuat pengeluaran harian...</p>
        ) : daily.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Belum ada pengeluaran harian dicatat.</p>
        ) : (
          <div className="divide-y divide-border">
            {daily.map((day) => (
              <div key={day.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{day.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {day.category} {day.notes ? `• ${day.notes}` : ""}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">
                    -{formatRupiah(day.amount)}
                  </span>
                  <button
                    onClick={() => onDelete(day.id)}
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
