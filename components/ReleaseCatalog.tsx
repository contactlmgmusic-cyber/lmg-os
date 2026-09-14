"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Release = {
  id: string; titre: string | null; type: string | null; statut: string | null;
  date_sortie: string | null; cover_url: string | null; spotify_url?: string | null;
  apple_music_url?: string | null; youtube_url?: string | null; isrc?: string | null; upc?: string | null;
  artistes: { nom?: string | null } | null; projets: { titre?: string | null } | null;
};

function formatDate(value: string | null) {
  if (!value) return "Date à définir";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default function ReleaseCatalog({ releases }: { releases: Release[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Tous");
  const [status, setStatus] = useState<"all" | "preparing" | "released">("all");
  const types = useMemo(() => ["Tous", ...Array.from(new Set(releases.map((release) => release.type || "Single")))], [releases]);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const published = releases.filter((release) => release.date_sortie && new Date(release.date_sortie) <= now).length;
  const scheduled = releases.filter((release) => release.date_sortie && new Date(release.date_sortie) > now).length;
  const distributed = releases.filter((release) => release.spotify_url || release.apple_music_url || release.youtube_url).length;

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return releases.filter((release) => {
      const releaseDate = release.date_sortie ? new Date(release.date_sortie) : null;
      const typeMatch = type === "Tous" || (release.type || "Single") === type;
      const statusMatch = status === "all" || status === "released" && Boolean(releaseDate && releaseDate <= now) || status === "preparing" && (!releaseDate || releaseDate > now);
      const searchMatch = !query || [release.titre, release.type, release.statut, release.artistes?.nom, release.projets?.titre, release.isrc, release.upc].some((value) => value?.toLowerCase().includes(query));
      return typeMatch && statusMatch && searchMatch;
    });
  }, [now, releases, search, status, type]);

  return <>
    <section className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[{ label: "Catalogue", value: releases.length, detail: "sorties référencées" }, { label: "Publiées", value: published, detail: "déjà disponibles" }, { label: "Planifiées", value: scheduled, detail: "dates à venir" }, { label: "Distribuées", value: distributed, detail: "au moins un DSP" }].map((stat) => <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">{stat.label}</p><p className="mt-3 text-3xl font-bold">{stat.value}</p><p className="mt-1 text-xs text-zinc-700">{stat.detail}</p></div>)}
    </section>

    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-xl font-bold">Bibliothèque musicale</h2><p className="mt-1 text-sm text-zinc-600">{visible.length} résultat{visible.length > 1 ? "s" : ""}</p></div><div className="grid grid-cols-3 rounded-xl border border-zinc-800 bg-black p-1">{([{ id: "all", label: "Toutes" }, { id: "preparing", label: "À venir" }, { id: "released", label: "Publiées" }] as const).map((tab) => <button key={tab.id} type="button" onClick={() => setStatus(tab.id)} className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${status === tab.id ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}>{tab.label}</button>)}</div></div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un titre, un artiste, un projet, un ISRC…" className="mt-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-500" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{types.map((item) => <button key={item} type="button" onClick={() => setType(item)} className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold ${type === item ? "border-zinc-500 bg-zinc-800 text-white" : "border-zinc-900 text-zinc-600 hover:text-white"}`}>{item}</button>)}</div>
      </div>

      {visible.length === 0 ? <div className="px-6 py-20 text-center"><p className="text-lg font-semibold">Aucune sortie trouvée</p><p className="mt-2 text-sm text-zinc-600">Modifie la recherche ou réinitialise les filtres.</p><button type="button" onClick={() => { setSearch(""); setType("Tous"); setStatus("all"); }} className="mt-5 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold">Tout afficher</button></div> : <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map((release) => <Link key={release.id} href={`/sorties/${release.id}`} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-black transition hover:border-zinc-600"><div className="relative aspect-square overflow-hidden bg-zinc-900">{release.cover_url ? <img src={release.cover_url} alt={release.titre || "Cover de la sortie"} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center"><span className="rounded-full border border-zinc-800 px-4 py-2 text-xs text-zinc-600">Cover à ajouter</span></div>}<span className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/80 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">{release.type || "Single"}</span></div><div className="p-5"><p className="truncate text-xs font-semibold uppercase tracking-wider text-zinc-600">{release.artistes?.nom || "Artiste non lié"}</p><h3 className="mt-2 truncate text-xl font-bold">{release.titre || "Sortie sans titre"}</h3><p className="mt-2 truncate text-sm text-zinc-600">{release.projets?.titre || release.statut || "Sans projet lié"}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-900 pt-4"><span className="text-xs text-zinc-500">{formatDate(release.date_sortie)}</span><span className="text-xs font-semibold text-zinc-700 transition group-hover:text-white">Ouvrir →</span></div></div></Link>)}</div>}
    </section>
  </>;
}
