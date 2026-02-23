"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  X,
  History,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import CollapsibleSidebar from "@/components/collapsible-sidebar";
import AlertsSidebar from "@/components/sidebar/alerts-sidebar";
import {
  listAlertRules,
  createAlertRule,
  deleteAlertRule,
  updateAlertRule,
  getAlertHistory,
  acknowledgeAlert,
  type AlertRuleResponse,
  type AlertHistoryResponse,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const METRICS = [
  { value: "aht", label: "Average Handle Time (sec)" },
  { value: "avg_script_score", label: "Avg Script Score (%)" },
  { value: "resolution_rate", label: "Resolution Rate (%)" },
  { value: "negative_sentiment_pct", label: "Negative Sentiment (%)" },
  { value: "total_calls", label: "Total Calls" },
  { value: "failed_calls", label: "Failed Calls" },
];

const SEVERITIES = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

const severityIcon: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  critical: <ShieldAlert className="h-4 w-4 text-red-500" />,
};

const severityColor: Record<string, string> = {
  info: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  critical: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

export default function AlertsPage() {
  const [tab, setTab] = useState<"rules" | "history">("rules");
  const [rules, setRules] = useState<AlertRuleResponse[]>([]);
  const [history, setHistory] = useState<AlertHistoryResponse[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formMetric, setFormMetric] = useState("aht");
  const [formCondition, setFormCondition] = useState("above");
  const [formThreshold, setFormThreshold] = useState("");
  const [formSeverity, setFormSeverity] = useState("warning");
  const [formCooldown, setFormCooldown] = useState("60");
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoadingRules(true);
    try {
      const data = await listAlertRules();
      setRules(data.items);
    } catch (err) {
      console.error("Failed to load alert rules:", err);
    } finally {
      setLoadingRules(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getAlertHistory({ page_size: 50 });
      setHistory(data.items);
    } catch (err) {
      console.error("Failed to load alert history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
    fetchHistory();
  }, [fetchRules, fetchHistory]);

  const handleDeleteRule = async (id: string, ruleName: string) => {
    if (!confirm(`Delete rule "${ruleName}"?`)) return;
    try {
      await deleteAlertRule(id);
      fetchRules();
    } catch {
      alert("Failed to delete rule");
    }
  };

  const handleToggleRule = async (rule: AlertRuleResponse) => {
    try {
      await updateAlertRule(rule.id, { is_active: !rule.is_active });
      fetchRules();
    } catch {
      alert("Failed to update rule");
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      fetchHistory();
    } catch {
      alert("Failed to acknowledge alert");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formThreshold) return;

    setSaving(true);
    try {
      await createAlertRule({
        name: formName,
        metric_name: formMetric,
        condition: formCondition,
        threshold: parseFloat(formThreshold),
        severity: formSeverity,
        cooldown_minutes: parseInt(formCooldown) || 60,
      });
      setFormName("");
      setFormThreshold("");
      setShowForm(false);
      fetchRules();
    } catch {
      alert("Failed to create rule");
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
            <Bell className="h-5 w-5 text-blue-600" />
            Alert Management
          </h2>
          {tab === "rules" && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Rule
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setTab("rules")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "rules"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
            )}
          >
            <ListChecks className="h-4 w-4" />
            Rules ({rules.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "history"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
            )}
          >
            <History className="h-4 w-4" />
            History ({history.length})
          </button>
        </div>

        {/* Rules tab */}
        {tab === "rules" && (
          <>
            {/* Create form */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="e.g., High AHT Alert"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Metric
                    </label>
                    <select
                      value={formMetric}
                      onChange={(e) => setFormMetric(e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {METRICS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Condition
                    </label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Threshold
                    </label>
                    <input
                      type="number"
                      value={formThreshold}
                      onChange={(e) => setFormThreshold(e.target.value)}
                      required
                      step="any"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Severity
                    </label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Cooldown (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formCooldown}
                      onChange={(e) => setFormCooldown(e.target.value)}
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
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
                    disabled={saving || !formName.trim() || !formThreshold}
                    className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Create Rule
                  </button>
                </div>
              </form>
            )}

            {/* Rules list */}
            {loadingRules ? (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading rules...
              </div>
            ) : rules.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
                <Bell className="h-8 w-8" />
                <p className="text-sm">No alert rules configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {severityIcon[rule.severity]}
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {rule.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {METRICS.find((m) => m.value === rule.metric_name)?.label || rule.metric_name}{" "}
                            {rule.condition} {rule.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            severityColor[rule.severity],
                          )}
                        >
                          {rule.severity}
                        </span>
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            rule.is_active
                              ? "bg-green-50 text-green-600"
                              : "bg-zinc-100 text-zinc-500",
                          )}
                        >
                          {rule.is_active ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id, rule.name)}
                          className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* History tab */}
        {tab === "history" && (
          <>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-500">
                <History className="h-8 w-8" />
                <p className="text-sm">No alerts triggered yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4",
                      h.acknowledged
                        ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                        : "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {severityIcon[h.severity]}
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {h.message}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {h.acknowledged ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(h.id)}
                        className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      </main>
      <CollapsibleSidebar>
        <AlertsSidebar rules={rules} history={history} />
      </CollapsibleSidebar>
      </div>
    </div>
  );
}
