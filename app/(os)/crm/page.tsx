import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];
type FollowUp = { id: string; name: string; kind: string; date: string; href: string; status: string };

export default async function CrmPage() {
  const profile = await requireRole(allowed);
  const supabase = await createAuthenticatedSupabaseClient();
  const today = new Date().toISOString().split("T")[0];
  const inSevenDays = addDays(today, 7);
  const isManager = profile.role === ROLES.MANAGER;

  const { data: managedArtists } = isManager
    ? await supabase.from("artistes").select("id").eq("manager_id", profile.id)
    : { data: [] };
  const artistIds = (managedArtists || []).map((item: any) => item.id);

  let prospectsQuery = supabase.from("prospects_lmg").select("id, nom, type, statut, priorite, potentiel_revenu, prochaine_relance, responsable_id");
  let bookingsQuery = supabase.from("bookings").select("id, evenement, statut, prochaine_relance, montant_cachet, cachet, montant_commission, commission_lmg, artiste_id");
  let mediasQuery = supabase.from("medias").select("id, nom, type, statut, prochaine_relance, priorite, artiste_id");
  let influencersQuery = supabase.from("influenceurs").select("id, nom, plateforme, statut, prochaine_relance, artiste_id");

  if (isManager) {
    prospectsQuery = prospectsQuery.eq("responsable_id", profile.id);
    if (artistIds.length) {
      bookingsQuery = bookingsQuery.in("artiste_id", artistIds);
      mediasQuery = mediasQuery.in("artiste_id", artistIds);
      influencersQuery = influencersQuery.in("artiste_id", artistIds);
    } else {
      const emptyId = "00000000-0000-0000-0000-000000000000";
      bookingsQuery = bookingsQuery.eq("id", emptyId);
      mediasQuery = mediasQuery.eq("id", emptyId);
      influencersQuery = influencersQuery.eq("id", emptyId);
    }
  }

  const [{ data: prospects }, { data: bookings }, { data: medias }, { data: influencers }, partnersResult] = await Promise.all([
    prospectsQuery.order("created_at", { ascending: false }),
    bookingsQuery.order("created_at", { ascending: false }),
    mediasQuery.order("created_at", { ascending: false }),
    influencersQuery.order("created_at", { ascending: false }),
    isManager ? Promise.resolve({ data: [] }) : supabase.from("partenaires").select("id, nom, type, statut, prochaine_relance, tarif").order("created_at", { ascending: false }),
  ]);
  const partners = partnersResult.data || [];

  const followUps: FollowUp[] = [
    ...(prospects || []).filter((item: any) => item.prochaine_relance).map((item: any) => ({ id: `prospect-${item.id}`, name: item.nom, kind: "Prospect", date: item.prochaine_relance, href: `/prospects/detail/${item.id}`, status: item.statut || "À contacter" })),
    ...(bookings || []).filter((item: any) => item.prochaine_relance).map((item: any) => ({ id: `booking-${item.id}`, name: item.evenement || "Booking", kind: "Booking", date: item.prochaine_relance, href: `/booking/${item.id}`, status: item.statut || "Prospect" })),
    ...(medias || []).filter((item: any) => item.prochaine_relance).map((item: any) => ({ id: `media-${item.id}`, name: item.nom, kind: "Média", date: item.prochaine_relance, href: `/medias/${item.id}`, status: item.statut || "À contacter" })),
    ...(influencers || []).filter((item: any) => item.prochaine_relance).map((item: any) => ({ id: `influencer-${item.id}`, name: item.nom, kind: "Influenceur", date: item.prochaine_relance, href: `/influenceurs/${item.id}`, status: item.statut || "À contacter" })),
    ...partners.filter((item: any) => item.prochaine_relance).map((item: any) => ({ id: `partner-${item.id}`, name: item.nom, kind: "Partenaire", date: item.prochaine_relance, href: `/partenaires/${item.id}`, status: item.statut || "À contacter" })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const lateFollowUps = followUps.filter((item) => item.date < today);
  const weekFollowUps = followUps.filter((item) => item.date >= today && item.date <= inSevenDays);
  const prospectPotential = (prospects || []).filter((item: any) => item.statut !== "Perdu").reduce((sum: number, item: any) => sum + Number(item.potentiel_revenu || 0), 0);
  const bookingPotential = (bookings || []).filter((item: any) => !["Payé", "Annulé"].includes(item.statut)).reduce((sum: number, item: any) => sum + Number(item.montant_cachet || item.cachet || 0), 0);
  const activePartners = partners.filter((item: any) => ["Collaboration", "Partenaire actif"].includes(item.statut)).length;
  const earnedCoverage = (medias || []).filter((item: any) => item.statut === "Publié").length + (influencers || []).filter((item: any) => item.statut === "Publié").length;

  const modules = [
    { label: "Prospects business", count: (prospects || []).length, detail: `${formatCurrency(prospectPotential)} de potentiel`, href: "/prospects", action: "/prospects/nouveau", actionLabel: "Nouveau prospect" },
    { label: "Booking", count: (bookings || []).length, detail: `${formatCurrency(bookingPotential)} en pipeline`, href: "/booking", action: "/booking/nouveau", actionLabel: "Nouveau booking" },
    { label: "Relations médias", count: (medias || []).length, detail: `${(medias || []).filter((item: any) => item.statut === "Publié").length} publication(s)`, href: "/medias", action: "/medias/nouveau", actionLabel: "Nouveau média" },
    { label: "Influenceurs", count: (influencers || []).length, detail: `${(influencers || []).filter((item: any) => item.statut === "Publié").length} publication(s)`, href: "/influenceurs", action: "/influenceurs/nouveau", actionLabel: "Nouvel influenceur" },
    ...(!isManager ? [{ label: "Partenaires", count: partners.length, detail: `${activePartners} actif(s)`, href: "/partenaires", action: "/partenaires/nouveau", actionLabel: "Nouveau partenaire" }] : []),
  ];

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Développement LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">{isManager ? "CRM de mes artistes" : "Cockpit CRM"}</h1><p className="mt-3 max-w-3xl text-zinc-500">{isManager ? "Bookings, médias, influenceurs et relances liés uniquement aux artistes de ton portefeuille." : "Les opportunités, contacts et relances de LMG dans une seule vue de pilotage."}</p></div><div className="flex flex-wrap gap-3"><Link href="/prospects/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Nouveau prospect</Link><Link href="/booking/nouveau" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">+ Nouveau booking</Link></div></header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Pipeline commercial" value={formatCurrency(prospectPotential + bookingPotential)} /><Metric label="Relances en retard" value={lateFollowUps.length} tone={lateFollowUps.length ? "danger" : "good"} /><Metric label="Relances sous 7 jours" value={weekFollowUps.length} tone={weekFollowUps.length ? "warning" : "good"} /><Metric label="Retombées obtenues" value={earnedCoverage} /></section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel eyebrow="Action commerciale" title="File de relances" description="Toutes les relances classées par date, quel que soit le canal.">
        {!followUps.length ? <Empty text="Aucune relance programmée." /> : <div>{followUps.slice(0, 12).map((item) => <FollowUpRow key={item.id} item={item} today={today} />)}</div>}
      </Panel>
      <Panel eyebrow="Portefeuille" title="Canaux CRM" description="Accédez au bon pipeline sans perdre la vue globale.">
        <div className="space-y-3">{modules.map((module) => <ModuleCard key={module.href} module={module} />)}</div>
      </Panel>
    </section>

    <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Discipline CRM</p><h2 className="mt-2 text-2xl font-bold">Aucune opportunité sans prochaine action</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Chaque contact actif doit avoir un statut clair, un responsable et une date de relance. Les Kanban spécialisés restent l’espace de traitement détaillé.</p></div></section>
  </div></main>;
}

function Metric({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "warning" | "danger" | "good" }) { const styles = { default: "border-zinc-800 bg-zinc-950", warning: "border-yellow-500/25 bg-yellow-500/[0.06]", danger: "border-red-500/25 bg-red-500/[0.06]", good: "border-green-500/20 bg-green-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>; }
function Panel({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) { return <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><p className="mt-2 text-sm text-zinc-500">{description}</p><div className="mt-5">{children}</div></section>; }
function FollowUpRow({ item, today }: { item: FollowUp; today: string }) { const late = item.date < today; return <Link href={item.href} className="group grid gap-3 border-b border-zinc-900 py-4 last:border-0 sm:grid-cols-[100px_1fr_auto] sm:items-center"><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase ${late ? "bg-red-500/10 text-red-300" : "bg-zinc-900 text-zinc-400"}`}>{item.kind}</span><div className="min-w-0"><p className="truncate font-semibold group-hover:text-yellow-400">{item.name}</p><p className="mt-1 text-xs text-zinc-600">{item.status}</p></div><div className="text-left sm:text-right"><p className={`text-xs font-semibold ${late ? "text-red-400" : "text-zinc-400"}`}>{late ? "En retard · " : ""}{formatDate(item.date)}</p><p className="mt-1 text-xs text-zinc-700">Ouvrir →</p></div></Link>; }
function ModuleCard({ module }: { module: { label: string; count: number; detail: string; href: string; action: string; actionLabel: string } }) { return <div className="rounded-2xl border border-zinc-800 bg-black p-4"><div className="flex items-start justify-between gap-4"><Link href={module.href} className="min-w-0 flex-1"><div className="flex items-center gap-3"><span className="text-2xl font-black">{module.count}</span><span className="font-semibold hover:text-yellow-400">{module.label}</span></div><p className="mt-2 text-xs text-zinc-600">{module.detail}</p></Link><Link href={module.action} title={module.actionLabel} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 text-lg text-zinc-400 hover:border-zinc-600 hover:text-white">+</Link></div></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-600">{text}</div>; }
function addDays(value: string, days: number) { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().split("T")[0]; }
function formatCurrency(value: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
