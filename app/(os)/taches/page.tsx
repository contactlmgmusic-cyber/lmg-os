import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import KanbanBoard from "@/components/KanbanBoard";
import { ROLES } from "@/lib/roles";
import { requireRole } from "@/lib/require-role";

export const dynamic = "force-dynamic";

export default async function TachesPage() {
  const cookieStore = await cookies();

  await requireRole(["super_admin", "admin", "manager", "prestataire"]);

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
        .maybeSingle()
    : { data: null };

  const { data: taches, error } = await supabase
  .from("taches")
  .select(`
    *,
    responsable:profiles!taches_responsable_id_fkey (
      id,
      nom,
      avatar_url,
      role
    )
  `)
  .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-4xl font-bold">Tâches</h1>
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          {error.message}
        </div>
      </main>
    );
  }

  const canCreateTask =
    currentProfile?.role === ROLES.SUPER_ADMIN ||
    currentProfile?.role === ROLES.ADMIN ||
    currentProfile?.role === ROLES.MANAGER;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold">Tâches</h1>

          <p className="mt-3 text-zinc-400">
            Pilotage opérationnel des tâches LMG
          </p>
        </div>

        {canCreateTask && (
          <Link
            href="/taches/nouveau"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            + Nouvelle tâche
          </Link>
        )}
      </div>

      <KanbanBoard taches={taches || []} />
    </main>
  );
}