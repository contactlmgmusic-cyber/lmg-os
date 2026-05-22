import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default async function TachesPage() {
  const { data: taches, error } = await supabase
    .from("taches")
    .select(`
      *,
      profiles!taches_responsable_id_fkey (
        id,
        nom,
        avatar_url,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
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
          className="rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          + Nouvelle tâche
        </Link>
      </div>

      <KanbanBoard taches={taches || []} />
    </main>
  );
}