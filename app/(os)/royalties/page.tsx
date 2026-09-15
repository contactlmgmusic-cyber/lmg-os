import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { canGenerateRoyalties } from "@/lib/permissions";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string | string[]; statut?: string | string[]; projet?: string | string[] }>;
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER, ROLES.ARTISTE];

export default async function RoyaltiesPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await requireRole(allowed);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const filters = await searchParams;
  const q = value(filters.q).trim().toLowerCase();
  const statut = value(filters.statut);
  const projet = value(filters.projet);

  let query = supabase.from("royalties").select(`
    id, nom, role, email, revenu_total, pourcentage, montant_du, statut, created_at, date_paiement,
    projets(id, titre, artiste_id, artistes(id, nom, manager_id))
  `).order("created_at", { ascending: false });

  if (profile.role === ROLES.MANAGER) {
    const { data: managedArtists } = await supabase.from("artistes").select("id").eq("manager_id", profile.id);
    const artistIds = (managedArtists || []).map((artist: any) => artist.id);
    const { data: managedProjects } = artistIds.length
      ? await supabase.from("projets").select("id").in("artiste_id", artistIds)
      : { data: [] };
    const projectIds = (managedProjects || []).map((item: any) => item.id);
    query = query.in("projet_id", projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"]);
  }
  if (profile.role === ROLES.ARTISTE) query = query.eq("email", user?.email || "__no_email__");

  const { data, error } = await query;
  if (error) return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Royalties LMG</p><h1 className="mt-2 text-3xl font-bold">Royalties indisponibles</h1><p className="mt-3 text-sm text-zinc-400">Les répartitions n’ont pas pu être chargées.</p></div></main>;

  const royalties = data || [];
  const projects = Array.from(new Map(royalties.filter((item: any) => item.projets?.id).map((item: any) => [item.projets.id, { id: item.projets.id, titre: item.projets.titre }])).values()) as Array<{ id: string; titre: string }>;
  const filtered = royalties.filter((item: any) => {
    const searchable = [item.nom, item.role, item.email, item.projets?.titre, item.projets?.artistes?.nom].filter(Boolean).join(" ").toLowerCase();
    return (!q || searchable.includes(q)) && (!statut || normalizedStatus(item.statut) === statut) && (!projet || item.projets?.id === projet);
  });
  const totalDu = royalties.reduce((sum: number, item: any) => sum + Number(item.montant_du || 0), 0);
  const totalPaye = royalties.filter((item: any) => normalizedStatus(item.statut) === "Payé").reduce((sum: number, item: any) => sum + Number(item.montant_du || 0), 0);
  const totalAPayer = totalDu - totalPaye;
  const progression = totalDu > 0 ? Math.round((totalPaye / totalDu) * 100) : 0;
  const beneficiaries = new Set(royalties.map((item: any) => item.email || item.nom).filter(Boolean)).size;
  const canGenerate = canGenerateRoyalties(profile.role);
  const isArtist = profile.role === ROLES.ARTISTE;
  const activeFilters = [q, statut, projet].filter(Boolean).length;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Finance LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">{isArtist ? "Mes royalties" : "Royalties"}</h1><p className="mt-3 max-w-3xl text-zinc-500">{isArtist ? "Suis les montants qui te sont dus et l’historique de tes paiements." : profile.role === ROLES.MANAGER ? "Suis les répartitions et paiements liés à tes artistes." : "Contrôle les répartitions issues des splits et sécurise chaque paiement."}</p></div>
      <div className="flex flex-wrap gap-3">{canGenerate && <Link href="/royalties/generer" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">Générer des royalties</Link>}{!isArtist && <Link href="/finances/dashboard" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">Vue financière</Link>}</div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Royalties générées" value={euros(totalDu)} detail={`${royalties.length} répartition(s)`} />
      <Metric label="Montants payés" value={euros(totalPaye)} detail={`${progression}% du total`} tone="good" />
      <Metric label="Reste à payer" value={euros(totalAPayer)} detail={`${royalties.filter((item: any) => normalizedStatus(item.statut) !== "Payé").length} paiement(s)`} tone={totalAPayer ? "warning" : "good"} />
      <Metric label="Bénéficiaires" value={String(beneficiaries)} detail={`${projects.length} projet(s) concerné(s)`} />
    </section>

    <section className="mt-8 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Paiements</p><h2 className="mt-2 text-2xl font-bold">Avancement global</h2><p className="mt-2 text-sm text-zinc-500">Part des montants générés déjà réglée.</p>
        <div className="mt-7 flex items-end justify-between gap-4"><p className="text-6xl font-black">{progression}<span className="text-2xl text-zinc-600">%</span></p><span className={`rounded-full px-3 py-1 text-xs font-bold ${totalAPayer ? "bg-yellow-500/10 text-yellow-300" : "bg-green-500/10 text-green-300"}`}>{totalAPayer ? "Paiements en attente" : "À jour"}</span></div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-black"><div className="h-full rounded-full bg-green-400" style={{ width: `${progression}%` }} /></div>
        <div className="mt-7 grid grid-cols-2 gap-3"><Mini label="Payé" value={euros(totalPaye)} /><Mini label="À payer" value={euros(totalAPayer)} /></div>
      </section>
      <section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Répartition</p><h2 className="mt-2 text-2xl font-bold">Suivi détaillé</h2><p className="mt-2 text-sm text-zinc-500">{filtered.length} résultat(s) sur {royalties.length}</p></div>{activeFilters > 0 && <Link href="/royalties" className="text-sm font-semibold text-zinc-400 hover:text-white">Réinitialiser →</Link>}</div>
        <form method="get" className="mt-6 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.9fr_auto]">
          <label className="sr-only" htmlFor="royalty-search">Rechercher</label><input id="royalty-search" name="q" defaultValue={value(filters.q)} placeholder="Nom, rôle, artiste, projet…" className="min-h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-600" />
          <Select name="statut" label="Tous les statuts" current={statut} options={["À payer", "Payé"]} />
          <select name="projet" defaultValue={projet} aria-label="Tous les projets" className="min-h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm outline-none focus:border-zinc-600"><option value="">Tous les projets</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.titre}</option>)}</select>
          <button className="min-h-12 rounded-xl bg-zinc-100 px-5 text-sm font-bold text-black">Filtrer</button>
        </form>
        {!filtered.length ? <Empty text={royalties.length ? "Aucune royalty ne correspond aux filtres." : "Aucune royalty générée."} /> : <div className="mt-5">{filtered.map((royalty: any) => <RoyaltyRow key={royalty.id} royalty={royalty} />)}</div>}
      </section>
    </section>

    {!isArtist && <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Discipline royalties</p><h2 className="mt-2 text-2xl font-bold">Aucun paiement sans trace</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Chaque règlement doit conserver sa date, sa méthode et sa référence. Les royalties restent liées au split et au projet qui ont servi au calcul.</p></div>{canGenerate && <Link href="/royalties/generer" className="shrink-0 text-sm font-semibold text-zinc-400 hover:text-white">Nouvelle répartition →</Link>}</div></section>}
  </div></main>;
}

type Tone = "default" | "good" | "warning";
function Metric({ label, value: amount, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: Tone }) { const styles = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", warning: "border-yellow-500/25 bg-yellow-500/[0.06]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{amount}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function Mini({ label, value: amount }: { label: string; value: string }) { return <div className="rounded-2xl border border-zinc-800 bg-black p-4"><p className="text-xs text-zinc-600">{label}</p><p className="mt-2 text-xl font-bold">{amount}</p></div>; }
function Select({ name, label, current, options }: { name: string; label: string; current: string; options: string[] }) { return <select name={name} defaultValue={current} aria-label={label} className="min-h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm outline-none focus:border-zinc-600"><option value="">{label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select>; }
function RoyaltyRow({ royalty }: { royalty: any }) {
  const paid = normalizedStatus(royalty.statut) === "Payé";
  return <Link href={`/royalties/${royalty.id}`} className="group grid gap-4 border-b border-zinc-900 py-5 last:border-0 md:grid-cols-[1fr_0.75fr_auto] md:items-center"><div className="min-w-0"><p className="truncate font-semibold group-hover:text-yellow-400">{royalty.nom || "Bénéficiaire"}</p><p className="mt-1 text-xs text-zinc-600">{royalty.role || "Participant"} · {royalty.projets?.titre || "Projet non lié"}</p><p className="mt-1 text-[11px] text-zinc-700">{royalty.projets?.artistes?.nom || royalty.email || "Artiste non renseigné"}</p></div><div><p className="text-sm text-zinc-400">{Number(royalty.pourcentage || 0)}% de {euros(Number(royalty.revenu_total || 0))}</p><span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${paid ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>{paid ? "Payé" : "À payer"}</span></div><div className="text-left md:text-right"><p className="text-xl font-bold">{euros(Number(royalty.montant_du || 0))}</p><p className="mt-1 text-[11px] text-zinc-700">{paid && royalty.date_paiement ? `Payé le ${date(royalty.date_paiement)}` : "Voir le détail →"}</p></div></Link>;
}
function Empty({ text }: { text: string }) { return <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-600">{text}</div>; }
function normalizedStatus(status?: string) { return status === "Payé" ? "Payé" : "À payer"; }
function value(input?: string | string[]) { return Array.isArray(input) ? input[0] || "" : input || ""; }
function euros(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount || 0); }
function date(input: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${input}T12:00:00`)); }
