import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MediaKanban from "@/components/MediaKanban";
import { ROLES } from "@/lib/roles";
import { requireRole } from "@/lib/require-role.server";

export const dynamic = "force-dynamic";

export default async function MediasPage() {
  const profile = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
  ]);

  const isManager =
    profile.role === ROLES.MANAGER;

  let query = supabase
    .from("medias")
    .select(
      isManager
        ? `
          *,
          artistes!inner (
            id,
            nom,
            manager_id
          ),
          projets (
            id,
            titre
          )
        `
        : `
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
        `
    )
    .order("created_at", {
      ascending: false,
    });

  if (isManager) {
    query = query.eq(
      "artistes.manager_id",
      profile.id
    );
  }

  const {
    data: medias,
    error,
  } = await query;

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">
          Impossible de charger les médias.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          {error.message}
        </p>
      </main>
    );
  }

  const canCreateMedia =
    profile.role === ROLES.SUPER_ADMIN ||
    profile.role === ROLES.ADMIN ||
    profile.role === ROLES.ARTISTIC_DIRECTOR ||
    profile.role === ROLES.MANAGER;

  return (
    <main className="p-10 text-white">
      <div className="mb-8 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold">
            CRM Médias
          </h1>

          <p className="mt-2 text-zinc-400">
            {isManager
              ? "Médias liés à mes artistes"
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