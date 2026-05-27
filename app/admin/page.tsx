import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {

  const { data: artistes } = await supabase.from("artistes").select("*");
  const { data: projets } = await supabase.from("projets").select("*");
  const { data: taches } = await supabase.from("taches").select("*");
  const { data: assets } = await supabase.from("assets").select("*");

  const urgentTasks =
    taches?.filter((t: any) => t.priorite === "Haute" && t.statut !== "Terminé") || [];

  const upcomingProjects =
    projets?.filter((p: any) => p.date_sortie && new Date(p.date_sortie) >= new Date()) || [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Admin
        </p>
        <h1 className="text-5xl font-bold">Dashboard Admin</h1>
        <p className="mt-3 text-zinc-400">
          Vue globale du label : artistes, projets, tâches et assets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Artistes", artistes?.length || 0],
          ["Projets", projets?.length || 0],
          ["Tâches urgentes", urgentTasks.length],
          ["Assets", assets?.length || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">{label}</p>
            <h2 className="mt-3 text-5xl font-bold">{value}</h2>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Prochaines sorties</h2>
          <div className="space-y-4">
            {upcomingProjects.length === 0 && <p className="text-zinc-500">Aucune sortie à venir.</p>}
            {upcomingProjects.slice(0, 6).map((projet: any) => (
              <Link key={projet.id} href={`/projets/${projet.id}`} className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600">
                <h3 className="text-xl font-semibold">{projet.titre}</h3>
                <p className="mt-2 text-sm text-zinc-500">Sortie : {projet.date_sortie}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Tâches urgentes</h2>
          <div className="space-y-4">
            {urgentTasks.length === 0 && <p className="text-zinc-500">Aucune tâche urgente.</p>}
            {urgentTasks.slice(0, 6).map((task: any) => (
              <Link key={task.id} href={`/taches/${task.id}`} className="block rounded-2xl border border-red-500/30 bg-red-500/5 p-5 hover:border-red-500/60">
                <p className="text-sm text-red-300">Priorité haute</p>
                <h3 className="mt-1 text-xl font-semibold">{task.titre}</h3>
                <p className="mt-2 text-sm text-zinc-500">{task.deadline || "Pas de deadline"}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}