import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import DeleteContractButton from "@/components/DeleteContractButton";

export const dynamic = "force-dynamic";

export default async function ContratDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER, ROLES.ARTISTE]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { id } = await params;
  const [{ data: contract, error }, { data: { user } }] = await Promise.all([
    supabase.from("contrats").select("*, artistes(id, nom), projets(id, titre)").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };

  if (error || !contract) return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">LMG Legal</p><h1 className="mt-2 text-3xl font-bold">Contrat introuvable</h1><p className="mt-3 text-sm text-zinc-400">Ce dossier n’existe plus ou n’est pas accessible avec ton rôle.</p><Link href="/contrats" className="mt-6 inline-block text-sm font-bold text-white">← Retour aux contrats</Link></div></main>;

  const status = contract.statut || "Brouillon";
  const canManage = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(profile?.role);
  const canSign = canManage || profile?.role === ROLES.ARTISTE;
  const hasOriginal = Boolean(contract.fichier_url);
  const hasSigned = Boolean(contract.fichier_signe_url);
  const checks = [Boolean(contract.titre), Boolean(contract.type), Boolean(contract.artiste_id || contract.projet_id), hasOriginal, status !== "Signé" || Boolean(contract.signe_par && contract.date_signature)];
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px]">
    <Link href="/contrats" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux contrats</Link>
    <header className="mt-6 flex flex-col gap-6 border-b border-zinc-900 pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Dossier juridique</p><Status status={status} /></div><h1 className="mt-3 text-4xl font-bold md:text-6xl">{contract.titre || "Contrat sans titre"}</h1><p className="mt-3 text-zinc-500">{contract.type || "Type non renseigné"} · créé le {date(contract.created_at)}</p></div>
      <div className="flex flex-wrap gap-3">{canManage && <Link href={`/contrats/${contract.id}/modifier`} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">Modifier le contrat</Link>}{canSign && status !== "Archivé" && <Link href={`/contrats/${contract.id}/signature`} className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-bold text-green-300">{status === "Signé" ? "Mettre à jour la signature" : "Signer / archiver"}</Link>}</div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="État contractuel" value={status} detail={statusDetail(status)} tone={status === "Signé" ? "good" : status === "Envoyé" ? "warning" : "default"} />
      <Metric label="Contrat original" value={hasOriginal ? "Disponible" : "Manquant"} detail={hasOriginal ? "document archivé" : "pièce à ajouter"} tone={hasOriginal ? "good" : "danger"} />
      <Metric label="Version signée" value={hasSigned ? "Disponible" : "Absente"} detail={hasSigned ? "preuve archivée" : status === "Signé" ? "à régulariser" : "pas encore attendue"} tone={hasSigned ? "good" : status === "Signé" ? "danger" : "default"} />
      <Metric label="Qualité du dossier" value={`${completeness}%`} detail={completeness === 100 ? "dossier complet" : "contrôle nécessaire"} tone={completeness === 100 ? "good" : "warning"} />
    </section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Panel eyebrow="Références" title="Rattachements du contrat"><div className="grid gap-3 sm:grid-cols-2"><Relation label="Artiste" value={contract.artistes?.nom} href={contract.artistes?.id ? `/artistes/${contract.artistes.id}` : undefined} /><Relation label="Projet" value={contract.projets?.titre} href={contract.projets?.id ? `/projets/${contract.projets.id}` : undefined} /></div></Panel>
        <Panel eyebrow="Contexte" title="Notes internes"><p className="whitespace-pre-wrap text-sm leading-7 text-zinc-400">{contract.notes || "Aucune note interne renseignée."}</p></Panel>
        {status === "Signé" && <section className="rounded-[26px] border border-green-500/20 bg-green-500/[0.05] p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">Signature archivée</p><h2 className="mt-2 text-2xl font-bold text-green-100">{contract.signe_par || "Signataire non renseigné"}</h2><p className="mt-2 text-sm text-green-200/60">Signé le {date(contract.date_signature)}</p>{contract.signature_notes && <p className="mt-5 whitespace-pre-wrap border-t border-green-500/10 pt-5 text-sm leading-7 text-green-100/70">{contract.signature_notes}</p>}</section>}
      </div>
      <aside className="space-y-6">
        <Panel eyebrow="Progression" title="Cycle contractuel"><Lifecycle status={status} /></Panel>
        <Panel eyebrow="Documents" title="Pièces du dossier"><div className="space-y-3"><Document label="Contrat original" href={contract.fichier_url} tone="neutral" /><Document label="Contrat signé" href={contract.fichier_signe_url} tone="signed" /></div></Panel>
        {canManage && <section className="rounded-[26px] border border-red-500/15 bg-red-500/[0.03] p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Zone sensible</p><p className="mt-3 text-xs leading-5 text-zinc-600">La suppression est définitive et doit rester exceptionnelle.</p><div className="mt-4"><DeleteContractButton contratId={contract.id} /></div></section>}
      </aside>
    </section>

    {completeness < 100 && <section className="mt-8 rounded-[26px] border border-yellow-500/20 bg-yellow-500/[0.04] p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Dossier à sécuriser</p><h2 className="mt-2 text-2xl font-bold">Certaines informations restent incomplètes</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{missing(contract, hasOriginal)}</p>{canManage && <Link href={`/contrats/${contract.id}/modifier`} className="mt-5 inline-block text-sm font-bold text-yellow-300">Compléter le contrat →</Link>}</section>}
  </div></main>;
}

type Tone = "default" | "good" | "warning" | "danger";
function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: Tone }) { const style = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", warning: "border-yellow-500/20 bg-yellow-500/[0.05]", danger: "border-red-500/20 bg-red-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${style[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><div className="mt-5">{children}</div></section>; }
function Status({ status }: { status: string }) { const style = status === "Signé" ? "border-green-500/30 bg-green-500/10 text-green-300" : status === "Envoyé" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" : status === "Archivé" ? "border-zinc-700 text-zinc-500" : "border-blue-500/30 bg-blue-500/10 text-blue-300"; return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${style}`}>{status}</span>; }
function Relation({ label, value, href }: { label: string; value?: string | null; href?: string }) { const body = <><p className="text-xs text-zinc-600">{label}</p><p className={`mt-2 font-semibold ${value ? "" : "text-zinc-600"}`}>{value || "Non lié"}</p>{href && <p className="mt-3 text-xs text-zinc-700">Ouvrir →</p>}</>; return href ? <Link href={href} className="rounded-2xl border border-zinc-800 bg-black p-4 hover:border-zinc-600">{body}</Link> : <div className="rounded-2xl border border-zinc-900 bg-black p-4">{body}</div>; }
function Document({ label, href, tone }: { label: string; href?: string | null; tone: "neutral" | "signed" }) { if (!href) return <div className="rounded-xl border border-dashed border-zinc-800 p-4"><p className="text-sm font-semibold text-zinc-600">{label}</p><p className="mt-1 text-xs text-zinc-700">Document non disponible</p></div>; return <a href={href} target="_blank" rel="noreferrer" className={`block rounded-xl border p-4 ${tone === "signed" ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-zinc-700 bg-black text-white"}`}><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs opacity-60">Ouvrir le PDF ↗</p></a>; }
function Lifecycle({ status }: { status: string }) { const steps = ["Brouillon", "Envoyé", "Signé", "Archivé"]; const current = Math.max(0, steps.indexOf(status)); return <div>{steps.map((step, index) => <div key={step} className="flex gap-4 last:[&_.line]:hidden"><div className="flex flex-col items-center"><span className={`h-3 w-3 rounded-full ${index <= current ? "bg-yellow-400" : "bg-zinc-800"}`} /><span className={`line h-10 w-px ${index < current ? "bg-yellow-400/40" : "bg-zinc-800"}`} /></div><div className="-mt-1"><p className={`text-sm font-semibold ${index <= current ? "text-white" : "text-zinc-600"}`}>{step}</p>{index === current && <p className="mt-1 text-xs text-yellow-500">Étape actuelle</p>}</div></div>)}</div>; }
function statusDetail(status: string) { return status === "Signé" ? "accord formalisé" : status === "Envoyé" ? "signature attendue" : status === "Archivé" ? "cycle terminé" : "préparation en cours"; }
function missing(contract: any, hasOriginal: boolean) { const fields = [!contract.titre && "le titre", !contract.type && "le type", !contract.artiste_id && !contract.projet_id && "un rattachement", !hasOriginal && "le PDF original", contract.statut === "Signé" && (!contract.signe_par || !contract.date_signature) && "les informations de signature"].filter(Boolean); return `À compléter : ${fields.join(", ")}.`; }
function date(input?: string | null) { if (!input) return "date non renseignée"; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(input.length === 10 ? `${input}T12:00:00` : input)); }
