import { supabase } from "@/lib/supabase";

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

  const events = [
    ...(projets || []).map((projet: any) => ({
      id: projet.id,
      title: projet.titre,
      date: toDateKey(projet.date_sortie),
      type: "Sortie",
      href: `/projets/${projet.id}`,
      color: "border-violet-500/50 bg-violet-500/10 text-violet-200",
    })),

    ...(rolloutEvents || []).map((event: any) => ({
      id: event.id,
      title: event.titre,
      date: toDateKey(event.date_event),
      type: event.type || "Rollout",
      href: event.projets?.id ? `/projets/${event.projets.id}` : "/rollout",
      color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-200",
    })),

    ...(taches || []).map((tache: any) => ({
      id: tache.id,
      title: tache.titre,
      date: toDateKey(tache.deadline),
      type: "Tâche",
      href: `/taches/${tache.id}`,
      color:
        tache.priorite === "Haute"
          ? "border-red-500/50 bg-red-500/10 text-red-200"
          : tache.priorite === "Moyenne"
          ? "border-orange-500/50 bg-orange-500/10 text-orange-200"
          : "border-zinc-700 bg-zinc-800 text-zinc-300",
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

        <a
          href="/taches/nouveau"
          className="rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          + Nouvelle tâche
        </a>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-3 text-center text-sm text-zinc-500">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: (firstDay.getDay() + 6) % 7 }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="min-h-40 rounded-3xl border border-zinc-900 bg-zinc-950"
          />
        ))}

        {days.map((day) => {
          const dayEvents = events.filter((event) => event.date === day.key);
          const isToday = day.key === toDateKey(new Date().toISOString());

          return (
            <div
              key={day.key}
              className={`min-h-40 rounded-3xl border p-4 ${
                isToday
                  ? "border-white bg-zinc-900"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold">
                  {formatDay(day.date)}
                </span>

                {dayEvents.length > 0 && (
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-black">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <a
                    key={`${event.type}-${event.id}`}
                    href={event.href}
                    className={`block rounded-xl border px-3 py-2 text-xs transition hover:scale-[1.02] ${event.color}`}
                  >
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 opacity-70">{event.type}</p>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}