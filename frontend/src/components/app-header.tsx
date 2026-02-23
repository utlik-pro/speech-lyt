"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectSelector from "@/components/project-selector";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/", label: "Calls" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agents", label: "Agents" },
  { href: "/scripts", label: "Scripts" },
  { href: "/qa", label: "QA" },
  { href: "/alerts", label: "Alerts" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Headphones className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            SpeechLyt
          </h1>
          <ProjectSelector />
        </div>
        <nav className="flex items-center gap-4 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                isActive(link.href)
                  ? "font-medium text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              {link.label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-1",
                  isActive("/settings")
                    ? "font-medium text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                )}
              >
                <User className="h-4 w-4" />
                <span className="max-w-[80px] truncate">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
