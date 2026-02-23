"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "speechlyt-sidebar-open";

export function useSidebar(defaultOpen: boolean = true) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsOpen(stored === "true");
    }
    setHydrated(true);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { isOpen, toggle, hydrated };
}
