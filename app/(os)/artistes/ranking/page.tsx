import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ArtistRankingPage() {
  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR]);
  const supabase = await createAuthenticatedSupabaseClient();
  const isManager = profile.role === ROLES.MANAGER;
  let artistsQuery = supabase.from("artistes").select("id, nom, style, photo_url, statut, manager_id").order("nom");
  if (isManager) artistsQuery = artistsQuery.eq("manager_id", profile.id);
  const { data: artists } = await artistsQuery;
  const artistIds = (artists || []).map((artist: any) => artist.id);
  const [{ data: analytics }, { data: bookings }, { data: releases }] = artistIds.length
    ? await Promise.all([
        supabase.from("analytics").select("artiste_id, streams, followers, vues").in("artiste_id", artistIds),
        supabase.from("bookings").select("artiste_id, statut").in("artiste_id", artistIds),
        supabase.from("sorties").select("artiste_id, statut").in("artiste_id", artistIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const ranking = (artists || []).map((artist: any) => {
    const artistAnalytics = (analytics || []).filter((item: any) => item.artiste_id === artist.id);
    const streams = total(artistAnalytics, "streams");
    const followers = total(artistAnalytics, "followers");
    const views = total(artistAnalytics, "vues");
    const confirmedBookings = (bookings || []).filter((item: any) => item.artiste_id === artist.id && item.statut === "Confirmé").length;
    const releaseCount = (releases || []).filter((item: any) => item.artiste_id === artist.id).length;
    const score = Math.min(100, Math.round(Math.min(streams / 100000, 1) * 40 + Math.min(followers / 10000, 1) * 25 + Math.min(views / 250000, 1) * 15 + Math.min(confirmedBookings / 10, 1) * 10 + Math.min(releaseCount / 5, 1) * 10));
    return { ...artist, streams, followers, views, confirmedBookings, releaseCount, score };
  }).sort((a: any, b: any) => b.score - a.score);

  const leader = ranking[0];
  const average = ranking.length ? Math.round(ranking.reduce((sum: number, artist: any) => sum + artist.score, 0) / ranking.length) : 0;
  const streamTotal = ranking.reduce((sum: number, artist: any) => sum + artist.streams, 0);

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Performance artistique</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">{isManager ? "Performance de mes artistes" : "Vue comparative du roster"}</h1><p className="mt-3 max-w-3xl text-zinc-500">Un indicateur de pilotage fondé sur l’audience, les streams, les sorties et les bookings. Il ne s’agit pas d’un classement de valeur artistique.</p></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Artistes observés" value={number(ranking.length)} /><Metric label="Score moyen" value={`${average}/100`} tone="cyan" /><Metric label="Streams cumulés" value={number(streamTotal)} /><Metric label="Dynamique la plus forte" value={leader?.nom || "Aucune donnée"} tone="yellow" /></section>
    <section className="mt-8 space-y-4">{!ranking.length ? <div className="rounded-[26px] border border-dashed border-zinc-800 p-12 text-center text-zinc-600">Aucune donnée disponible.</div> : ranking.map((artist: any, index: number) => <Link key={artist.id} href={`/artistes/${artist.id}`} className="group grid gap-5 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 transition hover:border-cyan-500/35 lg:grid-cols-[70px_minmax(220px,1fr)_repeat(5,110px)] lg:items-center"><span className="text-3xl font-black text-zinc-700">#{index + 1}</span><div className="min-w-0"><p className="truncate text-xl font-bold group-hover:text-cyan-300">{artist.nom}</p><p className="mt-1 text-xs text-zinc-600">{artist.style || "Style non renseigné"}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${artist.score}%` }} /></div></div><Value label="Score" value={`${artist.score}/100`} /><Value label="Streams" value={number(artist.streams)} /><Value label="Followers" value={number(artist.followers)} /><Value label="Vues" value={number(artist.views)} /><Value label="Bookings" value={number(artist.confirmedBookings)} /></Link>)}</section>
  </div></main>;
}

function total(rows: any[], key: string) { return rows.reduce((sum, item) => sum + Number(item[key] || 0), 0); }
function number(value: number) { return Number(value || 0).toLocaleString("fr-FR"); }
function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "cyan" | "yellow" }) { const styles = { default: "border-zinc-800 bg-zinc-950", cyan: "border-cyan-500/25 bg-cyan-500/[0.06]", yellow: "border-yellow-500/25 bg-yellow-500/[0.06]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 truncate text-2xl font-bold">{value}</p></div>; }
function Value({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-2 font-semibold">{value}</p></div>; }
