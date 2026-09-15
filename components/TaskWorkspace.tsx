"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import KanbanBoard from "@/components/KanbanBoard";

type Profile = {
  id: string;
  nom: string | null;
  avatar_url: string | null;
  role: string | null;
};

type Task = {
  id: string;
  titre: string;
  description: string | null;
  statut: string | null;
  priorite: string | null;
  deadline: string | null;
  responsable_id?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  task_assignees?: { user_id: string }[];
  responsable?: Profile | null;
};

const statusLabels = ["Tous", "À faire", "En cours", "Terminé"];
const priorityLabels = ["Toutes", "Urgente", "Haute", "Moyenne", "Basse"];

function normalizeStatus(status: string | null) {
  const value = (status || "").trim().toLowerCase();
  if (["en cours", "encours", "en_cours"].includes(value)) return "En cours";
  if (["terminé", "termine", "done", "terminee"].includes(value)) return "Terminé";
  return "À faire";
}

function formatDate(value: string | null) {
  if (!value) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function concernsUser(task: Task, userId?: string) {
  return Boolean(userId && (
    task.responsable_id === userId ||
    task.assigned_to === userId ||
    task.created_by === userId ||
    task.task_assignees?.some((assignment) => assignment.user_id === userId)
  ));
}

export default function TaskWorkspace({
  tasks,
  currentUserId,
}: {
  tasks: Task[];
  currentUserId?: string;
}) {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [priority, setPriority] = useState("Toutes");
  const [mineOnly, setMineOnly] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const metrics = useMemo(() => {
    const open = tasks.filter((task) => normalizeStatus(task.statut) !== "Terminé");
    const overdue = open.filter(
      (task) => task.deadline && new Date(task.deadline).getTime() < today.getTime()
    );
    const mine = open.filter((task) => concernsUser(task, currentUserId));
    const completed = tasks.filter((task) => normalizeStatus(task.statut) === "Terminé");
    return { open: open.length, overdue: overdue.length, mine: mine.length, completed: completed.length };
  }, [tasks, currentUserId, today]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const taskStatus = normalizeStatus(task.statut);
      const matchesSearch =
        !query ||
        task.titre.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.responsable?.nom?.toLowerCase().includes(query);
      const matchesStatus = status === "Tous" || taskStatus === status;
      const matchesPriority = priority === "Toutes" || task.priorite === priority;
      const matchesMine = !mineOnly || concernsUser(task, currentUserId);
      return Boolean(matchesSearch && matchesStatus && matchesPriority && matchesMine);
    });
  }, [tasks, search, status, priority, mineOnly, currentUserId]);

  const metricCards = [
    { label: "Tâches ouvertes", value: metrics.open, accent: "text-white" },
    { label: "Mes priorités", value: metrics.mine, accent: "text-yellow-400" },
    { label: "En retard", value: metrics.overdue, accent: "text-red-400" },
    { label: "Terminées", value: metrics.completed, accent: "text-emerald-400" },
  ];

  return (
    <div>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-500">{metric.label}</p>
            <p className={`mt-3 text-4xl font-bold ${metric.accent}`}>{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une tâche ou un responsable..."
              className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none transition focus:border-zinc-600"
            />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm">
              {statusLabels.map((label) => <option key={label}>{label}</option>)}
            </select>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm">
              {priorityLabels.map((label) => <option key={label}>{label}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setMineOnly((value) => !value)}
              className={`rounded-xl border px-4 py-3 text-sm transition ${mineOnly ? "border-yellow-400 bg-yellow-400 text-black" : "border-zinc-800 bg-black text-zinc-300 hover:border-zinc-600"}`}
            >
              Mes tâches
            </button>
          </div>

          <div className="flex rounded-xl border border-zinc-800 bg-black p-1">
            {(["kanban", "list"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setView(item)} className={`rounded-lg px-4 py-2 text-sm capitalize ${view === item ? "bg-white text-black" : "text-zinc-400"}`}>
                {item === "list" ? "Liste" : "Kanban"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-600">{filteredTasks.length} tâche(s) affichée(s)</p>
      </section>

      <div className="mt-8">
        {view === "kanban" ? (
          <KanbanBoard taches={filteredTasks} />
        ) : (
          <div className="overflow-hidden rounded-[26px] border border-zinc-800">
            {filteredTasks.length === 0 ? (
              <p className="bg-zinc-950 p-8 text-zinc-500">Aucune tâche ne correspond aux filtres.</p>
            ) : (
              filteredTasks.map((task) => (
                <Link key={task.id} href={`/taches/${task.id}`} className="grid gap-4 border-b border-zinc-800 bg-zinc-950 p-5 transition last:border-b-0 hover:bg-zinc-900 md:grid-cols-[1fr_150px_180px_150px] md:items-center">
                  <div>
                    <p className="font-semibold">{task.titre}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{task.description || "Aucune description"}</p>
                  </div>
                  <span className="text-sm text-zinc-300">{normalizeStatus(task.statut)}</span>
                  <span className="text-sm text-zinc-400">{task.responsable?.nom || "Non assignée"}</span>
                  <div className="md:text-right">
                    <p className="text-sm text-zinc-300">{formatDate(task.deadline)}</p>
                    <p className="mt-1 text-xs text-zinc-600">{task.priorite || "Priorité basse"}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
