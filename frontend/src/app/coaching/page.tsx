"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import {
  listCoachingInsights,
  acknowledgeInsight,
  dismissInsight,
  resolveInsight,
  listManagers,
  type CoachingInsightResponse,
  type ManagerResponse,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
};

const TYPE_ICONS: Record<string, typeof TrendingUp> = {
  skill_gap: Target,
  training_need: GraduationCap,
  strength: Award,
  improvement_area: TrendingUp,
  coaching_recommendation: ArrowUpRight,
  performance_trend: TrendingUp,
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
  acknowledged: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20",
  resolved: "bg-green-50 text-green-600 dark:bg-green-900/20",
  dismissed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
};

export default function CoachingPage() {
  const [insights, setInsights] = useState<CoachingInsightResponse[]>([]);
  const [managers, setManagers] = useState<ManagerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterManager, setFilterManager] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (filterManager) params.manager_id = filterManager;
      if (filterStatus) params.status = filterStatus;
      const [insightsData, managersData] = await Promise.all([
        listCoachingInsights(params as Parameters<typeof listCoachingInsights>[0]),
        listManagers(),
      ]);
      setInsights(insightsData.items);
      setManagers(managersData.items);
    } catch (err) {
      console.error("Failed to load coaching data:", err);
    } finally {
      setLoading(false);
    }
  }, [filterManager, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeInsight(id);
      fetchData();
    } catch {
      alert("Failed to acknowledge insight");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissInsight(id);
      fetchData();
    } catch {
      alert("Failed to dismiss insight");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveInsight(id);
      fetchData();
    } catch {
      alert("Failed to resolve insight");
    }
  };

  const getManagerName = (managerId: string) => {
    const m = managers.find((mgr) => mgr.id === managerId);
    return m?.name || "Unknown";
  };

  // Stats
  const activeCount = insights.filter((i) => i.status === "active").length;
  const criticalCount = insights.filter((i) => i.priority === "critical" || i.priority === "high").length;
  const resolvedCount = insights.filter((i) => i.status === "resolved").length;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Coaching Insights
          </h2>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs font-medium text-zinc-500">Active Insights</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{activeCount}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs font-medium text-zinc-500">High Priority</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">{criticalCount}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs font-medium text-zinc-500">Resolved</div>
            <div className="mt-1 text-2xl font-bold text-green-600">{resolvedCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="">All Managers</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Insights list */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading coaching insights...
          </div>
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
            <GraduationCap className="h-8 w-8" />
            <p className="text-sm">No coaching insights yet</p>
            <p className="text-xs">Run a coaching AI agent on manager data to generate insights</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => {
              const TypeIcon = TYPE_ICONS[insight.insight_type] || TrendingUp;
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "rounded-lg border bg-white p-5 transition-shadow hover:shadow-sm dark:bg-zinc-900",
                    PRIORITY_STYLES[insight.priority] || "border-zinc-200 dark:border-zinc-800",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <TypeIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {insight.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-medium">
                            {getManagerName(insight.manager_id)}
                          </span>
                          <span className={cn("rounded-full px-1.5 py-0.5", STATUS_STYLES[insight.status])}>
                            {insight.status}
                          </span>
                          <span className="text-zinc-400">
                            {insight.insight_type.replace(/_/g, " ")}
                          </span>
                          <span className="text-zinc-400">
                            {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    {insight.status === "active" && (
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => handleAcknowledge(insight.id)}
                          className="rounded p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          title="Acknowledge"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResolve(insight.id)}
                          className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Mark Resolved"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDismiss(insight.id)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Dismiss"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {insight.status === "acknowledged" && (
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => handleResolve(insight.id)}
                          className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Mark Resolved"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
