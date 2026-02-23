"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FolderOpen } from "lucide-react";
import { useProject } from "@/lib/project-context";

export default function ProjectSelector() {
  const { projects, selectedProject, setSelectedProject, loading } =
    useProject();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || projects.length === 0) {
    return null;
  }

  const handleSelect = (project: (typeof projects)[number]) => {
    if (project.id === selectedProject?.id) {
      setOpen(false);
      return;
    }
    setSelectedProject(project);
    setOpen(false);
    // Reload the page so all data refetches with the new project header
    window.location.reload();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: selectedProject?.color || "#3b82f6",
          }}
        />
        <span className="max-w-[140px] truncate">
          {selectedProject?.name || "Select project"}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleSelect(project)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                project.id === selectedProject?.id
                  ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: project.color || "#3b82f6",
                }}
              />
              <span className="truncate">{project.name}</span>
            </button>
          ))}

          {projects.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400">
              <FolderOpen className="h-4 w-4" />
              No projects
            </div>
          )}
        </div>
      )}
    </div>
  );
}
