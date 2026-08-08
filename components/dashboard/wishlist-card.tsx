import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/currency";
import { CheckCircle2, Trash2 } from "lucide-react";

interface WishlistCardProps {
  item: {
    id: string;
    title: string;
    targetPrice: string | number;
    priority: string;
    status: string;
  };
  netSavings: number;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function WishlistCard({
  item,
  netSavings,
  onToggleStatus,
  onDelete,
}: WishlistCardProps) {
  const price = Number(item.targetPrice);
  const daysReq = netSavings > 0 ? Math.ceil((price / netSavings) * 30) : null;

  return (
    <Card className="p-5 shadow-sm space-y-3 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <Badge
            variant={
              item.priority === "high"
                ? "rose"
                : item.priority === "medium"
                ? "amber"
                : "blue"
            }
          >
            Prioritas {item.priority}
          </Badge>

          <Badge variant={item.status === "achieved" ? "emerald" : "teal"}>
            {item.status === "achieved" ? "Tercapai" : "Menabung"}
          </Badge>
        </div>

        <h3 className="font-bold text-lg mt-2 text-foreground">{item.title}</h3>
        <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
          {formatRupiah(price)}
        </p>

        <div className="mt-3 p-3 rounded-lg bg-muted text-xs space-y-1">
          <p className="font-semibold text-foreground">Estimasi Kelayakan:</p>
          {daysReq ? (
            <p className="text-muted-foreground">
              Dapat dicapai dalam <span className="font-bold text-foreground">~{daysReq} hari</span> dengan tingkat tabungan bersih Anda saat ini.
            </p>
          ) : (
            <p className="text-rose-500">
              Diperlukan tabungan bersih bulanan yang positif untuk menghitung estimasi.
            </p>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(item.id, item.status)}
        >
          {item.status === "saving" ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" /> Tandai Tercapai
            </>
          ) : (
            "Buka Kembali Goal"
          )}
        </Button>

        <button
          onClick={() => onDelete(item.id)}
          className="text-muted-foreground hover:text-destructive p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
