import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ArtisteProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: artiste, error } = await supabase
    .from("artistes")
    .select("*")
    .eq("id", id)
    .single();

  const { data: projets } = await supabase
    .from("projets")
    .select("*")
    .eq("artiste_id", id)
    .order("created_at", { ascending: false });

  if (error || !artiste) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Artiste introuvable.</p>
      </main>
    );
  }

  return (
    <main className="text-white">
      <div className="relative h-[420px] overflow-hidden">
        {artiste.photo_url ? (
          <img
            src={artiste.photo_url}
            alt={artiste.nom}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-500">
            Aucun visuel
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />

        <div className="absolute bottom-10 left-10">
          <Link
            href="/artistes"
            className="mb-5 block text-sm text-zinc-300 hover:text-white"
          >
            ← Retour aux artistes
          </Link>

          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-400">
            Profil artiste
          </p>

          <h1 className="text-6xl font-bold">{artiste.nom}</h1>

          <p className="mt-3 text-xl text-zinc-300">
            {artiste.style || "Style non renseigné"}
          </p>
        </div>
      </div>

      <section className="p-10">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Statut</p>
            <p className="mt-2 text-xl font-semibold">
              {artiste.statut || "Non renseigné"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Instagram</p>
            <p className="mt-2 text-xl font-semibold">
              {artiste.instagram ? `@${artiste.instagram}` : "Non renseigné"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Manager</p>
            <p className="mt-2 text-xl font-semibold">
              {artiste.manager || "LMG"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Ville</p>
            <p className="mt-2 text-xl font-semibold">
              {artiste.ville || "Non renseignée"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Projets</p>
            <p className="mt-2 text-xl font-semibold">
              {projets?.length || 0}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-3xl font-bold">Bio / notes internes</h2>

              <p className="mt-5 leading-relaxed text-zinc-300">
                {artiste.bio ||
                  artiste.notes ||
                  "Aucune bio ou note renseignée."}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-bold">Projets liés</h2>

                <Link
                  href="/projets/nouveau"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                >
                  + Nouveau projet
                </Link>
              </div>

              {(!projets || projets.length === 0) && (
                <p className="text-zinc-500">
                  Aucun projet lié à cet artiste pour le moment.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {projets?.map((projet) => (
                  <Link
                    key={projet.id}
                    href={`/projets/${projet.id}`}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-black transition hover:border-zinc-600"
                  >
                    <div className="aspect-video bg-zinc-800">
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

                    <div className="p-5">
                      <p className="text-sm text-zinc-500">
                        {projet.type || "Projet"}
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {projet.titre}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-400">
                        {projet.statut || "Statut non renseigné"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Sortie : {projet.date_sortie || "Non renseignée"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              <Link
                href={`/artistes/${artiste.id}/modifier`}
                className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:opacity-90"
              >
                Modifier artiste
              </Link>

              <Link
                href="/projets/nouveau"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Ajouter projet
              </Link>

              {artiste.instagram && (
                <a
                  href={`https://instagram.com/${artiste.instagram}`}
                  target="_blank"
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Ouvrir Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}