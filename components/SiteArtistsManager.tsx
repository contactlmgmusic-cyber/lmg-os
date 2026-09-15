"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Artist = { id: string; nom: string | null; slug: string | null; style: string | null; photo_url: string | null; is_public: boolean | null; featured: boolean | null; display_order: number | null };

export default function SiteArtistsManager() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => { void load(); }, []);
  async function load() {
    const response = await fetch("/api/site-internet/artistes", { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(result.error || "Chargement impossible."); setLoading(false); return; }
    setArtists(result.artists || []); setLoading(false);
  }
  async function update(id: string, patch: Partial<Artist>) {
    setSavingId(id); setMessage("");
    const response = await fetch("/api/site-internet/artistes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(result.error || "Modification impossible."); setSavingId(null); return; }
    setArtists((items) => items.map((item) => item.id === id ? { ...item, ...patch, ...(result.patch || {}) } : item));
    setSavingId(null); setMessage("Modification enregistrée.");
  }
  if (loading) return <main className="min-h-screen bg-black p-8 text-zinc-400">Chargement des artistes…</main>;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]"><header className="flex flex-col gap-5 border-b border-zinc-900 pb-8 md:flex-row md:items-end md:justify-between"><div><Link href="/site-internet" className="text-sm text-zinc-500 hover:text-white">← Site Internet</Link><p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Pilotage éditorial</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Artistes publics</h1><p className="mt-3 text-zinc-400">Choisis les profils visibles, mis en avant et leur priorité d’affichage.</p></div><a href="/site/artistes" target="_blank" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold">Voir le site →</a></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-3"><Stat label="Total" value={artists.length} /><Stat label="Publics" value={artists.filter((item) => item.is_public).length} /><Stat label="Mis en avant" value={artists.filter((item) => item.featured).length} /></section>
    {message && <p className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">{message}</p>}
    <section className="mt-8 space-y-4">{artists.map((artist) => <article key={artist.id} className={`grid gap-5 rounded-[26px] border bg-zinc-950 p-5 lg:grid-cols-[88px_1fr_auto] lg:items-center ${artist.featured ? "border-yellow-500/30" : "border-zinc-800"}`}><div className="relative h-[88px] w-[88px] overflow-hidden rounded-2xl bg-zinc-900">{artist.photo_url ? <Image src={artist.photo_url} alt={artist.nom || "Artiste LMG"} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-zinc-600">Sans photo</div>}</div><div><p className="text-xs font-bold uppercase tracking-wider text-yellow-500">{artist.style || "Artiste"}</p><h2 className="mt-2 text-2xl font-bold">{artist.nom || "Sans nom"}</h2><div className="mt-3 flex gap-4 text-xs text-zinc-500">{artist.slug && <a href={`/site/artistes/${artist.slug}`} target="_blank" className="hover:text-white">Voir la page →</a>}<Link href={`/artistes/${artist.id}`} className="hover:text-white">Ouvrir la fiche →</Link></div></div><div className="grid grid-cols-3 gap-3"><Toggle label="Public" active={Boolean(artist.is_public)} disabled={savingId === artist.id} onClick={() => update(artist.id, { is_public: !artist.is_public })} /><Toggle label="Featured" active={Boolean(artist.featured)} disabled={savingId === artist.id} onClick={() => update(artist.id, { featured: !artist.featured })} /><label className="text-xs text-zinc-500">Ordre<input type="number" min={0} defaultValue={artist.display_order || 0} disabled={savingId === artist.id} onBlur={(e) => update(artist.id, { display_order: Number(e.target.value) || 0 })} className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-center text-white" /></label></div></article>)}{!artists.length && <p className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-600">Aucun artiste disponible.</p>}</section>
  </div></main>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>; }
function Toggle({ label, active, disabled, onClick }: { label: string; active: boolean; disabled: boolean; onClick: () => void }) { return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl border px-4 py-3 text-xs font-bold ${active ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-zinc-800 bg-black text-zinc-500"}`}>{label}<span className="mt-1 block text-[10px]">{active ? "Actif" : "Inactif"}</span></button>; }

