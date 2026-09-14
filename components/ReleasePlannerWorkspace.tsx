"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ReleaseItem = {
  id: string; titre: string | null; type: string | null; statut: string | null;
  date_sortie: string | null; progress: number; progressLabel: string;
  tasksDone: number; tasksTotal: number; urgencyLabel: string;
  urgencyLevel: "danger" | "warning" | "success" | "normal" | "neutral";
  artistes: { nom?: string | null } | null;
};

const urgencyStyle = {
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  normal: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  neutral: "border-zinc-700 bg-zinc-900 text-zinc-400",
};

function formatDate(value: string | null) {
  if (!value) return "Date à définir";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default function ReleasePlannerWorkspace({ releases }: { releases: ReleaseItem[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"priority" | "active" | "ready" | "all">("priority");
  const ready = releases.filter((release) => release.progress >= 100).length;
  const late = releases.filter((release) => release.urgencyLevel === "danger" && release.urgencyLabel.startsWith("En retard")).length;
  const upcoming = releases.filter((release) => release.urgencyLevel === "danger" || release.urgencyLevel === "warning").length - late;
  const average = releases.length ? Math.round(releases.reduce((sum, release) => sum + release.progress, 0) / releases.length) : 0;

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return releases.filter((release) => {
      const statusMatch = filter === "all" || filter === "priority" && ["danger", "warning"].includes(release.urgencyLevel) || filter === "active" && release.progress < 100 || filter === "ready" && release.progress >= 100;
      const searchMatch = !query || [release.titre, release.type, release.statut, release.artistes?.nom].some((value) => value?.toLowerCase().includes(query));
      return statusMatch && searchMatch;
    });
  }, [filter, releases, search]);

  return <>
    <section className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[{ label: "Sorties suivies", value: releases.length, detail: "portefeuille total" }, { label: "30 jours", value: Math.max(0, upcoming), detail: "à sécuriser" }, { label: "Prêtes", value: ready, detail: "checklist complète" }, { label: "Progression", value: `${average}%`, detail: late ? `${late} retard${late > 1 ? "s" : ""} à traiter` : "aucun retard", danger: late > 0 }].map((stat) => <div key={stat.label} className={`rounded-2xl border p-5 ${stat.danger ? "border-red-500/30 bg-red-500/10" : "border-zinc-800 bg-zinc-950"}`}><p className={`text-xs font-semibold uppercase tracking-wider ${stat.danger ? "text-red-300" : "text-zinc-600"}`}>{stat.label}</p><p className="mt-3 text-3xl font-bold">{stat.value}</p><p className={`mt-1 text-xs ${stat.danger ? "text-red-300/60" : "text-zinc-700"}`}>{stat.detail}</p></div>)}
    </section>

    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-xl font-bold">Portefeuille des sorties</h2><p className="mt-1 text-sm text-zinc-600">{visible.length} sortie{visible.length > 1 ? "s" : ""} affichée{visible.length > 1 ? "s" : ""}</p></div><div className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-black p-1">{([{ id: "priority", label: "Priorités" }, { id: "active", label: "En cours" }, { id: "ready", label: "Prêtes" }, { id: "all", label: "Toutes" }] as const).map((tab) => <button key={tab.id} type="button" onClick={() => setFilter(tab.id)} className={`whitespace-nowrap rounded-lg px-3.5 py-2.5 text-xs font-semibold ${filter === tab.id ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}>{tab.label}</button>)}</div></div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une sortie, un artiste ou un statut…" className="mt-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-500" />
      </div>
      {visible.length === 0 ? <div className="px-6 py-20 text-center"><p className="text-lg font-semibold">Aucune sortie dans cette vue</p><p className="mt-2 text-sm text-zinc-600">Modifie la recherche ou affiche toutes les sorties.</p><button type="button" onClick={() => { setFilter("all"); setSearch(""); }} className="mt-5 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold">Tout afficher</button></div> : <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">{visible.map((release) => <Link key={release.id} href={`/release-planner/${release.id}`} className="group flex min-h-64 flex-col rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-semibold uppercase tracking-wider text-zinc-600">{release.artistes?.nom || "Artiste non lié"}</p><h3 className="mt-2 truncate text-xl font-bold">{release.titre || "Sortie sans titre"}</h3></div><span className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${urgencyStyle[release.urgencyLevel]}`}>{release.urgencyLabel}</span></div><p className="mt-4 text-sm text-zinc-500">{release.type || "Sortie"} · {release.statut || "À préparer"}</p><p className="mt-1 text-xs text-zinc-700">{formatDate(release.date_sortie)}</p><div className="mt-auto pt-7"><div className="mb-2 flex items-center justify-between text-xs"><span className="text-zinc-600">{release.tasksDone} / {release.tasksTotal} actions</span><span className="font-bold">{release.progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-zinc-900"><div className={`h-full rounded-full ${release.progress >= 100 ? "bg-emerald-500" : release.progress >= 70 ? "bg-blue-500" : release.progress >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${release.progress}%` }} /></div><div className="mt-4 flex items-center justify-between text-xs"><span className="font-semibold text-zinc-500">{release.progressLabel}</span><span className="text-zinc-700 transition group-hover:text-white">Piloter →</span></div></div></Link>)}</div>}
    </section>
  </>;
}
