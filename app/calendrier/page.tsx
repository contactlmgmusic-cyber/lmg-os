import { supabase } from "@/lib/supabase";
import CalendarEventCard from "@/components/CalendarEventCard";

export const dynamic = "force-dynamic";

type Projet = {
  id: string;
  titre: string;
  date_sortie: string;
};

type RolloutEvent = {
  id: string;
  titre: string;
  date_event: string;
  type: string;
  projets?: {
    id: string;
    titre: string;
  };
};

export default async function CalendrierPage() {
  const { data: projets } = await supabase
    .from("projets")
    .select("id, titre, date_sortie")
    .not("date_sortie", "is", null);

  const { data: rolloutEvents } = await supabase
    .from("rollout_events")
    .select(`
      id,
      titre,
      date_event,
      type,
      projets (
        id,
        titre
      )
    `)
    .not("date_event", "is", null);

  const projetEvents =
    (projets as Projet[] | null)?.map((projet) => ({
      id: projet.id,
      title: projet.titre,
      date: projet.date_sortie,
      type: "Sortie",
      href: `/projets/${projet.id}`,
      projet: null,
    })) || [];

  const rolloutCalendarEvents =
    (rolloutEvents as RolloutEvent[] | null)?.map((event) => ({
      id: event.id,
      title: event.titre,
      date: event.date_event,
      type: event.type || "Rollout",
      href: event.projets?.id ? `/projets/${event.projets.id}` : "/projets",
      projet: event.projets?.titre || null,
    })) || [];

  const events = [...projetEvents, ...rolloutCalendarEvents].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  return (
    <main className="p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Calendar
        </p>

        <h1 className="text-5xl font-bold">Calendrier rollout</h1>

        <p className="mt-2 text-zinc-400">
          Sorties, teasers, contenus, clips et actions promo.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        {events.length === 0 && (
          <p className="text-zinc-500">Aucun événement planifié.</p>
        )}

        <div className="space-y-4">
          {events.map((event) => (
            <CalendarEventCard
              key={`${event.type}-${event.id}`}
              event={event}
            />
          ))}
        </div>
      </div>
    </main>
  );
}