import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ArtisticDirectionPage() {
  const profile = await requireRole([ROLES.ARTISTIC_DIRECTOR]);
  const supabase = await createAuthenticatedSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const [artistsResult, projectsResult, releasesResult, approvalsResult, tasksResult] = await Promise.all([
    supabase.from("artistes").select("id, nom, style, photo_url, statut").order("nom"),
    supabase.from("projets").select("id, titre, statut, date_sortie, artiste_id, artistes(nom)").order("date_sortie", { ascending: true, nullsFirst: false }),
    supabase.from("sorties").select("id, titre, statut, date_sortie, artiste_id, artistes(nom)").gte("date_sortie", today).order("date_sortie").limit(8),
    supabase.from("artist_approvals").select("id, titre, type, statut, created_at, artistes(nom)").eq("statut", "En attente").order("created_at", { ascending: false }).limit(8),
    supabase.from("taches").select("id, titre, statut, priorite, deadline, responsable_id, projets(titre)").neq("statut", "Terminé").order("deadline", { ascending: true, nullsFirst: false }).limit(10),
  ]);

  const artists = artistsResult.data || [];
  const projects = projectsResult.data || [];
  const releases = releasesResult.data || [];
  const approvals = approvalsResult.data || [];
  const tasks = tasksResult.data || [];
  const activeProjects = projects.filter((project: any) => !["Sorti", "Archivé", "Terminé"].includes(project.statut));
  const lateTasks = tasks.filter((task: any) => task.deadline && task.deadline < today);
  const firstName = String((profile as any).nom || "").split(" ")[0];

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10 md:py-10">
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">Direction artistique</p><h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Cockpit artistique{firstName ? ` · ${firstName}` : ""}</h1><p className="mt-3 max-w-3xl text-zinc-500">Artistes, sorties, validations et priorités créatives réunis sans les données réservées à la direction générale.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/validations-artiste/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Demander une validation</Link><Link href="/release-planner" className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-bold text-zinc-300">Ouvrir le planning</Link></div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Artistes suivis" value={artists.length} detail="Roster artistique" />
        <Metric label="Projets actifs" value={activeProjects.length} detail="Création et développement" />
        <Metric label="Sorties à venir" value={releases.length} detail="Planning futur" tone={releases.length ? "cyan" : "default"} />
        <Metric label="Validations en attente" value={approvals.length} detail="Réponses artistes attendues" tone={approvals.length ? "warning" : "good"} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Prochaines sorties" subtitle="Les échéances créatives qui arrivent." href="/release-planner">
          {!releases.length ? <Empty text="Aucune sortie à venir." /> : releases.map((release: any) => <Row key={release.id} href={`/sorties/${release.id}`} title={release.titre} meta={`${relationName(release.artistes)} · ${formatDate(release.date_sortie)}`} badge={release.statut || "À préparer"} />)}
        </Panel>
        <Panel title="Attention requise" subtitle="Ce qui peut ralentir le pôle artistique." href="/mon-travail">
          <Alert label="Validations artistes" value={approvals.length} danger={approvals.length > 0} />
          <Alert label="Tâches en retard" value={lateTasks.length} danger={lateTasks.length > 0} />
          <Alert label="Projets actifs" value={activeProjects.length} danger={false} />
        </Panel>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Validations artistes" subtitle="Les retours encore attendus." href="/validations-artiste">
          {!approvals.length ? <Empty text="Aucune validation en attente." /> : approvals.map((approval: any) => <Row key={approval.id} href="/validations-artiste" title={approval.titre} meta={`${relationName(approval.artistes)} · ${approval.type || "Validation"}`} badge="En attente" tone="warning" />)}
        </Panel>
        <Panel title="Priorités opérationnelles" subtitle="Les prochaines tâches du pôle." href="/taches">
          {!tasks.length ? <Empty text="Aucune tâche artistique ouverte." /> : tasks.slice(0, 8).map((task: any) => <Row key={task.id} href={`/taches/${task.id}`} title={task.titre} meta={`${relationName(task.projets) || "Pôle artistique"} · ${task.deadline ? formatDate(task.deadline) : "Sans échéance"}`} badge={task.priorite || "Normale"} tone={task.deadline && task.deadline < today ? "danger" : "default"} />)}
        </Panel>
      </section>

      <section className="mt-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Roster</p><h2 className="mt-2 text-3xl font-bold">Artistes</h2></div><Link href="/artistes" className="text-sm text-zinc-500 hover:text-white">Voir tout →</Link></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{artists.map((artist: any) => <Link key={artist.id} href={`/artistes/${artist.id}`} className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5 transition hover:border-cyan-500/40"><p className="text-xs font-bold uppercase tracking-wider text-cyan-400">{artist.style || "Artiste"}</p><h3 className="mt-3 text-2xl font-bold">{artist.nom}</h3><p className="mt-2 text-sm text-zinc-600">{artist.statut || "Suivi actif"}</p></Link>)}</div></section>
    </div>
  </main>;
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: number; detail: string; tone?: "default" | "cyan" | "warning" | "good" }) { const styles = { default: "border-zinc-800 bg-zinc-950", cyan: "border-cyan-500/25 bg-cyan-500/[0.06]", warning: "border-yellow-500/25 bg-yellow-500/[0.06]", good: "border-green-500/20 bg-green-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p><p className="mt-3 text-4xl font-bold">{value}</p><p className="mt-3 text-sm text-zinc-500">{detail}</p></div>; }
function Panel({ title, subtitle, href, children }: { title: string; subtitle: string; href: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{subtitle}</p></div><Link href={href} className="shrink-0 text-xs font-semibold text-zinc-500 hover:text-white">Voir tout →</Link></div>{children}</section>; }
function Row({ href, title, meta, badge, tone = "default" }: { href: string; title: string; meta: string; badge: string; tone?: "default" | "warning" | "danger" }) { const badgeStyle = tone === "danger" ? "bg-red-500/10 text-red-300" : tone === "warning" ? "bg-yellow-500/10 text-yellow-300" : "bg-zinc-900 text-zinc-400"; return <Link href={href} className="flex items-center gap-4 border-b border-zinc-900 py-4 last:border-0"><div className="min-w-0 flex-1"><p className="truncate font-semibold hover:text-cyan-300">{title}</p><p className="mt-1 truncate text-xs text-zinc-600">{meta}</p></div><span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${badgeStyle}`}>{badge}</span></Link>; }
function Alert({ label, value, danger }: { label: string; value: number; danger: boolean }) { return <div className="flex items-center justify-between border-b border-zinc-900 py-4 last:border-0"><span className="text-sm text-zinc-400">{label}</span><span className={`rounded-full px-3 py-1 text-sm font-bold ${danger ? "bg-red-500/10 text-red-300" : "bg-zinc-900 text-zinc-300"}`}>{value}</span></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-600">{text}</div>; }
function relationName(value: any) { if (Array.isArray(value)) return value[0]?.nom || value[0]?.titre || ""; return value?.nom || value?.titre || ""; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
