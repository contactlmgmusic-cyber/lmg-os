import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

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
    ROLES.MANAGER,
  ]);

  const { data: analytics } = await supabase
    .from("analytics")
    .select(`
      *,
      artistes ( id, nom ),
      sorties ( id, titre )
    `)
    .order("date_snapshot", { ascending: false });

  const rows = analytics || [];

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

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Analytics
        </p>

        <h1 className="text-5xl font-bold">Analytics Dashboard</h1>

        <p className="mt-3 text-zinc-400">
          Classements artistes, sorties, revenus et performances globales.
        </p>
      </div>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <Kpi title="Streams" value={formatNumber(totalStreams)} />
        <Kpi title="Followers" value={formatNumber(totalFollowers)} />
        <Kpi title="Vues" value={formatNumber(totalVues)} />
        <Kpi title="Revenus" value={formatEuro(totalRevenus)} />
        <Kpi title="Snapshots 30j" value={formatNumber(snapshots30.length)} />
        <Kpi title="Dernier snapshot" value={dernierSnapshot} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Ranking title="Top artistes streams" rows={topArtistesStreams} valueKey="streams" type="number" />
        <Ranking title="Top artistes revenus" rows={topArtistesRevenus} valueKey="revenus" type="euro" />
        <Ranking title="Top sorties streams" rows={topSortiesStreams} valueKey="streams" type="number" labelKey="titre" />
        <Ranking title="Top sorties revenus" rows={topSortiesRevenus} valueKey="revenus" type="euro" labelKey="titre" />
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
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
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
      <h2 className="mb-6 text-3xl font-bold">{title}</h2>

      {rows.length === 0 && (
        <p className="text-zinc-500">Aucune donnée disponible.</p>
      )}

      <div className="space-y-4">
        {rows.map((row, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-2xl border border-zinc-800 bg-black p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">#{index + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">
                  {row[labelKey] || "Non renseigné"}
                </h3>
              </div>

              <p className="text-right text-xl font-bold">
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