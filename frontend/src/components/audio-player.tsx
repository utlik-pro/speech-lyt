"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  AlertCircle,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface AudioPlayerProps {
  src: string;
  totalDuration: number;
  onTimeUpdate: (time: number) => void;
  seekTo?: number; // external seek request (timestamp in seconds)
}

export default function AudioPlayer({
  src,
  totalDuration,
  onTimeUpdate,
  seekTo,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rateIndex, setRateIndex] = useState(2); // 1x
  const [error, setError] = useState(false);

  // Handle external seek requests
  useEffect(() => {
    if (seekTo !== undefined && audioRef.current && !error) {
      audioRef.current.currentTime = seekTo;
      setCurrentTime(seekTo);
      onTimeUpdate(seekTo);
    }
  }, [seekTo, error, onTimeUpdate]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    onTimeUpdate(t);
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    const d = audioRef.current.duration;
    if (d && isFinite(d)) setDuration(d);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setPlaying(false);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || error) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setError(true));
    }
    setPlaying(!playing);
  };

  const skip = (delta: number) => {
    if (!audioRef.current || error) return;
    const t = Math.max(0, Math.min(audioRef.current.currentTime + delta, duration));
    audioRef.current.currentTime = t;
    setCurrentTime(t);
    onTimeUpdate(t);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || error) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = pct * duration;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
    onTimeUpdate(t);
  };

  const cycleRate = () => {
    const next = (rateIndex + 1) % PLAYBACK_RATES.length;
    setRateIndex(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = PLAYBACK_RATES[next];
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    setMuted(next);
    audioRef.current.volume = next ? 0 : volume;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
        <AlertCircle className="h-4 w-4" />
        Audio file unavailable
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="group mb-3 h-2 cursor-pointer rounded-full bg-zinc-100 dark:bg-zinc-800"
      >
        <div
          className="relative h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute -right-1.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600 opacity-0 shadow group-hover:opacity-100 dark:border-zinc-900" />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Skip back */}
        <button
          onClick={() => skip(-10)}
          className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title="Back 10s"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>

        {/* Skip forward */}
        <button
          onClick={() => skip(10)}
          className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title="Forward 10s"
        >
          <SkipForward className="h-4 w-4" />
        </button>

        {/* Time display */}
        <span className="min-w-[5rem] text-center font-mono text-xs text-zinc-500">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>

        {/* Playback rate */}
        <button
          onClick={cycleRate}
          className={cn(
            "rounded px-1.5 py-0.5 text-xs font-medium",
            PLAYBACK_RATES[rateIndex] !== 1
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800",
          )}
        >
          {PLAYBACK_RATES[rateIndex]}x
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Volume */}
        <button onClick={toggleMute} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="h-1 w-16 cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );
}
