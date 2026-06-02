import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CalendarFilterView from "@/components/CalendarFilterView";

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

export default async function CalendrierPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

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

const {
  data: { user },
} = await supabaseAuth.auth.getUser();

const { data: currentProfile } = user
  ? await supabase
      .from("profiles")
      .select("role, artiste_id")
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

if (currentProfile?.role === "manager") {
  projetsQuery = projetsQuery.eq("artistes.manager_id", user?.id);
  rolloutQuery = rolloutQuery.eq("projets.artistes.manager_id", user?.id);
  tachesQuery = tachesQuery.eq("projets.artistes.manager_id", user?.id);
}

if (currentProfile?.role === "artiste") {
  projetsQuery = projetsQuery.eq("artiste_id", currentProfile.artiste_id);
  rolloutQuery = rolloutQuery.eq("projets.artiste_id", currentProfile.artiste_id);
  tachesQuery = tachesQuery.eq("projets.artiste_id", currentProfile.artiste_id);
}

const { data: projets } = await projetsQuery;
const { data: rolloutEvents } = await rolloutQuery;
const { data: taches } = await tachesQuery;

const { data: bookings } = await supabase
  .from("bookings")
  .select("id, evenement, ville, date_event, statut, prochaine_relance")
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

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Workspace
          </p>

          <h1 className="text-5xl font-bold capitalize">
            {formatMonth(today)}
          </h1>

          <p className="mt-3 text-zinc-400">
            Vue mensuelle des releases, rollouts et deadlines.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
  <span className="rounded-full border border-violet-500/50 bg-violet-500/10 px-3 py-1 text-sm text-violet-200">
    Sorties
  </span>

  <span className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
    Rollout
  </span>

  <span className="rounded-full border border-green-500/50 bg-green-500/10 px-3 py-1 text-sm text-green-200">
    Contrats
  </span>

  <span className="rounded-full border border-pink-500/50 bg-pink-500/10 px-3 py-1 text-sm text-pink-200">
    Bookings
  </span>

  <span className="rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-200">
    Relances
  </span>

  <span className="rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-sm text-red-200">
    Urgences
  </span>
</div>

        {currentProfile?.role !== "artiste" && (
  <a
    href="/taches/nouveau"
    className="rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
  >
    + Nouvelle tâche
  </a>
)}
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