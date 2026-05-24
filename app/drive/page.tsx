import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DrivePage() {
  const { data: assets, error } = await supabase
    .from("assets")
    .select(`
      *,
      projets (
        id,
        titre
      ),
      taches (
        id,
        titre
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Drive
        </p>

        <h1 className="text-5xl font-bold">Assets</h1>

        <p className="mt-3 text-zinc-400">
          Tous les fichiers uploadés sur les projets et tâches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {assets?.map((asset) => (
          <div
            key={asset.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-500">
              {asset.type || "Fichier"}
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {asset.nom}
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Projet : {asset.projets?.titre || "Non lié"}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Tâche : {asset.taches?.titre || "Non liée"}
            </p>

            <a
              href={asset.url}
              target="_blank"
              className="mt-5 block rounded-xl bg-white px-5 py-3 text-center font-medium text-black"
            >
              Ouvrir
            </a>
          </div>
        ))}

        {(!assets || assets.length === 0) && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
            Aucun fichier uploadé pour le moment.
          </div>
        )}
      </div>
    </main>
  );
}