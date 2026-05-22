import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

  const { data: taches } = await supabase
    .from("taches")
    .select("id, titre, deadline, statut, priorite")
    .not("deadline", "is", null);

  const allEvents = [
    ...(projets || []).map((projet: any) => ({
      id: projet.id,
      titre: projet.titre,
      date: projet.date_sortie,
      type: "Sortie",
      couleur: "bg-violet-500",
      description: "Release projet",
      href: `/projets/${projet.id}`,
    })),

    ...(rolloutEvents || []).map((event: any) => ({
      id: event.id,
      titre: event.titre,
      date: event.date_event,
      type: event.type || "Rollout",
      couleur: "bg-cyan-500",
      description: event.projets?.titre || "Rollout",
      href: event.projets?.id ? `/projets/${event.projets.id}` : "/rollout",
    })),

    ...(taches || []).map((tache: any) => ({
      id: tache.id,
      titre: tache.titre,
      date: tache.deadline,
      type: "Tâche",
      couleur:
        tache.priorite === "Haute"
          ? "bg-red-500"
          : tache.priorite === "Moyenne"
          ? "bg-orange-500"
          : "bg-zinc-500",
      description: `Statut : ${tache.statut || "À faire"}`,
      href: `/taches/${tache.id}`,
    })),
  ].sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
  );

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Workspace
        </p>

        <h1 className="text-5xl font-bold">Calendrier global</h1>

        <p className="mt-3 text-zinc-400">
          Releases, rollout et deadlines centralisés.
        </p>
      </div>

      <div className="space-y-4">
        {allEvents.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
            Aucun événement planifié.
          </div>
        )}

        {allEvents.map((event) => (
          <a
            key={`${event.type}-${event.id}`}
            href={event.href}
            className="flex items-center gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600"
          >
            <div className={`h-4 w-4 rounded-full ${event.couleur}`} />

            <div className="min-w-[90px] text-sm text-zinc-400">
              {formatDate(event.date)}
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold">{event.titre}</h2>

              <p className="text-sm text-zinc-500">{event.description}</p>
            </div>

            <div className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
              {event.type}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}