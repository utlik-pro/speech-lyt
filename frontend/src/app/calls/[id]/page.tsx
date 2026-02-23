"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  FileAudio,
  Loader2,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Tag,
  Mic,
  MessageSquare,
  Target,
  Volume2,
  User,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Shield,
} from "lucide-react";
import { cn, formatDuration, formatFileSize } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import {
  getCall,
  getCallEmotions,
  getCallSummary,
  getConversationStats,
  getCallTranscription,
  getCallScriptAnalysis,
  getCallAudioUrl,
  getManagerInfo,
  type CallResponse,
  type EmotionAnalysisResponse,
  type CallSummaryResponse,
  type ConversationStatsResponse,
  type TranscriptionResponse,
  type ScriptAnalysisResponse,
  type ManagerResponse,
  getCallEvaluations,
  type QAEvaluationResponse,
} from "@/lib/api";
import ConversationStatsComponent from "@/components/conversation-stats";
import ConversationTimeline from "@/components/conversation-timeline";
import ScriptComplianceCard from "@/components/script-compliance-card";
import QAEvaluationCard from "@/components/qa-evaluation-card";
import AudioPlayer from "@/components/audio-player";
import { formatDistanceToNow } from "date-fns";

const sentimentIcon: Record<string, React.ReactNode> = {
  positive: <Smile className="h-5 w-5 text-green-500" />,
  neutral: <Meh className="h-5 w-5 text-zinc-400" />,
  negative: <Frown className="h-5 w-5 text-red-500" />,
};

const sentimentLabel: Record<string, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

const sentimentColor: Record<string, string> = {
  positive: "text-green-600 bg-green-50 dark:bg-green-900/20",
  neutral: "text-zinc-600 bg-zinc-100 dark:bg-zinc-800",
  negative: "text-red-600 bg-red-50 dark:bg-red-900/20",
};

const outcomeColors: Record<string, string> = {
  resolved: "text-green-600 bg-green-50",
  unresolved: "text-yellow-600 bg-yellow-50",
  escalated: "text-red-600 bg-red-50",
  callback: "text-blue-600 bg-blue-50",
};

export default function CallDetailPage() {
  const params = useParams();
  const callId = params.id as string;

  const [call, setCall] = useState<CallResponse | null>(null);
  const [emotions, setEmotions] = useState<EmotionAnalysisResponse | null>(null);
  const [summary, setSummary] = useState<CallSummaryResponse | null>(null);
  const [convStats, setConvStats] = useState<ConversationStatsResponse | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysisResponse | null>(null);
  const [qaEvaluation, setQaEvaluation] = useState<QAEvaluationResponse | null>(null);
  const [agent, setAgent] = useState<ManagerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const callData = await getCall(callId);
        setCall(callData);

        // Load agent info if available
        if (callData.agent_id) {
          getManagerInfo(callData.agent_id).then(setAgent).catch(() => {});
        }

        if (callData.status === "completed") {
          const [emotionData, summaryData, statsData, transData, scriptData, qaData] =
            await Promise.allSettled([
              getCallEmotions(callId),
              getCallSummary(callId),
              getConversationStats(callId),
              getCallTranscription(callId),
              getCallScriptAnalysis(callId),
              getCallEvaluations(callId),
            ]);
          if (emotionData.status === "fulfilled") setEmotions(emotionData.value);
          if (summaryData.status === "fulfilled") setSummary(summaryData.value);
          if (statsData.status === "fulfilled") setConvStats(statsData.value);
          if (transData.status === "fulfilled") setTranscription(transData.value);
          if (scriptData.status === "fulfilled") setScriptAnalysis(scriptData.value);
          if (qaData.status === "fulfilled" && qaData.value.items.length > 0) {
            setQaEvaluation(qaData.value.items[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load call");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [callId]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSegmentClick = useCallback((time: number) => {
    setSeekTo(time);
    setCurrentTime(time);
    setTimeout(() => setSeekTo(undefined), 50);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-950">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-zinc-500">{error || "Call not found"}</p>
        <Link href="/" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to calls
        </Link>
      </div>
    );
  }

  const DirectionIcon = call.direction === "inbound" ? PhoneIncoming : call.direction === "outbound" ? PhoneOutgoing : Phone;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to calls
        </Link>

        {/* Two-column layout */}
        <div className="mt-6 flex gap-6">
          {/* LEFT SIDEBAR */}
          <div className="w-80 shrink-0 space-y-4">
            {/* Call info */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Call Info
                </h3>
              </div>

              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">File</span>
                  <span className="text-right text-zinc-800 dark:text-zinc-200" title={call.original_filename}>
                    {call.original_filename.length > 20
                      ? call.original_filename.slice(0, 20) + "..."
                      : call.original_filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Format</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {call.audio_format.toUpperCase()} / {formatFileSize(call.file_size_bytes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration</span>
                  <span className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    {formatDuration(call.duration_seconds)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      call.status === "completed"
                        ? "bg-green-50 text-green-600"
                        : call.status === "failed"
                          ? "bg-red-50 text-red-600"
                          : "bg-blue-50 text-blue-600",
                    )}
                  >
                    {call.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Uploaded</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {call.error_message && (
                <div className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {call.error_message}
                </div>
              )}
            </div>

            {/* Manager info */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Manager
                </h3>
              </div>
              {agent ? (
                <div className="mt-3 space-y-2 text-sm">
                  <Link
                    href={`/managers/${agent.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {agent.name}
                  </Link>
                  {agent.team && (
                    <p className="text-xs text-zinc-500">{agent.team}</p>
                  )}
                  {agent.email && (
                    <p className="text-xs text-zinc-400">{agent.email}</p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-zinc-400">
                  {call.agent_id ? "Loading..." : "No manager assigned"}
                </p>
              )}
            </div>

            {/* Client info */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Client
                </h3>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <DirectionIcon className="h-4 w-4 text-zinc-400" />
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    call.direction === "inbound"
                      ? "bg-green-50 text-green-600"
                      : call.direction === "outbound"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-zinc-100 text-zinc-500",
                  )}>
                    {call.direction}
                  </span>
                </div>
                {call.phone_number ? (
                  <p className="font-mono text-zinc-800 dark:text-zinc-200">
                    {call.phone_number}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400">No phone number</p>
                )}
              </div>
            </div>

            {/* Quick stats */}
            {convStats && (
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-purple-500" />
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Quick Stats
                  </h3>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">Talk/Listen</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {convStats.talk_listen_ratio.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Silence</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {Math.round(convStats.silence_pct)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Interruptions</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {convStats.interruption_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Avg WPM</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {Math.round((convStats.agent_wpm + convStats.client_wpm) / 2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Script compliance score (compact) */}
            {scriptAnalysis && (
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Script Score
                  </h3>
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      scriptAnalysis.overall_score >= 80
                        ? "text-green-600"
                        : scriptAnalysis.overall_score >= 60
                          ? "text-yellow-600"
                          : "text-red-600",
                    )}
                  >
                    {Math.round(scriptAnalysis.overall_score)}%
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {scriptAnalysis.stage_results.filter((s) => s.passed).length}/
                    {scriptAnalysis.stage_results.length} stages passed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Summary */}
            {summary && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <MessageSquare className="h-4 w-4" />
                  AI Summary
                </h3>
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {summary.short_summary}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-medium text-zinc-500">Topic</span>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200">{summary.topic}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-500">Outcome</span>
                    <span
                      className={cn(
                        "ml-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        outcomeColors[summary.outcome] || outcomeColors.unresolved,
                      )}
                    >
                      {summary.outcome}
                    </span>
                  </div>
                  {summary.problem && (
                    <div>
                      <span className="text-xs font-medium text-zinc-500">Problem</span>
                      <p className="text-sm text-zinc-800 dark:text-zinc-200">{summary.problem}</p>
                    </div>
                  )}
                  {summary.solution && (
                    <div>
                      <span className="text-xs font-medium text-zinc-500">Solution</span>
                      <p className="text-sm text-zinc-800 dark:text-zinc-200">{summary.solution}</p>
                    </div>
                  )}
                  {summary.next_steps && (
                    <div className="sm:col-span-2">
                      <span className="text-xs font-medium text-zinc-500">Next Steps</span>
                      <p className="text-sm text-zinc-800 dark:text-zinc-200">{summary.next_steps}</p>
                    </div>
                  )}
                </div>

                {summary.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {summary.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {summary.entities.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-medium text-zinc-500">Extracted Entities</span>
                    <div className="mt-1 space-y-1">
                      {summary.entities.map((ent, i) => (
                        <div
                          key={i}
                          className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <span className="font-medium">{ent.name}:</span>
                          <span>{ent.value}</span>
                          <span className="text-zinc-400">({ent.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Emotions */}
            {emotions && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Target className="h-4 w-4" />
                  Emotion Analysis
                </h3>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  {(["overall_sentiment", "agent_sentiment", "client_sentiment"] as const).map(
                    (key) => {
                      const label = key === "overall_sentiment" ? "Overall" : key === "agent_sentiment" ? "Agent" : "Client";
                      const val = emotions[key];
                      return (
                        <div key={key} className="text-center">
                          <p className="text-xs text-zinc-500">{label}</p>
                          <div className="mt-1 flex flex-col items-center gap-1">
                            {sentimentIcon[val] || sentimentIcon.neutral}
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                sentimentColor[val] || sentimentColor.neutral,
                              )}
                            >
                              {sentimentLabel[val] || val}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {emotions.critical_moments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-zinc-500">Critical Moments</p>
                    <div className="mt-2 space-y-2">
                      {emotions.critical_moments.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-md border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
                          <div>
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              {formatDuration(m.time)} — {m.type}
                            </span>
                            <p className="text-xs text-zinc-500">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Script Compliance (detailed) */}
            {scriptAnalysis && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Shield className="h-4 w-4" />
                  Script Compliance
                </h3>
                <div className="mt-4">
                  <ScriptComplianceCard analysis={scriptAnalysis} />
                </div>
              </div>
            )}

            {/* QA Evaluation */}
            {qaEvaluation && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Target className="h-4 w-4" />
                  QA Evaluation
                </h3>
                <div className="mt-4">
                  <QAEvaluationCard evaluation={qaEvaluation} />
                </div>
              </div>
            )}

            {/* Conversation Statistics */}
            {convStats && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Mic className="h-4 w-4" />
                  Conversation Statistics
                </h3>
                <div className="mt-4">
                  <ConversationStatsComponent stats={convStats} />
                </div>
              </div>
            )}

            {/* Audio Player */}
            {call.status === "completed" && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Volume2 className="h-4 w-4" />
                  Audio Playback
                </h3>
                <AudioPlayer
                  src={getCallAudioUrl(callId)}
                  totalDuration={call.duration_seconds || 0}
                  onTimeUpdate={handleTimeUpdate}
                  seekTo={seekTo}
                />
              </div>
            )}

            {/* Conversation Timeline */}
            {transcription && transcription.segments.length > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <MessageSquare className="h-4 w-4" />
                  Conversation Timeline
                </h3>
                <div className="mt-4">
                  <ConversationTimeline
                    segments={transcription.segments}
                    totalDuration={call.duration_seconds || 0}
                    currentTime={currentTime}
                    onSegmentClick={handleSegmentClick}
                  />
                </div>
              </div>
            )}

            {/* Status message if not completed */}
            {call.status !== "completed" && call.status !== "failed" && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Call is being processed. Refresh to check for updates.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
