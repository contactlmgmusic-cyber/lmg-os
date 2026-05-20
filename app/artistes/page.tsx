import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ArtistesPage() {
  const { data: artistes, error } = await supabase
    .from("artistes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-10 text-white">Erreur : {error.message}</main>;
  }

  return (
    <main className="p-10 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Artistes</h1>

        <Link
          href="/artistes/nouveau"
          className="rounded-xl bg-white text-black px-5 py-3 font-semibold"
        >
          + Nouvel artiste
        </Link>
      </div>

      <div className="grid gap-6">
        {artistes?.map((artiste) => (
          <div
            key={artiste.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              {artiste.photo_url && (
                <img
                  src={artiste.photo_url}
                  alt={artiste.nom}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              )}

              <div>
                <h2 className="text-2xl font-semibold">{artiste.nom}</h2>
                <p className="text-zinc-400">{artiste.style}</p>
                <p className="mt-2 text-sm text-zinc-300">
                  Statut : {artiste.statut}
                </p>
              </div>
            </div>

            <Link
              href={`/artistes/${artiste.id}`}
              className="rounded-xl bg-white text-black px-5 py-3 font-semibold"
            >
              Voir profil
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}