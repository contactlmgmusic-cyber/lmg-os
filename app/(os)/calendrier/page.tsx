import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CalendarFilterView from "@/components/CalendarFilterView";
import { ROLES } from "@/lib/roles";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDay(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function toDateKey(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

export default async function CalendrierPage({ searchParams }: { searchParams: Promise<{ mois?: string }> }) {
  const params = await searchParams;
  const today = new Date();
  const requestedMonth = /^\d{4}-\d{2}$/.test(params.mois || "") ? params.mois! : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [year, monthNumber] = requestedMonth.split("-").map(Number);
  const month = monthNumber - 1;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = Array.from({ length: lastDay.getDate() }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      date,
      key: date.toISOString().split("T")[0],
    };
  });

  const cookieStore = await cookies();

const supabaseAuth = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  }
);
const supabase = supabaseAuth;

const {
  data: { user },
} = await supabaseAuth.auth.getUser();

const { data: currentProfile } = user
  ? await supabase
      .from("profiles")
      .select("id, role, artiste_id")
      .eq("id", user.id)
      .single()
  : { data: null };

let projetsQuery = supabase
  .from("projets")
  .select(`
    id,
    titre,
    date_sortie,
    artiste_id,
    artistes (
      id,
      manager_id
    )
  `)
  .not("date_sortie", "is", null);

let rolloutQuery = supabase
  .from("rollout_events")
  .select(`
    id,
    titre,
    date_event,
    type,
    statut,
    projets (
      id,
      titre,
      artiste_id,
      artistes (
        id,
        manager_id
      )
    )
  `)
  .not("date_event", "is", null);

let tachesQuery = supabase
  .from("taches")
  .select(`
    id,
    titre,
    deadline,
    statut,
    priorite,
    responsable_id,
    assigned_to,
    created_by,
    task_assignees (user_id),
    projets (
      id,
      artiste_id,
      artistes (
        id,
        manager_id
      )
    )
  `)
  .not("deadline", "is", null);

if (currentProfile?.role === ROLES.MANAGER) {
  projetsQuery = projetsQuery.eq("artistes.manager_id", user?.id);
  rolloutQuery = rolloutQuery.eq("projets.artistes.manager_id", user?.id);
}

if (currentProfile?.role === ROLES.ARTISTE) {
  projetsQuery = projetsQuery.eq("artiste_id", currentProfile.artiste_id);
  rolloutQuery = rolloutQuery.eq("projets.artiste_id", currentProfile.artiste_id);
}

const { data: projets } = await projetsQuery;
const { data: rolloutEvents } = await rolloutQuery;
const { data: rawTasks } = await tachesQuery;
const isAdmin = currentProfile?.role === ROLES.SUPER_ADMIN || currentProfile?.role === ROLES.ADMIN;
const taches = isAdmin ? rawTasks || [] : (rawTasks || []).filter((task: any) => {
  const assigned = task.responsable_id === currentProfile?.id || task.assigned_to === currentProfile?.id || task.task_assignees?.some((item: { user_id: string }) => item.user_id === currentProfile?.id);
  return assigned || (currentProfile?.role === ROLES.ARTISTIC_DIRECTOR && task.created_by === currentProfile.id);
});

const { data: bookings } = await supabase
  .from("bookings")
  .select("id, evenement, ville, date_event, statut, prochaine_relance")
  .not("date_event", "is", null);

  const { data: artisteEvents } = await supabase
  .from("artiste_events")
  .select(`
    id,
    titre,
    type,
    date_event,
    heure,
    lieu,
    statut,
    artiste_id,
    artistes (
      id,
      nom
    )
  `)
  .not("date_event", "is", null);

const { data: contrats } = await supabase
  .from("contrats")
  .select("id, titre, statut, date_signature")
  .not("date_signature", "is", null);

  const events = [
    ...(projets || []).map((projet: any) => ({
      id: projet.id,
      title: projet.titre,
      date: toDateKey(projet.date_sortie),
      type: "Sortie",
      category: "Sortie",
      href: `/projets/${projet.id}`,
      color: "border-violet-500/50 bg-violet-500/10 text-violet-200",
    })),

    ...(artisteEvents || []).map((event: any) => ({
  id: `artist-event-${event.id}`,
  title: `${event.type} : ${event.titre}`,
  date: toDateKey(event.date_event),
  type: `${event.artistes?.nom || "Artiste"}${event.heure ? ` • ${event.heure}` : ""}`,
  category: "Artiste",
  href: "/calendrier",
  color: "border-blue-500/50 bg-blue-500/10 text-blue-200",
})),

    ...(rolloutEvents || []).map((event: any) => ({
      id: event.id,
      title: event.titre,
      date: toDateKey(event.date_event),
      type: event.type || "Rollout",
      category: "Rollout",
      href: event.projets?.id ? `/projets/${event.projets.id}` : "/rollout",
      color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-200",
    })),

    ...(taches || []).map((tache: any) => ({
      id: tache.id,
      title: tache.titre,
      date: toDateKey(tache.deadline),
      type: "Tâche",
      category: "Tâche",
      href: `/taches/${tache.id}`,
      color:
        tache.priorite === "Haute"
          ? "border-red-500/50 bg-red-500/10 text-red-200"
          : tache.priorite === "Moyenne"
          ? "border-orange-500/50 bg-orange-500/10 text-orange-200"
          : "border-zinc-700 bg-zinc-800 text-zinc-300",
    })),

    ...(contrats || []).map((contrat: any) => ({
  id: contrat.id,
  title: contrat.titre,
  date: toDateKey(contrat.date_signature),
  type: `Contrat ${contrat.statut || ""}`,
  category: "Contrat",
  href: `/contrats/${contrat.id}`,
  color: "border-green-500/50 bg-green-500/10 text-green-200",
})),

...(bookings || []).map((booking: any) => ({
  id: booking.id,
  title: booking.evenement,
  date: toDateKey(booking.date_event),
  type: `Booking ${booking.statut || ""}`,
  category: "Booking",
  href: "/booking",
  color: "border-pink-500/50 bg-pink-500/10 text-pink-200",
})),

...(bookings || [])
  .filter((booking: any) => booking.prochaine_relance)
  .map((booking: any) => ({
    id: `${booking.id}-relance`,
    title: `Relance : ${booking.evenement}`,
    date: toDateKey(booking.prochaine_relance),
    type: "Relance booking",
    category: "Relance",
    href: `/booking/${booking.id}`,
    color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
  })),
  ];

const canCreateTask =
  currentProfile?.role === ROLES.SUPER_ADMIN ||
  currentProfile?.role === ROLES.ADMIN ||
  currentProfile?.role === ROLES.ARTISTIC_DIRECTOR;

  const previousMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const monthKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Workspace
          </p>

          <h1 className="text-4xl font-bold capitalize tracking-tight md:text-6xl">
            {formatMonth(today)}
          </h1>

          <p className="mt-3 text-zinc-400">
            Vue mensuelle des releases, rollouts et deadlines.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/calendrier?mois=${monthKey(previousMonth)}`} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-white">← Mois précédent</Link>
          <Link href="/calendrier" className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-white">Aujourd’hui</Link>
          <Link href={`/calendrier?mois=${monthKey(nextMonth)}`} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-white">Mois suivant →</Link>
          {canCreateTask && <Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">+ Nouvelle tâche</Link>}
        </div>
      </div>

      <CalendarFilterView
  days={[
    ...Array.from({ length: (firstDay.getDay() + 6) % 7 }).map((_, index) => ({
      key: `empty-${index}`,
      day: "",
      isToday: false,
    })),
    ...days.map((day) => ({
      key: day.key,
      day: formatDay(day.date),
      isToday: day.key === toDateKey(new Date().toISOString()),
    })),
  ]}
  events={events}
/>
    </main>
  );
}
