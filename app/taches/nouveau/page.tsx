import { createClient } from "@supabase/supabase-js";
import NewTaskForm from "@/components/NewTaskForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function NouvelleTachePage() {
  const { data: profiles, error } = await supabaseServer
    .from("profiles")
    .select("id, nom")
    .order("nom", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">Erreur profiles : {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvelle tâche</h1>

        <p className="mt-3 text-zinc-400">
          Créer et assigner une tâche équipe.
        </p>

        <p className="mt-3 text-sm text-zinc-500">
          {profiles?.length || 0} membre(s) disponible(s)
        </p>
      </div>

      <NewTaskForm profiles={profiles || []} />
    </main>
  );
}