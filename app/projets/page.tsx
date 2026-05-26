import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ProjetsPage() {
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
    .from("projets")
    .select(`
      *,
      artistes (
        id,
        nom,
        manager_id
      )
    `)
    .order("created_at", { ascending: false });

  if (currentProfile?.role === "manager") {
    query = query.eq("artistes.manager_id", user?.id);
  }

  if (currentProfile?.role === "artist") {
    query = query.or(
      `artiste_id.eq.${currentProfile.artiste_id},statut.eq.Sorti`
    );
  }

  const { data: projets, error } = await query;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  const canCreateProject =
    currentProfile?.role === "admin" ||
    currentProfile?.role === "manager";

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">Projets</h1>

          <p className="mt-2 text-zinc-400">
            {currentProfile?.role === "manager"
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
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Aucun projet trouvé.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projets?.map((projet: any) => (
          <Link
            key={projet.id}
            href={`/projets/${projet.id}`}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600"
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