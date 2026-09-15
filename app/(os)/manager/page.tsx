import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const profile = await requireRole([ROLES.MANAGER]);
  const supabase = await createAuthenticatedSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: artists } = await supabase.from("artistes").select("id, nom, style, photo_url, statut").eq("manager_id", profile.id).order("nom");
  const artistIds = (artists || []).map((artist: any) => artist.id);

  const [projectsResult, bookingsResult, contractsResult, releasesResult, approvalsResult, tasksResult] = artistIds.length
    ? await Promise.all([
        supabase.from("projets").select("id, titre, statut, date_sortie, artiste_id, artistes(nom)").in("artiste_id", artistIds).order("date_sortie", { ascending: true, nullsFirst: false }),
        supabase.from("bookings").select("id, evenement, statut, date_event, artiste_id, artistes(nom)").in("artiste_id", artistIds).order("date_event", { ascending: true, nullsFirst: false }),
        supabase.from("contrats").select("id, titre, statut, artiste_id, artistes(nom)").in("artiste_id", artistIds).order("created_at", { ascending: false }),
        supabase.from("sorties").select("id, titre, statut, date_sortie, artiste_id, artistes(nom)").in("artiste_id", artistIds).gte("date_sortie", today).order("date_sortie").limit(8),
        supabase.from("artist_approvals").select("id, titre, statut, artiste_id, artistes(nom)").in("artiste_id", artistIds).eq("statut", "En attente").order("created_at", { ascending: false }),
        supabase.from("taches").select("id, titre, statut, priorite, deadline, responsable_id, assigned_to, created_by").or(`responsable_id.eq.${profile.id},assigned_to.eq.${profile.id},created_by.eq.${profile.id}`).order("deadline", { ascending: true, nullsFirst: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const projects = projectsResult.data || [];
  const bookings = bookingsResult.data || [];
  const contracts = contractsResult.data || [];
  const releases = releasesResult.data || [];
  const approvals = approvalsResult.data || [];
  const tasks = tasksResult.data || [];
  const openTasks = tasks.filter((task: any) => task.statut !== "Terminé");
  const lateTasks = openTasks.filter((task: any) => task.deadline && task.deadline < today);
  const activeProjects = projects.filter((project: any) => !["Sorti", "Archivé", "Terminé"].includes(project.statut));
  const pendingContracts = contracts.filter((contract: any) => contract.statut !== "Signé");
  const activeBookings = bookings.filter((booking: any) => !["Annulé", "Refusé", "Payé"].includes(booking.statut));

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10 md:py-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Portefeuille manager</p><h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Mes artistes, mes priorités</h1><p className="mt-3 max-w-3xl text-zinc-500">Une vue strictement limitée aux artistes qui te sont confiés et aux actions qui te concernent.</p></div><div className="flex flex-wrap gap-3"><Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Créer une tâche</Link><Link href="/chat" className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-bold text-zinc-300">Chats artistes</Link></div></header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Artistes confiés" value={(artists || []).length} detail="Portefeuille actif" /><Metric label="Projets actifs" value={activeProjects.length} detail="Liés à tes artistes" /><Metric label="Mes tâches ouvertes" value={openTasks.length} detail="Assignées ou créées par toi" tone={lateTasks.length ? "warning" : "good"} /><Metric label="Alertes à traiter" value={lateTasks.length + approvals.length + pendingContracts.length} detail="Retards, validations, contrats" tone={lateTasks.length + approvals.length + pendingContracts.length ? "danger" : "good"} /></section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><Panel title="Mes priorités" subtitle="Uniquement les tâches auxquelles tu participes." href="/taches">{!openTasks.length ? <Empty text="Aucune tâche ouverte ne t’est attribuée." /> : openTasks.slice(0, 8).map((task: any) => <Row key={task.id} href={`/taches/${task.id}`} title={task.titre} meta={task.deadline ? formatDate(task.deadline) : "Sans échéance"} badge={task.priorite || "Moyenne"} tone={task.deadline && task.deadline < today ? "danger" : "default"} />)}</Panel><Panel title="Points de vigilance" subtitle="Ce qui bloque actuellement ton portefeuille." href="/notifications"><Alert label="Tâches en retard" value={lateTasks.length} /><Alert label="Validations en attente" value={approvals.length} /><Alert label="Contrats à finaliser" value={pendingContracts.length} /><Alert label="Bookings actifs" value={activeBookings.length} neutral /></Panel></section>

    <section className="mt-8 grid gap-6 xl:grid-cols-2"><Panel title="Sorties à venir" subtitle="Planning de tes artistes." href="/release-planner">{!releases.length ? <Empty text="Aucune sortie programmée." /> : releases.map((release: any) => <Row key={release.id} href={`/sorties/${release.id}`} title={release.titre} meta={`${relationName(release.artistes)} · ${formatDate(release.date_sortie)}`} badge={release.statut || "À préparer"} />)}</Panel><Panel title="Projets actifs" subtitle="Les projets artistiques sous ta responsabilité." href="/projets">{!activeProjects.length ? <Empty text="Aucun projet actif." /> : activeProjects.slice(0, 8).map((project: any) => <Row key={project.id} href={`/projets/${project.id}`} title={project.titre} meta={relationName(project.artistes)} badge={project.statut || "En cours"} />)}</Panel></section>

    <section className="mt-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Portefeuille</p><h2 className="mt-2 text-3xl font-bold">Mes artistes</h2></div><Link href="/artistes" className="text-sm text-zinc-500 hover:text-white">Voir tout →</Link></div>{!(artists || []).length ? <Empty text="Aucun artiste ne t’est encore assigné." /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{(artists || []).map((artist: any) => <Link key={artist.id} href={`/artistes/${artist.id}`} className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5 transition hover:border-yellow-500/40"><p className="text-xs font-bold uppercase tracking-wider text-yellow-500">{artist.style || "Artiste"}</p><h3 className="mt-3 text-2xl font-bold">{artist.nom}</h3><p className="mt-2 text-sm text-zinc-600">{artist.statut || "Suivi actif"}</p></Link>)}</div>}</section>
  </div></main>;
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: number; detail: string; tone?: "default" | "warning" | "danger" | "good" }) { const styles = { default: "border-zinc-800 bg-zinc-950", warning: "border-yellow-500/25 bg-yellow-500/[0.06]", danger: "border-red-500/25 bg-red-500/[0.06]", good: "border-green-500/20 bg-green-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-4xl font-bold">{value}</p><p className="mt-3 text-sm text-zinc-500">{detail}</p></div>; }
function Panel({ title, subtitle, href, children }: { title: string; subtitle: string; href: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{subtitle}</p></div><Link href={href} className="text-xs font-semibold text-zinc-500 hover:text-white">Voir tout →</Link></div>{children}</section>; }
function Row({ href, title, meta, badge, tone = "default" }: { href: string; title: string; meta: string; badge: string; tone?: "default" | "danger" }) { return <Link href={href} className="flex items-center gap-4 border-b border-zinc-900 py-4 last:border-0"><div className="min-w-0 flex-1"><p className="truncate font-semibold hover:text-yellow-300">{title}</p><p className="mt-1 truncate text-xs text-zinc-600">{meta}</p></div><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${tone === "danger" ? "bg-red-500/10 text-red-300" : "bg-zinc-900 text-zinc-400"}`}>{badge}</span></Link>; }
function Alert({ label, value, neutral = false }: { label: string; value: number; neutral?: boolean }) { return <div className="flex items-center justify-between border-b border-zinc-900 py-4 last:border-0"><span className="text-sm text-zinc-400">{label}</span><span className={`rounded-full px-3 py-1 text-sm font-bold ${value && !neutral ? "bg-red-500/10 text-red-300" : "bg-zinc-900 text-zinc-300"}`}>{value}</span></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-600">{text}</div>; }
function relationName(value: any) { return Array.isArray(value) ? value[0]?.nom || "Artiste" : value?.nom || "Artiste"; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
