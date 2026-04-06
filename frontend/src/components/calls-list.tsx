"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileAudio,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Phone,
} from "lucide-react";
import { cn, formatFileSize, formatDuration } from "@/lib/utils";
import { listCalls, deleteCall, type CallResponse, type CallFilters } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Ожидание", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30", icon: <Clock className="h-3 w-3" /> },
  uploading: { label: "Загрузка", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  processing: { label: "Обработка", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  transcribing: { label: "Транскрипция", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  analyzing: { label: "Анализ", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  completed: { label: "Завершён", color: "text-green-600 bg-green-50 dark:bg-green-950/30", icon: <CheckCircle className="h-3 w-3" /> },
  failed: { label: "Ошибка", color: "text-red-600 bg-red-50 dark:bg-red-950/30", icon: <AlertCircle className="h-3 w-3" /> },
};

const DIRECTION_ICON: Record<string, React.ReactNode> = {
  inbound: <ArrowDownCircle className="h-4 w-4 text-green-500" />,
  outbound: <ArrowUpCircle className="h-4 w-4 text-blue-500" />,
  unknown: <Phone className="h-4 w-4 text-zinc-400" />,
};

interface CallsListProps {
  refreshKey?: number;
  filters?: CallFilters;
}

export default function CallsList({ refreshKey, filters = {} }: CallsListProps) {
  const router = useRouter();
  const [calls, setCalls] = useState<CallResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCalls(page, pageSize, filters);
      setCalls(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить звонки");
    } finally {
      setLoading(false);
    }
  }, [page, JSON.stringify(filters)]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls, refreshKey]);

  const handleDelete = useCallback(
    async (callId: string, filename: string) => {
      if (!confirm(`Удалить "${filename}"?`)) return;
      try {
        await deleteCall(callId);
        fetchCalls();
      } catch {
        alert("Не удалось удалить звонок");
      }
    },
    [fetchCalls],
  );

  const totalPages = Math.ceil(total / pageSize);

  if (loading && calls.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Загрузка звонков...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-red-500">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchCalls}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
        <FileAudio className="h-8 w-8" />
        <p className="text-sm">Звонки ещё не загружены</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Всего звонков: {total}
        </p>
        <button
          onClick={fetchCalls}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          Обновить
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-2">Файл</th>
              <th className="px-4 py-2">Длительность</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Загружен</th>
              <th className="px-4 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => {
              const statusCfg = STATUS_CONFIG[call.status] ?? STATUS_CONFIG.pending;
              return (
                <tr
                  key={call.id}
                  onClick={() => router.push(`/calls/${call.id}`)}
                  className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {DIRECTION_ICON[call.direction] ?? DIRECTION_ICON.unknown}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                          {call.original_filename}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {call.audio_format.toUpperCase()} &middot;{" "}
                          {formatFileSize(call.file_size_bytes)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                    {formatDuration(call.duration_seconds)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        statusCfg.color,
                      )}
                    >
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(call.id, call.original_filename);
                      }}
                      className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-xs text-zinc-500">
            Страница {page} из {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
