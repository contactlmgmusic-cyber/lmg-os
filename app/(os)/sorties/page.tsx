import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SortiesPage() {
  const { data: sorties, error } = await supabase
    .from("sorties")
    .select(`
      *,
      artistes ( id, nom ),
      projets ( id, titre )
    `)
    .order("date_sortie", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Releases
          </p>

          <h1 className="text-5xl font-bold">Gestion des sorties</h1>

          <p className="mt-3 text-zinc-400">
            Singles, EP, albums, clips, liens DSP, UPC, ISRC et distribution.
          </p>
        </div>

        <Link
          href="/sorties/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouvelle sortie
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(!sorties || sorties.length === 0) && (
          <p className="text-zinc-500">Aucune sortie créée.</p>
        )}

        {sorties?.map((sortie: any) => (
          <Link
            key={sortie.id}
            href={`/sorties/${sortie.id}`}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600"
          >
            <div className="aspect-square bg-zinc-800">
              {sortie.cover_url ? (
                <img
                  src={sortie.cover_url}
                  alt={sortie.titre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Aucune cover
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                {sortie.type || "Single"}
              </p>

              <h2 className="mt-2 text-2xl font-bold">{sortie.titre}</h2>

              <p className="mt-2 text-zinc-400">
                {sortie.artistes?.nom || "Artiste non lié"}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  {sortie.statut || "En préparation"}
                </span>

                <span className="text-sm text-zinc-500">
                  {sortie.date_sortie || "Date non renseignée"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}