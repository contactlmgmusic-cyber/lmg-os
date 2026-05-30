"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    contratsASigner: 0,
    bookingsConfirmes: 0,
    mediasRelance: 0,
    revenusMois: 0,
    depensesMois: 0,
    resultatMois: 0,
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [upcomingProjects, setUpcomingProjects] = useState<any[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);

  function monthStart() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }

  async function loadDashboard() {
    const start = monthStart();

    const { count: artistesCount } = await supabaseBrowser
      .from("artistes")
      .select("*", { count: "exact", head: true });

    const { count: projetsCount } = await supabaseBrowser
      .from("projets")
      .select("*", { count: "exact", head: true });

    const { count: tachesCount } = await supabaseBrowser
      .from("taches")
      .select("*", { count: "exact", head: true })
      .neq("statut", "Terminé");

    const { count: contratsCount } = await supabaseBrowser
      .from("contrats")
      .select("*", { count: "exact", head: true })
      .neq("statut", "Signé");

    const { count: bookingsConfirmesCount } = await supabaseBrowser
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("statut", "Confirmé");

    const { count: mediasRelanceCount } = await supabaseBrowser
      .from("medias")
      .select("*", { count: "exact", head: true })
      .eq("statut", "Relancé");

    const { data: finances } = await supabaseBrowser
      .from("finances")
      .select("*")
      .gte("date_operation", start);

    const revenus =
      finances
        ?.filter((f: any) => f.type === "Revenu")
        .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

    const depenses =
      finances
        ?.filter((f: any) => f.type === "Dépense")
        .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

    const { data: projects } = await supabaseBrowser
      .from("projets")
      .select("id, titre, date_sortie, statut")
      .not("date_sortie", "is", null)
      .order("date_sortie", { ascending: true })
      .limit(5);

    const { data: tasks } = await supabaseBrowser
      .from("taches")
      .select("id, titre, deadline, priorite, statut")
      .eq("priorite", "Haute")
      .neq("statut", "Terminé")
      .order("deadline", { ascending: true })
      .limit(5);

    const { data: relances } = await supabaseBrowser
      .from("bookings")
      .select("id, evenement, prochaine_relance, statut")
      .not("prochaine_relance", "is", null)
      .order("prochaine_relance", { ascending: true })
      .limit(5);

    const { data: logs } = await supabaseBrowser
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    setStats({
      artistes: artistesCount || 0,
      projets: projetsCount || 0,
      taches: tachesCount || 0,
      contratsASigner: contratsCount || 0,
      bookingsConfirmes: bookingsConfirmesCount || 0,
      mediasRelance: mediasRelanceCount || 0,
      revenusMois: revenus,
      depensesMois: depenses,
      resultatMois: revenus - depenses,
    });

    setUpcomingProjects(projects || []);
    setUrgentTasks(tasks || []);
    setFollowUps(relances || []);
    setActivityLogs(logs || []);
  }

  useEffect(() => {
    loadDashboard();

    const channel = supabaseBrowser
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
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

        <h1 className="text-6xl font-bold">Executive P & DG</h1>

        <p className="mt-3 text-zinc-400">
          Vue globale du label : business, finance, sorties, contrats et opérations.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard label="CA du mois" value={`${stats.revenusMois.toFixed(2)} €`} tone="green" />
        <KpiCard label="Dépenses du mois" value={`${stats.depensesMois.toFixed(2)} €`} tone="red" />
        <KpiCard label="Résultat du mois" value={`${stats.resultatMois.toFixed(2)} €`} />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Artistes" value={stats.artistes} />
        <KpiCard label="Projets" value={stats.projets} />
        <KpiCard label="Tâches ouvertes" value={stats.taches} />
        <KpiCard label="Contrats à signer" value={stats.contratsASigner} />
        <KpiCard label="Bookings confirmés" value={stats.bookingsConfirmes} />
        <KpiCard label="Médias relancés" value={stats.mediasRelance} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Sorties à venir" href="/projets">
          {upcomingProjects.length === 0 && (
            <p className="text-zinc-500">Aucune sortie planifiée.</p>
          )}

          {upcomingProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projets/${project.id}`}
              className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
            >
              <h3 className="text-lg font-semibold">{project.titre}</h3>
              <p className="mt-2 text-sm text-zinc-500">
                {project.date_sortie || "Date non renseignée"} • {project.statut || "Statut"}
              </p>
            </Link>
          ))}
        </Panel>

        <Panel title="Tâches urgentes" href="/taches">
          {urgentTasks.length === 0 && (
            <p className="text-zinc-500">Aucune tâche urgente.</p>
          )}

          {urgentTasks.map((task) => (
            <Link
              key={task.id}
              href={`/taches/${task.id}`}
              className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
            >
              <h3 className="text-lg font-semibold">{task.titre}</h3>
              <p className="mt-2 text-sm text-zinc-500">
                {task.deadline || "Sans deadline"} • {task.priorite}
              </p>
            </Link>
          ))}
        </Panel>

        <Panel title="Relances booking" href="/booking">
          {followUps.length === 0 && (
            <p className="text-zinc-500">Aucune relance booking.</p>
          )}

          {followUps.map((booking) => (
            <Link
              key={booking.id}
              href={`/booking/${booking.id}`}
              className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
            >
              <h3 className="text-lg font-semibold">{booking.evenement}</h3>
              <p className="mt-2 text-sm text-zinc-500">
                {booking.prochaine_relance || "Date non renseignée"} • {booking.statut || "Statut"}
              </p>
            </Link>
          ))}
        </Panel>
      </div>

      <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-3xl font-bold">Activité récente</h2>

        <div className="space-y-4">
          {activityLogs.length === 0 && (
            <p className="text-zinc-500">Aucune activité pour le moment.</p>
          )}

          {activityLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-zinc-800 bg-black p-5"
            >
              <p className="text-sm text-zinc-500">{log.type || "activité"}</p>

              <h3 className="mt-1 text-lg font-semibold">{log.titre}</h3>

              <p className="mt-2 text-sm text-zinc-400">{log.description}</p>

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

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "border-green-500/30 bg-green-500/10"
      : tone === "red"
      ? "border-red-500/30 bg-red-500/10"
      : "border-zinc-800 bg-zinc-900";

  return (
    <div className={`rounded-3xl border p-6 ${toneClass}`}>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

        <Link href={href} className="text-sm text-zinc-400 hover:text-white">
          Voir →
        </Link>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}