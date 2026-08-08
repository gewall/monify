"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserFinancialOverview } from "@/lib/financial/actions";
import { ActionLogRecord } from "@/types/financial";
import { AuditLogList } from "@/components/dashboard/audit-log-list";
import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function LogsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "demo-user";

  const [logs, setLogs] = useState<ActionLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getUserFinancialOverview(userId)
      .then((res) => {
        if (active) {
          setLogs((res.logs || []) as unknown as ActionLogRecord[]);
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

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-teal-500" />
            <h1 className="text-2xl font-black tracking-tight">Security & Action Audit Trail</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete timestamped history of user account actions, security updates & financial edits.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Recorded Events</p>
          <p className="text-2xl font-black text-foreground">{logs.length}</p>
        </div>
      </Card>

      <AuditLogList logs={logs} loading={loading} />
    </div>
  );
}
