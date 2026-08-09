"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#06b6d4",
  "#a855f7",
  "#f59e0b",
  "#ec4899",
  "#3b82f6",
];

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default function BudgetAllocationChart({
  data,
}: {
  data: any[];
}) {
  const chartData = data.filter(
    (item: any) => Number(item.value || 0) > 0
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-2xl border border-zinc-800 bg-black">
        <p className="text-zinc-500">
          Aucun budget enregistré.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={3}
          >
            {chartData.map((entry: any, index: number) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) =>
              formatEuro(Number(value || 0))
            }
            contentStyle={{
              backgroundColor: "#09090b",
              border: "1px solid #3f3f46",
              borderRadius: "12px",
            }}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}