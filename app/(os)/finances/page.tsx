import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string | string[]; type?: string | string[]; statut?: string | string[]; categorie?: string | string[] }>;

export default async function FinancesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const filters = await searchParams;
  const q = value(filters.q).trim().toLowerCase();
  const type = value(filters.type);
  const statut = value(filters.statut);
  const categorie = value(filters.categorie);

  const { data, error } = await supabase.from("finances").select(`
    id, titre, type, categorie, montant, statut, date_operation, created_at,
    artistes(id, nom), projets(id, titre), bookings(id, evenement)
  `).order("date_operation", { ascending: false }).order("created_at", { ascending: false });

  if (error) {
    return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Transactions LMG</p><h1 className="mt-2 text-3xl font-bold">Transactions indisponibles</h1><p className="mt-3 text-sm text-zinc-400">Les opérations n’ont pas pu être chargées. Réessaie dans quelques instants.</p></div></main>;
  }

  const finances = data || [];
  const categories = Array.from(new Set(finances.map((item: any) => item.categorie).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), "fr"));
  const filtered = finances.filter((item: any) => {
    const searchable = [item.titre, item.categorie, item.artistes?.nom, item.projets?.titre, item.bookings?.evenement].filter(Boolean).join(" ").toLowerCase();
    return (!q || searchable.includes(q)) && (!type || item.type === type) && (!statut || item.statut === statut) && (!categorie || item.categorie === categorie);
  });

  const revenus = total(finances, "Revenu");
  const depenses = total(finances, "Dépense");
  const aEncaisser = pending(finances, "Revenu");
  const aRegler = pending(finances, "Dépense");
  const activeFilters = [q, type, statut, categorie].filter(Boolean).length;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Finance LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Transactions</h1><p className="mt-3 max-w-3xl text-zinc-500">Enregistre et suis chaque revenu ou dépense, de la prévision jusqu’au paiement.</p></div>
      <div className="flex flex-wrap gap-3"><Link href="/finances/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Nouvelle opération</Link><Link href="/finances/dashboard" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">Vue financière</Link></div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Revenus enregistrés" value={euros(revenus)} detail={`${count(finances, "Revenu")} opération(s)`} tone="good" />
      <Metric label="Dépenses enregistrées" value={euros(depenses)} detail={`${count(finances, "Dépense")} opération(s)`} />
      <Metric label="À encaisser" value={euros(aEncaisser)} detail="Prévu ou facturé" tone={aEncaisser ? "warning" : "default"} />
      <Metric label="À régler" value={euros(aRegler)} detail="Prévu ou facturé" tone={aRegler ? "warning" : "default"} />
    </section>

    <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Registre financier</p><h2 className="mt-2 text-2xl font-bold">Toutes les opérations</h2><p className="mt-2 text-sm text-zinc-500">{filtered.length} résultat(s) sur {finances.length}</p></div>{activeFilters > 0 && <Link href="/finances" className="text-sm font-semibold text-zinc-400 hover:text-white">Réinitialiser les {activeFilters} filtre(s) →</Link>}</div>

      <form method="get" className="mt-6 grid gap-3 lg:grid-cols-[1.5fr_repeat(3,0.75fr)_auto]">
        <label className="sr-only" htmlFor="finance-search">Rechercher</label>
        <input id="finance-search" name="q" defaultValue={value(filters.q)} placeholder="Titre, artiste, projet, booking…" className="min-h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-zinc-600" />
        <Select name="type" label="Tous les types" current={type} options={["Revenu", "Dépense"]} />
        <Select name="statut" label="Tous les statuts" current={statut} options={["Prévu", "Facturé", "Payé", "Annulé"]} />
        <Select name="categorie" label="Toutes les catégories" current={categorie} options={categories.map(String)} />
        <button className="min-h-12 rounded-xl bg-zinc-100 px-5 text-sm font-bold text-black hover:bg-white">Filtrer</button>
      </form>

      {!filtered.length ? <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-10 text-center"><p className="font-semibold">Aucune transaction trouvée</p><p className="mt-2 text-sm text-zinc-600">{finances.length ? "Modifie ou réinitialise les filtres." : "Crée la première opération financière de LMG."}</p>{!finances.length && <Link href="/finances/nouveau" className="mt-5 inline-block text-sm font-bold text-yellow-400">Créer une opération →</Link>}</div> : <>
        <div className="mt-6 hidden grid-cols-[110px_1fr_150px_140px_140px] gap-4 border-b border-zinc-800 px-4 pb-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 lg:grid"><span>Date</span><span>Opération</span><span>Rattachement</span><span>Statut</span><span className="text-right">Montant</span></div>
        <div>{filtered.map((finance: any) => <TransactionRow key={finance.id} finance={finance} />)}</div>
      </>}
    </section>

    <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Qualité des données</p><h2 className="mt-2 text-2xl font-bold">Une transaction complète rend tout Finance fiable</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Renseigne la catégorie, la date, le statut et au moins un rattachement pertinent. Ces informations alimentent directement la trésorerie, la rentabilité des projets et les alertes.</p></div><Link href="/finances/nouveau" className="shrink-0 text-sm font-semibold text-zinc-400 hover:text-white">Ajouter une opération →</Link></div></section>
  </div></main>;
}

type Tone = "default" | "good" | "warning";
function Metric({ label, value: amount, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: Tone }) { const styles = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", warning: "border-yellow-500/25 bg-yellow-500/[0.06]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{amount}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function Select({ name, label, current, options }: { name: string; label: string; current: string; options: string[] }) { return <select name={name} defaultValue={current} aria-label={label} className="min-h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none focus:border-zinc-600"><option value="">{label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>; }
function TransactionRow({ finance }: { finance: any }) {
  const attachment = finance.projets?.titre || finance.artistes?.nom || finance.bookings?.evenement || "Non rattachée";
  return <Link href={`/finances/${finance.id}`} className="group grid gap-4 border-b border-zinc-900 px-2 py-5 last:border-0 hover:bg-white/[0.02] lg:grid-cols-[110px_1fr_150px_140px_140px] lg:items-center lg:px-4">
    <div><p className="text-xs font-semibold text-zinc-400">{date(finance.date_operation)}</p><p className="mt-1 text-[11px] text-zinc-700">{finance.categorie || "Sans catégorie"}</p></div>
    <div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${finance.type === "Revenu" ? "bg-green-400" : "bg-red-400"}`} /><p className="truncate font-semibold group-hover:text-yellow-400">{finance.titre || "Opération sans titre"}</p></div><p className="mt-1 pl-4 text-xs text-zinc-600">{finance.type}</p></div>
    <div className="min-w-0"><p className="truncate text-sm text-zinc-400">{attachment}</p><p className="mt-1 text-[11px] text-zinc-700">{attachmentKind(finance)}</p></div>
    <Status value={finance.statut || "Prévu"} />
    <div className="text-left lg:text-right"><p className={`font-bold ${finance.type === "Revenu" ? "text-green-400" : "text-red-400"}`}>{finance.type === "Revenu" ? "+" : "−"} {euros(Number(finance.montant || 0))}</p><p className="mt-1 text-[11px] text-zinc-700">Voir le détail →</p></div>
  </Link>;
}
function Status({ value: status }: { value: string }) { const style: Record<string, string> = { "Payé": "bg-green-500/10 text-green-300", "Facturé": "bg-blue-500/10 text-blue-300", "Prévu": "bg-yellow-500/10 text-yellow-300", "Annulé": "bg-zinc-800 text-zinc-500" }; return <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${style[status] || "bg-zinc-800 text-zinc-400"}`}>{status}</span>; }
function attachmentKind(finance: any) { if (finance.projets?.titre) return "Projet"; if (finance.artistes?.nom) return "Artiste"; if (finance.bookings?.evenement) return "Booking"; return "Aucun rattachement"; }
function total(items: any[], type: string) { return items.filter((item) => item.type === type && item.statut !== "Annulé").reduce((sum, item) => sum + Number(item.montant || 0), 0); }
function pending(items: any[], type: string) { return items.filter((item) => item.type === type && !["Payé", "Annulé"].includes(item.statut)).reduce((sum, item) => sum + Number(item.montant || 0), 0); }
function count(items: any[], type: string) { return items.filter((item) => item.type === type && item.statut !== "Annulé").length; }
function value(input?: string | string[]) { return Array.isArray(input) ? input[0] || "" : input || ""; }
function euros(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount || 0); }
function date(input?: string) { if (!input) return "Sans date"; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${input}T12:00:00`)); }
