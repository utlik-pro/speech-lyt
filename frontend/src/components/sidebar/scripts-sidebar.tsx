"use client";

import { cn } from "@/lib/utils";
import { SidebarSection } from "@/components/collapsible-sidebar";

interface ScriptsSidebarProps {
  scripts: Array<{
    id: string;
    name: string;
    type: string;
    is_active: boolean;
    stages: Array<{ id?: string; name: string }>;
  }>;
}

const typeColors: Record<string, string> = {
  support:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  sales:
    "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  inbound:
    "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  outbound:
    "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
};

export default function ScriptsSidebar({ scripts }: ScriptsSidebarProps) {
  const activeCount = scripts.filter((s) => s.is_active).length;
  const totalStages = scripts.reduce((sum, s) => sum + s.stages.length, 0);

  // Group by type
  const typeGroups = scripts.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Stats */}
      <SidebarSection title="Статистика">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Всего скриптов</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {scripts.length}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Активных</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {activeCount}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Всего этапов</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {totalStages}
            </div>
          </div>
        </div>
      </SidebarSection>

      {/* Script Types */}
      <SidebarSection title="Типы скриптов">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(typeGroups).map(([type, count]) => (
            <span
              key={type}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                typeColors[type] ||
                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
              )}
            >
              {type} ({count})
            </span>
          ))}
        </div>
      </SidebarSection>

      {/* Scripts */}
      <SidebarSection title="Скрипты">
        {scripts.length === 0 ? (
          <p className="text-xs text-zinc-400">Скрипты не найдены</p>
        ) : (
          <div className="space-y-1.5">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {script.name}
                  </span>
                  <span
                    className={cn(
                      "ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-xs",
                      script.is_active
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                    )}
                  >
                    {script.is_active ? "Активен" : "Неактивен"}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {script.stages.length} этапов
                </div>
              </div>
            ))}
          </div>
        )}
      </SidebarSection>
    </>
  );
}
