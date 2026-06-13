"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

type GraphRow = {
  date: string;
  streams: number;
  vues: number;
  followers: number;
  revenus: number;
};

export default function AnalyticsGraphsPage() {
  const [data, setData] = useState<GraphRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profile?.role !== ROLES.SUPER_ADMIN &&
        profile?.role !== ROLES.ADMIN
      ) {
        window.location.href = "/";
        return;
      }

      const { data: analytics } = await supabaseBrowser
        .from("analytics")
        .select("*")
        .not("date_snapshot", "is", null)
        .order("date_snapshot", { ascending: true });

      const map = new Map<string, GraphRow>();

      analytics?.forEach((row: any) => {
        const date = row.date_snapshot;
        if (!date) return;

        const current =
          map.get(date) || {
            date,
            streams: 0,
            vues: 0,
            followers: 0,
            revenus: 0,
          };

        current.streams += Number(row.streams || 0);
        current.vues += Number(row.vues || 0);
        current.followers += Number(row.followers || 0);
        current.revenus += Number(row.revenus || 0);

        map.set(date, current);
      });

      setData(Array.from(map.values()));
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Analytics
        </p>

        <h1 className="text-5xl font-bold">Graphiques analytics</h1>

        <p className="mt-3 text-zinc-400">
          Évolution des streams, vues, followers et revenus dans le temps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ChartCard title="Streams" dataKey="streams" data={data} />
        <ChartCard title="Vues" dataKey="vues" data={data} />
        <ChartCard title="Followers" dataKey="followers" data={data} />
        <ChartCard title="Revenus (€)" dataKey="revenus" data={data} />
      </div>
    </main>
  );
}

function ChartCard({
  title,
  dataKey,
  data,
}: {
  title: string;
  dataKey: keyof GraphRow;
  data: GraphRow[];
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <h2 className="mb-6 text-3xl font-bold">{title}</h2>

      {data.length === 0 ? (
        <p className="text-zinc-500">Aucune donnée disponible.</p>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#ffffff"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}