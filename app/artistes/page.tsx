import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ArtistesPage() {
  const { data: artistes, error } = await supabase
    .from("artistes")
    .select("*")
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
          <h1 className="text-5xl font-bold">Artistes</h1>
          <p className="mt-2 text-zinc-400">Gestion des artistes LMG</p>
        </div>

        <a
          href="/artistes/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Nouvel artiste
        </a>
      </div>

      {(!artistes || artistes.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">Aucun artiste pour le moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {artistes?.map((artiste) => (
          <div
            key={artiste.id}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
          >
            <div className="h-64 bg-zinc-800">
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
              <h2 className="text-2xl font-bold">{artiste.nom}</h2>

              <p className="mt-2 text-zinc-400">
                {artiste.style || "Style non renseigné"}
              </p>

              <p className="mt-3 text-sm text-zinc-500">
                {artiste.instagram ? `@${artiste.instagram}` : "Aucun Instagram"}
              </p>

              <a
                href={`/artistes/${artiste.id}`}
                className="mt-6 block rounded-xl bg-white px-5 py-3 text-center font-medium text-black hover:bg-zinc-200"
              >
                Voir profil
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}