"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/use-sidebar";

interface CollapsibleSidebarProps {
  children: React.ReactNode;
}

export default function CollapsibleSidebar({ children }: CollapsibleSidebarProps) {
  const { isOpen, toggle, hydrated } = useSidebar();

  if (!hydrated) return null;

  return (
    <aside
      className={cn(
        "hidden lg:flex",
        "sticky top-0 h-screen shrink-0",
        "border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        "transition-[width] duration-300 ease-in-out",
        isOpen ? "w-80" : "w-10",
      )}
    >
      {/* Toggle strip */}
      <button
        onClick={toggle}
        className={cn(
          "flex w-10 shrink-0 items-center justify-center",
          "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600",
          "dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
          "transition-colors",
        )}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Content */}
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          "transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none w-0 opacity-0",
        )}
      >
        <div className="space-y-5 p-4">{children}</div>
      </div>
    </aside>
  );
}

export function SidebarSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
