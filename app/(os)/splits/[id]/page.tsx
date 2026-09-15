import Link from "next/link";
import { notFound } from "next/navigation";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { canGenerateRoyalties } from "@/lib/permissions";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];

export default async function SplitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole(allowed);
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: split, error } = await supabase.from("splits").select(`
    id, titre, statut, notes, artiste_id, projet_id, created_at,
    projets(id, titre), artistes(id, nom),
    split_participants(id, nom, role, pourcentage, email),
    royalties(id, montant_du, statut)
  `).eq("id", id).single();
  if (error || !split) notFound();

  const participants = split.split_participants || [];
  const total = participants.reduce((sum: number, item: any) => sum + Number(item.pourcentage || 0), 0);
  const complete = participants.length > 0 && Math.abs(total - 100) < 0.001;
  const remaining = 100 - total;
  const missingEmails = participants.filter((item: any) => !item.email).length;
  const missingRoles = participants.filter((item: any) => !item.role).length;
  const royalties = split.royalties || [];
  const generated = royalties.length > 0;
  const royaltiesTotal = royalties.reduce((sum: number, item: any) => sum + Number(item.montant_du || 0), 0);
  const project: any = relation(split.projets);
  const artist: any = relation(split.artistes);
  const canGenerate = canGenerateRoyalties(profile.role);
  const canEditParticipants = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(profile.role as any) && !generated;
  const canDelete = profile.role !== ROLES.MANAGER;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/splits" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux split sheets</Link>
    <header className="mt-6 flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Contrôle des droits</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">{split.titre || "Split Sheet"}</h1><p className="mt-3 text-zinc-500">{artist?.nom || "Artiste non lié"} · {project?.titre || "Projet non lié"}</p></div>
      <div className="flex flex-wrap gap-3"><State complete={complete} total={total} />{generated && <span className="rounded-full bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300">Royalties générées</span>}</div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Total réparti" value={`${total}%`} detail={complete ? "Répartition complète" : remaining > 0 ? `${remaining}% restant(s)` : `${Math.abs(remaining)}% en trop`} tone={complete ? "good" : "warning"} />
      <Metric label="Participants" value={String(participants.length)} detail={participants.length ? "Bénéficiaires renseignés" : "Aucun participant"} />
      <Metric label="Informations manquantes" value={String(missingEmails + missingRoles)} detail={`${missingEmails} email(s) · ${missingRoles} rôle(s)`} tone={missingEmails + missingRoles ? "warning" : "good"} />
      <Metric label="Royalties liées" value={euros(royaltiesTotal)} detail={generated ? `${royalties.length} ligne(s) générée(s)` : "Pas encore générées"} />
    </section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
        <div className="flex flex-col gap-4 border-b border-zinc-900 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Répartition</p><h2 className="mt-2 text-2xl font-bold">Participants</h2><p className="mt-2 text-sm text-zinc-500">Identité, rôle et part de chaque bénéficiaire.</p></div>{canEditParticipants && <Link href={`/splits/${split.id}/participants/nouveau`} className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-black">+ Ajouter un participant</Link>}</div>
        {!participants.length ? <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-600">Ajoute les bénéficiaires pour commencer la répartition.</div> : <div>{participants.sort((a: any, b: any) => Number(b.pourcentage || 0) - Number(a.pourcentage || 0)).map((participant: any) => <Participant key={participant.id} participant={participant} />)}</div>}
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-black"><div className={`h-full rounded-full ${complete ? "bg-green-400" : total > 100 ? "bg-red-400" : "bg-yellow-400"}`} style={{ width: `${Math.min(total, 100)}%` }} /></div>
        {!complete && <div className={`mt-4 rounded-xl border p-4 text-sm ${total > 100 ? "border-red-500/20 bg-red-500/[0.05] text-red-300" : "border-yellow-500/20 bg-yellow-500/[0.05] text-yellow-300"}`}>{total > 100 ? `Répartition dépassée de ${Math.abs(remaining)} %. Corrige les pourcentages avant toute génération.` : `Il reste ${remaining} % à attribuer avant que le split soit exploitable.`}</div>}
      </section>

      <aside className="space-y-6">
        <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Contexte</p><h2 className="mt-2 text-2xl font-bold">Rattachements</h2><div className="mt-5 space-y-3"><Info label="Artiste" value={artist?.nom || "Non lié"} href={artist?.id ? `/artistes/${artist.id}` : undefined} /><Info label="Projet" value={project?.titre || "Non lié"} href={project?.id ? `/projets/${project.id}` : undefined} /><Info label="Statut interne" value={split.statut || "Brouillon"} /></div>{split.notes && <div className="mt-5 border-t border-zinc-900 pt-5"><p className="text-xs text-zinc-600">Notes</p><p className="mt-2 text-sm leading-6 text-zinc-400">{split.notes}</p></div>}</section>
        <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Workflow</p><h2 className="mt-2 text-2xl font-bold">Prochaine action</h2><p className="mt-3 text-sm leading-6 text-zinc-500">{generated ? "Les royalties ont déjà été générées depuis ce split. Consulte leur suivi avant toute modification de la répartition." : complete ? canGenerate ? "Le split est complet et prêt pour la génération des royalties." : "Le split est complet. La Direction peut maintenant générer les royalties." : "Complète la répartition et les informations des participants avant de générer les royalties."}</p>
          <div className="mt-5 space-y-3">{canGenerate && complete && !generated && <Link href="/royalties/generer" className="block rounded-xl bg-white px-5 py-4 text-center text-sm font-bold text-black">Générer les royalties</Link>}{generated && <Link href="/royalties" className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-sm font-bold text-zinc-300">Voir les royalties</Link>}{canEditParticipants && <Link href={`/splits/${split.id}/participants/nouveau`} className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-sm font-bold text-zinc-300">Ajouter un participant</Link>}{canDelete && <Link href={`/splits/${split.id}/supprimer`} className="block rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-4 text-center text-sm font-bold text-red-300">Supprimer le split</Link>}</div>
        </section>
      </aside>
    </section>
  </div></main>;
}

type Tone = "default" | "good" | "warning";
function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: Tone }) { const styles = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", warning: "border-yellow-500/25 bg-yellow-500/[0.06]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function Participant({ participant }: { participant: any }) { const missing = !participant.email || !participant.role; return <div className="grid gap-3 border-b border-zinc-900 py-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate font-semibold">{participant.nom || "Participant sans nom"}</p>{missing && <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-bold text-yellow-300">À compléter</span>}</div><p className="mt-1 text-xs text-zinc-600">{participant.role || "Rôle manquant"} · {participant.email || "Email manquant"}</p></div><p className="text-2xl font-bold">{Number(participant.pourcentage || 0)}%</p></div>; }
function Info({ label, value, href }: { label: string; value: string; href?: string }) { const content = <><p className="text-xs text-zinc-600">{label}</p><p className="mt-1 font-semibold">{value}</p></>; return href ? <Link href={href} className="block rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600">{content}<p className="mt-2 text-[11px] text-zinc-700">Ouvrir →</p></Link> : <div className="rounded-xl border border-zinc-800 bg-black p-4">{content}</div>; }
function State({ complete, total }: { complete: boolean; total: number }) { return <span className={`rounded-full px-3 py-2 text-xs font-bold ${complete ? "bg-green-500/10 text-green-300" : total > 100 ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>{complete ? "Complet · 100 %" : total > 100 ? `Dépassé · ${total}%` : `Incomplet · ${total}%`}</span>; }
function relation(input: any) { return Array.isArray(input) ? input[0] : input; }
function euros(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount || 0); }
