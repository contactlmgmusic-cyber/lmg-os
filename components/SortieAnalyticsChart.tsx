"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SortieAnalyticsChart({
  data,
}: {
  data: any[];
}) {
  const chartData = [...data]
    .reverse()
    .map((item) => ({
      date: new Date(item.date_snapshot).toLocaleDateString("fr-FR"),
      streams: Number(item.streams || 0),
      revenus: Number(item.revenus || 0),
      vues: Number(item.vues || 0),
    }));

  return (
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <h2 className="mb-6 text-3xl font-bold">
        Évolution de la sortie
      </h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="streams"
              strokeWidth={3}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}