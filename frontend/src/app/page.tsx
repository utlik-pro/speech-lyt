"use client";

import { useState } from "react";
import Link from "next/link";
import { Headphones } from "lucide-react";
import AudioUpload from "@/components/audio-upload";
import CallsList from "@/components/calls-list";
import CallsFilterBar from "@/components/calls-filter-bar";
import ProjectSelector from "@/components/project-selector";
import type { CallFilters } from "@/lib/api";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<CallFilters>({});

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
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Beta
            </span>
            <ProjectSelector />
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="font-medium text-blue-600 dark:text-blue-400">
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

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {/* Upload Section */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
            Upload Audio
          </h2>
          <AudioUpload onUploadComplete={() => setRefreshKey((k) => k + 1)} />
        </section>

        {/* Filters */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-zinc-800 dark:text-zinc-200">
            Calls
          </h2>
          <CallsFilterBar filters={filters} onChange={setFilters} />
        </section>

        {/* Calls List */}
        <section>
          <CallsList refreshKey={refreshKey} filters={filters} />
        </section>
      </main>
    </div>
  );
}
