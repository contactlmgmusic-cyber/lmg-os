import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SplitsPage() {
  const { data: splits, error } = await supabase
    .from("splits")
    .select(`
      *,
      projets ( id, titre ),
      artistes ( id, nom )
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
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Royalties
          </p>

          <h1 className="text-5xl font-bold">Split Sheets</h1>

          <p className="mt-3 text-zinc-400">
            Répartition des droits, auteurs, compositeurs et producteurs.
          </p>
        </div>

        <Link
          href="/splits/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Nouveau split
        </Link>
      </div>

      {(!splits || splits.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Aucun split sheet ajouté.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {splits?.map((split: any) => (
          <Link
            key={split.id}
            href={`/splits/${split.id}`}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-500">
              {split.projets?.titre || "Projet non lié"}
            </p>

            <h2 className="mt-2 text-2xl font-bold">{split.titre}</h2>

            <p className="mt-3 text-sm text-zinc-400">
              Artiste : {split.artistes?.nom || "Non lié"}
            </p>

            <span className="mt-5 inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
              {split.statut || "Brouillon"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}