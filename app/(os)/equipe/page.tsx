import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import RoleBadge from "@/components/RoleBadge";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const internalRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];

export default async function EquipePage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configuration Supabase indisponible.");
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const [profilesResult, usersResult, invitationsResult] = await Promise.all([
    admin.from("profiles").select("id, nom, email, role, avatar_url, artiste_id, created_at"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("invitations").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const authUsers = usersResult.data?.users || [];
  const members = (profilesResult.data || []).map((profile: any) => {
    const authUser = authUsers.find((user) => user.id === profile.id);
    return { ...profile, email: authUser?.email || profile.email || "", avatarUrl: profile.avatar_url || authUser?.user_metadata?.avatar_url || "", lastSignInAt: authUser?.last_sign_in_at || null, confirmedAt: authUser?.email_confirmed_at || null, disabled: Boolean(authUser?.banned_until && new Date(authUser.banned_until) > new Date()) };
  }).sort((a: any, b: any) => Number(!internalRoles.includes(a.role)) - Number(!internalRoles.includes(b.role)) || String(a.nom || "").localeCompare(String(b.nom || ""), "fr"));
  const internal = members.filter((member: any) => internalRoles.includes(member.role));
  const external = members.filter((member: any) => !internalRoles.includes(member.role));
  const connected = members.filter((member: any) => member.lastSignInAt).length;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Administration</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Équipe LMG</h1><p className="mt-3 max-w-2xl text-zinc-400">Membres, fonctions, activité de connexion et niveaux d’accès à LMG OS.</p></div><Link href="/invitations" className="w-fit rounded-xl bg-white px-6 py-4 font-bold text-black">+ Inviter un membre</Link></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Profils" value={members.length} /><Kpi label="Déjà connectés" value={connected} accent /><Kpi label="Équipe interne" value={internal.length} /><Kpi label="Invitations en attente" value={invitationsResult.count || 0} /></section>
    {profilesResult.error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">Impossible de charger l’équipe : {profilesResult.error.message}</p>}
    <TeamSection eyebrow="Organisation" title="Équipe interne" description="Direction, administration, management et direction artistique." members={internal} />
    <TeamSection eyebrow="Accès spécialisés" title="Artistes et prestataires" description={`${external.length} accès externe${external.length > 1 ? "s" : ""} encadré${external.length > 1 ? "s" : ""}.`} members={external} />
  </div></main>;
}

function TeamSection({ eyebrow, title, description, members }: { eyebrow: string; title: string; description: string; members: any[] }) { return <section className="mt-10"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">{eyebrow}</p><h2 className="mt-2 text-3xl font-bold">{title}</h2><p className="mt-2 text-sm text-zinc-500">{description}</p></div>{!members.length ? <p className="rounded-[26px] border border-dashed border-zinc-800 p-10 text-center text-zinc-600">Aucun membre dans cette catégorie.</p> : <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{members.map((member) => <MemberCard key={member.id} member={member} />)}</div>}</section>; }

function MemberCard({ member }: { member: any }) {
  const initials = String(member.nom || member.email || "LM").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <article className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><div className="flex items-start gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-xl font-black text-black">{member.avatarUrl ? <img src={member.avatarUrl} alt={member.nom || "Membre LMG"} className="h-full w-full object-cover" /> : initials}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-xl font-bold">{member.nom || "Membre"}</h3><p className="mt-1 truncate text-sm text-zinc-500">{member.email || "E-mail non renseigné"}</p></div><span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${member.disabled ? "bg-red-400" : member.lastSignInAt ? "bg-green-400" : "bg-zinc-600"}`} title={member.disabled ? "Compte désactivé" : member.lastSignInAt ? "Compte actif" : "Jamais connecté"} /></div><div className="mt-3"><RoleBadge role={member.role} /></div></div></div>
    <dl className="mt-6 grid grid-cols-2 gap-3"><Info label="Dernière connexion" value={member.lastSignInAt ? formatRelative(member.lastSignInAt) : "Jamais"} /><Info label="Compte créé" value={member.created_at ? new Date(member.created_at).toLocaleDateString("fr-FR") : "—"} /><Info label="E-mail" value={member.confirmedAt ? "Confirmé" : "À confirmer"} /><Info label="État" value={member.disabled ? "Désactivé" : "Actif"} /></dl>
    <Link href={`/equipe/${member.id}/modifier`} className="mt-6 block rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-bold text-zinc-300 transition hover:border-yellow-500 hover:text-yellow-300">Gérer le membre</Link></article>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-zinc-900 bg-black p-3"><dt className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</dt><dd className="mt-1 truncate text-xs font-semibold text-zinc-300" title={value}>{value}</dd></div>; }
function Kpi({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) { return <div className={`rounded-2xl border p-5 ${accent ? "border-yellow-500/30 bg-yellow-500/[0.06]" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className={`mt-3 text-4xl font-black ${accent ? "text-yellow-400" : ""}`}>{value}</p></div>; }
function formatRelative(input: string) { const date = new Date(input); const elapsed = Date.now() - date.getTime(); const days = Math.floor(elapsed / 86400000); if (days <= 0) return "Aujourd’hui"; if (days === 1) return "Hier"; if (days < 30) return `Il y a ${days} jours`; return date.toLocaleDateString("fr-FR"); }
