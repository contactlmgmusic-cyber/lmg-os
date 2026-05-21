import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ArtistesPage() {
  const { data: artistes, error } = await supabase
    .from("artistes")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          Erreur : {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">
            Artistes
          </h1>

          <p className="mt-2 text-zinc-400">
            Gestion des artistes LMG
          </p>
        </div>

        <Link
          href="/artistes/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90"
        >
          + Nouvel artiste
        </Link>
      </div>

      {(!artistes || artistes.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">
            Aucun artiste pour le moment.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {artistes?.map((artiste) => (
          <Link
            key={artiste.id}
            href={`/artistes/${artiste.id}`}
            className="group block overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:bg-zinc-950"
          >
            <div className="relative h-64 overflow-hidden bg-zinc-800">
              {artiste.photo_url ? (
                <img
                  src={artiste.photo_url}
                  alt={artiste.nom}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Aucun visuel
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-4">
                <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  {artiste.statut || "Indépendant"}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {artiste.nom}
                </h2>

                <p className="mt-2 text-zinc-400">
                  {artiste.style ||
                    "Style non renseigné"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                {artiste.instagram ? (
                  <span className="text-sm text-zinc-500">
                    @{artiste.instagram}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-600">
                    Aucun Instagram
                  </span>
                )}

                <div className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition group-hover:bg-zinc-200">
                  Voir profil
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}