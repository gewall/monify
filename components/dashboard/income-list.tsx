import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { IncomeRecord } from "@/types/financial";
import { Trash2 } from "lucide-react";

interface IncomeListProps {
  incomes: IncomeRecord[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function IncomeList({ incomes, loading, onDelete }: IncomeListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sumber Penghasilan Aktif</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground py-8 text-center">Memuat sumber penghasilan...</p>
        ) : incomes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Belum ada penghasilan ditambahkan.</p>
        ) : (
          <div className="divide-y divide-border">
            {incomes.map((inc) => (
              <div key={inc.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{inc.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {inc.sourceType} • {inc.frequency}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{formatRupiah(inc.amount)}
                  </span>
                  <button
                    onClick={() => onDelete(inc.id)}
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
