"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsGlobalChart({
  data,
}: {
  data: any[];
}) {

  const chartData = [...data]
    .reverse()
    .map((item) => ({
      date: new Date(item.date_snapshot).toLocaleDateString("fr-FR"),
      streams: Number(item.streams || 0),
      vues: Number(item.vues || 0),
      revenus: Number(item.revenus || 0),
      followers: Number(item.followers || 0),
    }));


  return (
    <section className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <h2 className="mb-6 text-3xl font-bold">
        Évolution globale
      </h2>


      <div className="h-[400px]">

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

            <Line
              type="monotone"
              dataKey="revenus"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </section>
  );
}