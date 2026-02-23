export default function MockCalls() {
  const rows = [
    { id: "C-1247", agent: "Иванов А.", dur: "5:32", sentiment: "positive", score: 94, status: "done" },
    { id: "C-1246", agent: "Петрова М.", dur: "3:18", sentiment: "neutral", score: 82, status: "done" },
    { id: "C-1245", agent: "Сидоров К.", dur: "8:45", sentiment: "negative", score: 61, status: "done" },
    { id: "C-1244", agent: "Козлова Е.", dur: "4:12", sentiment: "positive", score: 88, status: "processing" },
    { id: "C-1243", agent: "Николаев Д.", dur: "6:55", sentiment: "positive", score: 91, status: "done" },
  ];

  const sentimentColors: Record<string, string> = {
    positive: "bg-emerald-500/20 text-emerald-400",
    neutral: "bg-yellow-500/20 text-yellow-400",
    negative: "bg-red-500/20 text-red-400",
  };

  const sentimentLabels: Record<string, string> = {
    positive: "Позитив",
    neutral: "Нейтрал",
    negative: "Негатив",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-2xl">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-zinc-400">Звонки</span>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded bg-zinc-800 px-2 py-1 text-[9px] text-zinc-500">
            Все статусы
          </div>
          <div className="h-6 w-20 rounded bg-zinc-800 px-2 py-1 text-[9px] text-zinc-500">
            Все агенты
          </div>
          <div className="h-6 rounded bg-blue-600/80 px-3 py-1 text-[9px] text-white">
            Загрузить
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-white/5">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-white/5 bg-zinc-800/60 text-zinc-500">
              <th className="px-3 py-2 text-left font-medium">ID</th>
              <th className="px-3 py-2 text-left font-medium">Оператор</th>
              <th className="px-3 py-2 text-left font-medium">Длит.</th>
              <th className="px-3 py-2 text-left font-medium">Тональность</th>
              <th className="px-3 py-2 text-left font-medium">Скрипт</th>
              <th className="px-3 py-2 text-left font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 text-zinc-300 last:border-0 hover:bg-zinc-800/40"
              >
                <td className="px-3 py-2 font-mono text-blue-400">{row.id}</td>
                <td className="px-3 py-2">{row.agent}</td>
                <td className="px-3 py-2 font-mono">{row.dur}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${sentimentColors[row.sentiment]}`}
                  >
                    {sentimentLabels[row.sentiment]}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-12 rounded-full bg-zinc-700">
                      <div
                        className="h-1 rounded-full bg-emerald-500"
                        style={{ width: `${row.score}%` }}
                      />
                    </div>
                    <span className="text-zinc-500">{row.score}%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {row.status === "done" ? (
                    <span className="text-emerald-400">Готово</span>
                  ) : (
                    <span className="text-yellow-400">Обработка...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transcription preview */}
      <div className="mt-3 rounded-lg border border-white/5 bg-zinc-800/60 p-3">
        <div className="mb-2 text-[10px] font-medium text-zinc-500">
          Транскрипция звонка C-1247
        </div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex gap-2">
            <span className="shrink-0 font-medium text-blue-400">Оператор:</span>
            <span className="text-zinc-400">Добрый день! Меня зовут Алексей, чем могу помочь?</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-medium text-emerald-400">Клиент:</span>
            <span className="text-zinc-400">Здравствуйте, хотел бы уточнить статус моего заказа...</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-medium text-blue-400">Оператор:</span>
            <span className="text-zinc-400">Конечно, давайте я проверю. Назовите номер заказа.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
