"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
} from "lucide-react";

interface HeroVideoProps {
  src: string;
  poster?: string;
}

export function HeroVideo({ src, poster }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  // Wire up video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrent(v.currentTime);
      setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) v.play().catch(() => {});
    setMuted(next);
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  const fullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else v.requestFullscreen().catch(() => {});
  };

  const seekTo = (clientX: number) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setProgress(pct * 100);
  };

  const onBarDown = (e: React.MouseEvent) => {
    setScrubbing(true);
    seekTo(e.clientX);
  };

  useEffect(() => {
    if (!scrubbing) return;
    const onMove = (e: MouseEvent) => seekTo(e.clientX);
    const onUp = () => setScrubbing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [scrubbing]);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const showControls = hovered || !playing || scrubbing;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-blue-500/10"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        onClick={togglePlay}
        className="h-full w-full cursor-pointer bg-black object-contain"
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Big play overlay when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/50 transition-transform hover:scale-110">
            <Play className="ml-1 h-10 w-10" fill="currentColor" />
          </div>
        </button>
      )}

      {/* "Включите звук" badge when muted */}
      {muted && (
        <button
          onClick={toggleSound}
          className="absolute right-4 top-4 z-10 flex animate-pulse items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 hover:animate-none"
        >
          <Volume2 className="h-4 w-4" />
          Включите звук
        </button>
      )}

      {/* Custom controls bar */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16 transition-all duration-200 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          onMouseDown={onBarDown}
          className="group/bar relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/20 transition-all hover:h-2"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 shadow-lg shadow-blue-500/50 transition-opacity group-hover/bar:opacity-100"
            style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-blue-600"
            aria-label={playing ? "Пауза" : "Играть"}
          >
            {playing ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
            )}
          </button>

          <button
            onClick={restart}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-blue-600"
            aria-label="С начала"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={toggleSound}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-blue-600"
            aria-label={muted ? "Включить звук" : "Выключить звук"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <div className="font-mono text-sm tabular-nums text-white/80">
            {fmt(current)}{" "}
            <span className="text-white/40">/ {fmt(duration)}</span>
          </div>

          <button
            onClick={fullscreen}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-blue-600"
            aria-label="На весь экран"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
