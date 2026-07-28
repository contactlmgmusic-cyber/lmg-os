import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import AnalyticsGlobalChart from "@/components/AnalyticsGlobalChart";

export const dynamic = "force-dynamic";

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default async function AnalyticsDashboardPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
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

  const { data: analytics, error: analyticsError } = await supabase
  .from("analytics")
  .select(`
    id,
    artiste_id,
    sortie_id,
    date_snapshot,
    streams,
    followers,
    vues,
    revenus,
    artistes (
      id,
      nom
    ),
    sorties (
      id,
      titre
    )
  `)
  .order("date_snapshot", { ascending: false });

if (analyticsError) {
  console.error(
    "Erreur lors du chargement des analytics :",
    analyticsError
  );

  throw new Error("Impossible de charger les données analytics.");
}

const rows = analytics ?? [];

  const totalStreams = rows.reduce((acc: number, row: any) => acc + Number(row.streams || 0), 0);
  const totalFollowers = rows.reduce((acc: number, row: any) => acc + Number(row.followers || 0), 0);
  const totalVues = rows.reduce((acc: number, row: any) => acc + Number(row.vues || 0), 0);
  const totalRevenus = rows.reduce((acc: number, row: any) => acc + Number(row.revenus || 0), 0);

  const now = new Date();
  const date30 = new Date();
  date30.setDate(now.getDate() - 30);

  const snapshots30 = rows.filter((row: any) => {
    if (!row.date_snapshot) return false;
    return new Date(row.date_snapshot) >= date30;
  });

  const dernierSnapshot = rows[0]?.date_snapshot || "Aucun";

  const artistesMap = new Map();

  rows.forEach((row: any) => {
    if (!row.artistes?.nom) return;

    const current = artistesMap.get(row.artistes.nom) || {
      nom: row.artistes.nom,
      streams: 0,
      vues: 0,
      followers: 0,
      revenus: 0,
    };

    current.streams += Number(row.streams || 0);
    current.vues += Number(row.vues || 0);
    current.followers += Number(row.followers || 0);
    current.revenus += Number(row.revenus || 0);

    artistesMap.set(row.artistes.nom, current);
  });

  const sortiesMap = new Map();

  rows.forEach((row: any) => {
    if (!row.sorties?.titre) return;

    const current = sortiesMap.get(row.sorties.titre) || {
      titre: row.sorties.titre,
      streams: 0,
      vues: 0,
      revenus: 0,
    };

    current.streams += Number(row.streams || 0);
    current.vues += Number(row.vues || 0);
    current.revenus += Number(row.revenus || 0);

    sortiesMap.set(row.sorties.titre, current);
  });

  const topArtistesStreams = Array.from(artistesMap.values())
    .sort((a: any, b: any) => b.streams - a.streams)
    .slice(0, 5);

  const topArtistesRevenus = Array.from(artistesMap.values())
    .sort((a: any, b: any) => b.revenus - a.revenus)
    .slice(0, 5);

  const topSortiesStreams = Array.from(sortiesMap.values())
    .sort((a: any, b: any) => b.streams - a.streams)
    .slice(0, 5);

  const topSortiesRevenus = Array.from(sortiesMap.values())
    .sort((a: any, b: any) => b.revenus - a.revenus)
    .slice(0, 5);

  const bestArtist = topArtistesStreams[0];
  const bestRelease = topSortiesStreams[0];

  const averageRevenue =
  rows.length > 0
    ? totalRevenus / rows.length
    : 0;

  const averageStreams =
  rows.length > 0
    ? Math.round(totalStreams / rows.length)
    : 0;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-12 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-10">

  <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
    LMG Analytics Center
  </p>

  <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

    <div>

      <h1 className="text-6xl font-black">
        Analytics
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Vue exécutive des performances artistes, sorties et revenus.
      </p>

    </div>

    <div className="grid grid-cols-2 gap-4">

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <p className="text-sm text-emerald-300">
          Streams
        </p>

        <p className="mt-2 text-3xl font-bold">
          {formatNumber(totalStreams)}
        </p>
      </div>

      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
        <p className="text-sm text-blue-300">
          Revenus
        </p>

        <p className="mt-2 text-3xl font-bold">
          {formatEuro(totalRevenus)}
        </p>
      </div>

    </div>

  </div>

</div>

      <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <Kpi title="Streams" value={formatNumber(totalStreams)} />
        <Kpi title="Followers" value={formatNumber(totalFollowers)} />
        <Kpi title="Vues" value={formatNumber(totalVues)} />
        <Kpi title="Revenus" value={formatEuro(totalRevenus)} />
        <Kpi title="Snapshots 30j" value={formatNumber(snapshots30.length)} />
        <Kpi title="Dernier snapshot" value={dernierSnapshot} />
      </section>

      <AnalyticsGlobalChart
      data={rows}
    />

      <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Ranking title="Top artistes streams" rows={topArtistesStreams} valueKey="streams" type="number" />
        <Ranking title="Top artistes revenus" rows={topArtistesRevenus} valueKey="revenus" type="euro" />
        <Ranking title="Top sorties streams" rows={topSortiesStreams} valueKey="streams" type="number" labelKey="titre" />
        <Ranking title="Top sorties revenus" rows={topSortiesRevenus} valueKey="revenus" type="euro" labelKey="titre" />
      </section>

      <section className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <h2 className="text-3xl font-bold">
    Insights automatiques
  </h2>

  <div className="mt-8 space-y-5">

    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
      <p className="font-semibold text-emerald-300">
        🚀 Meilleur artiste
      </p>

      <p className="mt-2 text-zinc-300">
        <strong>{bestArtist?.nom || "Aucun"}</strong> domine actuellement avec{" "}
        <strong>{formatNumber(bestArtist?.streams || 0)}</strong> streams.
      </p>
    </div>

    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
      <p className="font-semibold text-blue-300">
        🎵 Meilleure sortie
      </p>

      <p className="mt-2 text-zinc-300">
        <strong>{bestRelease?.titre || "Aucune"}</strong> est la sortie la plus performante.
      </p>
    </div>

    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
      <p className="font-semibold text-yellow-300">
        💰 Revenu moyen
      </p>

      <p className="mt-2 text-zinc-300">
        {formatEuro(averageRevenue)} par snapshot Analytics.
      </p>
    </div>

    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
      <p className="font-semibold text-purple-300">
        📈 Streams moyens
      </p>

      <p className="mt-2 text-zinc-300">
        {formatNumber(averageStreams)} streams par snapshot.
      </p>
    </div>

  </div>

</section>
    </main>
  );
}

function Kpi({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600">

      <p className="text-sm uppercase tracking-wide text-zinc-500">
        {title}
      </p>

      <p className="mt-4 text-4xl font-black">
        {value}
      </p>

    </div>
  );
}

function Ranking({
  title,
  rows,
  valueKey,
  type,
  labelKey = "nom",
}: {
  title: string;
  rows: any[];
  valueKey: string;
  type: "number" | "euro";
  labelKey?: string;
}) {
  return (
  <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

    <h2 className="mb-6 text-3xl font-bold">
      {title}
    </h2>

    {rows.length === 0 && (
      <p className="text-zinc-500">
        Aucune donnée disponible.
      </p>
    )}

    <div className="space-y-4">

      {rows.map((row, index) => (
        <div
          key={`${title}-${index}`}
          className={`rounded-2xl border p-5 transition ${
            index === 0
              ? "border-yellow-500/30 bg-yellow-500/10"
              : "border-zinc-800 bg-black"
          }`}
        >

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 font-bold">
                #{index + 1}
              </div>

              <div>
                <h3 className="text-xl font-semibold">
                  {row[labelKey] || "Non renseigné"}
                </h3>

                {index === 0 && (
                  <p className="mt-1 text-sm text-yellow-300">
                    🏆 Leader actuel
                  </p>
                )}
              </div>

            </div>


            <p className="text-right text-2xl font-black">

              {type === "euro"
                ? formatEuro(Number(row[valueKey] || 0))
                : formatNumber(Number(row[valueKey] || 0))}

            </p>

          </div>

        </div>
      ))}

    </div>

  </section>
);
}