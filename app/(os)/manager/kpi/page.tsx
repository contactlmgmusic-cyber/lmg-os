import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ManagerKpiPage() {
  const profile = await requireRole([ROLES.MANAGER]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: artists } = await supabase.from("artistes").select("id, nom, style, photo_url").eq("manager_id", profile.id).order("nom");
  const artistIds = (artists || []).map((artist: any) => artist.id);
  const [{ data: analytics }, { data: bookings }, { data: releases }] = artistIds.length
    ? await Promise.all([
        supabase.from("analytics").select("artiste_id, streams, followers, vues, revenus").in("artiste_id", artistIds),
        supabase.from("bookings").select("artiste_id, statut").in("artiste_id", artistIds),
        supabase.from("sorties").select("artiste_id, date_sortie, statut").in("artiste_id", artistIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const rows = (artists || []).map((artist: any) => {
    const artistAnalytics = (analytics || []).filter((item: any) => item.artiste_id === artist.id);
    const streams = sum(artistAnalytics, "streams");
    const followers = sum(artistAnalytics, "followers");
    const views = sum(artistAnalytics, "vues");
    const confirmedBookings = (bookings || []).filter((item: any) => item.artiste_id === artist.id && item.statut === "Confirmé").length;
    const releaseCount = (releases || []).filter((item: any) => item.artiste_id === artist.id).length;
    const score = Math.min(100, Math.round(Math.min(streams / 100000, 1) * 40 + Math.min(followers / 10000, 1) * 25 + Math.min(views / 250000, 1) * 15 + Math.min(confirmedBookings / 10, 1) * 10 + Math.min(releaseCount / 5, 1) * 10));
    return { ...artist, streams, followers, views, confirmedBookings, releaseCount, score };
  }).sort((a: any, b: any) => b.score - a.score);

  const totalStreams = rows.reduce((total: number, artist: any) => total + artist.streams, 0);
  const totalFollowers = rows.reduce((total: number, artist: any) => total + artist.followers, 0);
  const averageScore = rows.length ? Math.round(rows.reduce((total: number, artist: any) => total + artist.score, 0) / rows.length) : 0;
  const totalBookings = rows.reduce((total: number, artist: any) => total + artist.confirmedBookings, 0);

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-5 border-b border-zinc-900 pb-8 md:flex-row md:items-end md:justify-between"><div><Link href="/manager" className="text-sm text-zinc-500 hover:text-white">← Dashboard Manager</Link><p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Performance du portefeuille</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Mes indicateurs</h1><p className="mt-3 text-zinc-500">Les performances de tes artistes uniquement, sans comparaison avec le roster global.</p></div><Link href="/artistes/ranking" className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-bold">Comparer mes artistes</Link></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Score portefeuille" value={`${averageScore}/100`} tone="yellow" /><Metric label="Streams cumulés" value={number(totalStreams)} /><Metric label="Audience cumulée" value={number(totalFollowers)} /><Metric label="Bookings confirmés" value={number(totalBookings)} /></section>
    <section className="mt-8 overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950"><div className="border-b border-zinc-800 p-6"><h2 className="text-2xl font-bold">Performance par artiste</h2><p className="mt-2 text-sm text-zinc-500">Lecture opérationnelle du portefeuille, sans données de direction générale.</p></div>{!rows.length ? <p className="p-10 text-center text-zinc-600">Aucun artiste assigné.</p> : rows.map((artist: any, index: number) => <Link key={artist.id} href={`/artistes/${artist.id}`} className="grid gap-5 border-b border-zinc-900 p-5 last:border-0 hover:bg-zinc-900/40 lg:grid-cols-[70px_1fr_repeat(4,120px)] lg:items-center"><span className="text-2xl font-black text-zinc-700">#{index + 1}</span><div><p className="text-xl font-bold">{artist.nom}</p><p className="mt-1 text-xs text-zinc-600">{artist.style || "Style non renseigné"}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-yellow-500" style={{ width: `${artist.score}%` }} /></div></div><Value label="Score" value={`${artist.score}/100`} /><Value label="Streams" value={number(artist.streams)} /><Value label="Followers" value={number(artist.followers)} /><Value label="Bookings" value={number(artist.confirmedBookings)} /></Link>)}</section>
  </div></main>;
}

function sum(rows: any[], key: string) { return rows.reduce((total, item) => total + Number(item[key] || 0), 0); }
function number(value: number) { return Number(value || 0).toLocaleString("fr-FR"); }
function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "yellow" }) { return <div className={`rounded-2xl border p-5 ${tone === "yellow" ? "border-yellow-500/25 bg-yellow-500/[0.06]" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>; }
function Value({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-2 font-semibold">{value}</p></div>; }
