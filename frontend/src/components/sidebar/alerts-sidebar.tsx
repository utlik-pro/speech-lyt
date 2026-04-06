"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { SidebarSection } from "@/components/collapsible-sidebar";

interface AlertsSidebarProps {
  rules: Array<{
    id: string;
    name: string;
    metric_name: string;
    condition: string;
    threshold: number;
    severity: string;
    is_active: boolean;
  }>;
  history: Array<{
    id: string;
    severity: string;
    message: string;
    acknowledged: boolean;
    created_at: string;
  }>;
}

const severityIcon: Record<string, React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5 text-blue-500" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />,
  critical: <ShieldAlert className="h-3.5 w-3.5 text-red-500" />,
};

export default function AlertsSidebar({ rules, history }: AlertsSidebarProps) {
  const activeRules = rules.filter((r) => r.is_active).length;
  const totalTriggered = history.length;
  const unacknowledged = history.filter((h) => !h.acknowledged).length;

  // Severity breakdown
  const severityCounts = history.reduce<Record<string, number>>(
    (acc, h) => {
      acc[h.severity] = (acc[h.severity] || 0) + 1;
      return acc;
    },
    { info: 0, warning: 0, critical: 0 },
  );

  const lastTriggered = history.length > 0 ? history[0] : null;

  return (
    <>
      {/* Stats */}
      <SidebarSection title="Статистика">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Активных правил</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {activeRules}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Всего сработало</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {totalTriggered}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="text-xs text-zinc-500">Не подтверждено</div>
            <div
              className={cn(
                "text-sm font-bold",
                unacknowledged > 0
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-zinc-900 dark:text-zinc-100",
              )}
            >
              {unacknowledged}
            </div>
          </div>
        </div>
      </SidebarSection>

      {/* Severity Breakdown */}
      <SidebarSection title="По важности">
        <div className="space-y-1.5">
          {(["info", "warning", "critical"] as const).map((severity) => (
            <div
              key={severity}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-2">
                {severityIcon[severity]}
                <span className="text-xs capitalize text-zinc-700 dark:text-zinc-300">
                  {severity}
                </span>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {severityCounts[severity]}
              </span>
            </div>
          ))}
        </div>
      </SidebarSection>

      {/* Last Triggered */}
      <SidebarSection title="Последнее срабатывание">
        {lastTriggered ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="flex items-start gap-2">
              {severityIcon[lastTriggered.severity]}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {lastTriggered.message}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(lastTriggered.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">Алерты ещё не срабатывали</p>
        )}
      </SidebarSection>
    </>
  );
}
