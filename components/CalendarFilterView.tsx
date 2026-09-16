"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: string;
  href: string;
  color: string;
  category: string;
};

const categoryStyles: Record<string, string> = {
  Sortie: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  Rollout: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
  Contrat: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  Booking: "border-pink-500/40 bg-pink-500/10 text-pink-200",
  Relance: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  Tâche: "border-red-500/40 bg-red-500/10 text-red-200",
  Artiste: "border-blue-500/40 bg-blue-500/10 text-blue-200",
};

const categories = ["Sortie", "Rollout", "Contrat", "Booking", "Relance", "Tâche", "Artiste"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`));
}

export default function CalendarFilterView({ days, events }: { days: { key: string; day: string; isToday: boolean }[]; events: CalendarEvent[] }) {
  const [activeCategories, setActiveCategories] = useState(categories);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"month" | "agenda">("month");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events
      .filter((event) => activeCategories.includes(event.category))
      .filter((event) => !query || [event.title, event.type, event.category].some((value) => value.toLowerCase().includes(query)))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activeCategories, events, search]);

  const visibleDayKeys = new Set(days.filter((day) => day.day).map((day) => day.key));
  const monthEvents = filteredEvents.filter((event) => visibleDayKeys.has(event.date));
  const todayKey = new Date().toISOString().split("T")[0];
  const upcoming = monthEvents.filter((event) => event.date >= todayKey).length;

  function toggleCategory(category: string) {
    setActiveCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  }

  return (
    <>
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Échéances du mois" value={monthEvents.length} />
        <Metric label="À venir" value={upcoming} />
        <Metric label="Tâches" value={monthEvents.filter((event) => event.category === "Tâche").length} />
        <Metric label="Dates artistes" value={monthEvents.filter((event) => ["Booking", "Artiste", "Sortie"].includes(event.category)).length} />
      </section>

      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une date, une tâche ou un projet…" className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-500" />
          <div className="grid grid-cols-2 rounded-xl border border-zinc-800 bg-black p-1">
            <button type="button" onClick={() => setView("month")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === "month" ? "bg-white text-black" : "text-zinc-500"}`}>Mois</button>
            <button type="button" onClick={() => setView("agenda")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === "agenda" ? "bg-white text-black" : "text-zinc-500"}`}>Agenda</button>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => <button key={category} type="button" onClick={() => toggleCategory(category)} className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition ${activeCategories.includes(category) ? categoryStyles[category] : "border-zinc-900 text-zinc-700"}`}>{category}</button>)}
        </div>
      </section>

      {view === "agenda" ? (
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          {monthEvents.length === 0 ? <Empty /> : monthEvents.map((event) => <Link key={`${event.category}-${event.id}`} href={event.href} className="flex flex-col gap-3 border-b border-zinc-800 p-5 transition last:border-0 hover:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"><div><span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${categoryStyles[event.category]}`}>{event.category}</span><p className="mt-2 font-semibold">{event.title}</p><p className="mt-1 text-sm text-zinc-600">{event.type}</p></div><p className="text-sm font-semibold capitalize text-zinc-400">{formatDate(event.date)}</p></Link>)}
        </section>
      ) : (
        <div className="overflow-x-auto pb-3">
          <div className="min-w-[980px]">
            <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-600">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const dayEvents = monthEvents.filter((event) => event.date === day.key);
                return <div key={day.key} className={`min-h-40 rounded-2xl border p-3 ${!day.day ? "border-transparent bg-transparent" : day.isToday ? "border-yellow-400/60 bg-yellow-400/[0.04]" : "border-zinc-800 bg-zinc-950"}`}>
                  {day.day && <div className="mb-3 flex items-center justify-between"><span className={`text-sm font-bold ${day.isToday ? "text-yellow-300" : "text-zinc-400"}`}>{day.day}</span>{dayEvents.length > 0 && <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">{dayEvents.length}</span>}</div>}
                  <div className="space-y-2">{dayEvents.slice(0, 4).map((event) => <Link key={`${event.category}-${event.id}`} href={event.href} className={`block rounded-lg border px-2.5 py-2 text-[11px] transition hover:border-white/30 ${categoryStyles[event.category]}`}><p className="truncate font-semibold">{event.title}</p><p className="mt-1 truncate opacity-60">{event.type}</p></Link>)}{dayEvents.length > 4 && <button type="button" onClick={() => setView("agenda")} className="text-[10px] font-semibold text-zinc-500 hover:text-white">+ {dayEvents.length - 4} autres</button>}</div>
                </div>;
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}

function Empty() {
  return <div className="p-12 text-center"><p className="font-semibold">Aucune échéance à afficher</p><p className="mt-2 text-sm text-zinc-600">Modifie les filtres ou sélectionne un autre mois.</p></div>;
}
