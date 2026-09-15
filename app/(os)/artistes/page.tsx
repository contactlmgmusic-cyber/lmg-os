import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ArtistesPage() {
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

  let query = supabaseAuth
    .from("artistes")
    .select("*")
    .order("created_at", { ascending: false });

  if (currentProfile?.role === ROLES.MANAGER) {
    query = query.eq("manager_id", currentProfile.id);
  }
  if (currentProfile.role === ROLES.ARTISTE) {
    query = query.eq("id", currentProfile.artiste_id || "00000000-0000-0000-0000-000000000000");
  }

  const { data: artistes, error } = await query;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  const canCreateArtist =
  currentProfile?.role === ROLES.SUPER_ADMIN ||
  currentProfile?.role === ROLES.ADMIN ||
  currentProfile?.role === ROLES.ARTISTIC_DIRECTOR;

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mb-8 flex flex-col gap-6 border-b border-zinc-900 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Roster · Développement</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">{currentProfile?.role === ROLES.MANAGER ? "Mon portefeuille artistes" : "Artistes"}</h1>

          <p className="mt-2 text-zinc-400">
            {currentProfile?.role === ROLES.MANAGER
              ? "Mes artistes assignés"
              : "Gestion des artistes LMG"}
          </p>
        </div>

        {canCreateArtist && (
          <Link
            href="/artistes/nouveau"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            + Nouvel artiste
          </Link>
        )}
      </div>

      {(!artistes || artistes.length === 0) && (
        <div className="rounded-[26px] border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-500">
          Aucun artiste trouvé.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {artistes?.map((artiste: any) => (
          <Link
            key={artiste.id}
            href={`/artistes/${artiste.id}`}
            className="group overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-zinc-600"
          >
            <div className="aspect-video bg-zinc-800">
              {artiste.photo_url ? (
                <img
                  src={artiste.photo_url}
                  alt={artiste.nom}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Aucun visuel
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-sm text-zinc-500">
                {artiste.style || "Style non renseigné"}
              </p>

              <h2 className="mt-2 text-3xl font-bold">{artiste.nom}</h2>

              <p className="mt-3 text-sm text-zinc-400">
                {artiste.statut || "Statut non renseigné"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
