import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";
import AssetUploader from "@/components/AssetUploader";
import ProjectComments from "@/components/ProjectComments";
import PermissionGate from "@/components/PermissionGate";

export const dynamic = "force-dynamic";

export default async function ProjetDetailPage({
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

  const { data: projet, error } = await supabase
    .from("projets")
    .select(`
      *,
      artistes (
        id,
        nom,
        style,
        photo_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !projet) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Projet introuvable.</p>
      </main>
    );
  }

  const isArtistUser = currentProfile?.role === "artiste";
  const isOwnProject = currentProfile?.artiste_id === projet.artiste_id;
  const canViewInternalProjectData = !isArtistUser || isOwnProject;

  const { data: rolloutEvents } = await supabase
    .from("rollout_events")
    .select("*")
    .eq("projet_id", id)
    .order("date_event", { ascending: true });

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("projet_id", id)
    .order("created_at", { ascending: false });

  const { data: taches } = await supabase
    .from("taches")
    .select(`
      *,
      profiles!taches_responsable_id_fkey (
        id,
        nom,
        avatar_url,
        role
      )
    `)
    .eq("projet_id", id)
    .order("created_at", { ascending: false });

  const { data: comments } = await supabase
    .from("commentaires_projets")
    .select("*")
    .eq("projet_id", id)
    .order("created_at", { ascending: false });

    const { data: medias } = await supabase
  .from("medias")
  .select("*")
  .eq("projet_id", id)
  .order("created_at", { ascending: false });

  

const { data: finances } = await supabase
  .from("finances")
  .select("*")
  .eq("projet_id", id);

const { data: royalties } = await supabase
  .from("royalties")
  .select("*")
  .eq("projet_id", id);

const { data: splits } = await supabase
  .from("splits")
  .select("*")
  .eq("projet_id", id);

  const revenus =
  finances
    ?.filter((f: any) => f.type === "Revenu")
    .reduce(
      (acc: number, f: any) => acc + Number(f.montant || 0),
      0
    ) || 0;

const depenses =
  finances
    ?.filter((f: any) => f.type === "Dépense")
    .reduce(
      (acc: number, f: any) => acc + Number(f.montant || 0),
      0
    ) || 0;

const resultat = revenus - depenses;

const royaltiesPayees =
  royalties
    ?.filter((r: any) => r.statut === "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

const royaltiesAPayer =
  royalties
    ?.filter((r: any) => r.statut !== "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

    const totalTaches = taches?.length || 0;

const tachesTerminees =
  taches?.filter(
    (t: any) =>
      t.statut === "Terminé" ||
      t.statut === "Terminée" ||
      t.statut === "Done"
  ).length || 0;

const avancement =
  totalTaches > 0
    ? Math.round((tachesTerminees / totalTaches) * 100)
    : 0;

  return (
    <main className="text-white">
      <div className="relative h-[460px] overflow-hidden">
        {projet.cover_url ? (
          <img
            src={projet.cover_url}
            alt={projet.titre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-500">
            Aucune cover
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

        <div className="absolute bottom-10 left-10">
          <Link
            href="/projets"
            className="mb-5 block text-sm text-zinc-300 hover:text-white"
          >
            ← Retour aux projets
          </Link>

          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-400">
            Projet musical
          </p>

          <h1 className="text-6xl font-bold">{projet.titre}</h1>

          <p className="mt-3 text-xl text-zinc-300">
            {projet.artistes?.nom || "Artiste non lié"}
          </p>
        </div>
      </div>

      <section className="p-10">
       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
    <p className="text-sm text-zinc-500">Type</p>
    <p className="mt-2 text-xl font-semibold">
      {projet.type || "Non renseigné"}
    </p>
      </div>

    <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
  <p className="text-sm text-cyan-300">Avancement projet</p>

  <p className="mt-2 text-xl font-semibold">
    {avancement}%
  </p>
</div>

<div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-6">
  <p className="text-sm text-zinc-400">
    Tâches liées
  </p>

  <p className="mt-2 text-xl font-semibold">
    {totalTaches}
  </p>
</div>

<div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6">
  <p className="text-sm text-purple-300">
    Assets projet
  </p>

  <p className="mt-2 text-xl font-semibold">
    {assets?.length || 0}
  </p>
</div>
  

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
    <p className="text-sm text-zinc-500">Statut</p>
    <p className="mt-2 text-xl font-semibold">
      {projet.statut || "Non renseigné"}
    </p>
  </div>

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
    <p className="text-sm text-zinc-500">Date de sortie</p>
    <p className="mt-2 text-xl font-semibold">
      {projet.date_sortie || "Non renseignée"}
    </p>
  </div>

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
    <p className="text-sm text-zinc-500">Artiste</p>
    <p className="mt-2 text-xl font-semibold">
      {projet.artistes?.nom || "Non lié"}
    </p>
  </div>

  <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
    <p className="text-sm text-green-300">CA généré</p>
    <p className="mt-2 text-xl font-semibold">
      {revenus.toFixed(2)} €
    </p>
  </div>

  <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
    <p className="text-sm text-red-300">Dépenses</p>
    <p className="mt-2 text-xl font-semibold">
      {depenses.toFixed(2)} €
    </p>
  </div>

  <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-6">
    <p className="text-sm text-zinc-400">Résultat net</p>
    <p className="mt-2 text-xl font-semibold">
      {resultat.toFixed(2)} €
    </p>
  </div>

  <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
    <p className="text-sm text-yellow-300">Royalties à payer</p>
    <p className="mt-2 text-xl font-semibold">
      {royaltiesAPayer.toFixed(2)} €
    </p>
  </div>
</div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {canViewInternalProjectData && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <h2 className="text-3xl font-bold">Notes rollout</h2>
                <p className="mt-5 leading-relaxed text-zinc-300">
                  {projet.notes || "Aucune note renseignée pour ce projet."}
                </p>
              </div>
            )}

            {canViewInternalProjectData && !isArtistUser && (
              <PermissionGate role={currentProfile?.role} permission="assets">
                <AssetUploader projetId={projet.id} initialAssets={assets || []} />
              </PermissionGate>
            )}

            {canViewInternalProjectData && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Tâches liées</h2>

                  {!isArtistUser && (
                    <PermissionGate role={currentProfile?.role} permission="tasks">
                      <Link
                        href="/taches/nouveau"
                        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                      >
                        + Ajouter tâche
                      </Link>
                    </PermissionGate>
                  )}
                </div>

                {(!taches || taches.length === 0) && (
                  <p className="text-zinc-500">Aucune tâche liée à ce projet.</p>
                )}

                <div className="space-y-4">
                  {taches?.map((tache: any) => (
                    <Link
                      key={tache.id}
                      href={`/taches/${tache.id}`}
                      className="block rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {tache.titre}
                          </h3>

                          {tache.description && (
                            <p className="mt-2 text-sm text-zinc-500">
                              {tache.description}
                            </p>
                          )}

                          <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-sm font-bold">
                              {tache.profiles?.avatar_url ? (
                                <img
                                  src={tache.profiles.avatar_url}
                                  alt={tache.profiles.nom || ""}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                tache.profiles?.nom?.charAt(0)?.toUpperCase() ||
                                "L"
                              )}
                            </div>

                            <div>
                              <p className="text-sm text-zinc-300">
                                {tache.profiles?.nom || "Non assigné"}
                              </p>

                              <p className="text-xs text-zinc-500">
                                {tache.deadline
                                  ? `Deadline : ${tache.deadline}`
                                  : "Deadline non renseignée"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                            {tache.statut || "À faire"}
                          </span>

                          <p className="mt-3 text-xs text-zinc-500">
                            {tache.priorite || "Priorité"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {canViewInternalProjectData && (
              <ProjectComments
                projetId={projet.id}
                initialComments={comments || []}
              />
            )}

            {canViewInternalProjectData && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Timeline rollout</h2>

                  {!isArtistUser && (
                    <PermissionGate role={currentProfile?.role} permission="projects">
                      <a
                        href={`/rollout/nouveau?projet_id=${projet.id}`}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                      >
                        + Ajouter
                      </a>
                    </PermissionGate>
                  )}
                </div>

                <div className="space-y-4">
                  {(!rolloutEvents || rolloutEvents.length === 0) && (
                    <p className="text-zinc-500">
                      Aucune action rollout liée à ce projet.
                    </p>
                  )}

                  {rolloutEvents?.map((event: any) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-zinc-800 bg-black p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-zinc-500">
                            {event.date_event || "Date non renseignée"}
                          </p>

                          <h3 className="mt-1 text-xl font-semibold">
                            {event.titre}
                          </h3>

                          <p className="mt-2 text-zinc-400">
                            {event.type || "Action rollout"}
                          </p>

                          {event.notes && (
                            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                              {event.notes}
                            </p>
                          )}
                        </div>
                        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                          {event.statut || "À faire"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

          {!isArtistUser && (
            <aside className="space-y-6">
              <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <h2 className="mb-6 text-3xl font-bold">Médias liés</h2>

                {(!medias || medias.length === 0) && (
                  <p className="text-zinc-500">Aucun média lié.</p>
                )}

                <div className="space-y-4">
                  {medias?.map((media: any) => (
                    <a
                      key={media.id}
                      href={`/medias/${media.id}`}
                      className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
                    >
                      <p className="text-sm text-zinc-500">
                        {media.type || "Média"} • {media.plateforme || "Plateforme"}
                      </p>

                      <h3 className="mt-1 text-xl font-semibold">
                        {media.nom}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        {media.statut || "À contacter"}
                      </p>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">
    Split Sheet
  </h2>

  {(!splits || splits.length === 0) && (
    <p className="text-zinc-500">
      Aucun split lié.
    </p>
  )}

  <div className="space-y-4">
    {splits?.map((split: any) => (
      <Link
        key={split.id}
        href={`/splits/${split.id}`}
        className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
      >
        <h3 className="text-xl font-semibold">
          {split.nom}
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          {split.role} • {split.pourcentage}%
        </p>
      </Link>
    ))}
  </div>
</div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-3xl font-bold">Actions</h2>

              <div className="mt-6 space-y-3">
                {projet.artistes?.id && (
                  <a
                    href={`/artistes/${projet.artistes.id}`}
                    className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:opacity-90"
                  >
                    Voir artiste
                  </a>
                )}

                <a
  href={`/chat?channel=${projet.titre
    ?.toLowerCase()
    .replace(/\s+/g, "-")}`}
  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
>
  Ouvrir le channel projet
</a>

                <PermissionGate role={currentProfile?.role} permission="projects">
  <a
    href={`/projets/${projet.id}/modifier`}
    className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
  >
    Modifier projet
  </a>
</PermissionGate>

                <a
                  href={`/rollout/nouveau?projet_id=${projet.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Ajouter action rollout
                </a>
              </div>
            </div>
            </aside>
          )}
        </div>
      </section>
    </main>
  );
}