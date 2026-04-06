"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import CollapsibleSidebar from "@/components/collapsible-sidebar";
import QaSidebar from "@/components/sidebar/qa-sidebar";
import {
  listScorecards,
  createScorecard,
  deleteScorecard,
  type QAScorecardResponse,
  type QACriterionDef,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const AUTO_SOURCES = [
  { value: "script_analysis", label: "Анализ скрипта" },
  { value: "emotion", label: "Эмоции / Тональность" },
  { value: "summary", label: "Резюме звонка" },
  { value: "conversation_stats", label: "Статистика диалога" },
  { value: "manual", label: "Ручная проверка" },
];

const emptyCriterion = (): QACriterionDef => ({
  id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  name: "",
  category: "general",
  weight: 10,
  description: "",
  auto_source: "manual",
});

export default function QAPage() {
  const [scorecards, setScorecards] = useState<QAScorecardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<QACriterionDef[]>([emptyCriterion()]);
  const [saving, setSaving] = useState(false);

  const fetchScorecards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listScorecards();
      setScorecards(data.items);
    } catch (err) {
      console.error("Failed to load scorecards:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScorecards();
  }, [fetchScorecards]);

  const handleDelete = async (id: string, scName: string) => {
    if (!confirm(`Удалить карту оценки "${scName}"?`)) return;
    try {
      await deleteScorecard(id);
      fetchScorecards();
    } catch {
      alert("Не удалось удалить карту оценки");
    }
  };

  const addCriterion = () => setCriteria((prev) => [...prev, emptyCriterion()]);

  const removeCriterion = (idx: number) =>
    setCriteria((prev) => prev.filter((_, i) => i !== idx));

  const updateCriterion = (idx: number, field: keyof QACriterionDef, value: string | number) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await createScorecard({
        name,
        description: description || undefined,
        criteria: criteria.filter((c) => c.name.trim()),
      });
      setName("");
      setDescription("");
      setCriteria([emptyCriterion()]);
      setShowForm(false);
      fetchScorecards();
    } catch {
      alert("Не удалось создать карту оценки");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <div className="flex">
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
                Карты оценки качества
              </h2>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Новая карта
              </button>
            </div>

            {/* Create form */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Название
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="напр., Стандарт качества"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Описание
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Необязательное описание"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                {/* Criteria */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Критерии
                    </label>
                    <button
                      type="button"
                      onClick={addCriterion}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + Добавить критерий
                    </button>
                  </div>
                  <div className="mt-2 space-y-3">
                    {criteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        {criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCriterion(idx)}
                            className="absolute right-2 top-2 text-zinc-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="text-xs text-zinc-500">Название</label>
                            <input
                              type="text"
                              value={crit.name}
                              onChange={(e) => updateCriterion(idx, "name", e.target.value)}
                              placeholder="напр., Приветствие"
                              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500">Источник оценки</label>
                            <select
                              value={crit.auto_source}
                              onChange={(e) => updateCriterion(idx, "auto_source", e.target.value)}
                              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                            >
                              {AUTO_SOURCES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500">Вес</label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={crit.weight}
                              onChange={(e) => updateCriterion(idx, "weight", parseInt(e.target.value) || 10)}
                              className="mt-1 w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="text-xs text-zinc-500">Описание</label>
                          <input
                            type="text"
                            value={crit.description}
                            onChange={(e) => updateCriterion(idx, "description", e.target.value)}
                            placeholder="Что оценивается?"
                            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Создать карту
                  </button>
                </div>
              </form>
            )}

            {/* Scorecards list */}
            {loading ? (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Загрузка карт оценки...
              </div>
            ) : scorecards.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
                <ClipboardCheck className="h-8 w-8" />
                <p className="text-sm">Карты оценки ещё не созданы</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scorecards.map((sc) => (
                  <div
                    key={sc.id}
                    className="rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/qa/${sc.id}`}
                          className="font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
                        >
                          {sc.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          <span>{sc.criteria.length} критериев</span>
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5",
                              sc.is_active
                                ? "bg-green-50 text-green-600"
                                : "bg-zinc-100 text-zinc-500",
                            )}
                          >
                            {sc.is_active ? "Активна" : "Неактивна"}
                          </span>
                          <span>
                            Создана{" "}
                            {formatDistanceToNow(new Date(sc.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {sc.description && (
                          <p className="mt-1 text-sm text-zinc-500">{sc.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(sc.id, sc.name)}
                        className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {sc.criteria.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sc.criteria.map((c: QACriterionDef, i: number) => (
                          <span
                            key={c.id || i}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {c.name} ({c.weight}pt)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <CollapsibleSidebar>
          <QaSidebar scorecards={scorecards} />
        </CollapsibleSidebar>
      </div>
    </div>
  );
}
