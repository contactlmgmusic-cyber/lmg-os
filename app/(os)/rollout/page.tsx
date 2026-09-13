import RolloutKanban from "@/components/RolloutKanban";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ROLES } from "@/lib/roles";
import { requireRole } from "@/lib/require-role.server";

export const dynamic = "force-dynamic";

export default async function RolloutPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
  ]);

  const cookieStore = await cookies();

  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
  getAll() {
    return cookieStore.getAll();
  },
  setAll() {},
},
    }
  );
  const supabase = supabaseServer;

  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  const isArtistUser = profile?.role === ROLES.ARTISTE;
  const isManagerUser = profile?.role === ROLES.MANAGER;

  const canManageRollout =
  profile?.role === ROLES.SUPER_ADMIN ||
  profile?.role === ROLES.ADMIN ||
  profile?.role === ROLES.ARTISTIC_DIRECTOR;

  let artisteIds: string[] = [];

  if (isManagerUser) {
    const { data: managedArtists } = await supabase
      .from("artistes")
      .select("id")
      .eq("manager_id", profile.id);

    artisteIds = managedArtists?.map((a) => a.id) || [];
  }

  const { data: events, error } = await supabase
    .from("rollout_events")
    .select(`
      *,
      projets (
        id,
        titre,
        artiste_id
      )
    `)
    .order("date_event", { ascending: true });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          Erreur : {error.message}
        </p>
      </main>
    );
  }

  let filteredEvents = events || [];

  if (isArtistUser) {
    filteredEvents = filteredEvents.filter(
      (event: any) =>
        event.projets?.artiste_id === profile?.artiste_id
    );
  }

  if (isManagerUser) {
    filteredEvents = filteredEvents.filter(
      (event: any) =>
        artisteIds.includes(event.projets?.artiste_id)
    );
  }

  return (
    <main className="p-6 text-white md:p-10">
      <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Stratégie de sortie
          </p>

          <h1 className="text-5xl font-bold">
            Planning rollout
          </h1>

          <p className="mt-2 text-zinc-400">
            Orchestrez chaque contenu, activation et échéance jusqu’à la sortie.
          </p>
        </div>
        {canManageRollout && <Link href="/rollout/nouveau" className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200">+ Nouvelle action</Link>}
      </div>

<RolloutKanban
  events={filteredEvents}
  canManage={canManageRollout}
/>
   </main>
  );
}
