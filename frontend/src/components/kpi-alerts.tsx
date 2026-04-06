"use client";

import Link from "next/link";
import type { KPIAlert } from "@/lib/api";
import { AlertTriangle, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KPIAlerts({ alerts }: { alerts: KPIAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
        Все KPI в пределах нормы
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3",
            alert.severity === "critical"
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
          )}
        >
          {alert.severity === "critical" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                alert.severity === "critical"
                  ? "text-red-800 dark:text-red-300"
                  : "text-yellow-800 dark:text-yellow-300",
              )}
            >
              {alert.label}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
      <Link
        href="/alerts"
        className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <Settings className="h-3 w-3" />
        Управление правилами
      </Link>
    </div>
  );
}
