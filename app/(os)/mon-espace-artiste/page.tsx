import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  const { data: rolloutEvents } =
  projetIds.length > 0
    ? await supabase
        .from("rollout_events")
        .select("*")
        .in("projet_id", projetIds)
        .order("date_event", { ascending: true })
    : { data: [] };

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
  .eq("email", user.email);

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

  const { data: sorties } = await supabase
  .from("sorties")
  .select("*")
  .eq("artiste_id", profile.artiste_id)
  .order("date_sortie", { ascending: false });

const { data: analytics } = await supabase
  .from("analytics")
  .select("*")
  .eq("artiste_id", profile.artiste_id);

const { data: driveFiles } = await supabase
  .from("drive_files")
  .select("*")
  .eq("artiste_id", profile.artiste_id)
  .order("created_at", { ascending: false });

  const { data: objectifs } = await supabase
  .from("objectifs_artistes")
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

    const artisteTimeline = [
  ...(prochainesSorties || []).map((projet: any) => ({
    id: projet.id,
    type: "Sortie",
    titre: projet.titre,
    date: projet.date_sortie,
    href: `/projets/${projet.id}`,
  })),

  ...(taches || [])
    .filter((tache: any) => tache.deadline)
    .map((tache: any) => ({
      id: tache.id,
      type: "Tâche",
      titre: tache.titre,
      date: tache.deadline,
      href: `/taches/${tache.id}`,
    })),

  ...(bookings || [])
    .filter((booking: any) => booking.date_event)
    .map((booking: any) => ({
      id: booking.id,
      type: "Booking",
      titre: booking.evenement,
      date: booking.date_event,
      href: `/booking/${booking.id}`,
    })),
]
  .filter((event: any) => event.date)
  .sort(
    (a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  .slice(0, 10);

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

    const totalStreams =
  analytics?.reduce(
    (acc: number, item: any) => acc + Number(item.streams || 0),
    0
  ) || 0;

const totalVues =
  analytics?.reduce(
    (acc: number, item: any) => acc + Number(item.vues || 0),
    0
  ) || 0;

const totalFollowers =
  analytics?.reduce(
    (acc: number, item: any) => acc + Number(item.followers || 0),
    0
  ) || 0;

const totalRevenusAnalytics =
  analytics?.reduce(
    (acc: number, item: any) => acc + Number(item.revenus || 0),
    0
  ) || 0;

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

    const sortiesCount = sorties?.length || 0;
const bookingsConfirmes =
  bookings?.filter((booking: any) => booking.statut === "Confirmé").length || 0;

const lmgScore = Math.min(
  100,
  Math.round(
    progressionObjectifs * 0.3 +
      Math.min(totalStreams / 100000, 1) * 25 +
      Math.min(bookingsConfirmes / 10, 1) * 20 +
      Math.min(royaltiesPayees / 5000, 1) * 15 +
      Math.min(sortiesCount / 5, 1) * 10
  )
);

const lmgScoreLabel =
  lmgScore >= 80
    ? "Excellent"
    : lmgScore >= 60
    ? "En forte progression"
    : lmgScore >= 40
    ? "En développement"
    : "Phase de lancement";

    const artistLevel =
  lmgScore >= 90
    ? "Diamond Artist"
    : lmgScore >= 75
    ? "Platinum Artist"
    : lmgScore >= 60
    ? "Gold Artist"
    : lmgScore >= 40
    ? "Silver Artist"
    : "Bronze Artist";

const badges = [
  {
    label: "Premier contrat signé",
    unlocked: contrats?.some((contrat: any) => contrat.statut === "Signé"),
  },
  {
    label: "Première sortie",
    unlocked: sortiesCount > 0,
  },
  {
    label: "10K streams",
    unlocked: totalStreams >= 10000,
  },
  {
    label: "100K streams",
    unlocked: totalStreams >= 100000,
  },
  {
    label: "Premier booking",
    unlocked: bookingsConfirmes > 0,
  },
  {
    label: "Objectif atteint",
    unlocked: objectifsAtteints > 0,
  },
  {
    label: "Royalties générées",
    unlocked: royaltiesPayees > 0 || royaltiesAPayer > 0,
  },
];

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
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-7">
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">Projets</p>
      <p className="mt-2 text-4xl font-bold">{projets?.length || 0}</p>
    </div>

    <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6">
      <p className="text-sm text-blue-300">Contrats</p>
      <p className="mt-2 text-4xl font-bold">{contrats?.length || 0}</p>
    </div>

    <div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6">
      <p className="text-sm text-purple-300">Bookings</p>
      <p className="mt-2 text-4xl font-bold">{bookings?.length || 0}</p>
    </div>

    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">Tâches</p>
      <p className="mt-2 text-4xl font-bold">{taches?.length || 0}</p>
    </div>

    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">Documents</p>
      <p className="mt-2 text-4xl font-bold">
        {driveFiles?.length || assets?.length || 0}
      </p>
    </div>

    <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
      <p className="text-sm text-yellow-300">Royalties à payer</p>
      <p className="mt-2 text-4xl font-bold">
        {royaltiesAPayer.toFixed(0)} €
      </p>
    </div>

    <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
      <p className="text-sm text-green-300">Royalties payées</p>
      <p className="mt-2 text-4xl font-bold">
        {royaltiesPayees.toFixed(0)} €
      </p>
    </div>
  </div>

  <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8">
    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-300">
          Ma carrière chez LMG
        </p>

        <h2 className="text-4xl font-bold">LMG Score</h2>

        <p className="mt-3 text-xl text-cyan-100">
          {lmgScoreLabel}
        </p>
      </div>

      <div className="text-left xl:text-right">
        <p className="text-6xl font-bold">{lmgScore}</p>
        <p className="text-sm text-cyan-200">/ 100</p>
      </div>
    </div>

    <div className="mt-6 h-4 overflow-hidden rounded-full bg-black/40">
      <div
        className="h-full rounded-full bg-cyan-300"
        style={{ width: `${lmgScore}%` }}
      />
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4">
        <p className="text-sm text-cyan-200">Sorties</p>
        <p className="mt-2 text-2xl font-bold">{sortiesCount}</p>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4">
        <p className="text-sm text-cyan-200">Streams</p>
        <p className="mt-2 text-2xl font-bold">
          {totalStreams.toLocaleString("fr-FR")}
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4">
        <p className="text-sm text-cyan-200">Bookings confirmés</p>
        <p className="mt-2 text-2xl font-bold">{bookingsConfirmes}</p>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4">
        <p className="text-sm text-cyan-200">Royalties payées</p>
        <p className="mt-2 text-2xl font-bold">
          {royaltiesPayees.toFixed(0)} €
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4">
        <p className="text-sm text-cyan-200">Objectifs</p>
        <p className="mt-2 text-2xl font-bold">
          {progressionObjectifs}%
        </p>
      </div>
    </div>
  </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <div className="mb-6">
    <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
      Performance
    </p>

    <h2 className="text-3xl font-bold">Mes analytics</h2>
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
      <p className="text-sm text-blue-300">Streams</p>
      <p className="mt-2 text-3xl font-bold">
        {totalStreams.toLocaleString("fr-FR")}
      </p>
    </div>

    <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-5">
      <p className="text-sm text-pink-300">Vues</p>
      <p className="mt-2 text-3xl font-bold">
        {totalVues.toLocaleString("fr-FR")}
      </p>
    </div>

    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
      <p className="text-sm text-purple-300">Followers</p>
      <p className="mt-2 text-3xl font-bold">
        {totalFollowers.toLocaleString("fr-FR")}
      </p>
    </div>

    <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
      <p className="text-sm text-green-300">Revenus analytics</p>
      <p className="mt-2 text-3xl font-bold">
        {totalRevenusAnalytics.toFixed(2)} €
      </p>
    </div>
  </div>
</div>

<div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
        Progression artiste
      </p>

      <h2 className="text-3xl font-bold">
        {artistLevel}
      </h2>

      <p className="mt-2 text-zinc-400">
        Niveau calculé automatiquement selon ton activité LMG.
      </p>
    </div>

    <div className="rounded-2xl border border-zinc-700 bg-black px-6 py-4 text-center">
      <p className="text-sm text-zinc-500">Badges débloqués</p>
      <p className="mt-1 text-3xl font-bold">
        {badges.filter((badge) => badge.unlocked).length} / {badges.length}
      </p>
    </div>
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {badges.map((badge) => (
      <div
        key={badge.label}
        className={`rounded-2xl border p-5 ${
          badge.unlocked
            ? "border-green-500/30 bg-green-500/10"
            : "border-zinc-800 bg-black opacity-50"
        }`}
      >
        <p className="text-2xl">
          {badge.unlocked ? "🏆" : "🔒"}
        </p>

        <h3
          className={`mt-3 font-semibold ${
            badge.unlocked ? "text-green-300" : "text-zinc-500"
          }`}
        >
          {badge.label}
        </h3>

        <p className="mt-2 text-xs text-zinc-500">
          {badge.unlocked ? "Débloqué" : "À débloquer"}
        </p>
      </div>
    ))}
  </div>
</div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-6 text-3xl font-bold">Mes projets</h2>

            <div className="space-y-4">
              {(!projets || projets.length === 0) && (
                <p className="text-zinc-500">Aucun projet disponible.</p>
              )}

              
                {projets?.map((projet: any) => {
  let progression = 0;

  if (projet.titre) progression += 10;
  if (projet.type) progression += 10;
  if (projet.date_sortie) progression += 15;
  if (projet.cover_url) progression += 15;
  if (projet.statut) progression += 10;
  if (projet.spotify_url) progression += 15;
  if (projet.youtube_url) progression += 15;
  if (projet.notes) progression += 10;

  return (
    <Link
      key={projet.id}
      href={`/projets/${projet.id}`}
      className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">
          {projet.titre}
        </h3>

        <span className="text-sm font-medium text-zinc-400">
          {progression}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-white"
          style={{
            width: `${progression}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm text-zinc-500">
        Sortie : {projet.date_sortie || "Non renseignée"}
      </p>
    </Link>
  );
})}
              
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
      <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
        Documents
      </p>

      <h2 className="text-3xl font-bold">Mon Drive artiste</h2>
    </div>
  </div>

  {(!driveFiles || driveFiles.length === 0) && (
    <p className="text-zinc-500">Aucun document disponible.</p>
  )}

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {driveFiles?.map((file: any) => (
      <a
        key={file.id}
        href={file.fichier_url}
        target="_blank"
        className="rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
      >
        <p className="text-sm text-zinc-500">
          {file.categorie || "Document"}
        </p>

        <h3 className="mt-2 truncate text-xl font-bold">
          {file.nom}
        </h3>

        <p className="mt-3 text-sm text-zinc-500">
          {file.taille
            ? `${(Number(file.taille) / 1024 / 1024).toFixed(2)} MB`
            : "Taille non renseignée"}
        </p>
      </a>
    ))}
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
    Progression rollout
  </h2>

  {(!projets || projets.length === 0) && (
    <p className="text-zinc-500">
      Aucun projet disponible.
    </p>
  )}

  <div className="space-y-6">
    {projets?.map((projet: any) => {
      const events =
        rolloutEvents?.filter(
          (event: any) => event.projet_id === projet.id
        ) || [];

      const total = events.length;

      const done = events.filter(
        (event: any) =>
          event.statut === "Terminé" ||
          event.statut === "Fait" ||
          event.statut === "Validé"
      ).length;

      const percent =
        total > 0 ? Math.round((done / total) * 100) : 0;

      return (
        <Link
          key={projet.id}
          href={`/projets/${projet.id}`}
          className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                {projet.titre}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                {done} / {total} actions terminées
              </p>
            </div>

            <p className="text-2xl font-bold">
              {percent}%
            </p>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full rounded-full bg-green-400"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {events.slice(0, 6).map((event: any) => (
              <span
                key={event.id}
                className={`rounded-full border px-3 py-1 text-xs ${
                  event.statut === "Terminé" ||
                  event.statut === "Fait" ||
                  event.statut === "Validé"
                    ? "border-green-500/40 bg-green-500/10 text-green-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400"
                }`}
              >
                {event.titre}
              </span>
            ))}

            {events.length > 6 && (
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-500">
                +{events.length - 6}
              </span>
            )}
          </div>
        </Link>
      );
    })}
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
  <h2 className="mb-6 text-3xl font-bold">
    Mon calendrier
  </h2>

  {artisteTimeline.length === 0 && (
    <p className="text-zinc-500">
      Aucun événement à venir.
    </p>
  )}

  <div className="space-y-4">
    {artisteTimeline.map((event: any) => (
      <Link
        key={`${event.type}-${event.id}`}
        href={event.href}
        className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">
              {event.type}
            </p>

            <h3 className="mt-1 text-xl font-bold">
              {event.titre}
            </h3>
          </div>

          <p className="text-sm text-zinc-400">
            {event.date}
          </p>
        </div>
      </Link>
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