import Link from "next/link";
import { supabase } from "@/lib/supabase";
import KanbanBoard from "@/components/KanbanBoard";

export default async function TachesPage() {
  const { data: taches, error } = await supabase
    .from("taches")
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
            Rollout Kanban
          </h1>

          <p className="text-zinc-400 mt-2">
            Gestion du rollout LMG
          </p>
        </div>

        <Link
          href="/taches/nouveau"
          className="rounded-xl bg-white text-black px-5 py-3 font-semibold"
        >
          + Nouvelle tâche
        </Link>

      </div>

      <KanbanBoard taches={taches || []} />

    </main>
  );
}