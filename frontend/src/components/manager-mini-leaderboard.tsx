"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import type { ManagerLeaderboardEntry } from "@/lib/api";
import { formatDuration } from "@/lib/utils";

interface ManagerMiniLeaderboardProps {
  entries: ManagerLeaderboardEntry[];
}

const RANK_COLORS = ["text-yellow-500", "text-zinc-400", "text-amber-600"];

export default function ManagerMiniLeaderboard({ entries }: ManagerMiniLeaderboardProps) {
  const top5 = entries.slice(0, 5);

  if (top5.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">No manager data</p>
    );
  }

  return (
    <div className="space-y-2">
      {top5.map((e) => (
        <Link
          key={e.manager_id}
          href={`/managers/${e.manager_id}`}
          className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          <span
            className={`w-5 text-center text-sm font-bold ${
              e.rank <= 3 ? RANK_COLORS[e.rank - 1] : "text-zinc-400"
            }`}
          >
            {e.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {e.name}
            </p>
            <p className="text-[11px] text-zinc-400">{e.team || "-"}</p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <div>{e.total_calls} calls</div>
            <div>{formatDuration(e.avg_handle_time)} AHT</div>
          </div>
        </Link>
      ))}

      <Link
        href="/managers"
        className="block pt-1 text-center text-xs text-blue-600 hover:underline"
      >
        View all managers
      </Link>
    </div>
  );
}
