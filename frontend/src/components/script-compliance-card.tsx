"use client";

import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScriptAnalysisResponse } from "@/lib/api";

const severityIcon: Record<string, React.ReactNode> = {
  low: <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />,
  medium: <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />,
  high: <ShieldAlert className="h-3.5 w-3.5 text-red-500" />,
  critical: <ShieldAlert className="h-3.5 w-3.5 text-red-700" />,
};

const severityColor: Record<string, string> = {
  low: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
  medium: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20",
  high: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
  critical: "border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-900/30",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function barColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export default function ScriptComplianceCard({
  analysis,
}: {
  analysis: ScriptAnalysisResponse;
}) {
  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className={cn("text-3xl font-bold", scoreColor(analysis.overall_score))}>
            {Math.round(analysis.overall_score)}%
          </p>
          <p className="text-xs text-zinc-500">Общая оценка</p>
        </div>
        <div className="flex-1">
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={cn("h-full rounded-full transition-all", barColor(analysis.overall_score))}
              style={{ width: `${Math.min(analysis.overall_score, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage results */}
      {analysis.stage_results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500">Результаты по этапам</p>
          {analysis.stage_results.map((sr) => (
            <div
              key={sr.stage_id}
              className={cn(
                "rounded-md border p-3",
                sr.passed
                  ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10"
                  : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {sr.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {sr.stage_name}
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    sr.score >= 80
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : sr.score >= 60
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  {Math.round(sr.score)}%
                </span>
              </div>

              {/* Matched phrases */}
              {sr.matched_phrases.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {sr.matched_phrases.map((p, i) => (
                    <span
                      key={i}
                      className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Missing phrases */}
              {sr.missing_phrases.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {sr.missing_phrases.map((p, i) => (
                    <span
                      key={i}
                      className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700 line-through dark:bg-red-900/30 dark:text-red-400"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Forbidden words found */}
              {sr.found_forbidden_words.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {sr.found_forbidden_words.map((w, i) => (
                    <span
                      key={i}
                      className="rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-800 dark:bg-red-800 dark:text-red-200"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Violations */}
      {analysis.violations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500">Нарушения</p>
          {analysis.violations.map((v, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2 rounded-md border p-2",
                severityColor[v.severity] || severityColor.medium,
              )}
            >
              {severityIcon[v.severity] || severityIcon.medium}
              <div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {v.stage_name}
                </span>
                <p className="text-xs text-zinc-500">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
