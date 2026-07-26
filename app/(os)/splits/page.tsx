import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function SplitsPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
  ]);

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user?.id)
    .single();

  let splitsQuery = supabase
    .from("splits")
    .select(`
      *,
      projets ( id, titre ),
      artistes ( id, nom )
    `)
    .order("created_at", { ascending: false });

  if (profile?.role === ROLES.MANAGER) {
    const { data: managedArtists } = await supabase
      .from("artistes")
      .select("id")
      .eq("manager_id", profile.id);

    const artisteIds = (managedArtists || []).map(
      (artiste: any) => artiste.id
    );

    if (artisteIds.length === 0) {
      splitsQuery = splitsQuery.in("artiste_id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      splitsQuery = splitsQuery.in("artiste_id", artisteIds);
    }
  }

  const { data: splits, error } = await splitsQuery;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Royalties
          </p>

          <h1 className="text-5xl font-bold">Split Sheets</h1>

          <p className="mt-3 text-zinc-400">
            Répartition des droits, auteurs, compositeurs et producteurs.
          </p>
        </div>

        <Link
          href="/splits/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Nouveau split
        </Link>
      </div>

      {(!splits || splits.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Aucun split sheet ajouté.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {splits?.map((split: any) => (
          <Link
            key={split.id}
            href={`/splits/${split.id}`}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-500">
              {split.projets?.titre || "Projet non lié"}
            </p>

            <h2 className="mt-2 text-2xl font-bold">{split.titre}</h2>

            <p className="mt-3 text-sm text-zinc-400">
              Artiste : {split.artistes?.nom || "Non lié"}
            </p>

            <span className="mt-5 inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
              {split.statut || "Brouillon"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}