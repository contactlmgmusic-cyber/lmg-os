import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ArtistesPage() {
  const { data: artistes } = await supabase
    .from("artistes")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

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
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
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
          <div
            key={artiste.id}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
          >
            <div className="h-56 bg-zinc-800">
              {artiste.photo_url ? (
                <img
                  src={artiste.photo_url}
                  alt={artiste.nom}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Aucun visuel
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-semibold">
                {artiste.nom}
              </h2>

              <p className="mt-2 text-zinc-400">
                {artiste.style || "Style non renseigné"}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  {artiste.statut || "Indépendant"}
                </span>

                {artiste.instagram && (
                  <a
                    href={`https://instagram.com/${artiste.instagram}`}
                    target="_blank"
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    @{artiste.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}