"use client";

import { cn, formatDuration } from "@/lib/utils";
import { SidebarSection } from "@/components/collapsible-sidebar";

interface ManagersSidebarProps {
  entries: Array<{
    manager_id: string;
    name: string;
    team: string | null;
    total_calls: number;
    avg_handle_time: number;
    avg_script_score: number | null;
    resolution_rate: number;
    positive_sentiment_pct: number;
    rank: number;
  }>;
}

export default function ManagersSidebar({ entries }: ManagersSidebarProps) {
  // Group entries by team
  const teamGroups = entries.reduce<Record<string, number>>((acc, e) => {
    const team = e.team || "Без команды";
    acc[team] = (acc[team] || 0) + 1;
    return acc;
  }, {});

  // Best manager is entries[0] if exists
  const best = entries[0] ?? null;

  // Averages across all entries
  const avgAHT =
    entries.length > 0
      ? entries.reduce((s, e) => s + e.avg_handle_time, 0) / entries.length
      : 0;

  const avgScript =
    entries.filter((e) => e.avg_script_score !== null).length > 0
      ? entries
          .filter((e) => e.avg_script_score !== null)
          .reduce((s, e) => s + (e.avg_script_score ?? 0), 0) /
        entries.filter((e) => e.avg_script_score !== null).length
      : null;

  const avgResolution =
    entries.length > 0
      ? entries.reduce((s, e) => s + e.resolution_rate, 0) / entries.length
      : 0;

  if (entries.length === 0) {
    return (
      <div className="text-xs text-zinc-400">Нет данных по менеджерам</div>
    );
  }

  return (
    <>
      {/* Team Summary */}
      <SidebarSection title="По командам">
        <ul className="space-y-1">
          {Object.entries(teamGroups)
            .sort((a, b) => b[1] - a[1])
            .map(([team, count]) => (
              <li
                key={team}
                className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span className="truncate">{team}</span>
                <span className="ml-2 shrink-0 text-xs text-zinc-400">
                  {count}
                </span>
              </li>
            ))}
        </ul>
      </SidebarSection>

      {/* Best Manager */}
      {best && (
        <SidebarSection title="Лучший менеджер">
          <div
            className={cn(
              "rounded-lg border p-2.5",
              "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10",
            )}
          >
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {best.name}
            </div>
            <div className="mt-0.5 text-xs text-zinc-500">
              {best.team || "Без команды"}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-zinc-500">Звонков</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {best.total_calls}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Скрипт</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {best.avg_script_score !== null
                    ? `${best.avg_script_score}%`
                    : "--"}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Решение</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {best.resolution_rate}%
                </div>
              </div>
            </div>
          </div>
        </SidebarSection>
      )}

      {/* Key Metrics */}
      <SidebarSection title="Ключевые метрики">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Ср. СрВО</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatDuration(avgAHT)}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Ср. скрипт</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {avgScript !== null ? `${avgScript.toFixed(1)}%` : "--"}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Ср. решение</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {avgResolution.toFixed(1)}%
            </div>
          </div>
        </div>
      </SidebarSection>
    </>
  );
}
