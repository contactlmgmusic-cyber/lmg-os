import { createClient } from "@supabase/supabase-js";
import NewTaskForm from "@/components/NewTaskForm";
export const dynamic = "force-dynamic";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  (process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string
);

export default async function NouvelleTachePage() {
  const { data: profiles } = await supabaseServer
    .from("profiles")
    .select("id, nom")
    .order("nom", { ascending: true });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvelle tâche</h1>

        <p className="mt-3 text-zinc-400">
          Créer et assigner une tâche équipe.
        </p>
      </div>

      <NewTaskForm profiles={profiles || []} />
    </main>
  );
}