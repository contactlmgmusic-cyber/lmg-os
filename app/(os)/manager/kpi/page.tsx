import Link from "next/link";
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

export default async function ManagerKpiPage() {
  const profile = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
  ]);

  const isManager = profile?.role === ROLES.MANAGER;

  const { data: artistes } = await supabase
    .from("artistes")
    .select("id, nom, style, photo_url, manager_id")
    .order("nom");

  const visibleArtistes = isManager
    ? artistes?.filter((artiste: any) => artiste.manager_id === profile.id) || []
    : artistes || [];

  const artisteIds = visibleArtistes.map((artiste: any) => artiste.id);

  const { data: analytics } =
    artisteIds.length > 0
      ? await supabase.from("analytics").select("*").in("artiste_id", artisteIds)
      : { data: [] };

  const { data: bookings } =
    artisteIds.length > 0
      ? await supabase.from("bookings").select("*").in("artiste_id", artisteIds)
      : { data: [] };

  const { data: sorties } =
    artisteIds.length > 0
      ? await supabase.from("sorties").select("*").in("artiste_id", artisteIds)
      : { data: [] };

  const totalStreams =
    analytics?.reduce((acc: number, item: any) => acc + Number(item.streams || 0), 0) || 0;

  const totalFollowers =
    analytics?.reduce((acc: number, item: any) => acc + Number(item.followers || 0), 0) || 0;

  const totalRevenus =
    analytics?.reduce((acc: number, item: any) => acc + Number(item.revenus || 0), 0) || 0;

  const bookingsConfirmes =
    bookings?.filter((booking: any) => booking.statut === "Confirmé").length || 0;

  const sortiesCount = sorties?.length || 0;

  const managerScore = Math.min(
    100,
    Math.round(
      Math.min(visibleArtistes.length / 5, 1) * 20 +
        Math.min(totalStreams / 500000, 1) * 25 +
        Math.min(totalFollowers / 50000, 1) * 15 +
        Math.min(totalRevenus / 10000, 1) * 20 +
        Math.min(bookingsConfirmes / 20, 1) * 20
    )
  );

  const topArtistes = visibleArtistes
    .map((artiste: any) => {
      const rows =
        analytics?.filter((item: any) => item.artiste_id === artiste.id) || [];

      const streams = rows.reduce(
        (acc: number, item: any) => acc + Number(item.streams || 0),
        0
      );

      const revenus = rows.reduce(
        (acc: number, item: any) => acc + Number(item.revenus || 0),
        0
      );

      return {
        ...artiste,
        streams,
        revenus,
      };
    })
    .sort((a: any, b: any) => b.streams - a.streams)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Manager Performance
        </p>

        <h1 className="text-5xl font-bold">KPI Manager</h1>

        <p className="mt-3 text-zinc-400">
          Pilotage des artistes, performances, bookings et revenus.
        </p>
      </div>

      <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
              Score manager
            </p>

            <h2 className="text-6xl font-bold">{managerScore} / 100</h2>

            <p className="mt-3 text-zinc-400">
              Score calculé selon artistes gérés, streams, followers, revenus et bookings.
            </p>
          </div>

          <div className="w-full xl:w-96">
            <div className="h-4 overflow-hidden rounded-full bg-black">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${managerScore}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <Kpi label="Artistes gérés" value={formatNumber(visibleArtistes.length)} />
        <Kpi label="Streams" value={formatNumber(totalStreams)} />
        <Kpi label="Followers" value={formatNumber(totalFollowers)} />
        <Kpi label="Revenus" value={formatEuro(totalRevenus)} />
        <Kpi label="Bookings confirmés" value={formatNumber(bookingsConfirmes)} />
        <Kpi label="Sorties" value={formatNumber(sortiesCount)} />
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-6 text-3xl font-bold">Top artistes du manager</h2>

        {topArtistes.length === 0 && (
          <p className="text-zinc-500">Aucune donnée artiste disponible.</p>
        )}

        <div className="space-y-4">
          {topArtistes.map((artiste: any, index: number) => (
            <Link
              key={artiste.id}
              href={`/artistes/${artiste.id}`}
              className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-bold text-zinc-600">
                    #{index + 1}
                  </p>

                  {artiste.photo_url ? (
                    <img
                      src={artiste.photo_url}
                      alt={artiste.nom}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
                      👤
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold">{artiste.nom}</h3>
                    <p className="text-sm text-zinc-500">
                      {artiste.style || "Style non renseigné"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-zinc-500">Streams</p>
                    <p className="font-semibold">{formatNumber(artiste.streams)}</p>
                  </div>

                  <div>
                    <p className="text-zinc-500">Revenus</p>
                    <p className="font-semibold">{formatEuro(artiste.revenus)}</p>
                  </div>
                </div>
              </div>
            </Link>
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