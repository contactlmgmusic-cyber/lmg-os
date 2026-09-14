import Link from "next/link";
import WeeklyReviewEditor from "@/components/WeeklyReviewEditor";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];

export default async function WeeklyReviewPage() {
  await requireRole(allowed);
  const supabase = await createAuthenticatedSupabaseClient();
  const weekStart = getWeekStart();
  const weekEnd = new Date(`${weekStart}T12:00:00`); weekEnd.setDate(weekEnd.getDate() + 6);
  const today = new Date().toISOString().split("T")[0];
  const [{ data: review }, { data: tasks }, { data: projects }, { data: profiles }] = await Promise.all([
    supabase.from("weekly_reviews").select("*").eq("week_start", weekStart).maybeSingle(),
    supabase.from("taches").select("id, titre, statut, priorite, deadline, responsable:profiles!taches_responsable_id_fkey(nom, full_name)").order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("internal_projects").select("id, titre, pole, statut, priorite, deadline, progression").not("statut", "in", '("Terminé","Archivé")').order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("profiles").select("id, nom, full_name").in("role", ["super_admin","admin","artistic_director","manager"]).order("nom"),
  ]);
  const { data: decisions } = review?.id ? await supabase.from("weekly_review_decisions").select("id, decision, deadline, owner:profiles!weekly_review_decisions_owner_id_fkey(nom, full_name), project:internal_projects!weekly_review_decisions_internal_project_id_fkey(titre)").eq("review_id", review.id).order("created_at") : { data: [] };
  const lateTasks = (tasks || []).filter((item: any) => item.deadline && item.deadline < today && item.statut !== "Terminé");
  const doneTasks = (tasks || []).filter((item: any) => item.statut === "Terminé");
  const urgentProjects = (projects || []).filter((item: any) => item.priorite === "Urgente" || (item.deadline && item.deadline < today));

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between"><div><Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Dashboard</Link><p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Pilotage hebdomadaire</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Revue de la semaine</h1><p className="mt-3 text-zinc-500">Du {formatDate(weekStart)} au {formatDate(weekEnd.toISOString().split("T")[0])}</p></div><div className="flex flex-wrap gap-3"><Link href="/dashboard/objectifs-lmg" className="w-fit rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">Objectifs trimestriels</Link><Link href="/taches/nouveau" className="w-fit rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Créer une action</Link></div></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Tâches terminées" value={doneTasks.length} /><Metric label="Tâches en retard" value={lateTasks.length} danger={lateTasks.length > 0} /><Metric label="Projets internes actifs" value={(projects || []).length} /><Metric label="Projets à surveiller" value={urgentProjects.length} danger={urgentProjects.length > 0} /></section>
    <section className="mt-8 grid gap-6 xl:grid-cols-2"><Snapshot title="Retards à reprendre" empty="Aucune tâche en retard." items={lateTasks.slice(0, 6).map((item: any) => ({ id: item.id, title: item.titre, meta: item.responsable?.nom || item.responsable?.full_name || "Non attribuée", href: `/taches/${item.id}` }))} /><Snapshot title="Projets à surveiller" empty="Aucun projet interne critique." items={urgentProjects.slice(0, 6).map((item: any) => ({ id: item.id, title: item.titre, meta: `${item.pole || "Direction"} · ${item.progression || 0}%`, href: `/projets-internes/${item.id}` }))} /></section>
    <div className="mt-8"><WeeklyReviewEditor weekStart={weekStart} review={review as any} decisions={(decisions || []) as any} profiles={(profiles || []).map((item: any) => ({ id: item.id, label: item.nom || item.full_name || "Membre LMG" }))} projects={(projects || []).map((item: any) => ({ id: item.id, label: item.titre }))} /></div>
  </div></main>;
}

function Metric({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) { return <div className={`rounded-2xl border p-5 ${danger ? "border-red-500/25 bg-red-500/[0.06]" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className={`mt-3 text-4xl font-bold ${danger ? "text-red-300" : ""}`}>{value}</p></div>; }
function Snapshot({ title, items, empty }: { title: string; items: { id: string; title: string; meta: string; href: string }[]; empty: string }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><h2 className="text-xl font-bold">{title}</h2><div className="mt-4">{!items.length ? <p className="rounded-xl border border-dashed border-zinc-800 p-7 text-center text-sm text-zinc-600">{empty}</p> : items.map((item) => <Link key={item.id} href={item.href} className="flex items-center justify-between gap-4 border-b border-zinc-900 py-4 last:border-0"><div className="min-w-0"><p className="truncate font-semibold hover:text-yellow-400">{item.title}</p><p className="mt-1 text-xs text-zinc-600">{item.meta}</p></div><span className="text-zinc-600">→</span></Link>)}</div></section>; }
function getWeekStart() { const date = new Date(); const day = date.getUTCDay() || 7; date.setUTCDate(date.getUTCDate() - day + 1); return date.toISOString().split("T")[0]; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long" }).format(new Date(`${value}T12:00:00`)); }
