import { supabase } from "@/lib/supabase";
import RolloutKanban from "@/components/RolloutKanban";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function RolloutPage() {
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
    <main className="p-10 text-white">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Rollout
          </p>

          <h1 className="text-5xl font-bold">
            Kanban rollout
          </h1>

          <p className="mt-2 text-zinc-400">
            Suivi des actions promo, contenus, clips et sorties.
          </p>
        </div>
      </div>

<RolloutKanban events={filteredEvents} />
   </main>
  );
}