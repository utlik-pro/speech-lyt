"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { BarChart3 } from "lucide-react";
import { SidebarSection } from "@/components/collapsible-sidebar";
import {
  getKPIDashboard,
  getKPIAlerts,
  getAgentLeaderboard,
  type KPIDashboardResponse,
  type KPIAlertsResponse,
  type AgentLeaderboardResponse,
} from "@/lib/api";

export default function CallsSidebar() {
  const [dashboard, setDashboard] = useState<KPIDashboardResponse | null>(null);
  const [alerts, setAlerts] = useState<KPIAlertsResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<AgentLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getKPIDashboard(),
      getKPIAlerts(),
      getAgentLeaderboard(30),
    ])
      .then(([d, a, l]) => {
        setDashboard(d);
        setAlerts(a);
        setLeaderboard(l);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Quick Stats */}
      {dashboard && (
        <SidebarSection title="Quick Stats" icon={<BarChart3 className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total", value: dashboard.total_calls, icon: <Phone className="h-3.5 w-3.5 text-blue-500" /> },
              { label: "Completed", value: dashboard.completed_calls, icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> },
              { label: "Processing", value: dashboard.total_calls - dashboard.completed_calls - dashboard.failed_calls, icon: <Loader2 className="h-3.5 w-3.5 text-yellow-500" /> },
              { label: "Failed", value: dashboard.failed_calls, icon: <XCircle className="h-3.5 w-3.5 text-red-500" /> },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-1.5">
                  {s.icon}
                  <span className="text-xs text-zinc-500">{s.label}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </SidebarSection>
      )}

      {/* Recent Alerts */}
      {alerts && alerts.alerts.length > 0 && (
        <SidebarSection title="Recent Alerts" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
          <div className="space-y-2">
            {alerts.alerts.slice(0, 3).map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/50"
              >
                {a.severity === "critical" ? (
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
                )}
                <span className="text-zinc-600 dark:text-zinc-400">{a.message}</span>
              </div>
            ))}
          </div>
          <Link
            href="/alerts"
            className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View all alerts →
          </Link>
        </SidebarSection>
      )}

      {/* Top Agents */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <SidebarSection title="Top Agents" icon={<Trophy className="h-3.5 w-3.5" />}>
          <div className="space-y-2">
            {leaderboard.entries.slice(0, 3).map((e) => (
              <div
                key={e.agent_id}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {e.rank}
                  </span>
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {e.name}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">{e.total_calls} calls</span>
              </div>
            ))}
          </div>
          <Link
            href="/agents"
            className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View leaderboard →
          </Link>
        </SidebarSection>
      )}
    </>
  );
}
