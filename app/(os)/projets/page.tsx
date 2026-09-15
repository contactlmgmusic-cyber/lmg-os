import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ProjetsPage() {
  const currentProfile = await requireRole([
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER, ROLES.ARTISTE,
  ]);
  const cookieStore = await cookies();

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

  const isManager =
  currentProfile?.role === ROLES.MANAGER;

let query = supabaseAuth
  .from("projets")
  .select(
    isManager
      ? `
        *,
        artistes!inner (
          id,
          nom,
          manager_id
        )
      `
      : `
        *,
        artistes (
          id,
          nom,
          manager_id
        )
      `
  )
  .order("created_at", {
    ascending: false,
  });

if (isManager) {
  query = query.eq(
    "artistes.manager_id",
    currentProfile.id
  );
}

if (currentProfile.role === ROLES.ARTISTE) {
  query = query.eq(
    "artiste_id",
    currentProfile.artiste_id || "00000000-0000-0000-0000-000000000000"
  );
}

const {
  data: projets,
  error,
} = await query;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  const canCreateProject =
  currentProfile?.role === ROLES.SUPER_ADMIN ||
  currentProfile?.role === ROLES.ADMIN ||
  currentProfile?.role === ROLES.ARTISTIC_DIRECTOR ||
  currentProfile?.role === ROLES.MANAGER;

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mb-8 flex flex-col gap-6 border-b border-zinc-900 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Production · Catalogue actif</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">{currentProfile?.role === ROLES.MANAGER ? "Projets de mes artistes" : "Projets"}</h1>

          <p className="mt-2 text-zinc-400">
            {currentProfile?.role === ROLES.MANAGER
              ? "Projets de mes artistes"
              : "Singles, EP, albums et rollouts LMG"}
          </p>
        </div>

        {canCreateProject && (
          <Link
            href="/projets/nouveau"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            + Nouveau projet
          </Link>
        )}
      </div>

      {(!projets || projets.length === 0) && (
        <div className="rounded-[26px] border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-500">
          Aucun projet trouvé.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projets?.map((projet: any) => (
          <Link
            key={projet.id}
            href={`/projets/${projet.id}`}
            className="group overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-zinc-600"
          >
            <div className="aspect-video bg-zinc-800">
              {projet.cover_url ? (
                <img
                  src={projet.cover_url}
                  alt={projet.titre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Aucune cover
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-sm text-zinc-500">
                {projet.artistes?.nom || "Artiste non lié"}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {projet.titre}
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                {projet.type || "Projet"} • {projet.statut || "Statut non renseigné"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
