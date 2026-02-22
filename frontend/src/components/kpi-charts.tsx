"use client";

import type { PieLabelRenderProps } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#a1a1aa",
  negative: "#ef4444",
};

const CATEGORY_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#6366f1",
];

export function SentimentChart({
  data,
}: {
  data: Record<string, number>;
}) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
        No sentiment data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          label={(props: PieLabelRenderProps) => `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={SENTIMENT_COLORS[entry.name.toLowerCase()] || "#a1a1aa"}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart({
  data,
}: {
  data: Record<string, number>;
}) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
        No category data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({
  data,
  label,
  unit,
}: {
  data: { date: string; value: number }[];
  label: string;
  unit: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
        No trend data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value) => [`${value} ${unit}`, label]}
          labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
