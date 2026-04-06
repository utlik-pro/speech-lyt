"use client";

import { CheckCircle2, XCircle, Zap, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QAEvaluationResponse, QAResultItem } from "@/lib/api";

function scoreColor(pct: number): string {
  if (pct >= 80) return "text-green-600";
  if (pct >= 60) return "text-yellow-600";
  return "text-red-600";
}

function barColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export default function QAEvaluationCard({
  evaluation,
}: {
  evaluation: QAEvaluationResponse;
}) {
  const pct =
    evaluation.max_possible_score > 0
      ? Math.round((evaluation.total_score / evaluation.max_possible_score) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className={cn("text-3xl font-bold", scoreColor(pct))}>{pct}%</p>
          <p className="text-xs text-zinc-500">Оценка QA</p>
        </div>
        <div className="flex-1">
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={cn("h-full rounded-full transition-all", barColor(pct))}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {evaluation.total_score.toFixed(1)} / {evaluation.max_possible_score.toFixed(1)} б.
          </p>
        </div>
      </div>

      {/* Criterion results */}
      {evaluation.results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500">Результаты по критериям</p>
          {evaluation.results.map((r: QAResultItem) => (
            <div
              key={r.criterion_id}
              className={cn(
                "rounded-md border p-3",
                r.passed
                  ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10"
                  : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {r.criterion_id}
                  </span>
                  {r.auto_evaluated ? (
                    <span title="Автооценка">
                      <Zap className="h-3 w-3 text-blue-400" />
                    </span>
                  ) : (
                    <span title="Требуется ручная проверка">
                      <Hand className="h-3 w-3 text-orange-400" />
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    r.score >= r.max_score * 0.8
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : r.score >= r.max_score * 0.5
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  {r.score}/{r.max_score}
                </span>
              </div>
              {r.notes && (
                <p className="mt-1 text-xs text-zinc-500">{r.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {evaluation.comments && (
        <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-500">Комментарии</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {evaluation.comments}
          </p>
        </div>
      )}
    </div>
  );
}
