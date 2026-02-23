export default function MockDashboard() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-2xl">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <div className="h-2.5 w-24 rounded bg-zinc-700" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded bg-zinc-800" />
          <div className="h-6 w-16 rounded bg-zinc-800" />
        </div>
      </div>

      {/* KPI cards row */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Всего звонков", value: "12,847", color: "text-blue-400" },
          { label: "Обработано", value: "11,932", color: "text-emerald-400" },
          { label: "Ошибки", value: "215", color: "text-red-400" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-white/5 bg-zinc-800/80 p-3"
          >
            <div className="text-[10px] text-zinc-500">{card.label}</div>
            <div className={`mt-1 text-lg font-bold ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Metric pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "AHT", value: "4:32", status: "bg-emerald-500/20 text-emerald-400" },
          { label: "CSAT", value: "87%", status: "bg-emerald-500/20 text-emerald-400" },
          { label: "FCR", value: "72%", status: "bg-yellow-500/20 text-yellow-400" },
          { label: "NPS", value: "+42", status: "bg-emerald-500/20 text-emerald-400" },
          { label: "Скрипт", value: "91%", status: "bg-emerald-500/20 text-emerald-400" },
        ].map((m) => (
          <div
            key={m.label}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium ${m.status}`}
          >
            {m.label}: {m.value}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sentiment pie */}
        <div className="rounded-lg border border-white/5 bg-zinc-800/80 p-3">
          <div className="mb-2 text-[10px] font-medium text-zinc-500">
            Тональность
          </div>
          <div className="flex items-center justify-center py-2">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="113 75" strokeDashoffset="0" />
              <circle cx="40" cy="40" r="30" fill="none" stroke="#eab308" strokeWidth="8" strokeDasharray="38 150" strokeDashoffset="-113" />
              <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="37 151" strokeDashoffset="-151" />
            </svg>
          </div>
          <div className="flex justify-center gap-3 text-[9px]">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Позитив 60%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Нейтрал 20%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Негатив 20%
            </span>
          </div>
        </div>

        {/* Trend chart */}
        <div className="rounded-lg border border-white/5 bg-zinc-800/80 p-3">
          <div className="mb-2 text-[10px] font-medium text-zinc-500">
            Объём звонков
          </div>
          <div className="flex items-end gap-1 px-1 py-2">
            {[40, 55, 45, 65, 50, 70, 60, 75, 68, 80, 72, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-blue-500/60"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-3 rounded-lg border border-white/5 bg-zinc-800/80 p-3">
        <div className="mb-2 text-[10px] font-medium text-zinc-500">
          Тепловая карта нагрузки
        </div>
        <div className="grid grid-cols-12 gap-0.5">
          {Array.from({ length: 84 }).map((_, i) => {
            const intensity = Math.random();
            const bg =
              intensity > 0.7
                ? "bg-blue-500"
                : intensity > 0.4
                  ? "bg-blue-500/50"
                  : intensity > 0.15
                    ? "bg-blue-500/20"
                    : "bg-zinc-700/50";
            return (
              <div key={i} className={`aspect-square rounded-[2px] ${bg}`} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
