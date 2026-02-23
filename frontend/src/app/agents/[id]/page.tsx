"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import { SentimentChart, CategoryChart } from "@/components/kpi-charts";
import { getAgentStats, type AgentStatsResponse } from "@/lib/api";

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;

  const [stats, setStats] = useState<AgentStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAgentStats(agentId, days);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agent");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agentId, days]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-950">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-zinc-500">{error || "Agent not found"}</p>
        <Link href="/agents" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to agents
        </Link>
      </div>
    );
  }

  const { agent } = stats;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/agents"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to leaderboard
          </Link>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Agent card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {agent.name}
              </h2>
              <p className="text-sm text-zinc-500">
                {agent.team || "No team"} {agent.email && `· ${agent.email}`}
              </p>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Phone className="h-3.5 w-3.5" />
              Total Calls
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.total_calls}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Completed
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">{stats.completed_calls}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              Avg Handle Time
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatDuration(stats.avg_handle_time)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Target className="h-3.5 w-3.5" />
              Script Score
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.avg_script_score !== null ? `${stats.avg_script_score}%` : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolution Rate
            </div>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.resolution_rate}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Sentiment Distribution
            </h3>
            <SentimentChart data={stats.sentiment_distribution} />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Call Categories
            </h3>
            <CategoryChart data={stats.category_distribution} />
          </div>
        </div>
      </main>
    </div>
  );
}
