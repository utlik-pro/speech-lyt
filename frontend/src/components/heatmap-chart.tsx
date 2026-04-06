"use client";

import type { HeatmapCell } from "@/lib/api";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface HeatmapChartProps {
  cells: HeatmapCell[];
  maxCount: number;
}

export default function HeatmapChart({ cells, maxCount }: HeatmapChartProps) {
  const grid = new Map<string, number>();
  for (const c of cells) {
    grid.set(`${c.day}-${c.hour}`, c.count);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="mb-1 ml-10 flex">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex-1 text-center text-[10px] text-zinc-400"
            >
              {h % 3 === 0 ? `${h}:00` : ""}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {DAYS.map((day, di) => (
          <div key={day} className="flex items-center gap-1">
            <span className="w-9 text-right text-xs text-zinc-500">{day}</span>
            <div className="flex flex-1 gap-px">
              {HOURS.map((h) => {
                const count = grid.get(`${di}-${h}`) || 0;
                const intensity = maxCount > 0 ? count / maxCount : 0;
                return (
                  <div
                    key={h}
                    title={`${day} ${h}:00 — ${count} звонков`}
                    className="flex-1 rounded-sm"
                    style={{
                      aspectRatio: "1",
                      backgroundColor:
                        count === 0
                          ? "rgb(228 228 231)" // zinc-200
                          : `rgba(59, 130, 246, ${0.15 + intensity * 0.85})`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="mt-2 ml-10 flex items-center gap-1 text-[10px] text-zinc-400">
          <span>Меньше</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div
              key={v}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: `rgba(59, 130, 246, ${v})` }}
            />
          ))}
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}
