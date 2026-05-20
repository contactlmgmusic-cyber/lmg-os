import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { count: artistesCount } = await supabase
    .from("artistes")
    .select("*", { count: "exact", head: true });

  const { count: projetsCount } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true });

  const { count: tachesCount } = await supabase
    .from("taches")
    .select("*", { count: "exact", head: true });

  const { data: tachesUrgentes } = await supabase
    .from("taches")
    .select("*")
    .order("deadline", { ascending: true })
    .limit(5);

  const { data: projetsRecents } = await supabase
    .from("projets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-2">LMG OS</h1>
        <p className="text-zinc-400">
          Dashboard opérationnel de Legacy Music Group
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 mb-2">Artistes</p>
          <p className="text-5xl font-bold">{artistesCount || 0}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 mb-2">Projets musicaux</p>
          <p className="text-5xl font-bold">{projetsCount || 0}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 mb-2">Tâches rollout</p>
          <p className="text-5xl font-bold">{tachesCount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Tâches prioritaires</h2>

            <Link
              href="/taches/nouveau"
              className="rounded-xl bg-white text-black px-4 py-2 font-semibold"
            >
              + Ajouter
            </Link>
          </div>

          <div className="space-y-4">
            {tachesUrgentes?.length === 0 && (
              <p className="text-zinc-500">Aucune tâche pour le moment.</p>
            )}

            {tachesUrgentes?.map((tache) => (
              <div
                key={tache.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{tache.titre}</h3>
                    <p className="text-sm text-zinc-400">
                      {tache.statut || "Statut non renseigné"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-zinc-400">
                      {tache.priorite || "Priorité"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {tache.deadline || "Sans deadline"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Projets récents</h2>

            <Link
              href="/projets/nouveau"
              className="rounded-xl bg-white text-black px-4 py-2 font-semibold"
            >
              + Nouveau
            </Link>
          </div>

          <div className="space-y-4">
            {projetsRecents?.length === 0 && (
              <p className="text-zinc-500">Aucun projet pour le moment.</p>
            )}

            {projetsRecents?.map((projet) => (
              <Link
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="block bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition"
              >
                <h3 className="font-semibold">{projet.titre}</h3>
                <p className="text-sm text-zinc-400">
                  {projet.type || "Projet"} · {projet.statut || "Statut non renseigné"}
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  Sortie : {projet.date_sortie || "Non renseignée"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}