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

      const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

const releaseDate = sortie.date_sortie
  ? new Date(sortie.date_sortie)
  : null;

if (releaseDate) {
  releaseDate.setHours(0, 0, 0, 0);
}

const daysUntilRelease = releaseDate
  ? Math.ceil(
      (releaseDate.getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  : null;

let urgencyLabel = "Date inconnue";
let urgencyLevel = "neutral";

if (daysUntilRelease !== null) {
  if (daysUntilRelease < 0) {
    if (progress >= 100) {
      urgencyLabel = "Sortie publiée";
      urgencyLevel = "success";
    } else {
      urgencyLabel = `En retard de ${Math.abs(daysUntilRelease)} j`;
      urgencyLevel = "danger";
    }
  } else if (daysUntilRelease === 0) {
    urgencyLabel = "Sortie aujourd’hui";
    urgencyLevel = "danger";
  } else if (daysUntilRelease <= 7) {
    urgencyLabel = `J-${daysUntilRelease}`;
    urgencyLevel = "danger";
  } else if (daysUntilRelease <= 30) {
    urgencyLabel = `J-${daysUntilRelease}`;
    urgencyLevel = "warning";
  } else {
    urgencyLabel = `J-${daysUntilRelease}`;
    urgencyLevel = "normal";
  }
}

      return {
        ...sortie,
        tasksTotal: tasks.length,
        tasksDone: doneTasks,
        progress,
        progressLabel: getProgressLabel(progress),
        daysUntilRelease,
        urgencyLabel,
        urgencyLevel,
      };
    }) || [];

    const today = new Date();
today.setHours(0, 0, 0, 0);

const totalReleases = enrichedSorties.length;

const readyReleases = enrichedSorties.filter(
  (sortie: any) => sortie.progress >= 100
).length;

const lateReleases = enrichedSorties.filter((sortie: any) => {
  if (!sortie.date_sortie || sortie.progress >= 100) {
    return false;
  }

  const releaseDate = new Date(sortie.date_sortie);
  releaseDate.setHours(0, 0, 0, 0);

  return releaseDate < today;
}).length;

const upcomingReleases = enrichedSorties.filter((sortie: any) => {
  if (!sortie.date_sortie) return false;

  const releaseDate = new Date(sortie.date_sortie);
  releaseDate.setHours(0, 0, 0, 0);

  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() + 30);

  return releaseDate >= today && releaseDate <= limitDate;
}).length;

const averageProgress =
  totalReleases > 0
    ? Math.round(
        enrichedSorties.reduce(
          (total: number, sortie: any) =>
            total + sortie.progress,
          0
        ) / totalReleases
      )
    : 0;

const urgencyPriority: Record<string, number> = {
  danger: 1,
  warning: 2,
  normal: 3,
  neutral: 4,
  success: 5,
};

const sortedSorties = [...enrichedSorties].sort(
  (a: any, b: any) => {
    const priorityDifference =
      (urgencyPriority[a.urgencyLevel] || 99) -
      (urgencyPriority[b.urgencyLevel] || 99);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    if (
      a.daysUntilRelease === null &&
      b.daysUntilRelease === null
    ) {
      return 0;
    }

    if (a.daysUntilRelease === null) return 1;
    if (b.daysUntilRelease === null) return -1;

    return a.daysUntilRelease - b.daysUntilRelease;
  }
);

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

<section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
    <p className="text-sm text-zinc-500">
      Sorties suivies
    </p>

    <p className="mt-3 text-3xl font-black">
      {totalReleases}
    </p>
  </div>

  <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6">
    <p className="text-sm text-blue-300">
      Dans les 30 jours
    </p>

    <p className="mt-3 text-3xl font-black">
      {upcomingReleases}
    </p>
  </div>

  <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
    <p className="text-sm text-emerald-300">
      Prêtes
    </p>

    <p className="mt-3 text-3xl font-black">
      {readyReleases}
    </p>
  </div>

  <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
    <p className="text-sm text-red-300">
      En retard
    </p>

    <p className="mt-3 text-3xl font-black">
      {lateReleases}
    </p>
  </div>

  <div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6">
    <p className="text-sm text-purple-300">
      Progression moyenne
    </p>

    <p className="mt-3 text-3xl font-black">
      {averageProgress}%
    </p>
  </div>
</section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedSorties.map((sortie: any) => (
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

              <div className="flex flex-col items-end gap-2">
  <span
    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
      sortie.urgencyLevel === "danger"
        ? "border-red-500/40 bg-red-500/10 text-red-300"
        : sortie.urgencyLevel === "warning"
        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
        : sortie.urgencyLevel === "success"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
        : "border-zinc-700 bg-black text-zinc-300"
    }`}
  >
    {sortie.urgencyLabel}
  </span>

  <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs text-zinc-300">
    {sortie.progressLabel}
  </span>
</div>
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
  className={`h-full rounded-full transition-all ${
    sortie.progress >= 100
      ? "bg-emerald-500"
      : sortie.progress >= 70
      ? "bg-blue-500"
      : sortie.progress >= 40
      ? "bg-yellow-500"
      : "bg-red-500"
  }`}
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