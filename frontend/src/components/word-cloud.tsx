"use client";

import type { WordCloudItem } from "@/lib/api";

interface WordCloudProps {
  items: WordCloudItem[];
}

const COLORS = [
  "text-blue-600",
  "text-indigo-600",
  "text-violet-600",
  "text-purple-600",
  "text-pink-600",
  "text-cyan-600",
  "text-teal-600",
  "text-emerald-600",
];

export default function WordCloud({ items }: WordCloudProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">Нет данных по словам</p>
    );
  }

  const maxCount = items[0]?.count || 1;
  const minSize = 12;
  const maxSize = 36;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-4">
      {items.map((item, i) => {
        const ratio = item.count / maxCount;
        const size = minSize + ratio * (maxSize - minSize);
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={item.word}
            title={`${item.word}: ${item.count}`}
            className={`inline-block cursor-default transition-opacity hover:opacity-70 ${color}`}
            style={{
              fontSize: `${size}px`,
              lineHeight: 1.2,
              fontWeight: ratio > 0.5 ? 600 : 400,
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
}
