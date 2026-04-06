"use client";

import Link from "next/link";
import {
  ClipboardCheck,
  Bell,
  Users,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";
import { SidebarSection } from "@/components/collapsible-sidebar";
import type { KPIAlertsResponse, ManagerLeaderboardResponse } from "@/lib/api";

interface DashboardSidebarProps {
  alerts: KPIAlertsResponse | null;
  leaderboard: ManagerLeaderboardResponse | null;
}

export default function DashboardSidebar({ alerts, leaderboard }: DashboardSidebarProps) {
  const alertCounts = { info: 0, warning: 0, critical: 0 };
  if (alerts) {
    for (const a of alerts.alerts) {
      if (a.severity === "critical") alertCounts.critical++;
      else if (a.severity === "warning") alertCounts.warning++;
      else alertCounts.info++;
    }
  }

  return (
    <>
      {/* Active Alerts */}
      <SidebarSection title="Активные алерты" icon={<Bell className="h-3.5 w-3.5" />}>
        {alerts && alerts.alerts.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Алертов: {alerts.alerts.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {alertCounts.critical > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <ShieldAlert className="h-3 w-3" />
                  {alertCounts.critical} крит.
                </span>
              )}
              {alertCounts.warning > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <AlertTriangle className="h-3 w-3" />
                  {alertCounts.warning} предупр.
                </span>
              )}
              {alertCounts.info > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Info className="h-3 w-3" />
                  {alertCounts.info} инфо
                </span>
              )}
            </div>
            <Link
              href="/alerts"
              className="inline-block text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Управление алертами →
            </Link>
          </div>
        ) : (
          <p className="text-xs text-green-600 dark:text-green-400">Все метрики в норме</p>
        )}
      </SidebarSection>

      {/* Quick Links */}
      <SidebarSection title="Быстрые ссылки" icon={<span className="text-xs">→</span>}>
        <div className="space-y-1">
          {[
            { href: "/qa", label: "Карты оценки", icon: <ClipboardCheck className="h-4 w-4" /> },
            { href: "/alerts", label: "Правила алертов", icon: <Bell className="h-4 w-4" /> },
            { href: "/managers", label: "Рейтинг менеджеров", icon: <Users className="h-4 w-4" /> },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </SidebarSection>

      {/* Top Managers Quick View */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <SidebarSection title="Лучшие менеджеры" icon={<Users className="h-3.5 w-3.5" />}>
          <div className="space-y-1.5">
            {leaderboard.entries.slice(0, 5).map((e) => (
              <div
                key={e.manager_id}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {e.rank}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">{e.name}</span>
                </div>
                <span className="text-zinc-500">{e.total_calls}</span>
              </div>
            ))}
          </div>
        </SidebarSection>
      )}
    </>
  );
}
