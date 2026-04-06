"use client";

import type { KPIMetric } from "@/lib/api";
import { cn } from "@/lib/utils";

const statusColors = {
  normal: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  critical: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
};

const statusDot = {
  normal: "bg-green-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
};

export default function KPICard({ metric }: { metric: KPIMetric }) {
  const status = metric.status as keyof typeof statusColors;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-shadow hover:shadow-sm",
        statusColors[status] || statusColors.normal,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {metric.label}
        </span>
        <span className={cn("h-2.5 w-2.5 rounded-full", statusDot[status] || statusDot.normal)} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{metric.unit}</span>
        )}
      </div>
      {(metric.threshold_min !== null || metric.threshold_max !== null) && (
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          {metric.threshold_min !== null && `Мин: ${metric.threshold_min}${metric.unit}`}
          {metric.threshold_min !== null && metric.threshold_max !== null && " / "}
          {metric.threshold_max !== null && `Макс: ${metric.threshold_max}${metric.unit}`}
        </div>
      )}
    </div>
  );
}
