import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function FinanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { id } = await params;
  const { data: finance, error } = await supabase.from("finances").select(`
    *, artistes(id, nom), projets(id, titre), bookings(id, evenement), contrats(id, titre)
  `).eq("id", id).single();

  if (error || !finance) return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Transaction LMG</p><h1 className="mt-2 text-3xl font-bold">Opération introuvable</h1><p className="mt-3 text-sm text-zinc-400">Cette opération n’existe plus ou n’est pas accessible.</p><Link href="/finances" className="mt-6 inline-block text-sm font-bold text-white">← Retour aux transactions</Link></div></main>;

  const isRevenue = finance.type === "Revenu";
  const amount = Number(finance.montant || 0);
  const status = finance.statut || "Prévu";
  const isCancelled = status === "Annulé";
  const isPaid = status === "Payé";
  const signedAmount = isCancelled ? 0 : isRevenue ? amount : -amount;
  const cashImpact = isPaid ? signedAmount : 0;
  const forecastImpact = !isPaid && !isCancelled ? signedAmount : 0;
  const links = [finance.artistes?.id, finance.projets?.id, finance.bookings?.id, finance.contrats?.id].filter(Boolean).length;
  const checks = [Boolean(finance.titre), Boolean(finance.categorie), amount > 0, Boolean(finance.date_operation), links > 0];
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px]">
    <Link href="/finances" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux transactions</Link>
    <header className="mt-6 flex flex-col gap-6 border-b border-zinc-900 pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Transaction LMG</p><StatusBadge status={status} /></div><h1 className="mt-3 text-4xl font-bold md:text-6xl">{finance.titre || "Opération sans titre"}</h1><p className="mt-3 text-zinc-500">{finance.categorie || "Sans catégorie"} · {formatDate(finance.date_operation)}</p></div>
      <div className="flex flex-wrap gap-3"><Link href={`/finances/${finance.id}/modifier`} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">Modifier l’opération</Link><Link href="/finances/nouveau" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">+ Nouvelle opération</Link></div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Montant enregistré" value={`${isRevenue ? "+" : "−"} ${euros(amount)}`} detail={finance.type || "Opération"} tone={isRevenue ? "good" : "danger"} />
      <Metric label="Impact trésorerie" value={euros(cashImpact)} detail={isPaid ? "Flux encaissé ou réglé" : "Aucun impact tant que non payé"} tone={cashImpact < 0 ? "danger" : cashImpact > 0 ? "good" : "default"} />
      <Metric label="Impact prévisionnel" value={euros(forecastImpact)} detail={isCancelled ? "Opération annulée" : isPaid ? "Déjà réalisé" : "À encaisser ou à régler"} tone={forecastImpact < 0 ? "danger" : forecastImpact > 0 ? "good" : "default"} />
      <Metric label="Qualité de la donnée" value={`${completeness}%`} detail={links ? `${links} rattachement${links > 1 ? "s" : ""}` : "Aucun rattachement"} tone={completeness === 100 ? "good" : "warning"} />
    </section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Panel eyebrow="Lecture opérationnelle" title="Informations financières"><dl className="grid gap-3 sm:grid-cols-2"><Info label="Type" value={finance.type || "Non renseigné"} /><Info label="Catégorie" value={finance.categorie || "Non renseignée"} /><Info label="Date de l’opération" value={formatDate(finance.date_operation)} /><Info label="Statut actuel" value={status} /></dl></Panel>
        <Panel eyebrow="Contexte" title="Notes internes"><p className="whitespace-pre-wrap text-sm leading-7 text-zinc-400">{finance.notes || "Aucune note renseignée pour cette opération."}</p></Panel>
      </div>
      <aside className="space-y-6">
        <Panel eyebrow="Suivi" title="Cycle financier"><Lifecycle status={status} /></Panel>
        <Panel eyebrow="Attribution" title="Rattachements"><div className="space-y-3"><Relation label="Artiste" value={finance.artistes?.nom} href={finance.artistes?.id ? `/artistes/${finance.artistes.id}` : undefined} /><Relation label="Projet" value={finance.projets?.titre} href={finance.projets?.id ? `/projets/${finance.projets.id}` : undefined} /><Relation label="Booking" value={finance.bookings?.evenement} href={finance.bookings?.id ? `/booking/${finance.bookings.id}` : undefined} /><Relation label="Contrat" value={finance.contrats?.titre} href={finance.contrats?.id ? `/contrats/${finance.contrats.id}` : undefined} /></div></Panel>
      </aside>
    </section>

    <section className={`mt-8 rounded-[26px] border p-5 md:p-7 ${completeness === 100 ? "border-green-500/20 bg-green-500/[0.04]" : "border-yellow-500/20 bg-yellow-500/[0.04]"}`}><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className={`text-xs font-bold uppercase tracking-[0.2em] ${completeness === 100 ? "text-green-400" : "text-yellow-400"}`}>Contrôle de fiabilité</p><h2 className="mt-2 text-2xl font-bold">{completeness === 100 ? "Cette transaction est complète" : "Cette transaction demande un contrôle"}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{completeness === 100 ? "Elle peut alimenter correctement la trésorerie, la rentabilité et les alertes financières." : missing(finance, amount, links)}</p></div>{completeness < 100 && <Link href={`/finances/${finance.id}/modifier`} className="shrink-0 text-sm font-bold text-yellow-300">Compléter maintenant →</Link>}</div></section>
  </div></main>;
}

type Tone = "default" | "good" | "danger" | "warning";
function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: Tone }) { const style = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", danger: "border-red-500/20 bg-red-500/[0.05]", warning: "border-yellow-500/20 bg-yellow-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${style[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><div className="mt-5">{children}</div></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-zinc-800 bg-black p-4"><dt className="text-xs text-zinc-600">{label}</dt><dd className="mt-2 font-semibold">{value}</dd></div>; }
function Relation({ label, value, href }: { label: string; value?: string | null; href?: string }) { const content = <div className="flex items-center justify-between gap-4"><div><p className="text-xs text-zinc-600">{label}</p><p className={`mt-1 font-semibold ${value ? "text-white" : "text-zinc-600"}`}>{value || "Non lié"}</p></div>{href && <span className="text-xs text-zinc-600">Ouvrir →</span>}</div>; return href ? <Link href={href} className="block rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600">{content}</Link> : <div className="rounded-xl border border-zinc-900 bg-black p-4">{content}</div>; }
function StatusBadge({ status }: { status: string }) { const style = status === "Payé" ? "border-green-500/30 bg-green-500/10 text-green-300" : status === "Annulé" ? "border-red-500/30 bg-red-500/10 text-red-300" : status === "Facturé" ? "border-blue-500/30 bg-blue-500/10 text-blue-300" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"; return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${style}`}>{status}</span>; }
function Lifecycle({ status }: { status: string }) { if (status === "Annulé") return <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5"><p className="font-semibold text-red-300">Opération annulée</p><p className="mt-2 text-xs leading-5 text-zinc-500">Elle n’est comptée ni dans la trésorerie ni dans les engagements.</p></div>; const steps = ["Prévu", "Facturé", "Payé"]; const current = Math.max(0, steps.indexOf(status)); return <div>{steps.map((step, index) => <div key={step} className="flex gap-4 last:[&_.line]:hidden"><div className="flex flex-col items-center"><span className={`h-3 w-3 rounded-full ${index <= current ? "bg-yellow-400" : "bg-zinc-800"}`} /><span className={`line h-10 w-px ${index < current ? "bg-yellow-400/40" : "bg-zinc-800"}`} /></div><div className="-mt-1"><p className={`text-sm font-semibold ${index <= current ? "text-white" : "text-zinc-600"}`}>{step}</p>{index === current && <p className="mt-1 text-xs text-yellow-500">Statut actuel</p>}</div></div>)}</div>; }
function missing(finance: any, amount: number, links: number) { const fields = [!finance.titre && "le titre", !finance.categorie && "la catégorie", amount <= 0 && "le montant", !finance.date_operation && "la date", !links && "un rattachement"].filter(Boolean); return `Il manque ${fields.join(", ")} pour fiabiliser son impact dans le cockpit Finance.`; }
function euros(value: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value || 0); }
function formatDate(input?: string | null) { if (!input) return "Date non renseignée"; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${input}T12:00:00`)); }
