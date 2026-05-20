import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

  const { data: taches } = await supabase
    .from("taches")
    .select("*")
    .eq("projet_id", id)
    .order("created_at", { ascending: false });

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
    <main className="min-h-screen bg-black text-white">

      {projet.cover_url && (
        <div className="relative w-full h-[400px]">

          <img
            src={projet.cover_url}
            alt={projet.titre}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/60" />

        </div>
      )}

      <div className="p-10">

        <Link
          href="/projets"
          className="text-zinc-400 hover:text-white"
        >
          ← Retour aux projets
        </Link>

        <div className="mt-8 flex items-center gap-6 mb-10">

          {projet.artistes?.photo_url && (
            <img
              src={projet.artistes.photo_url}
              alt={projet.artistes.nom}
              className="w-28 h-28 rounded-3xl object-cover border border-zinc-800"
            />
          )}

          <div>

            <p className="text-zinc-400 mb-2">
              {projet.type || "Projet"}
            </p>

            <h1 className="text-6xl font-bold mb-3">
              {projet.titre}
            </h1>

            <p className="text-2xl text-zinc-300">
              {projet.artistes?.nom || "Artiste"}
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-10">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <p className="text-zinc-500 mb-2">
              Statut
            </p>

            <p>
              {projet.statut || "Non renseigné"}
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <p className="text-zinc-500 mb-2">
              Date de sortie
            </p>

            <p>
              {projet.date_sortie || "Non renseignée"}
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <p className="text-zinc-500 mb-2">
              Budget promo
            </p>

            <p>
              {projet.budget_promo
                ? `${projet.budget_promo} €`
                : "Non renseigné"}
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <p className="text-zinc-500 mb-2">
              Artiste
            </p>

            <p>
              {projet.artistes?.nom || "Non renseigné"}
            </p>

          </div>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-10">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-3xl font-bold">
              Rollout & tâches
            </h2>

            <Link
              href="/taches/nouveau"
              className="rounded-xl bg-white text-black px-5 py-3 font-semibold hover:bg-zinc-200 transition"
            >
              + Ajouter une tâche
            </Link>

          </div>

          <div className="space-y-4">

            {taches?.length === 0 && (
              <p className="text-zinc-500">
                Aucune tâche liée à ce projet.
              </p>
            )}

            {taches?.map((tache) => (

              <div
                key={tache.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
              >

                <div className="flex items-center justify-between mb-3">

                  <h3 className="font-semibold text-lg">
                    {tache.titre}
                  </h3>

                  <span className="text-sm text-zinc-400">
                    {tache.priorite || "Priorité"}
                  </span>

                </div>

                {tache.description && (
                  <p className="text-zinc-400 mb-4">
                    {tache.description}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm text-zinc-500">

                  <p>
                    Statut : {tache.statut || "Non renseigné"}
                  </p>

                  <p>
                    Deadline :{" "}
                    {tache.deadline || "Non renseignée"}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

          <h2 className="text-3xl font-bold mb-5">
            Notes internes
          </h2>

          <p className="text-zinc-300 leading-relaxed">
            {projet.notes || "Aucune note pour le moment."}
          </p>

        </div>

      </div>

    </main>
  );
}