"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Headphones,
  Clock,
  FileAudio,
  Loader2,
  AlertCircle,
  CheckCircle,
  Smile,
  Meh,
  Frown,
  Tag,
  Mic,
  MessageSquare,
  Target,
  Volume2,
} from "lucide-react";
import { cn, formatDuration, formatFileSize } from "@/lib/utils";
import ProjectSelector from "@/components/project-selector";
import {
  getCall,
  getCallEmotions,
  getCallSummary,
  getConversationStats,
  getCallTranscription,
  getCallAudioUrl,
  type CallResponse,
  type EmotionAnalysisResponse,
  type CallSummaryResponse,
  type ConversationStatsResponse,
  type TranscriptionResponse,
} from "@/lib/api";
import ConversationStatsComponent from "@/components/conversation-stats";
import ConversationTimeline from "@/components/conversation-timeline";
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

        if (callData.status === "completed") {
          const [emotionData, summaryData, statsData, transData] = await Promise.allSettled([
            getCallEmotions(callId),
            getCallSummary(callId),
            getConversationStats(callId),
            getCallTranscription(callId),
          ]);
          if (emotionData.status === "fulfilled") setEmotions(emotionData.value);
          if (summaryData.status === "fulfilled") setSummary(summaryData.value);
          if (statsData.status === "fulfilled") setConvStats(statsData.value);
          if (transData.status === "fulfilled") setTranscription(transData.value);
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
    // Reset seekTo after a tick so the same timestamp can be clicked again
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
            <Link href="/scripts" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Scripts
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to calls
        </Link>

        {/* Call info card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <FileAudio className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {call.original_filename}
                </h2>
                <p className="text-sm text-zinc-500">
                  {call.audio_format.toUpperCase()} &middot; {formatFileSize(call.file_size_bytes)}
                  &middot; {call.direction}
                  {call.phone_number && ` &middot; ${call.phone_number}`}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
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

          <div className="mt-4 flex gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Duration: {formatDuration(call.duration_seconds)}
            </span>
            <span>
              Uploaded {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
            </span>
          </div>

          {call.error_message && (
            <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {call.error_message}
            </div>
          )}
        </div>

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
              <div className="text-center">
                <p className="text-xs text-zinc-500">Overall</p>
                <div className="mt-1 flex flex-col items-center gap-1">
                  {sentimentIcon[emotions.overall_sentiment] || sentimentIcon.neutral}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      sentimentColor[emotions.overall_sentiment] || sentimentColor.neutral,
                    )}
                  >
                    {sentimentLabel[emotions.overall_sentiment] || emotions.overall_sentiment}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500">Agent</p>
                <div className="mt-1 flex flex-col items-center gap-1">
                  {sentimentIcon[emotions.agent_sentiment] || sentimentIcon.neutral}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      sentimentColor[emotions.agent_sentiment] || sentimentColor.neutral,
                    )}
                  >
                    {sentimentLabel[emotions.agent_sentiment] || emotions.agent_sentiment}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500">Client</p>
                <div className="mt-1 flex flex-col items-center gap-1">
                  {sentimentIcon[emotions.client_sentiment] || sentimentIcon.neutral}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      sentimentColor[emotions.client_sentiment] || sentimentColor.neutral,
                    )}
                  >
                    {sentimentLabel[emotions.client_sentiment] || emotions.client_sentiment}
                  </span>
                </div>
              </div>
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
      </main>
    </div>
  );
}
