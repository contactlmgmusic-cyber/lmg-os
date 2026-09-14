import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import SortieAnalyticsChart from "@/components/SortieAnalyticsChart";

export const dynamic = "force-dynamic";

export default async function SortieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createAuthenticatedSupabaseClient();
  const { id } = await params;

  const profile = await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ARTISTIC_DIRECTOR,
  ROLES.MANAGER,
]);

const isManager = profile.role === ROLES.MANAGER;

let sortieQuery = supabase
  .from("sorties")
  .select(
    isManager
      ? `
        *,
        artistes!inner (
          id,
          nom,
          manager_id
        ),
        projets (
          id,
          titre,
          budget_clip,
          budget_cover,
          budget_promo,
          budget_studio,
          budget_influence,
          budget_rp
        )
      `
      : `
        *,
        artistes (
          id,
          nom
        ),
        projets (
          id,
          titre,
          budget_clip,
          budget_cover,
          budget_promo,
          budget_studio,
          budget_influence,
          budget_rp
        )
      `
  )
  .eq("id", id);

if (isManager) {
  sortieQuery = sortieQuery.eq(
    "artistes.manager_id",
    profile.id
  );
}

const {
  data: sortie,
  error,
} = await sortieQuery.maybeSingle();

/*
 * Ce message est volontairement identique si la sortie
 * n’existe pas ou si elle appartient à un autre manager.
 */
if (error || !sortie) {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <Link
        href="/sorties"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour aux sorties
      </Link>

      <p className="mt-8 text-red-400">
        Sortie introuvable ou accès non autorisé.
      </p>
    </main>
  );
}

/*
 * Les données sensibles ne sont récupérées qu’après
 * vérification de l’accès à la sortie.
 */
const [
  { data: analytics, error: analyticsError },
  { data: releaseTasks, error: releaseTasksError },
] = await Promise.all([
  supabase
    .from("analytics")
    .select("*")
    .eq("sortie_id", id)
    .order("date_snapshot", { ascending: false }),

  supabase
    .from("release_tasks")
    .select("*")
    .eq("sortie_id", id),
]);

if (analyticsError || releaseTasksError) {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href="/sorties"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour aux sorties
      </Link>

      <p className="mt-8 text-red-400">
        Impossible de charger les données de cette sortie.
      </p>
    </main>
  );
}

const links = [
  {
    label: "Spotify",
    url: sortie.spotify_url,
  },
  {
    label: "Apple Music",
    url: sortie.apple_music_url,
  },
  {
    label: "Deezer",
    url: sortie.deezer_url,
  },
  {
    label: "YouTube",
    url: sortie.youtube_url,
  },
  {
    label: "SoundCloud",
    url: sortie.soundcloud_url,
  },
].filter(
  (
    item
  ): item is {
    label: string;
    url: string;
  } => Boolean(item.url)
);

const releaseTotal = releaseTasks?.length || 0;

const releaseDone =
  releaseTasks?.filter(
    (task: any) => task.statut === "Terminé"
  ).length || 0;

const releaseProgress =
  releaseTotal > 0
    ? Math.round(
        (releaseDone / releaseTotal) * 100
      )
    : 0;

const budgetSortie =
  Number(sortie.projets?.budget_clip || 0) +
  Number(sortie.projets?.budget_cover || 0) +
  Number(sortie.projets?.budget_promo || 0) +
  Number(sortie.projets?.budget_studio || 0) +
  Number(sortie.projets?.budget_influence || 0) +
  Number(sortie.projets?.budget_rp || 0);

const totalStreams =
  analytics?.reduce(
    (total: number, item: any) =>
      total + Number(item.streams || 0),
    0
  ) || 0;

const totalVues =
  analytics?.reduce(
    (total: number, item: any) =>
      total + Number(item.vues || 0),
    0
  ) || 0;

const totalRevenus =
  analytics?.reduce(
    (total: number, item: any) =>
      total + Number(item.revenus || 0),
    0
  ) || 0;

const roi =
  budgetSortie > 0
    ? Math.round(
        ((totalRevenus - budgetSortie) /
          budgetSortie) *
          100
      )
    : 0;

const dernierSnapshot = analytics?.[0];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/sorties" className="text-sm text-zinc-400 hover:text-white">
        ← Retour aux sorties
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          <div className="aspect-square bg-zinc-800">
            {sortie.cover_url ? (
              <img
                src={sortie.cover_url}
                alt={sortie.titre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Aucune cover
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3"><Link href={`/sorties/${sortie.id}/modifier`} className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-black hover:bg-zinc-200">Modifier</Link><Link href={`/release-planner/${sortie.id}`} className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold hover:border-zinc-500">Planner</Link></div>
        </aside>

        <div className="space-y-6">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {sortie.type || "Single"}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{sortie.titre}</h1>

          <p className="mt-3 text-xl text-zinc-400">
            {sortie.artistes?.nom || "Artiste non lié"}
          </p>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {sortie.statut || "En préparation"}
          </span>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Info label="Date de sortie" value={sortie.date_sortie} />
            <Info label="UPC" value={sortie.upc} />
            <Info label="ISRC" value={sortie.isrc} />
            <Info label="Projet lié" value={sortie.projets?.titre} />
          </div>

          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Performance</p><h2 className="mt-2 text-2xl font-bold">Analytics & rentabilité</h2></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
  <Info
    label="Streams"
    value={totalStreams.toLocaleString("fr-FR")}
  />

  <Info
    label="Vues"
    value={totalVues.toLocaleString("fr-FR")}
  />

  <Info
    label="Revenus"
    value={`${totalRevenus.toFixed(2)} €`}
  />

  <Info
    label="Dernier snapshot"
    value={dernierSnapshot?.date_snapshot || "Aucune donnée"}
  />

  <Info
  label="Budget lié"
  value={`${budgetSortie.toFixed(2)} €`}
/>

<Info
  label="ROI"
  value={
    budgetSortie > 0
      ? `${roi}%`
      : "Budget non renseigné"
  }
/>
</div>

{analytics && analytics.length > 1 && (
  <SortieAnalyticsChart
    data={analytics}
  />
)}
</section>

<section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
  <div className="flex items-center justify-between gap-4">
    <div>
      <h2 className="text-2xl font-bold">Release Planner</h2>

      <p className="mt-2 text-sm text-zinc-500">
        {releaseDone} / {releaseTotal} actions terminées
      </p>
    </div>

    <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
      {releaseProgress}%
    </span>
  </div>

  <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
    <div
      className="h-full rounded-full bg-white"
      style={{ width: `${releaseProgress}%` }}
    />
  </div>

  <Link
    href={`/release-planner/${sortie.id}`}
    className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
  >
    Ouvrir le planner →
  </Link>
</section>

          {links.length > 0 && (
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Distribution</p><h2 className="mt-2 text-2xl font-bold">Liens DSP</h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Suivi interne</p><h2 className="mt-2 text-2xl font-bold">Notes</h2>
            <p className="mt-4 whitespace-pre-line text-zinc-400">
              {sortie.notes || "Aucune note renseignée."}
            </p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/sorties/${sortie.id}/modifier`}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
            >
              Modifier sortie
            </Link>

            <Link
              href="/sorties"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
            >
              Retour
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4 sm:p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-base font-semibold sm:text-lg">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}
