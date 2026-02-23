export default function MockQA() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-zinc-400">
            Контроль качества
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* QA Scorecard */}
        <div className="rounded-lg border border-white/5 bg-zinc-800/80 p-3">
          <div className="mb-3 text-[10px] font-medium text-zinc-500">
            QA-оценка: Звонок C-1247
          </div>
          <div className="space-y-2">
            {[
              { name: "Приветствие", score: 10, max: 10 },
              { name: "Выявление потребности", score: 8, max: 10 },
              { name: "Предложение решения", score: 9, max: 10 },
              { name: "Работа с возражениями", score: 7, max: 10 },
              { name: "Закрытие диалога", score: 10, max: 10 },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">{c.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-zinc-700">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${(c.score / c.max) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] font-medium text-zinc-300">
                    {c.score}/{c.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
            <span className="text-[10px] font-medium text-zinc-400">
              Итого
            </span>
            <span className="text-sm font-bold text-emerald-400">44/50</span>
          </div>
        </div>

        {/* Manager Leaderboard */}
        <div className="rounded-lg border border-white/5 bg-zinc-800/80 p-3">
          <div className="mb-3 text-[10px] font-medium text-zinc-500">
            Рейтинг операторов
          </div>
          <div className="space-y-2">
            {[
              { rank: 1, name: "Иванов А.", score: 96, calls: 342, trend: "+3" },
              { rank: 2, name: "Козлова Е.", score: 94, calls: 298, trend: "+5" },
              { rank: 3, name: "Николаев Д.", score: 91, calls: 276, trend: "-1" },
              { rank: 4, name: "Петрова М.", score: 88, calls: 312, trend: "+2" },
              { rank: 5, name: "Сидоров К.", score: 83, calls: 254, trend: "-4" },
            ].map((a) => (
              <div
                key={a.rank}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-700/30"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                    a.rank <= 3
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-zinc-700 text-zinc-500"
                  }`}
                >
                  {a.rank}
                </span>
                <span className="flex-1 text-[10px] text-zinc-300">
                  {a.name}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {a.calls} зв.
                </span>
                <span className="w-8 text-right text-[10px] font-bold text-emerald-400">
                  {a.score}%
                </span>
                <span
                  className={`text-[9px] ${
                    a.trend.startsWith("+")
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {a.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Script compliance */}
      <div className="mt-3 rounded-lg border border-white/5 bg-zinc-800/80 p-3">
        <div className="mb-2 text-[10px] font-medium text-zinc-500">
          Соблюдение скрипта: &quot;Входящий звонок — поддержка&quot;
        </div>
        <div className="flex gap-1">
          {[
            { stage: "Приветствие", done: true },
            { stage: "Идентификация", done: true },
            { stage: "Проблема", done: true },
            { stage: "Решение", done: true },
            { stage: "Доп. продажа", done: false },
            { stage: "Прощание", done: true },
          ].map((s) => (
            <div
              key={s.stage}
              className={`flex-1 rounded px-1.5 py-1 text-center text-[8px] font-medium ${
                s.done
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {s.stage}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
