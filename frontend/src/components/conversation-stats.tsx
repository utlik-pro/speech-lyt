"use client";

import { Mic, MicOff, Volume2, Zap } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { ConversationStatsResponse } from "@/lib/api";

interface ConversationStatsProps {
  stats: ConversationStatsResponse;
}

export default function ConversationStats({ stats }: ConversationStatsProps) {
  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div>
        <div className="mb-1 flex justify-between text-[11px] text-zinc-500">
          <span>Оператор {stats.agent_talk_pct}%</span>
          <span>Клиент {stats.client_talk_pct}%</span>
          <span>Тишина {stats.silence_pct}%</span>
        </div>
        <div className="flex h-4 overflow-hidden rounded-full">
          <div
            className="bg-blue-500 transition-all"
            style={{ width: `${stats.agent_talk_pct}%` }}
            title={`Оператор: ${formatDuration(stats.agent_talk_time)}`}
          />
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${stats.client_talk_pct}%` }}
            title={`Клиент: ${formatDuration(stats.client_talk_time)}`}
          />
          <div
            className="bg-zinc-200 transition-all dark:bg-zinc-700"
            style={{ width: `${stats.silence_pct}%` }}
            title={`Тишина: ${formatDuration(stats.silence_time)}`}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-zinc-100 p-2 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Mic className="h-3 w-3 text-blue-500" />
            Говорит/Слушает
          </div>
          <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {stats.talk_listen_ratio.toFixed(2)}
          </p>
        </div>

        <div className="rounded-md border border-zinc-100 p-2 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <MicOff className="h-3 w-3 text-zinc-400" />
            Тишина
          </div>
          <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {formatDuration(stats.silence_time)}
          </p>
        </div>

        <div className="rounded-md border border-zinc-100 p-2 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Zap className="h-3 w-3 text-orange-500" />
            Перебивания
          </div>
          <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {stats.interruption_count}
          </p>
        </div>

        <div className="rounded-md border border-zinc-100 p-2 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Volume2 className="h-3 w-3 text-purple-500" />
            Макс. монолог
          </div>
          <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {formatDuration(stats.longest_monologue_duration)}
          </p>
        </div>
      </div>

      {/* WPM */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span>
          Скорость оператора: <strong className="text-zinc-700 dark:text-zinc-300">{stats.agent_wpm} сл/мин</strong>
        </span>
        <span>
          Скорость клиента: <strong className="text-zinc-700 dark:text-zinc-300">{stats.client_wpm} сл/мин</strong>
        </span>
      </div>
    </div>
  );
}
