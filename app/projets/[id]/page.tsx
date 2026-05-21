import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: projet, error } = await supabase
    .from("projets")
    .select(`
      *,
      artistes (
        id,
        nom,
        style,
        photo_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !projet) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Projet introuvable.</p>
      </main>
    );
  }

  return (
    <main className="text-white">
      <div className="relative h-[460px] overflow-hidden">
        {projet.cover_url ? (
          <img
            src={projet.cover_url}
            alt={projet.titre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-500">
            Aucune cover
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

        <div className="absolute bottom-10 left-10">
          <Link
            href="/projets"
            className="mb-5 block text-sm text-zinc-300 hover:text-white"
          >
            ← Retour aux projets
          </Link>

          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-400">
            Projet musical
          </p>

          <h1 className="text-6xl font-bold">{projet.titre}</h1>

          <p className="mt-3 text-xl text-zinc-300">
            {projet.artistes?.nom || "Artiste non lié"}
          </p>
        </div>
      </div>

      <section className="p-10">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Type</p>
            <p className="mt-2 text-xl font-semibold">
              {projet.type || "Non renseigné"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Statut rollout</p>
            <p className="mt-2 text-xl font-semibold">
              {projet.statut || "Non renseigné"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Date de sortie</p>
            <p className="mt-2 text-xl font-semibold">
              {projet.date_sortie || "Non renseignée"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Artiste</p>
            <p className="mt-2 text-xl font-semibold">
              {projet.artistes?.nom || "Non lié"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Notes rollout</h2>

            <p className="mt-5 leading-relaxed text-zinc-300">
              {projet.notes || "Aucune note renseignée pour ce projet."}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              {projet.artistes?.id && (
                <a
                  href={`/artistes/${projet.artistes.id}`}
                  className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:opacity-90"
                >
                  Voir artiste
                </a>
              )}

              <a
                href={`/projets/${projet.id}/modifier`}
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Modifier projet
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}