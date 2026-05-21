import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ProjetsPage() {
  const { data: projets, error } = await supabase
    .from("projets")
    .select(`
      *,
      artistes (
        nom
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">Projets</h1>
          <p className="mt-2 text-zinc-400">Singles, EP, albums et rollouts LMG</p>
        </div>

        <a
          href="/projets/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Nouveau projet
        </a>
      </div>

      {(!projets || projets.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">Aucun projet pour le moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projets?.map((projet) => (
          <div
            key={projet.id}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
          >
            <div className="aspect-square bg-zinc-800">
              {projet.cover_url ? (
                <img
                  src={projet.cover_url}
                  alt={projet.titre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Aucune cover
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-sm text-zinc-500">
                {projet.type || "Projet"}
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {projet.titre}
              </h2>

              <p className="mt-2 text-zinc-400">
                {projet.artistes?.nom || "Artiste non lié"}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  {projet.statut || "Statut non renseigné"}
                </span>

                <span className="text-sm text-zinc-500">
                  {projet.date_sortie || "Date non renseignée"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}