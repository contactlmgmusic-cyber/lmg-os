import Link from "next/link";
import { supabase } from "@/lib/supabase";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TachesPage() {
  const { data: taches, error } = await supabase
    .from("taches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          Erreur chargement tâches : {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Workspace
          </p>

          <h1 className="text-5xl font-bold">
            Gestion des tâches
          </h1>

          <p className="mt-3 text-zinc-400">
            Organisation opérationnelle du label.
          </p>
        </div>

        <Link
          href="/taches/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
        >
          + Nouvelle tâche
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-red-500 bg-red-500/10 p-4 text-red-300">
        DEBUG : {taches?.length || 0} tâche(s) récupérée(s)
      </div>

      <KanbanBoard taches={taches || []} />

      <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-2xl font-bold">
          Liste brute des tâches récupérées
        </h2>

        <div className="space-y-3">
          {taches?.map((tache) => (
            <div
              key={tache.id}
              className="rounded-xl border border-zinc-800 bg-black p-4 text-sm"
            >
              <p>Titre : {tache.titre}</p>
              <p>Statut : {tache.statut || "vide"}</p>
              <p>Créée le : {tache.created_at}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}