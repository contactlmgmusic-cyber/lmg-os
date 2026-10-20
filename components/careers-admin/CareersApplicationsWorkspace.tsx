"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  ["new", "Nouvelle"], ["review", "À étudier"], ["interview", "Entretien"],
  ["selected", "Retenue"], ["rejected", "Refusée"], ["talent_pool", "Vivier"],
] as const;

type Application = {
  id: string; first_name: string; last_name: string; email: string; status: string;
  created_at: string; assigned_to: string | null; assignee_name: string | null;
  next_action: string | null; next_action_at: string | null; opportunity: string;
  department: string | null; archived_at: string | null;
};

export default function CareersApplicationsWorkspace({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [deadline, setDeadline] = useState("all");
  const [view, setView] = useState<"list" | "board">("list");
  const [moving, setMoving] = useState<string | null>(null);
  const assignees = useMemo(() => [...new Set(applications.map((item) => item.assignee_name).filter(Boolean))] as string[], [applications]);
  const filtered = useMemo(() => applications.filter((item) => {
    const haystack = `${item.first_name} ${item.last_name} ${item.email} ${item.opportunity} ${item.department || ""}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (status !== "all" && item.status !== status) return false;
    if (assignee === "unassigned" && item.assigned_to) return false;
    if (assignee !== "all" && assignee !== "unassigned" && item.assignee_name !== assignee) return false;
    if (deadline === "overdue" && !isOverdue(item.next_action_at)) return false;
    if (deadline === "unscheduled" && item.next_action_at) return false;
    if (deadline === "upcoming" && (!item.next_action_at || isOverdue(item.next_action_at))) return false;
    return true;
  }), [applications, query, status, assignee, deadline]);

  async function move(id: string, nextStatus: string) {
    setMoving(id);
    const response = await fetch(`/api/careers/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    setMoving(null);
    if (response.ok) router.refresh();
  }

  function exportCsv() {
    const rows = [["Prénom", "Nom", "Email", "Opportunité", "Statut", "Responsable", "Prochaine action", "Échéance", "Reçue le"], ...filtered.map((item) => [item.first_name, item.last_name, item.email, item.opportunity, label(item.status), item.assignee_name || "Non attribuée", item.next_action || "", item.next_action_at || "", item.created_at])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `lmg-careers-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-4">
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 text-white">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_190px_180px_auto]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un candidat, une offre…" className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none placeholder:text-zinc-600 focus:border-amber-400/50" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"><option value="all">Tous les statuts</option>{statuses.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
        <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"><option value="all">Tous les responsables</option><option value="unassigned">Non attribuées</option>{assignees.map((name) => <option key={name}>{name}</option>)}</select>
        <select value={deadline} onChange={(event) => setDeadline(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"><option value="all">Toutes les échéances</option><option value="overdue">En retard</option><option value="upcoming">À venir</option><option value="unscheduled">Sans suivi</option></select>
        <button type="button" onClick={exportCsv} className="rounded-xl border border-amber-400/30 px-4 py-2.5 text-sm font-semibold text-amber-300">Exporter CSV</button>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4"><p className="text-xs text-zinc-500">{filtered.length} dossier{filtered.length > 1 ? "s" : ""}</p><div className="flex rounded-lg border border-white/10 p-1 text-xs"><button onClick={() => setView("list")} className={`rounded-md px-3 py-1.5 ${view === "list" ? "bg-amber-400 text-black" : "text-zinc-400"}`}>Liste</button><button onClick={() => setView("board")} className={`rounded-md px-3 py-1.5 ${view === "board" ? "bg-amber-400 text-black" : "text-zinc-400"}`}>Pipeline</button></div></div>
    </section>
    {view === "list" ? <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-white"><div className="divide-y divide-white/10">{filtered.map((item) => <ApplicationRow key={item.id} item={item} />)}{filtered.length === 0 && <Empty />}</div></div> :
      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">{statuses.map(([value, text]) => <section key={value} className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950 p-3 text-white"><div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{text}</h2><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-zinc-500">{filtered.filter((item) => item.status === value).length}</span></div><div className="space-y-2">{filtered.filter((item) => item.status === value).map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><Link href={`/recrutement/candidatures/${item.id}`} className="block text-sm font-medium hover:text-amber-300">{item.first_name} {item.last_name}</Link><p className="mt-1 truncate text-[11px] text-zinc-500">{item.opportunity}</p><select disabled={moving === item.id} value={item.status} onChange={(event) => move(item.id, event.target.value)} className="mt-3 w-full rounded-lg border border-white/10 bg-black px-2 py-1.5 text-[11px]">{statuses.map(([state, stateLabel]) => <option key={state} value={state}>{stateLabel}</option>)}</select></article>)}</div></section>)}</div>}
  </div>;
}

function ApplicationRow({ item }: { item: Application }) {
  return <Link href={`/recrutement/candidatures/${item.id}`} className="grid gap-4 px-5 py-4 transition hover:bg-white/[0.035] md:grid-cols-[1.2fr_1fr_150px_160px] md:items-center"><div><p className="font-medium">{item.first_name} {item.last_name}</p><p className="mt-1 text-xs text-zinc-500">{item.email}</p></div><div><p className="text-sm">{item.opportunity}</p><p className="mt-1 text-xs text-zinc-500">{item.assignee_name ? `Responsable · ${item.assignee_name}` : "Non attribuée"}</p></div><span className="w-fit rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300">{label(item.status)}</span><div className="text-xs text-zinc-500"><p>{formatDate(item.created_at)}</p><p className={`mt-1 truncate ${isOverdue(item.next_action_at) ? "text-red-400" : ""}`}>{item.next_action || "Aucun suivi planifié"}</p></div></Link>;
}
function Empty() { return <p className="px-6 py-12 text-center text-sm text-zinc-500">Aucun dossier ne correspond aux filtres.</p>; }
function label(value: string) { return statuses.find(([key]) => key === value)?.[1] || value; }
function isOverdue(value: string | null) { return Boolean(value && Date.parse(value) < Date.now()); }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value)); }
