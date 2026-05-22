import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { count: artistesCount } = await supabase
    .from("artistes")
    .select("*", { count: "exact", head: true });

  const { count: projetsCount } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true });

  const { count: tachesCount } = await supabase
    .from("taches")
    .select("*", { count: "exact", head: true });

  const { data: tachesUrgentes } = await supabase
    .from("taches")
    .select("*")
    .not("deadline", "is", null)
    .order("deadline", { ascending: true })
    .limit(5);

  const { data: projetsRecents } = await supabase
    .from("projets")
    .select(`
      *,
      artistes (
        nom
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: sortiesAVenir } = await supabase
    .from("projets")
    .select(`
      *,
      artistes (
        nom
      )
    `)
    .not("date_sortie", "is", null)
    .order("date_sortie", { ascending: true })
    .limit(5);

  const { data: taches } = await supabase
    .from("taches")
    .select("statut");

  const tachesTerminees =
    taches?.filter((tache) => tache.statut === "Terminé").length || 0;

  const progression =
    taches && taches.length > 0
      ? Math.round((tachesTerminees / taches.length) * 100)
      : 0;

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Legacy Music Group
          </p>

          <h1 className="text-6xl font-bold">
            Cockpit LMG
          </h1>

          <p className="mt-3 text-zinc-400">
            Vue globale artistes, projets, tâches et prochaines sorties.
          </p>
        </div>

        <a
          href="/taches/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
        >
          + Nouvelle tâche
        </a>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Artistes</p>
          <p className="mt-3 text-5xl font-bold">{artistesCount || 0}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Projets</p>
          <p className="mt-3 text-5xl font-bold">{projetsCount || 0}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Tâches</p>
          <p className="mt-3 text-5xl font-bold">{tachesCount || 0}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Progression globale</p>
          <p className="mt-3 text-5xl font-bold">{progression}%</p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Tâches prioritaires</h2>

            <a href="/taches" className="text-sm text-zinc-400 hover:text-white">
              Voir tout
            </a>
          </div>

          <div className="space-y-4">
            {(!tachesUrgentes || tachesUrgentes.length === 0) && (
              <p className="text-zinc-500">Aucune tâche avec deadline.</p>
            )}

            {tachesUrgentes?.map((tache) => (
              <a
                key={tache.id}
                href={`/taches/${tache.id}`}
                className="block rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{tache.titre}</h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      Responsable : {tache.responsable || "Non assigné"}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Deadline : {tache.deadline}
                    </p>
                  </div>

                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                    {tache.priorite || "Priorité"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sorties à venir</h2>

            <a
              href="/projets"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Voir projets
            </a>
          </div>

          <div className="space-y-4">
            {(!sortiesAVenir || sortiesAVenir.length === 0) && (
              <p className="text-zinc-500">Aucune sortie planifiée.</p>
            )}

            {sortiesAVenir?.map((projet) => (
              <a
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="flex gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-zinc-600"
              >
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-800">
                  {projet.cover_url && (
                    <img
                      src={projet.cover_url}
                      alt={projet.titre}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div>
                  <p className="text-sm text-zinc-500">{projet.date_sortie}</p>

                  <h3 className="mt-1 font-bold">{projet.titre}</h3>

                  <p className="text-sm text-zinc-400">
                    {projet.artistes?.nom || "Artiste non lié"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Projets récents</h2>

          <a href="/projets" className="text-sm text-zinc-400 hover:text-white">
            Voir tout
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {projetsRecents?.map((projet) => (
            <a
              key={projet.id}
              href={`/projets/${projet.id}`}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-black transition hover:border-zinc-600"
            >
              <div className="aspect-square bg-zinc-800">
                {projet.cover_url && (
                  <img
                    src={projet.cover_url}
                    alt={projet.titre}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold">{projet.titre}</h3>

                <p className="mt-1 text-sm text-zinc-400">
                  {projet.artistes?.nom || "Artiste non lié"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}