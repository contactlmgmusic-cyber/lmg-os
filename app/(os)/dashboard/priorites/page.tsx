import Link from "next/link";
import { getActiveCompanyQuarter } from "@/lib/company-quarter";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];
type Priority = { id: string; title: string; context: string; href: string; deadline: string | null; level: "Critique" | "Haute" | "À surveiller" };

export default async function StrategicPrioritiesPage() {
  await requireRole(allowed);
  const supabase = await createAuthenticatedSupabaseClient();
  const today = new Date().toISOString().split("T")[0];
  const weekStart = getWeekStart();
  const inSevenDays = addDays(today, 7);
  const activeQuarter = getActiveCompanyQuarter();

  const [{ data: objectives }, { data: tasks }, { data: projects }, { data: releases }, { data: review }] = await Promise.all([
    supabase.from("company_objectives").select("id, titre, pole, indicateur, valeur_initiale, valeur_actuelle, valeur_cible, niveau_risque, statut, deadline, owner:profiles!company_objectives_owner_id_fkey(nom, full_name)").eq("trimestre", activeQuarter).neq("statut", "Atteint").order("deadline"),
    supabase.from("taches").select("id, titre, priorite, statut, deadline, responsable:profiles!taches_responsable_id_fkey(nom, full_name)").neq("statut", "Terminé").order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("internal_projects").select("id, titre, pole, priorite, statut, deadline, progression, owner:profiles!internal_projects_owner_id_fkey(nom, full_name)").not("statut", "in", '("Terminé","Archivé")').order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("projets").select("id, titre, date_sortie, statut, artiste:artistes(nom)").gte("date_sortie", today).lte("date_sortie", inSevenDays).order("date_sortie"),
    supabase.from("weekly_reviews").select("id, statut, meeting_date, priorites_suivantes").eq("week_start", weekStart).maybeSingle(),
  ]);

  const { data: decisions } = review?.id
    ? await supabase.from("weekly_review_decisions").select("id, decision, deadline, owner:profiles!weekly_review_decisions_owner_id_fkey(nom, full_name), project:internal_projects!weekly_review_decisions_internal_project_id_fkey(id, titre)").eq("review_id", review.id).order("deadline", { ascending: true, nullsFirst: false })
    : { data: [] };

  const overdueTasks = (tasks || []).filter((item: any) => item.deadline && item.deadline < today);
  const highTasks = (tasks || []).filter((item: any) => ["Urgente", "Haute"].includes(item.priorite) && !overdueTasks.some((late: any) => late.id === item.id));
  const criticalProjects = (projects || []).filter((item: any) => item.priorite === "Urgente" || (item.deadline && item.deadline < today));
  const atRiskObjectives = (objectives || []).filter((item: any) => ["Critique", "À surveiller"].includes(item.niveau_risque));

  const priorities: Priority[] = [
    ...overdueTasks.map((item: any) => ({ id: `task-${item.id}`, title: item.titre, context: `Tâche en retard · ${person(item.responsable)}`, href: `/taches/${item.id}`, deadline: item.deadline, level: "Critique" as const })),
    ...criticalProjects.map((item: any) => ({ id: `project-${item.id}`, title: item.titre, context: `Projet interne · ${item.pole || "Direction"} · ${item.progression || 0}%`, href: `/projets-internes/${item.id}`, deadline: item.deadline, level: item.deadline && item.deadline < today ? "Critique" as const : "Haute" as const })),
    ...atRiskObjectives.map((item: any) => ({ id: `objective-${item.id}`, title: item.titre, context: `Objectif ${activeQuarter} · ${item.pole}`, href: "/dashboard/objectifs-lmg", deadline: item.deadline, level: item.niveau_risque === "Critique" ? "Critique" as const : "À surveiller" as const })),
    ...highTasks.slice(0, 8).map((item: any) => ({ id: `task-${item.id}`, title: item.titre, context: `Tâche ${item.priorite.toLowerCase()} · ${person(item.responsable)}`, href: `/taches/${item.id}`, deadline: item.deadline, level: "Haute" as const })),
    ...(releases || []).map((item: any) => ({ id: `release-${item.id}`, title: item.titre, context: `Sortie sous 7 jours · ${relationName(item.artiste)}`, href: `/projets/${item.id}`, deadline: item.date_sortie, level: "Haute" as const })),
  ].sort(comparePriorities);

  const criticalCount = priorities.filter((item) => item.level === "Critique").length;
  const health = criticalCount === 0 && atRiskObjectives.length === 0 ? "Maîtrisé" : criticalCount <= 2 ? "À surveiller" : "Intervention requise";

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between"><div><Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white">← Tableau de bord</Link><p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Intelligence opérationnelle</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Priorités stratégiques</h1><p className="mt-3 max-w-3xl text-zinc-500">Une seule lecture pour décider quoi traiter, qui doit agir et ce qui menace les objectifs de LMG.</p></div><div className="flex flex-wrap gap-3"><Link href="/dashboard/revue-hebdomadaire" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">Préparer la revue</Link><Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Créer une action</Link></div></header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Niveau opérationnel" value={health} tone={criticalCount ? "danger" : "good"} /><Metric label="Points critiques" value={criticalCount} tone={criticalCount ? "danger" : "good"} /><Metric label={`Objectifs ${activeQuarter} à risque`} value={atRiskObjectives.length} tone={atRiskObjectives.length ? "warning" : "good"} /><Metric label="Décisions cette semaine" value={(decisions || []).length} /></section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
      <Panel eyebrow="File de décision" title="À traiter maintenant" description="Classé par criticité puis par échéance.">
        {!priorities.length ? <Empty text="Aucun signal prioritaire. L’activité est sous contrôle." /> : <div>{priorities.slice(0, 12).map((item) => <PriorityRow key={item.id} item={item} />)}</div>}
      </Panel>
      <div className="space-y-6">
        <Panel eyebrow="Décisions" title="Engagements de la semaine" description={review ? `Revue ${review.statut.toLowerCase()}` : "Aucune revue préparée"}>
          {!(decisions || []).length ? <Empty text="Aucune décision enregistrée cette semaine." /> : <div>{(decisions || []).map((item: any) => <DecisionRow key={item.id} decision={item} />)}</div>}
          <Link href="/dashboard/revue-hebdomadaire" className="mt-5 block text-sm font-semibold text-yellow-500">Ouvrir la revue hebdomadaire →</Link>
        </Panel>
        <Panel eyebrow="Cap" title={`Objectifs ${activeQuarter}`} description="Progression des objectifs encore ouverts.">
          {!(objectives || []).length ? <Empty text="Aucun objectif actif pour ce trimestre." /> : <div className="space-y-4">{(objectives || []).slice(0, 6).map((item: any) => <ObjectiveProgress key={item.id} objective={item} />)}</div>}
          <Link href="/dashboard/objectifs-lmg" className="mt-5 block text-sm font-semibold text-yellow-500">Piloter les objectifs →</Link>
        </Panel>
      </div>
    </section>
  </div></main>;
}

function Metric({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "warning" | "danger" | "good" }) { const styles = { default: "border-zinc-800 bg-zinc-950", warning: "border-yellow-500/25 bg-yellow-500/[0.06]", danger: "border-red-500/25 bg-red-500/[0.06]", good: "border-green-500/20 bg-green-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-2xl font-bold md:text-3xl">{value}</p></div>; }
function Panel({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><p className="mt-2 text-sm text-zinc-500">{description}</p><div className="mt-5">{children}</div></section>; }
function PriorityRow({ item }: { item: Priority }) { const styles = item.level === "Critique" ? "bg-red-500/10 text-red-300" : item.level === "Haute" ? "bg-orange-500/10 text-orange-300" : "bg-yellow-500/10 text-yellow-300"; return <Link href={item.href} className="group grid gap-3 border-b border-zinc-900 py-4 last:border-0 sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase ${styles}`}>{item.level}</span><div className="min-w-0"><p className="truncate font-semibold group-hover:text-yellow-400">{item.title}</p><p className="mt-1 truncate text-xs text-zinc-600">{item.context}</p></div><span className="text-xs text-zinc-500">{item.deadline ? formatDate(item.deadline) : "Sans date"} →</span></Link>; }
function DecisionRow({ decision }: { decision: any }) { return <div className="border-b border-zinc-900 py-4 last:border-0"><p className="font-semibold">{decision.decision}</p><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-zinc-600"><span>{person(decision.owner)}</span><span>{decision.deadline ? formatDate(decision.deadline) : "Sans échéance"}</span></div>{decision.project?.id && <Link href={`/projets-internes/${decision.project.id}`} className="mt-2 block text-xs text-zinc-500 hover:text-white">{decision.project.titre} →</Link>}</div>; }
function ObjectiveProgress({ objective }: { objective: any }) { const span = Number(objective.valeur_cible) - Number(objective.valeur_initiale); const progress = span ? Math.max(0, Math.min(100, Math.round(((Number(objective.valeur_actuelle) - Number(objective.valeur_initiale)) / span) * 100))) : 0; return <div><div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-semibold">{objective.titre}</span><span className="text-zinc-500">{progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900"><div className={`h-full rounded-full ${objective.niveau_risque === "Critique" ? "bg-red-500" : objective.niveau_risque === "À surveiller" ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${progress}%` }} /></div></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-zinc-800 p-7 text-center text-sm text-zinc-600">{text}</div>; }
function comparePriorities(a: Priority, b: Priority) { const weight = { Critique: 0, Haute: 1, "À surveiller": 2 }; return weight[a.level] - weight[b.level] || deadlineValue(a.deadline) - deadlineValue(b.deadline); }
function deadlineValue(value: string | null) { return value ? new Date(`${value}T12:00:00`).getTime() : Number.MAX_SAFE_INTEGER; }
function person(value: any) { return value?.nom || value?.full_name || "Non attribué"; }
function relationName(value: any) { const relation = Array.isArray(value) ? value[0] : value; return relation?.nom || "Artiste non lié"; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`)); }
function getWeekStart() { const date = new Date(); const day = date.getUTCDay() || 7; date.setUTCDate(date.getUTCDate() - day + 1); return date.toISOString().split("T")[0]; }
function addDays(value: string, days: number) { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().split("T")[0]; }
