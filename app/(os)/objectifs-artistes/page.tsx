import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function progress(current: number, target: number) {
  if (!target || target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

export default async function ObjectifsArtistesPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

  const { data: objectifs } = await supabase
    .from("artiste_objectifs")
    .select(`
      *,
      artistes (
        id,
        nom,
        photo_url,
        style
      )
    `)
    .order("created_at", { ascending: false });

  const { data: analytics } = await supabase.from("analytics").select("*");
  const { data: bookings } = await supabase.from("bookings").select("*");
  const { data: sorties } = await supabase.from("sorties").select("*");

  const rows =
    objectifs?.map((objectif: any) => {
      const artisteId = objectif.artiste_id;

      const artistAnalytics =
        analytics?.filter((item: any) => item.artiste_id === artisteId) || [];

      const artistBookings =
        bookings?.filter(
          (item: any) =>
            item.artiste_id === artisteId && item.statut === "Confirmé"
        ) || [];

      const artistSorties =
        sorties?.filter((item: any) => item.artiste_id === artisteId) || [];

      const streams = artistAnalytics.reduce(
        (acc: number, item: any) => acc + Number(item.streams || 0),
        0
      );

      const followers = artistAnalytics.reduce(
        (acc: number, item: any) => acc + Number(item.followers || 0),
        0
      );

      const score =
        Math.round(
          (progress(streams, objectif.streams_objectif) +
            progress(followers, objectif.followers_objectif) +
            progress(
              artistBookings.length,
              objectif.bookings_objectif
            ) +
            progress(artistSorties.length, objectif.sorties_objectif)) /
            4
        ) || 0;

      return {
        ...objectif,
        streams,
        followers,
        bookings: artistBookings.length,
        sorties: artistSorties.length,
        score,
      };
    }) || [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Artist Goals
          </p>

          <h1 className="text-5xl font-bold">Objectifs artistes</h1>

          <p className="mt-3 text-zinc-400">
            Suivi des objectifs streams, followers, bookings et sorties.
          </p>
        </div>

        <Link
          href="/objectifs-artistes/create"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouvel objectif
        </Link>
      </div>

      <section className="space-y-5">
        {rows.length === 0 && (
          <p className="text-zinc-500">Aucun objectif artiste.</p>
        )}

        {rows.map((item: any) => (
          <Link
            key={item.id}
            href={`/artistes/${item.artiste_id}`}
            className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600"
          >
            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                {item.artistes?.photo_url ? (
                  <img
                    src={item.artistes.photo_url}
                    alt={item.artistes?.nom}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                    👤
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold">
                    {item.artistes?.nom || "Artiste"}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Période : {item.periode || "2026"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-700 bg-black px-6 py-4 text-center">
                <p className="text-sm text-zinc-500">Progression globale</p>
                <p className="mt-1 text-3xl font-bold">{item.score}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <GoalBar
                label="Streams"
                current={item.streams}
                target={item.streams_objectif}
              />

              <GoalBar
                label="Followers"
                current={item.followers}
                target={item.followers_objectif}
              />

              <GoalBar
                label="Bookings"
                current={item.bookings}
                target={item.bookings_objectif}
              />

              <GoalBar
                label="Sorties"
                current={item.sorties}
                target={item.sorties_objectif}
              />
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

function GoalBar({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const percent = progress(current, target);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="text-sm font-semibold">{percent}%</p>
      </div>

      <p className="mb-3 text-xl font-bold">
        {formatNumber(current)} / {formatNumber(target)}
      </p>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}