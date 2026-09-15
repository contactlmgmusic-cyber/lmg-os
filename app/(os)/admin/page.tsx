import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const actor = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: profiles }, { data: invitations }, { count: publicArtists }, { count: publicReleases }] = await Promise.all([
    supabase.from("profiles").select("id, role"),
    supabase.from("invitations").select("id, email, role, status, created_at, expires_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("artistes").select("id", { count: "exact", head: true }).eq("is_public", true),
    supabase.from("projets").select("id", { count: "exact", head: true }).eq("is_public", true),
  ]);
  const members = profiles || [];
  const pendingInvitations = (invitations || []).filter((item: any) => item.status === "pending").length;
  const superAdmins = members.filter((item: any) => item.role === ROLES.SUPER_ADMIN).length;
  const admins = members.filter((item: any) => item.role === ROLES.ADMIN).length;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-5 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">LMG Control</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Console d’administration</h1><p className="mt-3 max-w-3xl text-zinc-400">Accès, équipe et publication réunis dans un poste de contrôle unique.</p></div><span className="w-fit rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-400">Session · {actor.role === ROLES.SUPER_ADMIN ? "Super Admin" : "Admin"}</span></header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Membres actifs" value={members.length} detail="Comptes LMG OS" /><Metric label="Administrateurs" value={superAdmins + admins} detail={`${superAdmins} Super Admin · ${admins} Admin`} /><Metric label="Invitations ouvertes" value={pendingInvitations} detail="Accès en attente" tone={pendingInvitations ? "warning" : "good"} /><Metric label="Contenus publics" value={(publicArtists || 0) + (publicReleases || 0)} detail={`${publicArtists || 0} artistes · ${publicReleases || 0} releases`} /></section>

    <section className="mt-8 grid gap-5 lg:grid-cols-2"><ModuleCard eyebrow="Identités" title="Équipe et rôles" description="Consulte les membres, leurs responsabilités et leurs rattachements. Les changements de rôle sensibles sont protégés." href="/equipe" action="Gérer l’équipe" /><ModuleCard eyebrow="Accès" title="Invitations sécurisées" description="Génère des liens individuels, temporaires et à usage unique à transmettre depuis Gmail." href="/invitations" action="Gérer les invitations" /><ModuleCard eyebrow="Publication" title="Site Internet" description="Contrôle les artistes, releases et contenus mis en avant sur le site public." href="/site-internet" action="Piloter le site" /><ModuleCard eyebrow="Traçabilité" title="Activité du système" description="Consulte l’historique opérationnel de LMG OS et les actions enregistrées." href="/activity" action="Voir l’activité" /></section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><div className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Accès récents</p><h2 className="mt-2 text-2xl font-bold">Invitations</h2></div><Link href="/invitations" className="text-sm text-zinc-500 hover:text-white">Tout gérer →</Link></div><div className="mt-5 space-y-3">{!(invitations || []).length && <p className="rounded-2xl border border-dashed border-zinc-800 p-7 text-center text-sm text-zinc-600">Aucune invitation récente.</p>}{(invitations || []).map((item: any) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-black p-4"><div className="min-w-0"><p className="truncate font-semibold">{item.email}</p><p className="mt-1 text-xs text-zinc-600">{item.role}</p></div><Status status={item.status} /></div>)}</div></div>
      <aside className="rounded-[26px] border border-green-500/20 bg-green-500/[0.05] p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">Sécurité des accès</p><h2 className="mt-2 text-2xl font-bold">Protections actives</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-400"><li>✓ Pages réservées aux administrateurs</li><li>✓ Invitations uniques et limitées à 7 jours</li><li>✓ Attribution Super Admin restreinte</li><li>✓ Dernier Super Admin protégé</li><li>✓ Aucun e-mail envoyé par LMG OS</li></ul></aside>
    </section>
  </div></main>;
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: number; detail: string; tone?: "default" | "warning" | "good" }) { const style = tone === "warning" ? "border-yellow-500/20 bg-yellow-500/[0.05]" : tone === "good" ? "border-green-500/20 bg-green-500/[0.05]" : "border-zinc-800 bg-zinc-950"; return <div className={`rounded-2xl border p-5 ${style}`}><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-4xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function ModuleCard({ eyebrow, title, description, href, action }: { eyebrow: string; title: string; description: string; href: string; action: string }) { return <Link href={href} className="group rounded-[26px] border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-600"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">{description}</p><p className="mt-6 text-sm font-bold text-zinc-400 group-hover:text-white">{action} →</p></Link>; }
function Status({ status }: { status: string }) { const accepted = status === "accepted"; const expired = status === "expired"; return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${accepted ? "bg-green-500/10 text-green-300" : expired ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>{accepted ? "Acceptée" : expired ? "Expirée" : "En attente"}</span>; }

