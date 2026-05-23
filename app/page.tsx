"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type ActivityLog = {
  id: string;
  type: string | null;
  titre: string | null;
  description: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    artistes: 0,
    projets: 0,
    taches: 0,
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  async function loadDashboard() {
    const { count: artistesCount } = await supabaseBrowser
      .from("artistes")
      .select("*", { count: "exact", head: true });

    const { count: projetsCount } = await supabaseBrowser
      .from("projets")
      .select("*", { count: "exact", head: true });

    const { count: tachesCount } = await supabaseBrowser
      .from("taches")
      .select("*", { count: "exact", head: true });

    const { data: logs } = await supabaseBrowser
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    setStats({
      artistes: artistesCount || 0,
      projets: projetsCount || 0,
      taches: tachesCount || 0,
    });

    setActivityLogs(logs || []);
  }

  useEffect(() => {
    loadDashboard();

    const channel = supabaseBrowser
      .channel("realtime-activity")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_logs",
        },
        async () => {
          await loadDashboard();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Legacy Music Group
        </p>

        <h1 className="text-6xl font-bold">Cockpit LMG</h1>

        <p className="mt-3 text-zinc-400">
          Vue globale de l’activité label.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Artistes</p>

          <p className="mt-3 text-5xl font-bold">
            {stats.artistes}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Projets</p>

          <p className="mt-3 text-5xl font-bold">
            {stats.projets}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Tâches</p>

          <p className="mt-3 text-5xl font-bold">
            {stats.taches}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-3xl font-bold">
          Activité récente
        </h2>

        <div className="space-y-4">
          {activityLogs.length === 0 && (
            <p className="text-zinc-500">
              Aucune activité pour le moment.
            </p>
          )}

          {activityLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-zinc-800 bg-black p-5"
            >
              <p className="text-sm text-zinc-500">
                {log.type || "activité"}
              </p>

              <h3 className="mt-1 text-lg font-semibold">
                {log.titre}
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                {log.description}
              </p>

              <p className="mt-3 text-xs text-zinc-600">
                {new Date(log.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}