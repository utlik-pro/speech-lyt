"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  Zap,
  Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import {
  getScorecard,
  updateScorecard,
  deleteScorecard,
  type QAScorecardResponse,
  type QACriterionDef,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const sourceLabel: Record<string, string> = {
  script_analysis: "Анализ скрипта",
  emotion: "Тональность",
  summary: "Резюме звонка",
  conversation_stats: "Статистика",
  manual: "Ручная",
};

export default function ScorecardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scorecardId = params.id as string;

  const [scorecard, setScorecard] = useState<QAScorecardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getScorecard(scorecardId);
        setScorecard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить карту оценки");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [scorecardId]);

  const startEdit = () => {
    if (!scorecard) return;
    setEditName(scorecard.name);
    setEditDescription(scorecard.description || "");
    setEditActive(scorecard.is_active);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!scorecard) return;
    setSaving(true);
    try {
      const updated = await updateScorecard(scorecard.id, {
        name: editName,
        description: editDescription || undefined,
        is_active: editActive,
      });
      setScorecard(updated);
      setEditing(false);
    } catch {
      alert("Не удалось обновить карту оценки");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!scorecard || !confirm(`Удалить карту оценки "${scorecard.name}"?`)) return;
    try {
      await deleteScorecard(scorecard.id);
      router.push("/qa");
    } catch {
      alert("Не удалось удалить карту оценки");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !scorecard) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-950">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-zinc-500">{error || "Карта оценки не найдена"}</p>
        <Link href="/qa" className="mt-2 text-sm text-blue-600 hover:underline">
          К картам оценки
        </Link>
      </div>
    );
  }

  const totalWeight = scorecard.criteria.reduce(
    (sum: number, c: QACriterionDef) => sum + (c.weight || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <Link
          href="/qa"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          К картам оценки
        </Link>

        {/* Scorecard header */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {editing ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Название
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Описание
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded"
                />
                Активна
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editName.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Сохранить
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-6 w-6 text-blue-500" />
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {scorecard.name}
                  </h2>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                  <span>{scorecard.criteria.length} критериев</span>
                  <span className="text-xs text-zinc-400">
                    (макс. {totalWeight} б.)
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      scorecard.is_active
                        ? "bg-green-50 text-green-600"
                        : "bg-zinc-100 text-zinc-500",
                    )}
                  >
                    {scorecard.is_active ? "Активна" : "Неактивна"}
                  </span>
                  <span>
                    Создана{" "}
                    {formatDistanceToNow(new Date(scorecard.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {scorecard.description && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {scorecard.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={startEdit}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                  title="Редактировать"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Criteria list */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Критерии ({scorecard.criteria.length})
          </h3>
          <div className="space-y-3">
            {scorecard.criteria.map((crit: QACriterionDef, idx: number) => (
              <div
                key={crit.id || idx}
                className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {idx + 1}
                    </span>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {crit.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                      {crit.weight} б.
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        crit.auto_source === "manual"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                          : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                      )}
                    >
                      {crit.auto_source === "manual" ? (
                        <Hand className="h-3 w-3" />
                      ) : (
                        <Zap className="h-3 w-3" />
                      )}
                      {sourceLabel[crit.auto_source] || crit.auto_source}
                    </span>
                  </div>
                </div>
                {crit.description && (
                  <p className="mt-2 text-sm text-zinc-500">{crit.description}</p>
                )}
                {crit.category && crit.category !== "general" && (
                  <span className="mt-2 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                    {crit.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {scorecard.criteria.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-zinc-400">
            <ClipboardCheck className="h-8 w-8" />
            <p className="text-sm">Критерии для карты не заданы</p>
          </div>
        )}
      </main>
    </div>
  );
}
