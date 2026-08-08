"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ActionLogRecord } from "@/types/financial";
import { Filter, Calendar, Search, RotateCcw } from "lucide-react";

interface AuditLogListProps {
  logs: ActionLogRecord[];
  loading: boolean;
}

export function AuditLogList({ logs, loading }: AuditLogListProps) {
  const [selectedActionType, setSelectedActionType] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Extract unique action types for dropdown filter
  const actionTypes = useMemo(() => {
    const types = new Set(logs.map((log) => log.actionType));
    return ["ALL", ...Array.from(types)];
  }, [logs]);

  // Filter logs based on action type, date range, and search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Action Type Filter
      if (selectedActionType !== "ALL" && log.actionType !== selectedActionType) {
        return false;
      }

      // 2. Search Term Filter
      if (
        searchTerm &&
        !log.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.actionType.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // 3. Date Range Filter
      const logDate = new Date(log.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });
  }, [logs, selectedActionType, searchTerm, startDate, endDate]);

  const handleResetFilters = () => {
    setSelectedActionType("ALL");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  return (
    <Card className="space-y-4">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold flex items-center space-x-2">
            <Filter className="h-5 w-5 text-teal-500" />
            <span>Audit Trail & Activity Log</span>
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            Menampilkan <span className="font-bold text-foreground">{filteredLogs.length}</span> dari {logs.length} log
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters Controls Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border">
          {/* Search Term */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center space-x-1">
              <Search className="h-3 w-3" />
              <span>Cari Deskripsi</span>
            </label>
            <Input
              type="text"
              placeholder="Cari log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs bg-background"
            />
          </div>

          {/* Action Type Select */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center space-x-1">
              <Filter className="h-3 w-3" />
              <span>Jenis Aksinya</span>
            </label>
            <Select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="h-8 text-xs bg-background"
            >
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "ALL" ? "Semua Aksi (All Types)" : type}
                </option>
              ))}
            </Select>
          </div>

          {/* Start Date Range */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Dari Tanggal</span>
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-xs bg-background"
            />
          </div>

          {/* End Date Range */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Sampai Tanggal</span>
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs bg-background"
              />
              {(selectedActionType !== "ALL" || startDate || endDate || searchTerm) && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={handleResetFilters}
                  title="Reset Filter"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Audit Log Items List */}
        {loading ? (
          <p className="text-xs text-muted-foreground py-8 text-center">Memuat audit log...</p>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground rounded-lg border border-dashed border-border">
            Tidak ada audit log yang sesuai dengan filter yang dipilih.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-muted/20 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start sm:items-center space-x-2">
                  <Badge
                    variant={
                      log.actionType.includes("ADDED") || log.actionType.includes("CREATED")
                        ? "emerald"
                        : log.actionType.includes("DELETED")
                        ? "rose"
                        : log.actionType.includes("CRON")
                        ? "teal"
                        : "amber"
                    }
                    className="shrink-0"
                  >
                    {log.actionType}
                  </Badge>
                  <span className="text-foreground font-medium">{log.description}</span>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                  {new Date(log.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
