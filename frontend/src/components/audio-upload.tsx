"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileAudio, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn, formatFileSize, validateAudioFile } from "@/lib/utils";
import { uploadCall, type CallUploadResponse } from "@/lib/api";

interface FileUploadItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  result?: CallUploadResponse;
}

interface AudioUploadProps {
  onUploadComplete?: () => void;
}

export default function AudioUpload({ onUploadComplete }: AudioUploadProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const items: FileUploadItem[] = Array.from(newFiles).map((file) => {
      const validationError = validateAudioFile(file);
      return {
        file,
        progress: 0,
        status: validationError ? "error" : "pending",
        error: validationError ?? undefined,
      };
    });
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleUploadAll = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" as const, progress: 0 } : f)),
      );

      try {
        const result = await uploadCall(files[i].file, "unknown", (progress) => {
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress } : f)),
          );
        });

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "success" as const, progress: 100, result } : f,
          ),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error" as const, error: message } : f,
          ),
        );
      }
    }

    setIsUploading(false);
    onUploadComplete?.();
  }, [files, onUploadComplete]);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer",
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600",
        )}
      >
        <Upload className="h-10 w-10 text-zinc-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Drag & drop audio files here
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            WAV, MP3, OGG, FLAC — up to 500 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".wav,.mp3,.ogg,.flac"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {files.length} file{files.length !== 1 && "s"} selected
              {successCount > 0 && ` — ${successCount} uploaded`}
            </p>
            <div className="flex gap-2">
              {files.length > 0 && !isUploading && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {files.map((item, index) => (
              <li
                key={`${item.file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
              >
                <FileAudio className="h-4 w-4 shrink-0 text-zinc-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-800 dark:text-zinc-200">
                    {item.file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {formatFileSize(item.file.size)}
                    </span>
                    {item.status === "uploading" && (
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-1 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div
                            className="h-1 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-blue-600">{item.progress}%</span>
                      </div>
                    )}
                    {item.status === "error" && (
                      <span className="text-xs text-red-500">{item.error}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {item.status === "uploading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {item.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {item.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {item.status === "pending" && (
                    <button onClick={() => removeFile(index)}>
                      <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Upload Button */}
          {pendingCount > 0 && (
            <button
              onClick={handleUploadAll}
              disabled={isUploading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors",
                isUploading
                  ? "cursor-not-allowed bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700",
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {pendingCount} file{pendingCount !== 1 && "s"}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
