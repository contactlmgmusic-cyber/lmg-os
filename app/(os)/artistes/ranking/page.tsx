import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function getLevel(score: number) {
  if (score >= 90) return "💎 Diamond Artist";
  if (score >= 75) return "🏆 Platinum Artist";
  if (score >= 60) return "🥇 Gold Artist";
  if (score >= 40) return "🥈 Silver Artist";
  return "🥉 Bronze Artist";
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default async function ArtistRankingPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

  const { data: artistes } = await supabase
    .from("artistes")
    .select("id, nom, style, photo_url, statut")
    .order("nom");

  const { data: analytics } = await supabase.from("analytics").select("*");
  const { data: bookings } = await supabase.from("bookings").select("*");
  const { data: sorties } = await supabase.from("sorties").select("*");

  const ranking =
    artistes
      ?.map((artiste: any) => {
        const artistAnalytics =
          analytics?.filter((item: any) => item.artiste_id === artiste.id) || [];

        const artistBookings =
          bookings?.filter((item: any) => item.artiste_id === artiste.id) || [];

        const artistSorties =
          sorties?.filter((item: any) => item.artiste_id === artiste.id) || [];

        const streams = artistAnalytics.reduce(
          (acc: number, item: any) => acc + Number(item.streams || 0),
          0
        );

        const followers = artistAnalytics.reduce(
          (acc: number, item: any) => acc + Number(item.followers || 0),
          0
        );

        const revenus = artistAnalytics.reduce(
          (acc: number, item: any) => acc + Number(item.revenus || 0),
          0
        );

        const bookingsConfirmes = artistBookings.filter(
          (booking: any) => booking.statut === "Confirmé"
        ).length;

        const sortiesCount = artistSorties.length;

        const score = Math.min(
          100,
          Math.round(
            Math.min(streams / 100000, 1) * 30 +
              Math.min(followers / 10000, 1) * 20 +
              Math.min(revenus / 5000, 1) * 20 +
              Math.min(bookingsConfirmes / 10, 1) * 15 +
              Math.min(sortiesCount / 5, 1) * 15
          )
        );

        return {
          ...artiste,
          streams,
          followers,
          revenus,
          bookingsConfirmes,
          sortiesCount,
          score,
          level: getLevel(score),
        };
      })
      .sort((a: any, b: any) => b.score - a.score) || [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Artist Performance
        </p>

        <h1 className="text-5xl font-bold">Classement artistes</h1>

        <p className="mt-3 text-zinc-400">
          Classement automatique selon streams, followers, revenus, bookings et
          sorties.
        </p>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 xl:p-8">
        {ranking.length === 0 && (
          <p className="text-zinc-500">Aucun artiste disponible.</p>
        )}

        <div className="space-y-5">
          {ranking.map((artiste: any, index: number) => (
            <Link
              key={artiste.id}
              href={`/artistes/${artiste.id}`}
              className="block rounded-3xl border border-zinc-800 bg-black p-6 transition hover:border-zinc-500"
            >
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[90px_minmax(260px,1.4fr)_150px_150px_150px_150px_130px_110px] xl:items-center">
                <div className="text-4xl font-bold text-zinc-500">
                  #{index + 1}
                </div>

                <div className="flex min-w-0 items-center gap-5">
                  {artiste.photo_url ? (
                    <img
                      src={artiste.photo_url}
                      alt={artiste.nom}
                      className="h-20 w-20 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                      👤
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-bold">
                      {artiste.nom}
                    </h2>

                    <p className="mt-1 max-w-[260px] truncate text-sm text-zinc-500">
                      {artiste.style || "Style non renseigné"}
                    </p>

                    <p className="mt-3 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                      {artiste.level}
                    </p>
                  </div>
                </div>

                <RankingItem label="Score" value={`${artiste.score}/100`} />
                <RankingItem label="Streams" value={formatNumber(artiste.streams)} />
                <RankingItem label="Followers" value={formatNumber(artiste.followers)} />
                <RankingItem label="Revenus" value={formatEuro(artiste.revenus)} />
                <RankingItem label="Bookings" value={formatNumber(artiste.bookingsConfirmes)} />
                <RankingItem label="Sorties" value={formatNumber(artiste.sortiesCount)} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function RankingItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="whitespace-nowrap text-xs uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  );
}