import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionLogRecord } from "@/types/financial";

interface AuditLogListProps {
  logs: ActionLogRecord[];
  loading: boolean;
}

export function AuditLogList({ logs, loading }: AuditLogListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground py-8 text-center">Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No action logs recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
              >
                <div>
                  <Badge variant="teal" className="mr-2">
                    {log.actionType}
                  </Badge>
                  <span className="text-foreground font-medium">{log.description}</span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
