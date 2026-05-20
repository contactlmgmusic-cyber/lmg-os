import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ProjetsPage() {
  const { data: projets, error } = await supabase
    .from("projets")
    .select("*")
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
    <main className="p-10 text-white">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Projets musicaux
          </h1>

          <p className="text-zinc-400 mt-2">
            Gestion des sorties et rollouts LMG
          </p>
        </div>

        <Link
          href="/projets/nouveau"
          className="rounded-xl bg-white text-black px-5 py-3 font-semibold hover:bg-zinc-200 transition"
        >
          + Nouveau projet
        </Link>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {projets?.map((projet) => (

          <Link
            key={projet.id}
            href={`/projets/${projet.id}`}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition"
          >

            {projet.cover_url && (
              <img
                src={projet.cover_url}
                alt={projet.titre}
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-6">

              <p className="text-sm text-zinc-500 mb-2">
                {projet.type || "Projet"}
              </p>

              <h2 className="text-3xl font-bold mb-3">
                {projet.titre}
              </h2>

              <div className="space-y-2 text-zinc-400">

                <p>
                  Statut : {projet.statut || "Non renseigné"}
                </p>

                <p>
                  Sortie :{" "}
                  {projet.date_sortie || "Non renseignée"}
                </p>

                <p>
                  Budget promo :{" "}
                  {projet.budget_promo
                    ? `${projet.budget_promo} €`
                    : "Non renseigné"}
                </p>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </main>
  );
}