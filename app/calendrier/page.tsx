import { supabase } from "@/lib/supabase";
import CalendarEventCard from "../../components/CalendarEventCard";

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
  statut: string;
  projets?: {
    id: string;
    titre: string;
  };
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

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
      statut,
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
      statut: "Release",
      href: `/projets/${projet.id}`,
      projet: null,
    })) || [];

  const rolloutCalendarEvents =
    (rolloutEvents as RolloutEvent[] | null)?.map((event) => ({
      id: event.id,
      title: event.titre,
      date: event.date_event,
      type: event.type || "Rollout",
      statut: event.statut || "À faire",
      href: event.projets?.id ? `/projets/${event.projets.id}` : "/projets",
      projet: event.projets?.titre || null,
    })) || [];

  const events = [...projetEvents, ...rolloutCalendarEvents].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  const groupedEvents = events.reduce<Record<string, typeof events>>(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }

      acc[event.date].push(event);
      return acc;
    },
    {}
  );

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Calendar
          </p>

          <h1 className="text-5xl font-bold">Calendrier rollout</h1>

          <p className="mt-2 text-zinc-400">
            Vue premium des sorties, contenus, teasers et actions promo.
          </p>
        </div>

        <a
          href="/rollout/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
        >
          + Ajouter action
        </a>
      </div>

      {events.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500">Aucun événement planifié.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Événements planifiés</p>
          <p className="mt-3 text-6xl font-bold">{events.length}</p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-black p-4">
              <span className="text-zinc-400">Sorties</span>
              <span className="font-semibold">
                {events.filter((event) => event.type === "Sortie").length}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-black p-4">
              <span className="text-zinc-400">Actions promo</span>
              <span className="font-semibold">
                {events.filter((event) => event.type !== "Sortie").length}
              </span>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div
              key={date}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                    {formatDate(date)}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {dayEvents.length} action
                    {dayEvents.length > 1 ? "s" : ""}
                  </h2>
                </div>

                <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                  {date}
                </span>
              </div>

              <div className="space-y-4">
                {dayEvents.map((event) => (
                  <CalendarEventCard
                    key={`${event.type}-${event.id}`}
                    event={event}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}