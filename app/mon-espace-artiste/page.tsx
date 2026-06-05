import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AssetUploader from "@/components/AssetUploader";

export const dynamic = "force-dynamic";

export default async function MonEspaceArtistePage() {
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

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nom, role, artiste_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artiste_id) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-5xl font-bold">Mon espace artiste</h1>
        <p className="mt-4 text-zinc-400">
          Aucun artiste n’est lié à ton compte pour le moment.
        </p>
      </main>
    );
  }

  const { data: artiste } = await supabase
    .from("artistes")
    .select("*")
    .eq("id", profile.artiste_id)
    .single();

  const { data: projets } = await supabase
    .from("projets")
    .select("*")
    .eq("artiste_id", profile.artiste_id)
    .order("created_at", { ascending: false });

  const projetIds = projets?.map((projet) => projet.id) || [];

  const { data: taches } =
    projetIds.length > 0
      ? await supabase
          .from("taches")
          .select("*")
          .in("projet_id", projetIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const { data: assets } =
    projetIds.length > 0
      ? await supabase
          .from("assets")
          .select("*")
          .in("projet_id", projetIds)
          .order("created_at", { ascending: false })
      : { data: [] };

      const { data: royalties } = await supabase
  .from("royalties")
  .select("*")
  .eq("artiste_id", profile.artiste_id);

  const { data: contrats } = await supabase
  .from("contrats")
  .select("*")
  .eq("artiste_id", profile.artiste_id)
  .order("created_at", { ascending: false });

  const { data: bookings } = await supabase
  .from("bookings")
  .select("*")
  .eq("artiste_id", profile.artiste_id)
  .order("date_event", { ascending: true });

  const { data: objectifs } = await supabase
  .from("objectifs_artiste")
  .select("*")
  .eq("artiste_id", profile.artiste_id)
  .order("created_at", { ascending: false });

  const { data: equipe } = await supabase
  .from("equipe_artiste")
  .select("*")
  .eq("artiste_id", profile.artiste_id)
  .order("ordre", { ascending: true });

  const prochainesSorties =
  projets
    ?.filter(
      (projet: any) =>
        projet.date_sortie &&
        new Date(projet.date_sortie) >= new Date()
    )
    .sort(
      (a: any, b: any) =>
        new Date(a.date_sortie).getTime() -
        new Date(b.date_sortie).getTime()
    )
    .slice(0, 5) || [];

  const royaltiesAPayer =
  royalties
    ?.filter((r: any) => r.statut !== "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

const royaltiesPayees =
  royalties
    ?.filter((r: any) => r.statut === "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

    const totalObjectifs = objectifs?.length || 0;

const objectifsAtteints =
  objectifs?.filter((objectif: any) => {
    const target = Number(objectif.objectif || 0);
    const current = Number(objectif.actuel || 0);

    return target > 0 && current >= target;
  }).length || 0;

const progressionObjectifs =
  totalObjectifs > 0
    ? Math.round((objectifsAtteints / totalObjectifs) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative h-[420px] overflow-hidden">
        {artiste?.photo_url ? (
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
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-400">
            Portail artiste privé
          </p>

          <h1 className="text-6xl font-bold">
            {artiste?.nom || "Artiste"}
          </h1>

          <p className="mt-3 text-xl text-zinc-300">
            {artiste?.style || "Style non renseigné"}
          </p>
        </div>
      </div>

      <section className="p-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Projets</p>
            <p className="mt-2 text-4xl font-bold">{projets?.length || 0}</p>
          </div>

          <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6">
  <p className="text-sm text-blue-300">Contrats</p>

  <p className="mt-2 text-4xl font-bold">
    {contrats?.length || 0}
  </p>
</div>

<div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6">
  <p className="text-sm text-purple-300">Bookings</p>

  <p className="mt-2 text-4xl font-bold">
    {bookings?.length || 0}
  </p>
</div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Tâches</p>
            <p className="mt-2 text-4xl font-bold">{taches?.length || 0}</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Assets</p>
            <p className="mt-2 text-4xl font-bold">{assets?.length || 0}</p>
          </div>

          <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
  <p className="text-sm text-yellow-300">
    Royalties à payer
  </p>

  <p className="mt-2 text-4xl font-bold">
    {royaltiesAPayer.toFixed(0)} €
  </p>
</div>

<div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
  <p className="text-sm text-green-300">
    Royalties payées
  </p>

  <p className="mt-2 text-4xl font-bold">
    {royaltiesPayees.toFixed(0)} €
  </p>
</div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-6 text-3xl font-bold">Mes projets</h2>

            <div className="space-y-4">
              {(!projets || projets.length === 0) && (
                <p className="text-zinc-500">Aucun projet disponible.</p>
              )}

              {projets?.map((projet) => (
                <Link
                  key={projet.id}
                  href={`/projets/${projet.id}`}
                  className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
                >
                  <h3 className="text-xl font-bold">{projet.titre}</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Sortie : {projet.date_sortie || "Non renseignée"}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-6 text-3xl font-bold">Mes tâches</h2>

            <div className="space-y-4">
              {(!taches || taches.length === 0) && (
                <p className="text-zinc-500">Aucune tâche liée.</p>
              )}

              {taches?.map((tache) => (
                <Link
                  key={tache.id}
                  href={`/taches/${tache.id}`}
                  className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
                >
                  <h3 className="text-xl font-bold">{tache.titre}</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    {tache.statut || "À faire"} • {tache.deadline || "Sans deadline"}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">
    Mes contrats
  </h2>

  {(!contrats || contrats.length === 0) && (
    <p className="text-zinc-500">
      Aucun contrat disponible.
    </p>
  )}

  <div className="space-y-4">
    {contrats?.map((contrat: any) => (
      <Link
        key={contrat.id}
        href={`/contrats/${contrat.id}`}
        className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
      >
        <h3 className="text-xl font-bold">
          {contrat.titre}
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          {contrat.statut || "En attente"}
        </p>
      </Link>
    ))}
  </div>
</div>

<div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-3xl font-bold">Mes objectifs</h2>

      <p className="mt-2 text-zinc-500">
        {objectifsAtteints} / {totalObjectifs} atteints · {progressionObjectifs}%
      </p>
    </div>

    <div className="text-right">
      <p className="text-sm text-zinc-500">Progression</p>
      <p className="text-3xl font-bold">{progressionObjectifs}%</p>
    </div>
  </div>

  <div className="mb-6 h-3 overflow-hidden rounded-full bg-black">
    <div
      className="h-full rounded-full bg-white"
      style={{ width: `${progressionObjectifs}%` }}
    />
  </div>

  {(!objectifs || objectifs.length === 0) && (
    <p className="text-zinc-500">Aucun objectif renseigné.</p>
  )}

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {objectifs?.map((objectif: any) => {
      const target = Number(objectif.objectif || 0);
      const current = Number(objectif.actuel || 0);
      const percent =
        target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

      return (
        <div
          key={objectif.id}
          className="rounded-2xl border border-zinc-800 bg-black p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{objectif.titre}</h3>

              <p className="mt-2 text-sm text-zinc-500">
                {current} / {target} {objectif.unite || ""}
              </p>
            </div>

            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
              {objectif.statut || "En cours"}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full rounded-full bg-green-400"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            Progression : {percent}%
          </p>
        </div>
      );
    })}
  </div>
</div>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">
    Mes prochaines dates
  </h2>

  {(!bookings || bookings.length === 0) && (
    <p className="text-zinc-500">
      Aucun booking confirmé.
    </p>
  )}

  <div className="space-y-4">
    {bookings?.slice(0, 10).map((booking: any) => (
      <Link
        key={booking.id}
        href={`/booking/${booking.id}`}
        className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
      >
        <h3 className="text-xl font-bold">
          {booking.evenement}
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          {booking.ville || "Ville"} • {booking.date_event || "Date"}
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          {booking.statut || "Prospect"}
        </p>
      </Link>
    ))}
  </div>
</div>

<div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">
    Mes prochaines sorties
  </h2>

  {prochainesSorties.length === 0 && (
    <p className="text-zinc-500">
      Aucune sortie programmée.
    </p>
  )}

  <div className="space-y-4">
    {prochainesSorties.map((projet: any) => (
      <Link
        key={projet.id}
        href={`/projets/${projet.id}`}
        className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
      >
        <h3 className="text-xl font-bold">
          {projet.titre}
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          Sortie prévue : {projet.date_sortie}
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          {projet.statut || "En préparation"}
        </p>
      </Link>
    ))}
  </div>
</div>

<div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <h2 className="mb-6 text-3xl font-bold">
    Mon équipe
  </h2>

  {(!equipe || equipe.length === 0) && (
    <p className="text-zinc-500">
      Aucun membre renseigné.
    </p>
  )}

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              👤
            </div>
          )}

          <div>
            <h3 className="font-bold">
              {membre.nom}
            </h3>

            <p className="text-sm text-zinc-400">
              {membre.role}
            </p>
          </div>
        </div>

        {membre.email && (
          <p className="mt-4 text-sm text-zinc-500">
            {membre.email}
          </p>
        )}

        {membre.telephone && (
          <p className="mt-1 text-sm text-zinc-500">
            {membre.telephone}
          </p>
        )}
      </div>
    ))}
  </div>
</div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Mes assets</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(!assets || assets.length === 0) && (
              <p className="text-zinc-500">Aucun asset disponible.</p>
            )}

            {assets?.map((asset) => (
              <a
                key={asset.id}
                href={asset.url}
                target="_blank"
                className="rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <p className="text-sm text-zinc-500">{asset.type || "Asset"}</p>
                <h3 className="mt-2 truncate text-xl font-bold">{asset.nom}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}