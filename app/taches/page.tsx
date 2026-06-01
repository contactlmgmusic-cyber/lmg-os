import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function TachesPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = user
    ? await supabase
        .from("profiles")
        .select("id, nom, role, artiste_id")
        .eq("id", user.id)
        .single()
    : { data: null };

  let query = supabase
    .from("taches")
    .select(`
      *,
      responsable:profiles!taches_responsable_id_fkey (
        id,
        nom,
        avatar_url,
        role
      ),
      projets (
        id,
        titre,
        artiste_id,
        artistes (
          id,
          nom,
          manager_id
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (currentProfile?.role === "artiste" && currentProfile.artiste_id) {
    query = query.eq("projet_id.artiste_id", currentProfile.artiste_id);
  }

  if (currentProfile?.role === "manager" && user?.id) {
    query = query.eq("projets.artistes.manager_id", user.id);
  }

  const { data: taches, error } = await query;

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  const canCreateTask =
    currentProfile?.role === "admin" ||
    currentProfile?.role === "manager" ||
    currentProfile?.role === "member";

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">Tâches</h1>

          <p className="mt-3 text-zinc-400">
            {currentProfile?.role === "manager"
              ? "Tâches liées à mes artistes"
              : "Pilotage opérationnel des tâches LMG"}
          </p>
        </div>

        {canCreateTask && (
          <Link
            href="/taches/nouveau"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            + Nouvelle tâche
          </Link>
        )}
      </div>

      {(!taches || taches.length === 0) && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
          Aucune tâche disponible pour le moment.
        </div>
      )}

      {taches && taches.length > 0 && <KanbanBoard taches={taches} />}
    </main>
  );
}