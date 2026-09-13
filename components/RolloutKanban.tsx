"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type RolloutEvent = {
  id: string; titre: string; type: string | null; statut: string | null;
  date_event: string | null; notes: string | null;
  projets?: { id: string; titre: string } | null;
};

const columns = ["À faire", "En cours", "Programmé", "Publié", "Annulé"];

function formatDate(value: string | null) {
  if (!value) return "Date à définir";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function badge(status: string) {
  if (status === "Publié") return "bg-emerald-400/10 text-emerald-400";
  if (status === "Programmé") return "bg-blue-400/10 text-blue-300";
  if (status === "En cours") return "bg-yellow-400/10 text-yellow-400";
  if (status === "Annulé") return "bg-red-400/10 text-red-400";
  return "bg-zinc-800 text-zinc-300";
}

export default function RolloutKanban({ events, canManage }: { events: RolloutEvent[]; canManage: boolean }) {
  const [items, setItems] = useState(events);
  const [view, setView] = useState<"planning" | "kanban">("planning");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [project, setProject] = useState("Tous");

  const projects = useMemo(() => Array.from(new Set(items.map((item) => item.projets?.titre).filter(Boolean))) as string[], [items]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const current = item.statut || "À faire";
      const textMatch = !query || item.titre.toLowerCase().includes(query) || item.type?.toLowerCase().includes(query) || item.projets?.titre.toLowerCase().includes(query);
      return Boolean(textMatch && (status === "Tous" || current === status) && (project === "Tous" || item.projets?.titre === project));
    });
  }, [items, search, status, project]);

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const scheduled = items.filter((item) => item.statut === "Programmé").length;
  const published = items.filter((item) => item.statut === "Publié").length;
  const late = items.filter((item) => item.date_event && new Date(`${item.date_event}T12:00:00`) < now && !["Publié", "Annulé"].includes(item.statut || "À faire")).length;

  async function updateStatus(id: string, newStatus: string) {
    const previous = items;
    setItems((current) => current.map((item) => item.id === id ? { ...item, statut: newStatus } : item));
    const { error } = await supabaseBrowser.from("rollout_events").update({ statut: newStatus }).eq("id", id);
    if (error) { setItems(previous); alert(`Impossible de modifier le statut : ${error.message}`); }
  }

  function Card({ item, showBadge = true }: { item: RolloutEvent; showBadge?: boolean }) {
    const current = item.statut || "À faire";
    return (
      <article className="rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">{item.type || "Action rollout"}</p>
            <Link href={`/rollout/${item.id}`} className="mt-2 block truncate text-lg font-semibold hover:text-yellow-300">{item.titre}</Link>
          </div>
          {showBadge && <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${badge(current)}`}>{current}</span>}
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
          <span className="text-zinc-400">{item.projets?.titre || "Projet non lié"}</span>
          <span className="text-zinc-500">{formatDate(item.date_event)}</span>
        </div>
        {canManage && <select value={current} onChange={(event) => updateStatus(item.id, event.target.value)} className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">{columns.map((column) => <option key={column}>{column}</option>)}</select>}
      </article>
    );
  }

  return (
    <div>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[["Actions totales", items.length, "text-white"], ["Programmées", scheduled, "text-blue-300"], ["Publiées", published, "text-emerald-400"], ["En retard", late, "text-red-400"]].map(([label, value, color]) => (
          <div key={label} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"><p className="text-sm text-zinc-500">{label}</p><p className={`mt-3 text-4xl font-bold ${color}`}>{value}</p></div>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une action, un type ou un projet..." className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none focus:border-zinc-600" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm"><option>Tous</option>{columns.map((column) => <option key={column}>{column}</option>)}</select>
            <select value={project} onChange={(event) => setProject(event.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm"><option>Tous</option>{projects.map((name) => <option key={name}>{name}</option>)}</select>
          </div>
          <div className="flex rounded-xl border border-zinc-800 bg-black p-1">
            {(["planning", "kanban"] as const).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-4 py-2 text-sm capitalize ${view === item ? "bg-white text-black" : "text-zinc-400"}`}>{item}</button>)}
          </div>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-600">{filtered.length} action(s) affichée(s)</p>
      </section>

      {view === "planning" ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          {filtered.length === 0 ? <p className="p-8 text-zinc-500">Aucune action ne correspond aux filtres.</p> : filtered.map((item, index) => (
            <div key={item.id} className="grid border-b border-zinc-800 last:border-0 md:grid-cols-[180px_1fr]">
              <div className="border-b border-zinc-800 p-5 md:border-b-0 md:border-r"><p className="font-semibold">{formatDate(item.date_event)}</p><p className="mt-1 text-xs text-zinc-600">Étape {String(index + 1).padStart(2, "0")}</p></div>
              <div className="p-4"><Card item={item} /></div>
            </div>
          ))}
        </section>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-5">
          {columns.map((column) => { const columnItems = filtered.filter((item) => (item.statut || "À faire") === column); return (
            <section key={column} className="min-h-[420px] rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{column}</h2><span className="rounded-full bg-black px-2.5 py-1 text-xs text-zinc-500">{columnItems.length}</span></div>
              <div className="space-y-3">{columnItems.map((item) => <Card key={item.id} item={item} showBadge={false} />)}</div>
            </section>
          ); })}
        </div>
      )}
    </div>
  );
}
