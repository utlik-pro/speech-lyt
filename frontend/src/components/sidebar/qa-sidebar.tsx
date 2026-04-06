"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarSection } from "@/components/collapsible-sidebar";

interface QaSidebarProps {
  scorecards: Array<{
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    criteria: Array<{ id: string; name: string; weight: number }>;
    created_at: string;
  }>;
}

export default function QaSidebar({ scorecards }: QaSidebarProps) {
  const totalScorecards = scorecards.length;
  const activeScorecards = scorecards.filter((sc) => sc.is_active).length;
  const totalCriteria = scorecards.reduce(
    (sum, sc) => sum + sc.criteria.length,
    0,
  );
  const totalWeight = scorecards.reduce(
    (sum, sc) =>
      sum + sc.criteria.reduce((wSum, c) => wSum + c.weight, 0),
    0,
  );

  if (scorecards.length === 0) {
    return (
      <div className="text-xs text-zinc-400">Карты оценки не найдены</div>
    );
  }

  return (
    <>
      {/* Stats */}
      <SidebarSection title="Статистика">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Всего карт</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {totalScorecards}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Активные</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {activeScorecards}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Критериев</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {totalCriteria}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Общий вес</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {totalWeight}
            </div>
          </div>
        </div>
      </SidebarSection>

      {/* Scorecards */}
      <SidebarSection title="Карты оценки">
        <ul className="space-y-1.5">
          {scorecards.map((sc) => (
            <li key={sc.id}>
              <Link
                href={`/qa/${sc.id}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-zinc-100 dark:text-blue-400 dark:hover:bg-zinc-800"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="truncate">{sc.name}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      sc.is_active
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
                    )}
                  >
                    {sc.is_active ? "Активна" : "Неактивна"}
                  </span>
                </span>
                <span className="ml-2 shrink-0 rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  {sc.criteria.length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </SidebarSection>
    </>
  );
}
