import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

  const isArtistUser = currentProfile?.role === "artiste";
  const isOwnArtistProfile =
    isArtistUser && currentProfile?.artiste_id === id;

  const canViewInternalArtistData = !isArtistUser || isOwnArtistProfile;

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

  if (error || !artiste) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Artiste introuvable.</p>
      </main>
    );
  }

  const { data: projets } = await supabase
    .from("projets")
    .select("*")
    .eq("artiste_id", id)
    .order("created_at", { ascending: false });

  const projetIds = projets?.map((projet: any) => projet.id) || [];

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

      const { data: contrats } = await supabase
  .from("contrats")
  .select("*")
  .eq("artiste_id", id)
  .order("created_at", { ascending: false });

  const { data: bookings } = await supabase
  .from("bookings")
  .select("*")
  .eq("artiste_id", id)
  .order("date_event", { ascending: true });

  const { data: medias } = await supabase
  .from("medias")
  .select("*")
  .eq("artiste_id", id)
  .order("created_at", { ascending: false });

  const { data: equipe } = await supabase
  .from("equipe_artiste")
  .select("*")
  .eq("artiste_id", id)
  .order("ordre", { ascending: true });

  const { data: finances } = await supabase
  .from("finances")
  .select("*")
  .eq("artiste_id", id);

const { data: royalties } = await supabase
  .from("royalties")
  .select("*")
  .eq("email", artiste.email || "");

  const { data: activities } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("artiste_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const visibleProjects =
    isArtistUser && !isOwnArtistProfile
      ? projets?.filter((projet: any) => projet.statut === "Sorti") || []
      : projets || [];

  const releasedProjects =
    projets?.filter((projet: any) => projet.statut === "Sorti") || [];

  const openTasks =
    taches?.filter((tache: any) => tache.statut !== "Terminé") || [];

  const upcomingProjects =
    projets?.filter(
      (projet: any) =>
        projet.date_sortie && new Date(projet.date_sortie) >= new Date()
    ) || [];

  const lastRelease = releasedProjects[0];
  const nextRelease = upcomingProjects[0];

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

const revenusParProjet = projets
  ?.map((projet: any) => {
    const financesProjet =
      finances?.filter((f: any) => f.projet_id === projet.id) || [];

    const revenusProjet = financesProjet
      .filter((f: any) => f.type === "Revenu")
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0);

    const depensesProjet = financesProjet
      .filter((f: any) => f.type === "Dépense")
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0);

    return {
      id: projet.id,
      titre: projet.titre,
      revenus: revenusProjet,
      depenses: depensesProjet,
      resultat: revenusProjet - depensesProjet,
    };
  })
  .filter((p: any) => p.revenus > 0 || p.depenses > 0)
  .sort((a: any, b: any) => b.resultat - a.resultat) || [];

  const artistChannelSlug = `artiste-${slugify(artiste.nom || "artiste")}`;

  const socials = [
    { label: "Instagram", value: artiste.instagram, prefix: "https://instagram.com/" },
    { label: "TikTok", value: artiste.tiktok, prefix: "https://tiktok.com/@" },
    { label: "YouTube", value: artiste.youtube, prefix: "" },
    { label: "Spotify", value: artiste.spotify, prefix: "" },
    { label: "Deezer", value: artiste.deezer, prefix: "" },
    { label: "Apple Music", value: artiste.apple_music, prefix: "" },
  ].filter((social) => social.value);

  return (
    <main className="text-white">
      <div className="relative h-[460px] overflow-hidden">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

        <div className="absolute bottom-10 left-10 right-10">
          <Link
            href="/artistes"
            className="mb-5 block text-sm text-zinc-300 hover:text-white"
          >
            ← Retour aux artistes
          </Link>

          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-400">
            Profil artiste premium
          </p>

          <h1 className="text-6xl font-bold">{artiste.nom}</h1>

          <p className="mt-3 text-xl text-zinc-300">
            {artiste.style || "Style non renseigné"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/chat?channel=${artistChannelSlug}`}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Ouvrir le channel artiste
            </Link>

            {!isArtistUser && (
              <Link
                href={`/artistes/${artiste.id}/modifier`}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Modifier artiste
              </Link>

              
            )}
          </div>
        </div>
      </div>

      <section className="p-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Statut</p>
            <p className="mt-2 text-xl font-semibold">
              {artiste.statut || "Non renseigné"}
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
              {visibleProjects.length}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Sorties</p>
            <p className="mt-2 text-xl font-semibold">
              {releasedProjects.length}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Tâches ouvertes</p>
            <p className="mt-2 text-xl font-semibold">
              {canViewInternalArtistData ? openTasks.length : "Privé"}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Assets</p>
            <p className="mt-2 text-xl font-semibold">
              {canViewInternalArtistData ? assets?.length || 0 : "Privé"}
            </p>
          </div>
        </div>

<div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
  <p className="text-sm text-green-300">CA généré</p>

  <p className="mt-2 text-xl font-semibold">
    {canViewInternalArtistData
      ? `${revenus.toFixed(2)} €`
      : "Privé"}
  </p>
</div>

<div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
  <p className="text-sm text-red-300">Dépenses</p>

  <p className="mt-2 text-xl font-semibold">
    {canViewInternalArtistData
      ? `${depenses.toFixed(2)} €`
      : "Privé"}
  </p>
</div>

<div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-6">
  <p className="text-sm text-zinc-400">Résultat net</p>

  <p className="mt-2 text-xl font-semibold">
    {canViewInternalArtistData
      ? `${resultat.toFixed(2)} €`
      : "Privé"}
  </p>
</div>

<div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
  <p className="text-sm text-yellow-300">
    Royalties à payer
  </p>

  <p className="mt-2 text-xl font-semibold">
    {canViewInternalArtistData
      ? `${royaltiesAPayer.toFixed(2)} €`
      : "Privé"}
  </p>
</div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-3xl font-bold">Bio / notes</h2>

              <p className="mt-5 leading-relaxed text-zinc-300">
                {artiste.bio ||
                  artiste.notes ||
                  "Aucune bio ou note renseignée."}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-6 text-3xl font-bold">Projets visibles</h2>

              {visibleProjects.length === 0 && (
                <p className="text-zinc-500">Aucun projet visible.</p>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {visibleProjects.map((projet: any) => (
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
  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
    <h2 className="mb-6 text-3xl font-bold">Revenus par projet</h2>

    {revenusParProjet.length === 0 && (
      <p className="text-zinc-500">Aucune donnée financière par projet.</p>
    )}

    <div className="space-y-4">
      {revenusParProjet.map((projet: any) => (
        <Link
          key={projet.id}
          href={`/projets/${projet.id}`}
          className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{projet.titre}</h3>

              <p className="mt-2 text-sm text-zinc-500">
                Revenus : {projet.revenus.toFixed(2)} € • Dépenses :{" "}
                {projet.depenses.toFixed(2)} €
              </p>
            </div>

            <p
              className={
                projet.resultat >= 0 ? "text-green-400" : "text-red-400"
              }
            >
              {projet.resultat.toFixed(2)} €
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}

            {canViewInternalArtistData && (
              <>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                  <h2 className="mb-6 text-3xl font-bold">Tâches liées</h2>

                  {(!taches || taches.length === 0) && (
                    <p className="text-zinc-500">Aucune tâche liée.</p>
                  )}

                  <div className="space-y-4">
                    {taches?.map((tache: any) => (
                      <Link
                        key={tache.id}
                        href={`/taches/${tache.id}`}
                        className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
                      >
                        <h3 className="text-xl font-semibold">{tache.titre}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {tache.statut || "À faire"} •{" "}
                          {tache.deadline || "Sans deadline"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                  <h2 className="mb-6 text-3xl font-bold">Assets artiste</h2>

                  {(!assets || assets.length === 0) && (
                    <p className="text-zinc-500">Aucun asset lié.</p>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {assets?.map((asset: any) => (
                      <a
                        key={asset.id}
                        href={asset.url}
                        target="_blank"
                        className="rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
                      >
                        <p className="text-sm text-zinc-500">
                          {asset.type || "Asset"}
                        </p>

                        <h3 className="mt-2 truncate text-xl font-semibold">
                          {asset.nom}
                        </h3>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                  <h2 className="mb-6 text-3xl font-bold">
                    Timeline activité
                  </h2>

                  {(!activities || activities.length === 0) && (
                    <p className="text-zinc-500">Aucune activité récente.</p>
                  )}

                  <div className="space-y-4">
                    {activities?.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="rounded-2xl border border-zinc-800 bg-black p-5"
                      >
                        <p className="text-sm text-zinc-500">
                          {activity.type || "Activité"}
                        </p>

                        <h3 className="mt-1 text-xl font-semibold">
                          {activity.titre}
                        </h3>

                        {activity.description && (
                          <p className="mt-2 text-sm text-zinc-400">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-3xl font-bold">Réseaux</h2>

              <div className="mt-6 space-y-3">
                {socials.length === 0 && (
                  <p className="text-zinc-500">Aucun réseau renseigné.</p>
                )}

                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={`${social.prefix}${social.value}`}
                    target="_blank"
                    className="block rounded-xl border border-zinc-700 px-5 py-4 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-3xl font-bold">Releases</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                  <p className="text-sm text-zinc-500">Dernière sortie</p>
                  <p className="mt-2 text-lg font-semibold">
                    {lastRelease?.titre || "Aucune sortie"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                  <p className="text-sm text-zinc-500">Prochaine sortie</p>
                  <p className="mt-2 text-lg font-semibold">
                    {nextRelease?.titre || "Aucune sortie prévue"}
                  </p>
                </div>
              </div>
            </div>

            {canViewInternalArtistData && (
  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
    <h2 className="mb-6 text-3xl font-bold">Contrats liés</h2>

    {(!contrats || contrats.length === 0) && (
      <p className="text-zinc-500">Aucun contrat lié.</p>
    )}

    <div className="space-y-4">
      {contrats?.map((contrat: any) => (
        <Link
          key={contrat.id}
          href={`/contrats/${contrat.id}`}
          className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
        >
          <p className="text-sm text-zinc-500">{contrat.type}</p>

          <h3 className="mt-1 text-xl font-semibold">
            {contrat.titre}
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            {contrat.statut || "Brouillon"}
          </p>
        </Link>
      ))}
    </div>
  </div>
)}

   <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">Bookings liés</h2>

  {(!bookings || bookings.length === 0) && (
    <p className="text-zinc-500">Aucun booking lié.</p>
  )}

  <div className="space-y-4">
    {bookings?.map((booking: any) => (
      <Link
        key={booking.id}
        href={`/booking/${booking.id}`}
        className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
      >
        <p className="text-sm text-zinc-500">
          {booking.ville || "Ville non renseignée"}
        </p>

        <h3 className="mt-1 text-xl font-semibold">
          {booking.evenement}
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          {booking.date_event || "Date non renseignée"} • {booking.statut || "Prospect"}
        </p>
      </Link>
    ))}
  </div>
</div>

<div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">Médias liés</h2>

  {(!medias || medias.length === 0) && (
    <p className="text-zinc-500">Aucun média lié.</p>
  )}

  <div className="space-y-4">
    {medias?.map((media: any) => (
      <Link
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
      </Link>
    ))}
  </div>
</div>

<div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">
    Équipe
  </h2>

  {(!equipe || equipe.length === 0) && (
    <p className="text-zinc-500">
      Aucun membre renseigné.
    </p>
  )}

  <div className="space-y-4">
    {equipe?.map((membre: any) => (
      <div
        key={membre.id}
        className="rounded-2xl border border-zinc-800 bg-black p-5"
      >
        <div className="flex items-center gap-4">
          {membre.photo_url ? (
            <img
              src={membre.photo_url}
              alt={membre.nom}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
              👤
            </div>
          )}

          <div>
            <h3 className="font-semibold">
              {membre.nom}
            </h3>

            <p className="text-sm text-zinc-500">
              {membre.role}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

            {!isArtistUser && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
                <h2 className="text-3xl font-bold">Actions</h2>

                <div className="mt-6 space-y-3">
                  <Link
                    href={`/artistes/${artiste.id}/modifier`}
                    className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
                  >
                    Modifier artiste
                  </Link>

                  <Link
  href={`/artistes/${artiste.id}/equipe`}
  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
>
  Gérer l'équipe
</Link>

<Link
  href={`/artistes/${artiste.id}/objectifs`}
  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
>
  Gérer les objectifs
</Link>

                  <Link
                    href={`/chat?channel=${artistChannelSlug}`}
                    className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Ouvrir channel artiste
                  </Link>

                  <Link
                    href="/taches/nouveau"
                    className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Ajouter tâche
                  </Link>

                  <Link
                    href="/drive"
                    className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Ouvrir Drive
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}