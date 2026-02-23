"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Headphones,
  Plus,
  Trash2,
  FileText,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectSelector from "@/components/project-selector";
import {
  listScripts,
  createScript,
  deleteScript,
  type ScriptResponse,
  type ScriptStage,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface StageForm {
  order: number;
  name: string;
  required_phrases: string;
  forbidden_words: string;
  is_required: boolean;
  max_duration_seconds: string;
}

const emptyStage = (): StageForm => ({
  order: 0,
  name: "",
  required_phrases: "",
  forbidden_words: "",
  is_required: true,
  max_duration_seconds: "",
});

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<ScriptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("support");
  const [description, setDescription] = useState("");
  const [stages, setStages] = useState<StageForm[]>([emptyStage()]);
  const [saving, setSaving] = useState(false);

  const fetchScripts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listScripts();
      setScripts(data.items);
    } catch (err) {
      console.error("Failed to load scripts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const handleDelete = async (id: string, scriptName: string) => {
    if (!confirm(`Delete script "${scriptName}"?`)) return;
    try {
      await deleteScript(id);
      fetchScripts();
    } catch {
      alert("Failed to delete script");
    }
  };

  const addStage = () => {
    setStages((prev) => [...prev, { ...emptyStage(), order: prev.length }]);
  };

  const removeStage = (idx: number) => {
    setStages((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateStage = (idx: number, field: keyof StageForm, value: string | boolean) => {
    setStages((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await createScript({
        name,
        type,
        description: description || undefined,
        stages: stages
          .filter((s) => s.name.trim())
          .map((s, i) => ({
            order: i,
            name: s.name,
            required_phrases: s.required_phrases
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean),
            forbidden_words: s.forbidden_words
              .split("\n")
              .map((w) => w.trim())
              .filter(Boolean),
            is_required: s.is_required,
            max_duration_seconds: s.max_duration_seconds
              ? parseInt(s.max_duration_seconds, 10)
              : null,
          })),
      });
      setName("");
      setType("support");
      setDescription("");
      setStages([emptyStage()]);
      setShowForm(false);
      fetchScripts();
    } catch (err) {
      alert("Failed to create script");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Headphones className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              SpeechLyt
            </h1>
            <ProjectSelector />
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Calls
            </Link>
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Dashboard
            </Link>
            <Link href="/agents" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Agents
            </Link>
            <Link href="/scripts" className="font-medium text-blue-600 dark:text-blue-400">
              Scripts
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <FileText className="h-5 w-5 text-blue-600" />
            Script Templates
          </h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Script
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
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Sales Welcome Script"
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>

            {/* Stages */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Stages
                </label>
                <button
                  type="button"
                  onClick={addStage}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add Stage
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStage(idx)}
                        className="absolute right-2 top-2 text-zinc-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-zinc-500">Stage Name</label>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => updateStage(idx, "name", e.target.value)}
                          placeholder="e.g., Greeting"
                          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                        />
                      </div>
                      <div className="flex items-end gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <input
                            type="checkbox"
                            checked={stage.is_required}
                            onChange={(e) => updateStage(idx, "is_required", e.target.checked)}
                            className="rounded"
                          />
                          Required
                        </label>
                        <div>
                          <label className="text-xs text-zinc-500">Max duration (sec)</label>
                          <input
                            type="number"
                            value={stage.max_duration_seconds}
                            onChange={(e) =>
                              updateStage(idx, "max_duration_seconds", e.target.value)
                            }
                            className="mt-1 w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">
                          Required phrases (one per line)
                        </label>
                        <textarea
                          value={stage.required_phrases}
                          onChange={(e) =>
                            updateStage(idx, "required_phrases", e.target.value)
                          }
                          rows={3}
                          placeholder="Greeting phrase&#10;Company name"
                          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">
                          Forbidden words (one per line)
                        </label>
                        <textarea
                          value={stage.forbidden_words}
                          onChange={(e) =>
                            updateStage(idx, "forbidden_words", e.target.value)
                          }
                          rows={3}
                          placeholder="Rude word&#10;Competitor name"
                          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                        />
                      </div>
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create Script
              </button>
            </div>
          </form>
        )}

        {/* Scripts list */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading scripts...
          </div>
        ) : scripts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
            <FileText className="h-8 w-8" />
            <p className="text-sm">No scripts created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {script.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                        {script.type}
                      </span>
                      <span>{script.stages.length} stages</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5",
                          script.is_active
                            ? "bg-green-50 text-green-600"
                            : "bg-zinc-100 text-zinc-500",
                        )}
                      >
                        {script.is_active ? "Active" : "Inactive"}
                      </span>
                      <span>
                        Created{" "}
                        {formatDistanceToNow(new Date(script.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {script.description && (
                      <p className="mt-1 text-sm text-zinc-500">{script.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(script.id, script.name)}
                    className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {script.stages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {script.stages
                      .sort((a, b) => a.order - b.order)
                      .map((stage, i) => (
                        <span
                          key={stage.id || i}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            stage.is_required
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                          )}
                        >
                          {i + 1}. {stage.name}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
