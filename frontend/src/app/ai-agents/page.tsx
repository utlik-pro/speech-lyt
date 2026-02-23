"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Plus,
  Trash2,
  Loader2,
  Play,
  Pause,
  Settings,
  Zap,
  Brain,
  Shield,
  MessageSquare,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import {
  listAIAgents,
  createAIAgent,
  deleteAIAgent,
  updateAIAgent,
  type AIAgentResponse,
  type PipelineStepConfig,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const AGENT_TYPES = [
  { value: "analyzer", label: "Analyzer", icon: Zap, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  { value: "coach", label: "Coach", icon: Brain, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
  { value: "qa_reviewer", label: "QA Reviewer", icon: Shield, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  { value: "custom", label: "Custom", icon: MessageSquare, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
];

const STEP_TYPES = [
  { value: "emotion_analysis", label: "Emotion Analysis" },
  { value: "summary", label: "Summary" },
  { value: "script_compliance", label: "Script Compliance" },
  { value: "coaching", label: "Coaching" },
  { value: "custom", label: "Custom Analysis" },
];

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentType, setAgentType] = useState("analyzer");
  const [modelName, setModelName] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [steps, setSteps] = useState<PipelineStepConfig[]>([
    { step_type: "emotion_analysis", enabled: true, order: 1, config: {} },
    { step_type: "summary", enabled: true, order: 2, config: {} },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAIAgents();
      setAgents(data.items);
    } catch (err) {
      console.error("Failed to load AI agents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDelete = async (id: string, agentName: string) => {
    if (!confirm(`Delete AI agent "${agentName}"?`)) return;
    try {
      await deleteAIAgent(id);
      fetchAgents();
    } catch {
      alert("Failed to delete agent");
    }
  };

  const handleToggleActive = async (agent: AIAgentResponse) => {
    try {
      await updateAIAgent(agent.id, { is_active: !agent.is_active });
      fetchAgents();
    } catch {
      alert("Failed to update agent");
    }
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { step_type: "custom", enabled: true, order: prev.length + 1, config: {} },
    ]);
  };

  const removeStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const updateStep = (idx: number, field: string, value: string | boolean) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createAIAgent({
        name,
        description: description || undefined,
        agent_type: agentType,
        model_name: modelName,
        temperature,
        max_tokens: maxTokens,
        pipeline_steps: steps.filter((s) => s.enabled),
      });
      setName("");
      setDescription("");
      setSteps([
        { step_type: "emotion_analysis", enabled: true, order: 1, config: {} },
        { step_type: "summary", enabled: true, order: 2, config: {} },
      ]);
      setShowForm(false);
      fetchAgents();
    } catch {
      alert("Failed to create AI agent");
    } finally {
      setSaving(false);
    }
  };

  const getTypeInfo = (type: string) =>
    AGENT_TYPES.find((t) => t.value === type) || AGENT_TYPES[3];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Agents
          </h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Agent
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
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Quality Analyzer"
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Type</label>
                <select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {AGENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Model</label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Temperature ({temperature})
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Max Tokens</label>
                <input
                  type="number"
                  min={256}
                  max={8192}
                  step={256}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            {/* Pipeline steps */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Pipeline Steps
                </label>
                <button type="button" onClick={addStep} className="text-xs text-blue-600 hover:underline">
                  + Add Step
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <span className="w-6 text-center text-xs font-mono text-zinc-400">{idx + 1}</span>
                    <select
                      value={step.step_type}
                      onChange={(e) => updateStep(idx, "step_type", e.target.value)}
                      className="flex-1 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700"
                    >
                      {STEP_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-zinc-500">
                      <input
                        type="checkbox"
                        checked={step.enabled}
                        onChange={(e) => updateStep(idx, "enabled", e.target.checked)}
                      />
                      On
                    </label>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="text-zinc-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
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
                Create Agent
              </button>
            </div>
          </form>
        )}

        {/* Agent list */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading AI agents...
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
            <Bot className="h-8 w-8" />
            <p className="text-sm">No AI agents configured yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => {
              const typeInfo = getTypeInfo(agent.agent_type);
              const TypeIcon = typeInfo.icon;
              return (
                <div
                  key={agent.id}
                  className="rounded-lg border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn("rounded-lg p-2", typeInfo.color)}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {agent.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          <span className={cn(
                            "rounded-full px-1.5 py-0.5",
                            agent.is_active
                              ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
                          )}>
                            {agent.is_active ? "Active" : "Inactive"}
                          </span>
                          <span>{agent.model_name}</span>
                          <span>T={agent.temperature}</span>
                          <span>
                            Created{" "}
                            {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {agent.description && (
                          <p className="mt-1 text-sm text-zinc-500">{agent.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(agent)}
                        className={cn(
                          "rounded p-1.5 transition-colors",
                          agent.is_active
                            ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        )}
                        title={agent.is_active ? "Deactivate" : "Activate"}
                      >
                        {agent.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id, agent.name)}
                        className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pipeline steps */}
                  {agent.pipeline_steps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {agent.pipeline_steps
                        .sort((a, b) => a.order - b.order)
                        .map((step, i) => (
                          <span
                            key={i}
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs",
                              step.enabled
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-800",
                            )}
                          >
                            {step.order}. {STEP_TYPES.find((s) => s.value === step.step_type)?.label || step.step_type}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
