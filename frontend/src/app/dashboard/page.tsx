"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Headphones,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import type {
  KPIDashboardResponse,
  KPITrendResponse,
  KPIAlertsResponse,
} from "@/lib/api";
import { getKPIDashboard, getKPITrend, getKPIAlerts } from "@/lib/api";
import KPICard from "@/components/kpi-card";
import KPIAlerts from "@/components/kpi-alerts";
import { SentimentChart, CategoryChart, TrendChart } from "@/components/kpi-charts";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<KPIDashboardResponse | null>(null);
  const [trend, setTrend] = useState<KPITrendResponse | null>(null);
  const [alerts, setAlerts] = useState<KPIAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendMetric, setTrendMetric] = useState("aht");

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, trendData, alertData] = await Promise.all([
        getKPIDashboard(),
        getKPITrend(trendMetric),
        getKPIAlerts(),
      ]);
      setDashboard(dashData);
      setTrend(trendData);
      setAlerts(alertData);
    } catch (err) {
      console.error("Failed to load KPI data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload trend when metric changes
  useEffect(() => {
    getKPITrend(trendMetric).then(setTrend).catch(console.error);
  }, [trendMetric]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Headphones className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              SpeechLyt
            </h1>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Calls
            </Link>
            <Link
              href="/dashboard"
              className="font-medium text-blue-600 dark:text-blue-400"
            >
              Dashboard
            </Link>
            <Link href="/scripts" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Scripts
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              KPI Dashboard
            </h2>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading && !dashboard ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : dashboard ? (
          <>
            {/* Overview cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Phone className="h-4 w-4" />
                  Total Calls
                </div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {dashboard.total_calls}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed
                </div>
                <div className="mt-1 text-2xl font-bold text-green-600">
                  {dashboard.completed_calls}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Failed
                </div>
                <div className="mt-1 text-2xl font-bold text-red-600">
                  {dashboard.failed_calls}
                </div>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {dashboard.metrics.map((m) => (
                <KPICard key={m.name} metric={m} />
              ))}
            </div>

            {/* Alerts */}
            {alerts && alerts.alerts.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Alerts
                </h3>
                <KPIAlerts alerts={alerts.alerts} />
              </section>
            )}

            {/* Charts row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sentiment distribution */}
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Sentiment Distribution
                </h3>
                <SentimentChart data={dashboard.sentiment_distribution} />
              </div>

              {/* Category distribution */}
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Call Categories
                </h3>
                <CategoryChart data={dashboard.category_distribution} />
              </div>
            </div>

            {/* Trend chart */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Trend: {trend?.label || trendMetric}
                </h3>
                <select
                  value={trendMetric}
                  onChange={(e) => setTrendMetric(e.target.value)}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <option value="aht">Avg Handle Time</option>
                  <option value="call_volume">Call Volume</option>
                  <option value="avg_script_score">Script Compliance</option>
                </select>
              </div>
              {trend && (
                <TrendChart
                  data={trend.data}
                  label={trend.label}
                  unit={trend.unit}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
            Failed to load KPI data
          </div>
        )}
      </main>
    </div>
  );
}
