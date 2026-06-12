import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";
import MediaKanban from "@/components/MediaKanban";
import { ROLES } from "@/lib/roles";
import { requireRole } from "@/lib/require-role.server";

export const dynamic = "force-dynamic";

export default async function MediasPage() {
  const cookieStore = await cookies();

  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

  const supabaseAuth = createServerClient(
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
  } = await supabaseAuth.auth.getUser();

  const { data: currentProfile } = user
    ? await supabase
        .from("profiles")
        .select("role, artiste_id")
        .eq("id", user.id)
        .single()
    : { data: null };

  let query = supabase
    .from("medias")
    .select(`
      *,
      artistes (
        id,
        nom,
        manager_id
      ),
      projets (
        id,
        titre
      )
    `)
    .order("created_at", { ascending: false });

  if (currentProfile?.role === ROLES.MANAGER) {
    query = query.eq("artistes.manager_id", user?.id);
  }

  if (currentProfile?.role === ROLES.ARTISTE && currentProfile?.artiste_id) {
    query = query.eq("artiste_id", currentProfile.artiste_id);
  }

  if (currentProfile?.role === ROLES.PRESTATAIRE) {
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: medias, error } = await query;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  const canCreateMedia =
    currentProfile?.role === ROLES.SUPER_ADMIN ||
    currentProfile?.role === ROLES.ADMIN ||
    currentProfile?.role === ROLES.MANAGER;

  return (
    <main className="p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">CRM Médias</h1>

          <p className="mt-2 text-zinc-400">
            {currentProfile?.role === ROLES.MANAGER
              ? "Médias liés à mes artistes"
              : currentProfile?.role === ROLES.ARTISTE
              ? "Médias liés à mes projets"
              : "Playlists, radios, blogs, journalistes et influenceurs."}
          </p>
        </div>

        <div className="flex items-center gap-3">
  <Link
    href="/medias/dashboard"
    className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
  >
    Dashboard
  </Link>

  {canCreateMedia && (
    <Link
      href="/medias/nouveau"
      className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
    >
      + Nouveau contact
    </Link>
  )}
</div>
      </div>

      <MediaKanban medias={medias || []} />
    </main>
  );
}