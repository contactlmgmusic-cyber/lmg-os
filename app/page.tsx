import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { count: artistesCount } = await supabase
    .from("artistes")
    .select("*", { count: "exact", head: true });

  const { count: projetsCount } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true });

  const { count: tachesCount } = await supabase
    .from("taches")
    .select("*", { count: "exact", head: true });

  const { data: activityLogs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

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
          <p className="mt-3 text-5xl font-bold">{artistesCount || 0}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Projets</p>
          <p className="mt-3 text-5xl font-bold">{projetsCount || 0}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Tâches</p>
          <p className="mt-3 text-5xl font-bold">{tachesCount || 0}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-6 text-3xl font-bold">Activité récente</h2>

        <div className="space-y-4">
          {(!activityLogs || activityLogs.length === 0) && (
            <p className="text-zinc-500">
              Aucune activité pour le moment.
            </p>
          )}

          {activityLogs?.map((log) => (
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