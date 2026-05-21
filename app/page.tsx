import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { count: artistesCount } = await supabase
    .from("artistes")
    .select("*", { count: "exact", head: true });

  const { count: projetsCount } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true });

  const { data: projetsRecents } = await supabase
    .from("projets")
    .select(`
      *,
      artistes (
        nom
      )
    `)
    .order("created_at", { ascending: false })
    .limit(4);

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
    .limit(4);

  return (
    <main className="p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Legacy Music Group
        </p>

        <h1 className="text-6xl font-bold">
          Dashboard
        </h1>

        <p className="mt-3 text-zinc-400">
          Vue globale artistes, projets et sorties LMG.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Artistes
          </p>
          <p className="mt-3 text-5xl font-bold">
            {artistesCount || 0}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Projets
          </p>
          <p className="mt-3 text-5xl font-bold">
            {projetsCount || 0}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Sorties à venir
          </p>
          <p className="mt-3 text-5xl font-bold">
            {sortiesAVenir?.length || 0}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Statut
          </p>
          <p className="mt-3 text-2xl font-bold">
            LMG OS Live
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Projets récents
            </h2>

            <a
              href="/projets"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Voir tout
            </a>
          </div>

          <div className="space-y-4">
            {(!projetsRecents || projetsRecents.length === 0) && (
              <p className="text-zinc-500">
                Aucun projet pour le moment.
              </p>
            )}

            {projetsRecents?.map((projet) => (
              <a
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-zinc-600"
              >
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-zinc-800">
                  {projet.cover_url && (
                    <img
                      src={projet.cover_url}
                      alt={projet.titre}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">
                    {projet.titre}
                  </h3>

                  <p className="text-sm text-zinc-400">
                    {projet.artistes?.nom || "Artiste non lié"} ·{" "}
                    {projet.statut || "Statut non renseigné"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Sorties à venir
            </h2>

            <a
              href="/projets/nouveau"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Ajouter
            </a>
          </div>

          <div className="space-y-4">
            {(!sortiesAVenir || sortiesAVenir.length === 0) && (
              <p className="text-zinc-500">
                Aucune sortie planifiée.
              </p>
            )}

            {sortiesAVenir?.map((projet) => (
              <a
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="block rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-zinc-600"
              >
                <p className="text-sm text-zinc-500">
                  {projet.date_sortie}
                </p>

                <h3 className="mt-1 font-semibold">
                  {projet.titre}
                </h3>

                <p className="text-sm text-zinc-400">
                  {projet.artistes?.nom || "Artiste non lié"}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}