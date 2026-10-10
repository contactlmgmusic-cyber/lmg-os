import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

export default async function MobileTasksPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: tasks } = await supabase.from("taches").select("id, titre, description, statut, priorite, deadline").eq("responsable_id", user.id).neq("statut", "Terminé").order("deadline", { ascending: true, nullsFirst: false });
  const today = new Date().toISOString().split("T")[0];
  return <div className="px-5 py-6"><header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">À traiter</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Mes tâches</h1><p className="mt-2 text-sm text-zinc-500">Tes actions ouvertes, classées par échéance.</p></header><div className="mt-6 space-y-2">{tasks?.length ? tasks.map((task: any) => <Link href={`/mobile/taches/${task.id}`} key={task.id} className="block rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-4"><div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${task.deadline && task.deadline < today ? "bg-red-500" : task.priorite === "Urgente" || task.priorite === "Haute" ? "bg-[#f2b705]" : "bg-zinc-700"}`} /><div className="min-w-0 flex-1"><h2 className="text-sm font-black">{task.titre}</h2>{task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">{task.description}</p>}<div className="mt-3 flex gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-700"><span>{task.statut || "À faire"}</span><span>·</span><span>{task.deadline ? formatDate(task.deadline) : "Sans échéance"}</span></div></div><span className="text-zinc-700">›</span></div></Link>) : <Empty />}</div></div>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`)); }
function Empty() { return <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-10 text-center text-sm text-zinc-600">Aucune tâche ouverte ne t’est attribuée.</div>; }
