import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
]);

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default async function AnalyticsPage() {
  const { data: analytics } = await supabase
    .from("analytics")
    .select(`
      *,
      artistes ( id, nom ),
      projets ( id, titre ),
      sorties ( id, titre )
    `)
    .order("date_snapshot", { ascending: false });

  const allAnalytics = analytics || [];

  const totalStreams = allAnalytics.reduce((acc: number, item: any) => acc + Number(item.streams || 0), 0);
  const totalListeners = allAnalytics.reduce((acc: number, item: any) => acc + Number(item.listeners || 0), 0);
  const totalFollowers = allAnalytics.reduce((acc: number, item: any) => acc + Number(item.followers || 0), 0);
  const totalVues = allAnalytics.reduce((acc: number, item: any) => acc + Number(item.vues || 0), 0);
  const totalRevenus = allAnalytics.reduce((acc: number, item: any) => acc + Number(item.revenus || 0), 0);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Analytics
        </p>

        <h1 className="text-5xl font-bold">Analytics</h1>

        <p className="mt-3 text-zinc-400">
          Suivi des streams, vues, auditeurs, followers et revenus par artiste, projet et sortie.
        </p>
      </div>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Streams" value={formatNumber(totalStreams)} />
        <Kpi label="Auditeurs" value={formatNumber(totalListeners)} />
        <Kpi label="Followers" value={formatNumber(totalFollowers)} />
        <Kpi label="Vues" value={formatNumber(totalVues)} />
        <Kpi label="Revenus" value={formatEuro(totalRevenus)} />
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-6 text-3xl font-bold">Snapshots analytics</h2>

        {allAnalytics.length === 0 && (
          <p className="text-zinc-500">Aucune donnée analytics pour le moment.</p>
        )}

        <div className="space-y-4">
          {allAnalytics.map((item: any) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-800 bg-black p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">
                    {item.plateforme || "Plateforme"} • {item.date_snapshot || "Date non renseignée"}
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {item.sorties?.titre ||
                      item.projets?.titre ||
                      item.artistes?.nom ||
                      "Analytics"}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Artiste : {item.artistes?.nom || "Non lié"} · Projet : {item.projets?.titre || "Non lié"}
                  </p>
                </div>

                <p className="text-right text-sm text-zinc-400">
                  {formatEuro(Number(item.revenus || 0))}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                <MiniKpi label="Streams" value={formatNumber(item.streams)} />
                <MiniKpi label="Auditeurs" value={formatNumber(item.listeners)} />
                <MiniKpi label="Followers" value={formatNumber(item.followers)} />
                <MiniKpi label="Vues" value={formatNumber(item.vues)} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}