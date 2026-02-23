"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Ban,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import {
  getScript,
  updateScript,
  deleteScript,
  type ScriptResponse,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function ScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scriptId = params.id as string;

  const [script, setScript] = useState<ScriptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getScript(scriptId);
        setScript(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load script");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [scriptId]);

  const startEdit = () => {
    if (!script) return;
    setEditName(script.name);
    setEditType(script.type);
    setEditDescription(script.description || "");
    setEditActive(script.is_active);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!script) return;
    setSaving(true);
    try {
      const updated = await updateScript(script.id, {
        name: editName,
        type: editType,
        description: editDescription || undefined,
        is_active: editActive,
      });
      setScript(updated);
      setEditing(false);
    } catch {
      alert("Failed to update script");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!script || !confirm(`Delete script "${script.name}"?`)) return;
    try {
      await deleteScript(script.id);
      router.push("/scripts");
    } catch {
      alert("Failed to delete script");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-950">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-zinc-500">{error || "Script not found"}</p>
        <Link href="/scripts" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to scripts
        </Link>
      </div>
    );
  }

  const sortedStages = [...script.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Back link */}
        <Link
          href="/scripts"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scripts
        </Link>

        {/* Script header card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {editing ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
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
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded"
                />
                Active
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editName.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {script.name}
                  </h2>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                    {script.type}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      script.is_active
                        ? "bg-green-50 text-green-600"
                        : "bg-zinc-100 text-zinc-500",
                    )}
                  >
                    {script.is_active ? "Active" : "Inactive"}
                  </span>
                  <span>{script.stages.length} stages</span>
                  <span>
                    Created{" "}
                    {formatDistanceToNow(new Date(script.created_at), { addSuffix: true })}
                  </span>
                </div>
                {script.description && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {script.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={startEdit}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                  title="Edit script"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  title="Delete script"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stages */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Stages ({sortedStages.length})
          </h3>
          <div className="space-y-3">
            {sortedStages.map((stage, idx) => (
              <div
                key={stage.id || idx}
                className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {idx + 1}
                    </span>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {stage.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.is_required ? (
                      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Required
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                        Optional
                      </span>
                    )}
                    {stage.max_duration_seconds && (
                      <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                        <Clock className="h-3 w-3" />
                        {stage.max_duration_seconds}s max
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* Required phrases */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                      <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                      Required Phrases
                    </div>
                    {stage.required_phrases.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {stage.required_phrases.map((phrase, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-400">None specified</p>
                    )}
                  </div>

                  {/* Forbidden words */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                      <Ban className="h-3.5 w-3.5 text-red-500" />
                      Forbidden Words
                    </div>
                    {stage.forbidden_words.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {stage.forbidden_words.map((word, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-400">None specified</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {sortedStages.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-zinc-400">
            <FileText className="h-8 w-8" />
            <p className="text-sm">No stages defined for this script</p>
          </div>
        )}
      </main>
    </div>
  );
}
