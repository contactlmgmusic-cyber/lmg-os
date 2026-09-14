import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import ReleasePlannerWorkspace from "@/components/ReleasePlannerWorkspace";

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
  const supabase = await createAuthenticatedSupabaseClient();
  const profile = await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.ARTISTIC_DIRECTOR,
]);

const isManager =
  profile.role === ROLES.MANAGER;

let sortiesQuery = supabase
  .from("sorties")
  .select(
    isManager
      ? `
        *,
        artistes!inner (
          id,
          nom,
          manager_id
        ),
        projets (
          id,
          titre
        )
      `
      : `
        *,
        artistes (
          id,
          nom
        ),
        projets (
          id,
          titre
        )
      `
  )
  .order("date_sortie", {
    ascending: true,
  });

if (isManager) {
  sortiesQuery = sortiesQuery.eq(
    "artistes.manager_id",
    profile.id
  );
}

const {
  data: sorties,
  error: sortiesError,
} = await sortiesQuery;

if (sortiesError) {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <p className="text-red-400">
        Impossible de charger le Release Planner.
      </p>

      <p className="mt-2 text-sm text-zinc-500">
        {sortiesError.message}
      </p>
    </main>
  );
}

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

  return <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10"><header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">Production · LMG Music</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Planning des sorties</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Sécurise chaque release, de la production jusqu’à l’analyse post-sortie.</p></div><Link href="/sorties/nouveau" className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-black hover:bg-zinc-200">+ Nouvelle sortie</Link></header><ReleasePlannerWorkspace releases={sortedSorties} /></main>;
}
