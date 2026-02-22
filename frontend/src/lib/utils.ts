import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SUPPORTED_FORMATS = ["wav", "mp3", "ogg", "flac"];
const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export function validateAudioFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !SUPPORTED_FORMATS.includes(ext)) {
    return `Unsupported format: .${ext}. Supported: ${SUPPORTED_FORMATS.join(", ")}`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File too large: ${formatFileSize(file.size)}. Maximum: 500 MB`;
  }
  return null;
}
