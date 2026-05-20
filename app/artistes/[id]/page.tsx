import { supabase } from "@/lib/supabase";

export default async function ArtisteDetailPage({
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

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <div className="flex items-center gap-6 mb-10">

          {artiste.photo_url && (
            <img
              src={artiste.photo_url}
              alt={artiste.nom}
              className="w-32 h-32 rounded-3xl object-cover"
            />
          )}

          <div>
            <p className="text-zinc-400 mb-2">
              Profil artiste
            </p>

            <h1 className="text-5xl font-bold mb-2">
              {artiste.nom}
            </h1>

            <p className="text-xl text-zinc-300">
              {artiste.style}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-500 mb-2">
              Statut
            </p>

            <p>
              {artiste.statut}
            </p>
          </div>

          <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-500 mb-2">
              Instagram
            </p>

            <p>
              {artiste.instagram}
            </p>
          </div>

          <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-500 mb-2">
              ID
            </p>

            <p className="text-xs text-zinc-400 break-all">
              {artiste.id}
            </p>
          </div>

        </div>

        <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800">

          <h2 className="text-2xl font-semibold mb-3">
            Notes internes
          </h2>

          <p className="text-zinc-300">
            {artiste.notes || "Aucune note"}
          </p>

        </div>

      </div>
    </main>
  );
}