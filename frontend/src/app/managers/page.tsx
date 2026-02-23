"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trophy, ArrowUpDown } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import CollapsibleSidebar from "@/components/collapsible-sidebar";
import ManagersSidebar from "@/components/sidebar/managers-sidebar";
import {
  getManagerLeaderboard,
  type ManagerLeaderboardEntry,
  type ManagerLeaderboardResponse,
} from "@/lib/api";

type SortKey = "rank" | "total_calls" | "avg_handle_time" | "avg_script_score" | "resolution_rate" | "positive_sentiment_pct";

export default function ManagersPage() {
  const [data, setData] = useState<ManagerLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const d = await getManagerLeaderboard(days);
      setData(d);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [days]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "rank");
    }
  };

  const sorted = data?.entries
    ? [...data.entries].sort((a, b) => {
        const av = a[sortKey] ?? 0;
        const bv = b[sortKey] ?? 0;
        return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
      })
    : [];

  const rankColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-zinc-400",
    3: "text-amber-600",
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <div className="flex">
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Manager Leaderboard
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  Refresh
                </button>
              </div>
            </div>

            {loading && !data ? (
              <div className="flex h-64 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
                No managers found
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                      {([
                        ["rank", "Rank"],
                        ["", "Manager"],
                        ["", "Team"],
                        ["total_calls", "Calls"],
                        ["avg_handle_time", "AHT"],
                        ["avg_script_score", "Script %"],
                        ["resolution_rate", "Resolution %"],
                        ["positive_sentiment_pct", "Positive %"],
                      ] as [SortKey | "", string][]).map(([key, label]) => (
                        <th
                          key={label}
                          className={cn("px-4 py-2", key && "cursor-pointer hover:text-zinc-700")}
                          onClick={() => key && toggleSort(key as SortKey)}
                        >
                          <span className="flex items-center gap-1">
                            {label}
                            {key && sortKey === key && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((e) => (
                      <tr
                        key={e.agent_id}
                        onClick={() => (window.location.href = `/managers/${e.agent_id}`)}
                        className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50"
                      >
                        <td className="px-4 py-2.5">
                          <span className={cn("font-bold", rankColors[e.rank] || "text-zinc-400")}>
                            #{e.rank}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                          {e.name}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-500">{e.team || "-"}</td>
                        <td className="px-4 py-2.5">{e.total_calls}</td>
                        <td className="px-4 py-2.5">{formatDuration(e.avg_handle_time)}</td>
                        <td className="px-4 py-2.5">
                          {e.avg_script_score !== null ? `${e.avg_script_score}%` : "-"}
                        </td>
                        <td className="px-4 py-2.5">{e.resolution_rate}%</td>
                        <td className="px-4 py-2.5">{e.positive_sentiment_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <CollapsibleSidebar>
          <ManagersSidebar entries={data?.entries || []} />
        </CollapsibleSidebar>
      </div>
    </div>
  );
}
