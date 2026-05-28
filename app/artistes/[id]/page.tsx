import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ArtisteProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const isArtistUser = currentProfile?.role === "artist";

  const isOwnArtistProfile =
  isArtistUser && currentProfile?.artiste_id === id;

const canViewInternalArtistData =
  !isArtistUser || isOwnArtistProfile;

  const { data: artiste, error } = await supabase
    .from("artistes")
    .select(`
  *,
  manager:profiles!artistes_manager_id_fkey (
    id,
    nom,
    role
  )
`)
    .eq("id", id)
    .single();

  const { data: projets } = await supabase
    .from("projets")
    .select("*")
    .eq("artiste_id", id)
    .order("created_at", { ascending: false });

  const projetIds = projets?.map((projet) => projet.id) || [];

  const { data: taches } =
    projetIds.length > 0
      ? await supabase
          .from("taches")
          .select(`
            *,
            projets (
              id,
              titre
            ),
            profiles!taches_responsable_id_fkey (
              id,
              nom,
              avatar_url,
              role
            )
          `)
          .in("projet_id", projetIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const { data: assets } =
    projetIds.length > 0
      ? await supabase
          .from("assets")
          .select(`
            *,
            projets (
              id,
              titre
            )
          `)
          .in("projet_id", projetIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const { data: activities } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("artiste_id", id)
    .order("created_at", { ascending: false })
    .limit(15);

    const visibleProjects =
  isArtistUser && !isOwnArtistProfile
    ? projets?.filter((projet) => projet.statut === "Sorti") || []
    : projets || [];

  if (error || !artiste) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Artiste introuvable.</p>
      </main>
    );
  }

  return (
  <main className="text-white">
    <div className="relative h-[420px] overflow-hidden">
      {artiste.photo_url ? (
        <img
          src={artiste.photo_url}
          alt={artiste.nom}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-500">
          Aucun visuel
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />

      <div className="absolute bottom-10 left-10">
        <Link
          href="/artistes"
          className="mb-5 block text-sm text-zinc-300 hover:text-white"
        >
          ← Retour aux artistes
        </Link>

        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-400">
          Profil artiste
        </p>

        <h1 className="text-6xl font-bold">{artiste.nom}</h1>

        <p className="mt-3 text-xl text-zinc-300">
          {artiste.style || "Style non renseigné"}
        </p>
      </div>
    </div>

    <section className="p-10">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Statut</p>

          <p className="mt-2 text-xl font-semibold">
            {artiste.statut || "Non renseigné"}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Instagram</p>

          <p className="mt-2 text-xl font-semibold">
            {artiste.instagram
              ? `@${artiste.instagram}`
              : "Non renseigné"}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Manager</p>

          <p className="mt-2 text-xl font-semibold">
            {artiste.manager?.nom || "LMG"}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Projets</p>

          <p className="mt-2 text-xl font-semibold">
            {visibleProjects?.length || 0}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Tâches</p>

          <p className="mt-2 text-xl font-semibold">
            {taches?.length || 0}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Assets</p>

          <p className="mt-2 text-xl font-semibold">
            {assets?.length || 0}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">
            Projets liés
          </h2>

          {(!visibleProjects ||
            visibleProjects.length === 0) && (
            <p className="text-zinc-500">
              Aucun projet visible.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleProjects?.map((projet) => (
              <Link
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-black transition hover:border-zinc-600"
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

                <div className="p-5">
                  <p className="text-sm text-zinc-500">
                    {projet.type || "Projet"}
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {projet.titre}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    {projet.statut || "Non renseigné"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {canViewInternalArtistData && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <h2 className="text-3xl font-bold">
                  Assets artiste
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {assets?.map((asset: any) => (
                    <a
                      key={asset.id}
                      href={asset.url}
                      target="_blank"
                      className="rounded-2xl border border-zinc-800 bg-black p-5"
                    >
                      <p className="text-sm text-zinc-500">
                        {asset.type || "Asset"}
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        {asset.nom}
                      </h3>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <h2 className="mb-6 text-3xl font-bold">
                  Tâches liées
                </h2>

                <div className="space-y-4">
                  {taches?.map((tache: any) => (
                    <div
                      key={tache.id}
                      className="rounded-2xl border border-zinc-800 bg-black p-5"
                    >
                      <h3 className="text-xl font-semibold">
                        {tache.titre}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <h2 className="mb-6 text-3xl font-bold">
                  Timeline activité
                </h2>

                <div className="space-y-4">
                  {activities?.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="rounded-2xl border border-zinc-800 bg-black p-5"
                    >
                      <p className="text-sm text-zinc-500">
                        {activity.type}
                      </p>

                      <h3 className="mt-1 text-xl font-semibold">
                        {activity.titre}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!isArtistUser && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <h2 className="text-3xl font-bold">
                  Actions
                </h2>

                <div className="mt-6 space-y-3">
                  <Link
                    href={`/artistes/${artiste.id}/modifier`}
                    className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:opacity-90"
                  >
                    Modifier artiste
                  </Link>

                  <Link
                    href="/taches/nouveau"
                    className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                  >
                    Ajouter tâche
                  </Link>

                  <Link
                    href="/drive"
                    className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                  >
                    Ouvrir Drive
                  </Link>

                  <Link
  href={`/chat?channel=artiste-${artiste.nom
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")}`}
  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
>
  Ouvrir le channel artiste
</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  </main>
);
}