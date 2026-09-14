"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CalendarCommandItem = {
  id: string;
  type: string;
  titre: string;
  date: string;
  statut?: string | null;
  link: string;
  description?: string | null;
};

const typeStyles: Record<string, string> = {
  Rollout: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  Booking: "border-pink-500/30 bg-pink-500/10 text-pink-200",
  "Relance média": "border-amber-500/30 bg-amber-500/10 text-amber-200",
  "Relance influenceur": "border-orange-500/30 bg-orange-500/10 text-orange-200",
  "Relance partenaire": "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  Tâche: "border-red-500/30 bg-red-500/10 text-red-200",
  "Release Planner": "border-violet-500/30 bg-violet-500/10 text-violet-200",
};

const resolvedStatuses = ["Terminé", "Publié", "Refusé", "Confirmé", "Annulé", "Signé", "Payé", "Sorti", "Réalisé"];
const excludedUpcomingStatuses = ["Terminé", "Annulé", "Refusé"];

function startOfDay(value: string | Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function dayDistance(value: string, today: Date) {
  return Math.ceil((startOfDay(value).getTime() - today.getTime()) / 86_400_000);
}

export default function CalendarCommandCenter({ items }: { items: CalendarCommandItem[] }) {
  const types = useMemo(() => Array.from(new Set(items.map((item) => item.type))), [items]);
  const [activeTypes, setActiveTypes] = useState<string[]>(types);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"upcoming" | "late" | "all">("upcoming");
  const today = startOfDay(new Date());
  const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);

  const upcoming = items.filter((item) => startOfDay(item.date) >= today && !excludedUpcomingStatuses.includes(item.statut || ""));
  const late = items.filter((item) => startOfDay(item.date) < today && !resolvedStatuses.includes(item.statut || ""));
  const todayItems = upcoming.filter((item) => startOfDay(item.date).getTime() === today.getTime());
  const next7Days = upcoming.filter((item) => startOfDay(item.date) <= in7Days);

  const visibleItems = useMemo(() => {
    const source = view === "upcoming" ? upcoming : view === "late" ? late : items;
    const query = search.trim().toLowerCase();
    return source.filter((item) => activeTypes.includes(item.type) && (!query || [item.titre, item.type, item.description, item.statut].some((value) => value?.toLowerCase().includes(query))));
  }, [activeTypes, items, late, search, upcoming, view]);

  const grouped = useMemo(() => visibleItems.reduce<Record<string, CalendarCommandItem[]>>((groups, item) => {
    const key = item.date.slice(0, 10);
    (groups[key] ||= []).push(item);
    return groups;
  }, {}), [visibleItems]);

  function toggleType(type: string) {
    setActiveTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  }

  return <>
    <section className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        { label: "Aujourd’hui", value: todayItems.length, detail: "actions du jour" },
        { label: "7 prochains jours", value: next7Days.length, detail: "échéances proches" },
        { label: "À venir", value: upcoming.length, detail: "éléments ouverts" },
        { label: "En retard", value: late.length, detail: late.length ? "à traiter en priorité" : "aucun blocage", danger: late.length > 0 },
      ].map((stat) => <div key={stat.label} className={`rounded-2xl border p-5 ${stat.danger ? "border-red-500/30 bg-red-500/10" : "border-zinc-800 bg-zinc-950"}`}><p className={`text-xs font-semibold uppercase tracking-wider ${stat.danger ? "text-red-300" : "text-zinc-600"}`}>{stat.label}</p><p className="mt-3 text-3xl font-bold">{stat.value}</p><p className={`mt-1 text-xs ${stat.danger ? "text-red-300/60" : "text-zinc-700"}`}>{stat.detail}</p></div>)}
    </section>

    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-xl font-bold">Échéancier opérationnel</h2><p className="mt-1 text-sm text-zinc-600">{visibleItems.length} élément{visibleItems.length > 1 ? "s" : ""} affiché{visibleItems.length > 1 ? "s" : ""}</p></div>
          <div className="grid grid-cols-3 rounded-xl border border-zinc-800 bg-black p-1">
            {([{ id: "upcoming", label: "À venir" }, { id: "late", label: `Retards${late.length ? ` · ${late.length}` : ""}` }, { id: "all", label: "Tout" }] as const).map((tab) => <button key={tab.id} type="button" onClick={() => setView(tab.id)} className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${view === tab.id ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}>{tab.label}</button>)}
          </div>
        </div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une échéance, un statut ou un type…" className="mt-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-500" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {types.map((type) => { const active = activeTypes.includes(type); return <button key={type} type="button" onClick={() => toggleType(type)} className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition ${active ? typeStyles[type] || "border-zinc-600 bg-zinc-800 text-white" : "border-zinc-900 text-zinc-700"}`}>{type}</button>; })}
        </div>
      </div>

      {visibleItems.length === 0 ? <div className="px-6 py-20 text-center"><p className="text-lg font-semibold">Rien à afficher</p><p className="mt-2 text-sm text-zinc-600">Les filtres actifs ne contiennent aucune échéance.</p><button type="button" onClick={() => { setActiveTypes(types); setSearch(""); }} className="mt-5 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold">Réinitialiser les filtres</button></div> : <div className="divide-y divide-zinc-900">
        {Object.entries(grouped).map(([date, dateItems]) => {
          const distance = dayDistance(date, today);
          return <div key={date} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[170px_1fr]">
            <div><p className="text-sm font-bold capitalize">{formatLongDate(date)}</p><p className={`mt-1 text-xs font-semibold ${distance < 0 ? "text-red-400" : distance === 0 ? "text-emerald-400" : "text-zinc-600"}`}>{distance < 0 ? `Retard de ${Math.abs(distance)} j` : distance === 0 ? "Aujourd’hui" : `J-${distance}`}</p></div>
            <div className="grid gap-3 xl:grid-cols-2">{dateItems.map((item) => <Link key={`${item.type}-${item.id}`} href={item.link} className="group rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-zinc-600"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${typeStyles[item.type] || "border-zinc-700 bg-zinc-900 text-zinc-400"}`}>{item.type}</span><h3 className="mt-3 truncate font-bold group-hover:text-zinc-200">{item.titre}</h3>{item.description && <p className="mt-1 truncate text-sm text-zinc-600">{item.description}</p>}</div><span className="shrink-0 rounded-full border border-zinc-800 px-2.5 py-1 text-[10px] text-zinc-500">{item.statut || "À faire"}</span></div></Link>)}</div>
          </div>;
        })}
      </div>}
    </section>
  </>;
}
