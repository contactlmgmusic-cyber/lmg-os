import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const allowedRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ARTISTIC_DIRECTOR,
];

type WorkItem = {
  id: string;
  kind: "Tâche" | "Jalon";
  title: string;
  context: string;
  deadline: string | null;
  priority: string;
  href: string;
};

export default async function MyWorkPage() {
  await requireRole(allowedRoles);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: memberships }, { data: allProjects }, { data: tasks }] = await Promise.all([
    supabase.from("profiles").select("id, nom, full_name").eq("id", user.id).single(),
    supabase.from("internal_project_members").select("project_id, role_projet").eq("user_id", user.id),
    supabase.from("internal_projects").select("id, titre, pole, categorie, statut, priorite, objectif, owner_id, deadline, progression").not("statut", "in", '("Terminé","Archivé")').order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("taches").select("id, titre, statut, priorite, deadline, internal_project_id").eq("responsable_id", user.id).neq("statut", "Terminé").order("deadline", { ascending: true, nullsFirst: false }),
  ]);

  const membershipMap = new Map((memberships || []).map((item: any) => [item.project_id, item.role_projet]));
  const myProjects = (allProjects || []).filter((project: any) => project.owner_id === user.id || membershipMap.has(project.id));
  const projectIds = myProjects.map((project: any) => project.id);
  const { data: milestones } = projectIds.length
    ? await supabase.from("internal_project_milestones").select("id, project_id, titre, statut, deadline").in("project_id", projectIds).neq("statut", "Terminé").order("deadline", { ascending: true, nullsFirst: false })
    : { data: [] };

  const projectMap = new Map(myProjects.map((project: any) => [project.id, project]));
  const workItems: WorkItem[] = [
    ...(tasks || []).map((task: any) => ({
      id: task.id,
      kind: "Tâche" as const,
      title: task.titre,
      context: task.internal_project_id ? projectMap.get(task.internal_project_id)?.titre || "Projet interne" : "Tâche LMG",
      deadline: task.deadline,
      priority: task.priorite || "Moyenne",
      href: `/taches/${task.id}`,
    })),
    ...(milestones || []).map((milestone: any) => ({
      id: milestone.id,
      kind: "Jalon" as const,
      title: milestone.titre,
      context: projectMap.get(milestone.project_id)?.titre || "Projet interne",
      deadline: milestone.deadline,
      priority: projectMap.get(milestone.project_id)?.priorite || "Moyenne",
      href: `/projets-internes/${milestone.project_id}`,
    })),
  ].sort((a, b) => deadlineValue(a.deadline) - deadlineValue(b.deadline));

  const today = isoDate(new Date());
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndIso = isoDate(weekEnd);
  const overdue = workItems.filter((item) => item.deadline && item.deadline < today);
  const dueThisWeek = workItems.filter((item) => item.deadline && item.deadline >= today && item.deadline <= weekEndIso);
  const urgent = workItems.filter((item) => ["Urgente", "Haute"].includes(item.priority));
  const firstName = (profile?.nom || profile?.full_name || "").split(" ")[0];

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10 md:py-10">
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Espace personnel</p><h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Mon travail{firstName ? ` · ${firstName}` : ""}</h1><p className="mt-3 max-w-2xl text-zinc-500">Tout ce qui dépend de toi, sans le bruit du reste de l’organisation.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">+ Nouvelle tâche</Link><Link href="/projets-internes" className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300">Tous les projets internes</Link></div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Projets actifs" value={myProjects.length} detail="Responsable ou contributeur" />
        <Metric label="Actions ouvertes" value={workItems.length} detail="Tâches et jalons" />
        <Metric label="Cette semaine" value={dueThisWeek.length} detail="Échéances à venir" tone={dueThisWeek.length ? "warning" : "good"} />
        <Metric label="En retard" value={overdue.length} detail={overdue.length ? "À reprendre maintenant" : "Tu es à jour"} tone={overdue.length ? "danger" : "good"} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Panel title="Mes priorités" subtitle="Les prochaines actions, classées par échéance." href="/taches">
          {!workItems.length ? <Empty text="Aucune action ouverte ne t’est attribuée." /> : workItems.slice(0, 8).map((item) => <WorkRow key={`${item.kind}-${item.id}`} item={item} today={today} />)}
        </Panel>
        <div className="space-y-6">
          <Panel title="Attention requise" subtitle="Ce qui peut bloquer ton avancement.">
            <AlertRow label="Éléments en retard" value={overdue.length} danger={overdue.length > 0} />
            <AlertRow label="Priorités hautes ou urgentes" value={urgent.length} danger={urgent.length > 0} />
            <AlertRow label="Échéances sous 7 jours" value={dueThisWeek.length} danger={false} />
          </Panel>
          <div className="rounded-[26px] border border-yellow-500/20 bg-yellow-500/[0.06] p-6"><p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-500">Règle de focus</p><p className="mt-4 text-xl font-bold">Traite d’abord les retards, puis les échéances de la semaine.</p><p className="mt-3 text-sm leading-6 text-zinc-400">Les projets sans tâche ou jalon à ton nom restent visibles ci-dessous pour ne pas perdre le cap.</p></div>
        </div>
      </section>

      <section className="mt-8"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-500">Responsabilités</p><h2 className="mt-2 text-3xl font-bold">Mes projets internes</h2></div><Link href="/projets-internes" className="text-sm text-zinc-500 hover:text-white">Voir tout →</Link></div>
        {!myProjects.length ? <Empty text="Tu n’es encore responsable ou membre d’aucun projet interne." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{myProjects.map((project: any) => <ProjectCard key={project.id} project={project} role={project.owner_id === user.id ? "Responsable" : membershipMap.get(project.id) || "Contributeur"} />)}</div>}
      </section>
    </div>
  </main>;
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: number; detail: string; tone?: "default" | "warning" | "danger" | "good" }) { const styles = { default: "border-zinc-800 bg-zinc-950", warning: "border-yellow-500/25 bg-yellow-500/[0.06]", danger: "border-red-500/25 bg-red-500/[0.06]", good: "border-green-500/20 bg-green-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p><p className="mt-3 text-4xl font-bold">{value}</p><p className="mt-3 text-sm text-zinc-500">{detail}</p></div>; }
function Panel({ title, subtitle, href, children }: { title: string; subtitle: string; href?: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{subtitle}</p></div>{href && <Link href={href} className="shrink-0 text-xs font-semibold text-zinc-500 hover:text-white">Voir tout →</Link>}</div>{children}</section>; }
function WorkRow({ item, today }: { item: WorkItem; today: string }) { const late = Boolean(item.deadline && item.deadline < today); return <Link href={item.href} className="group flex items-center gap-4 border-b border-zinc-900 py-4 last:border-0"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${late ? "bg-red-500/10 text-red-300" : item.kind === "Jalon" ? "bg-yellow-500/10 text-yellow-300" : "bg-zinc-900 text-zinc-400"}`}>{item.kind === "Jalon" ? "J" : "T"}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold group-hover:text-yellow-400">{item.title}</p><p className="mt-1 truncate text-xs text-zinc-600">{item.context}</p></div><div className="text-right"><p className={`text-xs font-semibold ${late ? "text-red-400" : "text-zinc-400"}`}>{item.deadline ? formatDate(item.deadline) : "Sans date"}</p><p className="mt-1 text-[10px] text-zinc-600">{item.kind}</p></div></Link>; }
function AlertRow({ label, value, danger }: { label: string; value: number; danger: boolean }) { return <div className="flex items-center justify-between border-b border-zinc-900 py-4 last:border-0"><span className="text-sm text-zinc-400">{label}</span><span className={`rounded-full px-3 py-1 text-sm font-bold ${danger ? "bg-red-500/10 text-red-300" : "bg-zinc-900 text-zinc-300"}`}>{value}</span></div>; }
function ProjectCard({ project, role }: { project: any; role: string }) { return <Link href={`/projets-internes/${project.id}`} className="group rounded-[24px] border border-zinc-800 bg-zinc-950 p-6 transition hover:-translate-y-0.5 hover:border-zinc-600"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-500">{project.pole || "Direction"}</p><span className="rounded-full bg-zinc-900 px-3 py-1 text-[10px] text-zinc-400">{role}</span></div><h3 className="mt-5 text-xl font-bold group-hover:text-yellow-300">{project.titre}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{project.objectif || "Objectif à préciser."}</p><div className="mt-6"><div className="flex justify-between text-xs text-zinc-500"><span>{project.statut}</span><span>{project.progression || 0}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-yellow-500" style={{ width: `${Math.min(100, Math.max(0, Number(project.progression || 0)))}%` }} /></div></div></Link>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-zinc-800 px-5 py-9 text-center text-sm text-zinc-600">{text}</div>; }
function isoDate(date: Date) { return date.toISOString().split("T")[0]; }
function deadlineValue(value: string | null) { return value ? new Date(`${value}T12:00:00`).getTime() : Number.MAX_SAFE_INTEGER; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`)); }
