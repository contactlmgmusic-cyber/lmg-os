import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function getProgress(done: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.round((done / total) * 100);
}

function getProgressLabel(progress: number) {
  if (progress >= 100) return "Prêt";
  if (progress >= 70) return "Bien avancé";
  if (progress >= 40) return "En cours";
  return "À préparer";
}

export default async function ReleasePlannerPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
  ]);

  const { data: sorties } = await supabase
    .from("sorties")
    .select(`
      *,
      artistes ( id, nom ),
      projets ( id, titre )
    `)
    .order("date_sortie", { ascending: true });

  const sortieIds = sorties?.map((sortie: any) => sortie.id) || [];

  const { data: releaseTasks } =
    sortieIds.length > 0
      ? await supabase
          .from("release_tasks")
          .select("id, sortie_id, statut")
          .in("sortie_id", sortieIds)
      : { data: [] };

  const enrichedSorties =
    sorties?.map((sortie: any) => {
      const tasks =
        releaseTasks?.filter((task: any) => task.sortie_id === sortie.id) || [];

      const doneTasks = tasks.filter(
        (task: any) => task.statut === "Terminé"
      ).length;

      const progress = getProgress(doneTasks, tasks.length);

      return {
        ...sortie,
        tasksTotal: tasks.length,
        tasksDone: doneTasks,
        progress,
        progressLabel: getProgressLabel(progress),
      };
    }) || [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Release Planner
        </p>

        <h1 className="text-5xl font-bold">Release Planner</h1>

        <p className="mt-3 text-zinc-400">
          Planifie, suis et valide les actions clés avant chaque sortie.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {enrichedSorties.map((sortie: any) => (
          <Link
            key={sortie.id}
            href={`/release-planner/${sortie.id}`}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">
                  {sortie.artistes?.nom || "Artiste non lié"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {sortie.titre}
                </h2>
              </div>

              <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs text-zinc-300">
                {sortie.progressLabel}
              </span>
            </div>

            <p className="text-zinc-400">
              {sortie.type || "Sortie"} • {sortie.statut || "Statut"}
            </p>

            <p className="mt-4 text-sm text-zinc-500">
              Date : {sortie.date_sortie || "Non renseignée"}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-500">
                  Progression
                </span>

                <span className="font-semibold">
                  {sortie.progress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-black">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${sortie.progress}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                {sortie.tasksDone} / {sortie.tasksTotal} tâches terminées
              </p>
            </div>
          </Link>
        ))}

        {enrichedSorties.length === 0 && (
          <p className="text-zinc-500">Aucune sortie disponible.</p>
        )}
      </section>
    </main>
  );
}