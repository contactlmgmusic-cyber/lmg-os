import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import TaskWorkspace from "@/components/TaskWorkspace";
import { ROLES } from "@/lib/roles";
import { requireRole } from "@/lib/require-role.server";

export const dynamic = "force-dynamic";

export default async function TachesPage() {
  const cookieStore = await cookies();

  await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ARTISTIC_DIRECTOR,
  ROLES.MANAGER,
  ROLES.PRESTATAIRE,
]);

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
  currentProfile?.role === ROLES.ARTISTIC_DIRECTOR ||
  currentProfile?.role === ROLES.MANAGER;

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">Pilotage opérationnel</p>
          <h1 className="text-4xl font-bold md:text-5xl">Centre de travail</h1>

          <p className="mt-3 text-zinc-400">
            Priorisez, assignez et suivez l’avancement de toute l’équipe LMG.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/rollout" className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900">
            Ouvrir le rollout
          </Link>
        {canCreateTask && (
          <Link
            href="/taches/nouveau"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            + Nouvelle tâche
          </Link>
        )}
        </div>
      </div>

      <TaskWorkspace tasks={(taches || []) as any} currentUserId={currentProfile?.id} />
    </main>
  );
}
