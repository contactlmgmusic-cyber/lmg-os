import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import ReleaseCatalog from "@/components/ReleaseCatalog";

export const dynamic = "force-dynamic";

export default async function SortiesPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const profile = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
  ]);

  const isManager = profile.role === ROLES.MANAGER;

  /*
   * Pour un manager, la relation artistes doit obligatoirement
   * correspondre à un artiste dont il est le manager.
   *
   * Le !inner évite de récupérer les sorties des autres artistes
   * avec simplement une relation artistes vide.
   */
  let sortiesQuery = supabase
    .from("sorties")
    .select(
      isManager
        ? `
          *,
          artistes!inner ( id, nom, manager_id ),
          projets ( id, titre )
        `
        : `
          *,
          artistes ( id, nom ),
          projets ( id, titre )
        `
    )
    .order("date_sortie", { ascending: false });

  if (isManager) {
    sortiesQuery = sortiesQuery.eq(
      "artistes.manager_id",
      profile.id
    );
  }

  const { data: sorties, error } = await sortiesQuery;

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
            Catalogue · LMG Music
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Catalogue des sorties
          </h1>

          <p className="mt-3 text-zinc-400">
            Singles, EP, albums, clips, liens DSP, UPC, ISRC et
            distribution.
          </p>
        </div>

        <Link
          href="/sorties/nouveau"
          className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-black hover:bg-zinc-200"
        >
          + Nouvelle sortie
        </Link>
      </header>
      <ReleaseCatalog releases={sorties || []} />
    </main>
  );
}
