"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PeriodMetricComparison } from "@/lib/api";

interface PeriodComparisonProps {
  metrics: PeriodMetricComparison[];
}

export default function PeriodComparison({ metrics }: PeriodComparisonProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => {
        const isUp = m.delta > 0;
        const isDown = m.delta < 0;
        const isNeutral = m.delta === 0;
        // For negative_sentiment_pct, "up" is bad
        const isGood =
          m.name === "negative_sentiment_pct" || m.name === "aht"
            ? isDown
            : isUp;

        return (
          <div
            key={m.name}
            className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs text-zinc-500">{m.label}</p>
            <div className="mt-1 flex items-end justify-between">
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {typeof m.current === "number" ? m.current.toLocaleString() : m.current}
              </span>
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  isNeutral
                    ? "text-zinc-400"
                    : isGood
                      ? "text-green-600"
                      : "text-red-600",
                )}
              >
                {isNeutral ? (
                  <Minus className="h-3 w-3" />
                ) : isUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {m.pct_change !== null ? `${Math.abs(m.pct_change)}%` : "-"}
              </div>
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              пред.: {typeof m.previous === "number" ? m.previous.toLocaleString() : m.previous}
            </p>
          </div>
        );
      })}
    </div>
  );
}
