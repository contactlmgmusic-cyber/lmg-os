"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ArtistAnalyticsChart({
  data,
}: {
  data: any[];
}) {
  const formattedData = [...data]
    .reverse()
    .map((item) => ({
      date: new Date(item.date_snapshot).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      streams: Number(item.streams || 0),
      followers: Number(item.followers || 0),
      vues: Number(item.vues || 0),
      revenus: Number(item.revenus || 0),
    }));

  return (
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <h2 className="text-3xl font-bold">
        Évolution analytics
      </h2>

      <p className="mt-2 text-zinc-500">
        Progression des performances par snapshot.
      </p>

      <div className="mt-8 h-[350px]">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="streams"
                strokeWidth={3}
                name="Streams"
              />

              <Line
                type="monotone"
                dataKey="followers"
                strokeWidth={3}
                name="Followers"
              />

              <Line
                type="monotone"
                dataKey="vues"
                strokeWidth={3}
                name="Vues"
              />

            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-zinc-500">
            Aucun historique analytics disponible.
          </p>
        )}
      </div>
    </section>
  );
}