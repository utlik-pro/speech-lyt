"use client";

import { useEffect, useRef } from "react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Segment {
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
}

interface ConversationTimelineProps {
  segments: Segment[];
  totalDuration: number;
  currentTime?: number;
  onSegmentClick?: (time: number) => void;
}

export default function ConversationTimeline({
  segments,
  totalDuration,
  currentTime,
  onSegmentClick,
}: ConversationTimelineProps) {
  const activeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find active segment index
  const activeIndex =
    currentTime !== undefined
      ? segments.findIndex(
          (seg) => currentTime >= seg.start_time && currentTime < seg.end_time,
        )
      : -1;

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeIndex >= 0 && activeRef.current && listRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIndex]);

  if (segments.length === 0 || totalDuration <= 0) {
    return <p className="py-4 text-center text-sm text-zinc-400">No timeline data</p>;
  }

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSegmentClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSegmentClick(pct * totalDuration);
  };

  const playheadPct =
    currentTime !== undefined && totalDuration > 0
      ? (currentTime / totalDuration) * 100
      : null;

  return (
    <div className="space-y-3">
      {/* Visual timeline bar */}
      <div
        className={cn(
          "relative h-6 rounded-full bg-zinc-100 dark:bg-zinc-800",
          onSegmentClick && "cursor-pointer",
        )}
        onClick={handleBarClick}
      >
        {segments.map((seg, i) => {
          const left = (seg.start_time / totalDuration) * 100;
          const width = ((seg.end_time - seg.start_time) / totalDuration) * 100;
          const isAgent = seg.speaker === "agent";
          return (
            <div
              key={i}
              className={`absolute top-0 h-full rounded-sm ${
                isAgent ? "bg-blue-500/70" : "bg-green-500/70"
              }`}
              style={{ left: `${left}%`, width: `${Math.max(width, 0.3)}%` }}
              title={`${seg.speaker}: ${formatDuration(seg.start_time)} - ${formatDuration(seg.end_time)}`}
            />
          );
        })}

        {/* Playhead indicator */}
        {playheadPct !== null && (
          <div
            className="absolute top-0 z-10 h-full w-0.5 bg-red-500 shadow-sm shadow-red-500/50"
            style={{ left: `${Math.min(playheadPct, 100)}%` }}
          >
            <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500/70" />
          Agent
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500/70" />
          Client
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
          Silence
        </span>
        {playheadPct !== null && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-0.5 bg-red-500" />
            Playhead
          </span>
        )}
        <span className="ml-auto">{formatDuration(totalDuration)} total</span>
      </div>

      {/* Segment list (scrollable) */}
      <div ref={listRef} className="max-h-80 space-y-1 overflow-y-auto">
        {segments.map((seg, i) => {
          const isActive = i === activeIndex;
          const isAgent = seg.speaker === "agent";

          return (
            <div
              key={i}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSegmentClick?.(seg.start_time)}
              className={cn(
                "flex items-start gap-2 rounded px-2 py-1.5 text-xs transition-all",
                isAgent
                  ? "bg-blue-50 dark:bg-blue-950/20"
                  : "bg-green-50 dark:bg-green-950/20",
                isActive &&
                  (isAgent
                    ? "ring-2 ring-blue-400 bg-blue-100 dark:bg-blue-900/40"
                    : "ring-2 ring-green-400 bg-green-100 dark:bg-green-900/40"),
                onSegmentClick && "cursor-pointer hover:opacity-80",
              )}
            >
              <span className="mt-0.5 w-16 shrink-0 font-mono text-zinc-400">
                {formatDuration(seg.start_time)}
              </span>
              <span
                className={cn(
                  "w-12 shrink-0 font-medium",
                  isAgent ? "text-blue-600" : "text-green-600",
                )}
              >
                {isAgent ? "Agent" : "Client"}
              </span>
              <span
                className={cn(
                  "text-zinc-700 dark:text-zinc-300",
                  isActive && "font-medium",
                )}
              >
                {seg.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
