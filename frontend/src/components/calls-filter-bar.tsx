"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { listManagers, type ManagerResponse, type CallFilters } from "@/lib/api";

interface CallsFilterBarProps {
  filters: CallFilters;
  onChange: (filters: CallFilters) => void;
}

export default function CallsFilterBar({ filters, onChange }: CallsFilterBarProps) {
  const [managers, setManagers] = useState<ManagerResponse[]>([]);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    listManagers().then((r) => setManagers(r.items)).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        onChange({ ...filters, search: searchInput || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const update = (key: keyof CallFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Поиск по транскрипциям..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 w-56 rounded-md border border-zinc-300 bg-white pl-8 pr-3 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      {/* Agent */}
      <select
        value={filters.agent_id || ""}
        onChange={(e) => update("agent_id", e.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      >
        <option value="">Все менеджеры</option>
        {managers.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      {/* Sentiment */}
      <select
        value={filters.sentiment || ""}
        onChange={(e) => update("sentiment", e.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      >
        <option value="">Все тональности</option>
        <option value="positive">Позитивная</option>
        <option value="neutral">Нейтральная</option>
        <option value="negative">Негативная</option>
      </select>

      {/* Category */}
      <select
        value={filters.category || ""}
        onChange={(e) => update("category", e.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      >
        <option value="">Все категории</option>
        <option value="sales">Продажи</option>
        <option value="consultation">Консультация</option>
        <option value="complaint">Жалоба</option>
        <option value="service">Сервис</option>
        <option value="mortgage">Ипотека</option>
        <option value="inspection">Осмотр</option>
        <option value="contract">Договор</option>
        <option value="infrastructure">Инфраструктура</option>
      </select>

      {/* Outcome */}
      <select
        value={filters.outcome || ""}
        onChange={(e) => update("outcome", e.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      >
        <option value="">Все результаты</option>
        <option value="resolved">Решён</option>
        <option value="unresolved">Не решён</option>
        <option value="escalated">Эскалация</option>
        <option value="callback">Перезвонить</option>
      </select>

      {/* Date range */}
      <input
        type="date"
        value={filters.date_from || ""}
        onChange={(e) => update("date_from", e.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      />
      <input
        type="date"
        value={filters.date_to || ""}
        onChange={(e) => update("date_to", e.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      />

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={() => {
            setSearchInput("");
            onChange({});
          }}
          className="flex h-8 items-center gap-1 rounded-md bg-zinc-100 px-2.5 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          <X className="h-3 w-3" />
          Сбросить
        </button>
      )}
    </div>
  );
}
