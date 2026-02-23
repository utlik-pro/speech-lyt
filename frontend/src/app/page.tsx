"use client";

import { useState } from "react";
import AudioUpload from "@/components/audio-upload";
import CallsList from "@/components/calls-list";
import CallsFilterBar from "@/components/calls-filter-bar";
import AppHeader from "@/components/app-header";
import CollapsibleSidebar from "@/components/collapsible-sidebar";
import CallsSidebar from "@/components/sidebar/calls-sidebar";
import type { CallFilters } from "@/lib/api";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<CallFilters>({});

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <AppHeader />

      <div className="flex">
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
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
          </div>
        </main>

        <CollapsibleSidebar>
          <CallsSidebar />
        </CollapsibleSidebar>
      </div>
    </div>
  );
}
