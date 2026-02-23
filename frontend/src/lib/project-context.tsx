"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { listProjects, type ProjectResponse } from "@/lib/api";

interface ProjectContextValue {
  projects: ProjectResponse[];
  selectedProject: ProjectResponse | null;
  setSelectedProject: (project: ProjectResponse) => void;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProjectState] =
    useState<ProjectResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listProjects();
        setProjects(data.items);

        const savedId =
          typeof window !== "undefined"
            ? localStorage.getItem("speechlyt-project-id")
            : null;

        if (savedId) {
          const found = data.items.find((p) => p.id === savedId);
          if (found) {
            setSelectedProjectState(found);
          } else if (data.items.length > 0) {
            // Saved project no longer exists, fall back to first
            setSelectedProjectState(data.items[0]);
            localStorage.setItem("speechlyt-project-id", data.items[0].id);
          }
        } else if (data.items.length > 0) {
          // No saved selection, pick first
          setSelectedProjectState(data.items[0]);
          localStorage.setItem("speechlyt-project-id", data.items[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const setSelectedProject = (project: ProjectResponse) => {
    setSelectedProjectState(project);
    localStorage.setItem("speechlyt-project-id", project.id);
  };

  return (
    <ProjectContext.Provider
      value={{ projects, selectedProject, setSelectedProject, loading }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return ctx;
}
