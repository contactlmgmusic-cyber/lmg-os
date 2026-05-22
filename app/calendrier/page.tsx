import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Projet = {
  id: string;
  titre: string;
  date_sortie: string;
  cover_url?: string;
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
    .select("id, titre, date_sortie, cover_url")
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
      href: event.projets?.id
        ? `/projets/${event.projets.id}`
        : "/projets",
      projet: event.projets?.titre || null,
    })) || [];

  const events = [
    ...projetEvents,
    ...rolloutCalendarEvents,
  ].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  return (
    <main className="p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Calendar
        </p>

        <h1 className="text-5xl font-bold">
          Calendrier rollout
        </h1>

        <p className="mt-2 text-zinc-400">
          Sorties, teasers, contenus, clips et actions promo.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        {events.length === 0 && (
          <p className="text-zinc-500">
            Aucun événement planifié.
          </p>
        )}

        <div className="space-y-4">
          {events.map((event) => (
            <a
              key={`${event.type}-${event.id}`}
              href={event.href}
              className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600 md:grid-cols-[160px_1fr_160px]"
            >
              <div>
                <p className="text-sm text-zinc-500">
                  Date
                </p>

                <p className="mt-1 font-semibold">
                  {event.date}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {event.title}
                </h2>

                {event.projet && (
                  <p className="mt-1 text-sm text-zinc-400">
                    Projet : {event.projet}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                  {event.type}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}