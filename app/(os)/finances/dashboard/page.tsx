import Link from "next/link";
import BudgetAllocationChart from "@/components/BudgetAllocationChart";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function FinancesDashboardPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();

  const [financeResult, royaltyResult, projectResult, campaignResult] = await Promise.all([
    supabase.from("finances").select("id, titre, type, montant, statut, date_operation, projet_id, projets(id, titre)").order("date_operation", { ascending: false }),
    supabase.from("royalties").select("id, montant_du, statut"),
    supabase.from("projets").select("id, titre, budget_clip, budget_cover, budget_promo, budget_studio, budget_influence, budget_rp"),
    supabase.from("campagnes").select("id, budget"),
  ]);

  if (financeResult.error || royaltyResult.error || projectResult.error || campaignResult.error) {
    return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Finance LMG</p><h1 className="mt-2 text-3xl font-bold">Données financières indisponibles</h1><p className="mt-3 text-sm text-zinc-400">La vue n’a pas pu être chargée. Réessaie dans quelques instants.</p></div></main>;
  }

  const finances = financeResult.data || [];
  const royalties = royaltyResult.data || [];
  const projets = projectResult.data || [];
  const campagnes = campaignResult.data || [];
  const revenus = sum(finances, "Revenu");
  const depenses = sum(finances, "Dépense");
  const resultat = revenus - depenses;
  const encaisses = sum(finances, "Revenu", "Payé");
  const payees = sum(finances, "Dépense", "Payé");
  const tresorerie = encaisses - payees;
  const aEncaisser = outstanding(finances, "Revenu");
  const engagees = outstanding(finances, "Dépense");
  const royaltiesDues = royalties.filter((r: any) => r.statut !== "Payé").reduce((total: number, r: any) => total + Number(r.montant_du || 0), 0);
  const marge = revenus > 0 ? Math.round((resultat / revenus) * 100) : 0;
  const roi = depenses > 0 ? Math.round((resultat / depenses) * 100) : 0;

  const monthly = new Map<string, any>();
  finances.forEach((item: any) => {
    if (!item.date_operation || item.statut === "Annulé") return;
    const date = new Date(`${item.date_operation}T12:00:00`);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const row = monthly.get(key) || { key, mois: new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(date), revenus: 0, depenses: 0, resultat: 0 };
    if (item.type === "Revenu") row.revenus += Number(item.montant || 0);
    if (item.type === "Dépense") row.depenses += Number(item.montant || 0);
    row.resultat = row.revenus - row.depenses;
    monthly.set(key, row);
  });
  const chartData = Array.from(monthly.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-6);

  const rentabilite = projets.map((projet: any) => {
    const operations = finances.filter((item: any) => item.projet_id === projet.id);
    const projetRevenus = sum(operations, "Revenu");
    const projetDepenses = sum(operations, "Dépense");
    return { id: projet.id, titre: projet.titre, revenus: projetRevenus, depenses: projetDepenses, resultat: projetRevenus - projetDepenses };
  }).filter((projet) => projet.revenus || projet.depenses).sort((a, b) => b.resultat - a.resultat);
  const deficitaires = rentabilite.filter((projet) => projet.resultat < 0);
  const rentables = rentabilite.filter((projet) => projet.resultat > 0);

  const budgets = projets.reduce((total: any, projet: any) => ({
    clip: total.clip + Number(projet.budget_clip || 0), cover: total.cover + Number(projet.budget_cover || 0),
    promo: total.promo + Number(projet.budget_promo || 0), studio: total.studio + Number(projet.budget_studio || 0),
    influence: total.influence + Number(projet.budget_influence || 0), rp: total.rp + Number(projet.budget_rp || 0),
  }), { clip: 0, cover: 0, promo: 0, studio: 0, influence: 0, rp: 0 });
  const budgetProjets = Object.values(budgets).reduce((total: number, value) => total + Number(value), 0);
  const budgetCampagnes = campagnes.reduce((total: number, item: any) => total + Number(item.budget || 0), 0);
  const budgetData = [
    { name: "Clips", value: budgets.clip }, { name: "Promotion", value: budgets.promo },
    { name: "Studio", value: budgets.studio }, { name: "Influence", value: budgets.influence },
    { name: "Relations presse", value: budgets.rp }, { name: "Cover", value: budgets.cover },
  ];
  const score = financeScore(revenus, marge, roi, deficitaires.length, royaltiesDues);
  const alerts = [
    royaltiesDues > 0 ? { label: "Royalties à régler", value: euros(royaltiesDues), detail: "Montants générés pas encore marqués comme payés.", href: "/royalties", tone: "warning" } : null,
    aEncaisser > 0 ? { label: "Revenus à encaisser", value: euros(aEncaisser), detail: "Revenus prévus ou facturés pas encore encaissés.", href: "/finances", tone: "warning" } : null,
    engagees > 0 ? { label: "Dépenses engagées", value: euros(engagees), detail: "Dépenses prévues ou facturées pas encore réglées.", href: "/finances", tone: "neutral" } : null,
    deficitaires.length > 0 ? { label: "Projets déficitaires", value: String(deficitaires.length), detail: "Projets dont les dépenses dépassent les revenus.", href: "#rentabilite", tone: "danger" } : null,
    resultat < 0 ? { label: "Résultat global négatif", value: euros(resultat), detail: "Les dépenses enregistrées dépassent les revenus.", href: "/finances", tone: "danger" } : null,
  ].filter(Boolean) as Alert[];

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Pilotage financier LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Vue financière</h1><p className="mt-3 max-w-3xl text-zinc-500">Trésorerie, performance, engagements et alertes réunis dans un cockpit de décision.</p></div>
      <div className="flex flex-wrap gap-3"><Link href="/finances/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Nouvelle opération</Link><Link href="/finances" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">Voir les transactions</Link></div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Trésorerie nette suivie" value={euros(tresorerie)} detail="Encaissé − payé" tone={tresorerie < 0 ? "danger" : "good"} />
      <Metric label="Revenus enregistrés" value={euros(revenus)} detail={`${euros(encaisses)} encaissés`} />
      <Metric label="Dépenses enregistrées" value={euros(depenses)} detail={`${euros(payees)} payées`} />
      <Metric label="Résultat net" value={euros(resultat)} detail={`${marge}% de marge nette`} tone={resultat < 0 ? "danger" : "good"} />
    </section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel eyebrow="Flux financiers" title="Évolution sur 6 mois" description="Revenus, dépenses et résultat calculés à partir des opérations non annulées."><CashflowBars data={chartData} /></Panel>
      <Panel eyebrow="Indicateur exécutif" title="Finance Score LMG" description="Lecture synthétique de la rentabilité et des engagements en cours.">
        <div className="flex items-end justify-between gap-4"><p className="text-6xl font-black">{score}<span className="text-2xl text-zinc-600">/100</span></p><Status score={score} /></div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-900"><div className={`h-full rounded-full ${bar(score)}`} style={{ width: `${score}%` }} /></div>
        <dl className="mt-7 grid grid-cols-2 gap-3"><Mini label="ROI global" value={`${roi}%`} /><Mini label="Marge nette" value={`${marge}%`} /><Mini label="À encaisser" value={euros(aEncaisser)} /><Mini label="Royalties dues" value={euros(royaltiesDues)} /></dl>
      </Panel>
    </section>

    <section className="mt-8 grid gap-6 xl:grid-cols-2">
      <Panel eyebrow="Monitoring" title="Alertes financières" description="Les points qui demandent un contrôle ou une décision de la direction.">{!alerts.length ? <Empty text="Aucune alerte financière active." good /> : <div className="space-y-3">{alerts.map((alert) => <AlertRow key={alert.label} alert={alert} />)}</div>}</Panel>
      <Panel eyebrow="Engagements" title="Ce qui reste à sécuriser" description="Montants prévus ou dus, distincts des flux déjà encaissés et payés."><div className="grid gap-3 sm:grid-cols-2"><Commitment label="Revenus à encaisser" value={aEncaisser} href="/finances" /><Commitment label="Dépenses engagées" value={engagees} href="/finances" /><Commitment label="Royalties à payer" value={royaltiesDues} href="/royalties" /><Commitment label="Trésorerie après engagements" value={tresorerie + aEncaisser - engagees - royaltiesDues} /></div></Panel>
    </section>

    <section id="rentabilite" className="mt-8 grid scroll-mt-8 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel eyebrow="Rentabilité" title="Performance par projet" description="Classement selon les revenus et dépenses enregistrés dans Finance.">
        {!rentabilite.length ? <Empty text="Aucun projet ne possède encore de flux financier." /> : <div>{rentabilite.slice(0, 8).map((projet) => <ProjectRow key={projet.id} projet={projet} />)}</div>}
        {rentabilite.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3"><Mini label="Projets rentables" value={`${rentables.length}/${rentabilite.length}`} /><Mini label="Projets déficitaires" value={deficitaires.length} /></div>}
      </Panel>
      <Panel eyebrow="Budgets prévisionnels" title="Répartition des investissements" description={`${euros(budgetProjets)} sur les projets · ${euros(budgetCampagnes)} sur les campagnes`}><BudgetAllocationChart data={budgetData} /></Panel>
    </section>

    <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Discipline financière</p><h2 className="mt-2 text-2xl font-bold">Chaque euro doit avoir un statut et un rattachement</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Une opération doit être liée au bon artiste, projet ou booking et passer de prévu à facturé, puis payé. La vue devient fiable uniquement si les transactions sont tenues à jour.</p></div><Link href="/finances" className="shrink-0 text-sm font-semibold text-zinc-400 hover:text-white">Mettre à jour les transactions →</Link></div></section>
  </div></main>;
}

type Tone = "default" | "good" | "danger";
type Alert = { label: string; value: string; detail: string; href: string; tone: "warning" | "danger" | "neutral" };
function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: Tone }) { const styles = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", danger: "border-red-500/25 bg-red-500/[0.06]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function Panel({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) { return <section className="overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><p className="mt-2 text-sm text-zinc-500">{description}</p><div className="mt-5">{children}</div></section>; }
function Mini({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-zinc-800 bg-black p-4"><dt className="text-xs text-zinc-600">{label}</dt><dd className="mt-2 text-xl font-bold">{value}</dd></div>; }
function CashflowBars({ data }: { data: Array<{ mois: string; revenus: number; depenses: number; resultat: number }> }) {
  if (!data.length) return <Empty text="Aucune opération datée à afficher." />;
  const maximum = Math.max(...data.flatMap((row) => [row.revenus, row.depenses]), 1);
  return <div className="space-y-5">{data.map((row) => <div key={row.mois}><div className="mb-2 flex items-center justify-between gap-4 text-sm"><p className="font-semibold capitalize">{row.mois}</p><p className={row.resultat < 0 ? "text-red-400" : "text-green-400"}>{euros(row.resultat)}</p></div><div className="grid grid-cols-[76px_1fr_auto] items-center gap-3 text-xs"><span className="text-zinc-600">Revenus</span><div className="h-2 overflow-hidden rounded-full bg-black"><div className="h-full rounded-full bg-green-500/70" style={{ width: `${Math.max((row.revenus / maximum) * 100, row.revenus ? 2 : 0)}%` }} /></div><span className="w-20 text-right text-zinc-500">{euros(row.revenus)}</span><span className="text-zinc-600">Dépenses</span><div className="h-2 overflow-hidden rounded-full bg-black"><div className="h-full rounded-full bg-red-500/70" style={{ width: `${Math.max((row.depenses / maximum) * 100, row.depenses ? 2 : 0)}%` }} /></div><span className="w-20 text-right text-zinc-500">{euros(row.depenses)}</span></div></div>)}</div>;
}
function AlertRow({ alert }: { alert: Alert }) { const styles = { warning: "border-yellow-500/20 bg-yellow-500/[0.05]", danger: "border-red-500/20 bg-red-500/[0.05]", neutral: "border-zinc-800 bg-black" }; return <Link href={alert.href} className={`block rounded-2xl border p-4 transition hover:border-zinc-600 ${styles[alert.tone]}`}><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{alert.label}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{alert.detail}</p></div><p className="shrink-0 font-bold">{alert.value}</p></div></Link>; }
function Commitment({ label, value, href }: { label: string; value: number; href?: string }) { const content = <><p className="text-xs text-zinc-600">{label}</p><p className={`mt-2 text-2xl font-bold ${value < 0 ? "text-red-400" : ""}`}>{euros(value)}</p>{href && <p className="mt-3 text-xs text-zinc-700">Ouvrir →</p>}</>; return href ? <Link href={href} className="rounded-2xl border border-zinc-800 bg-black p-4 hover:border-zinc-600">{content}</Link> : <div className="rounded-2xl border border-zinc-800 bg-black p-4">{content}</div>; }
function ProjectRow({ projet }: { projet: { id: string; titre: string; revenus: number; depenses: number; resultat: number } }) { return <Link href={`/projets/${projet.id}`} className="group grid gap-3 border-b border-zinc-900 py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><p className="truncate font-semibold group-hover:text-yellow-400">{projet.titre || "Projet sans titre"}</p><p className="mt-1 text-xs text-zinc-600">{euros(projet.revenus)} de revenus · {euros(projet.depenses)} de dépenses</p></div><p className={`font-bold ${projet.resultat < 0 ? "text-red-400" : "text-green-400"}`}>{euros(projet.resultat)}</p></Link>; }
function Empty({ text, good = false }: { text: string; good?: boolean }) { return <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${good ? "border-green-500/20 text-green-400" : "border-zinc-800 text-zinc-600"}`}>{text}</div>; }
function Status({ score }: { score: number }) { const label = score >= 75 ? "Solide" : score >= 50 ? "À surveiller" : "Sous tension"; const style = score >= 75 ? "bg-green-500/10 text-green-300" : score >= 50 ? "bg-yellow-500/10 text-yellow-300" : "bg-red-500/10 text-red-300"; return <span className={`rounded-full px-3 py-1 text-xs font-bold ${style}`}>{label}</span>; }
function bar(score: number) { return score >= 75 ? "bg-green-400" : score >= 50 ? "bg-yellow-400" : "bg-red-400"; }
function sum(items: any[], type: "Revenu" | "Dépense", status?: string) { return items.filter((item) => item.type === type && item.statut !== "Annulé" && (!status || item.statut === status)).reduce((total, item) => total + Number(item.montant || 0), 0); }
function outstanding(items: any[], type: "Revenu" | "Dépense") { return items.filter((item) => item.type === type && !["Payé", "Annulé"].includes(item.statut)).reduce((total, item) => total + Number(item.montant || 0), 0); }
function financeScore(revenus: number, marge: number, roi: number, deficitaires: number, royalties: number) { if (!revenus) return 50; return Math.max(0, Math.min(100, Math.round(55 + Math.max(-25, Math.min(20, marge / 2)) + Math.max(-20, Math.min(15, roi / 5)) - Math.min(15, deficitaires * 4) - Math.min(10, (royalties / revenus) * 20)))); }
function euros(value: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value || 0); }
