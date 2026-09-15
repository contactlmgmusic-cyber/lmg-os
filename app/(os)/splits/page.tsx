import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];
type SearchParams = Promise<{ q?: string | string[]; etat?: string | string[] }>;

export default async function SplitsPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await requireRole(allowed);
  const supabase = await createAuthenticatedSupabaseClient();
  const filters = await searchParams;
  const q = value(filters.q).trim().toLowerCase();
  const etat = value(filters.etat);

  let query = supabase.from("splits").select(`
    id, titre, statut, notes, artiste_id, projet_id, created_at,
    projets(id, titre), artistes(id, nom),
    split_participants(id, nom, role, email, pourcentage),
    royalties(id, statut)
  `).order("created_at", { ascending: false });

  if (profile.role === ROLES.MANAGER) {
    const { data: managedArtists } = await supabase.from("artistes").select("id").eq("manager_id", profile.id);
    const artistIds = (managedArtists || []).map((artist: any) => artist.id);
    query = query.in("artiste_id", artistIds.length ? artistIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data, error } = await query;
  if (error) return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Split Sheets LMG</p><h1 className="mt-2 text-3xl font-bold">Split sheets indisponibles</h1><p className="mt-3 text-sm text-zinc-400">Les répartitions n’ont pas pu être chargées.</p></div></main>;

  const splits = (data || []).map((split: any) => {
    const participants = split.split_participants || [];
    const total = participants.reduce((sum: number, item: any) => sum + Number(item.pourcentage || 0), 0);
    const state = participants.length === 0 ? "Vide" : Math.abs(total - 100) < 0.001 ? "Complet" : "Incomplet";
    return { ...split, participants, total, state, generated: (split.royalties || []).length > 0 };
  });
  const filtered = splits.filter((split: any) => {
    const searchable = [split.titre, relation(split.artistes)?.nom, relation(split.projets)?.titre].filter(Boolean).join(" ").toLowerCase();
    return (!q || searchable.includes(q)) && (!etat || split.state === etat);
  });
  const complete = splits.filter((split: any) => split.state === "Complet").length;
  const incomplete = splits.filter((split: any) => split.state === "Incomplet").length;
  const empty = splits.filter((split: any) => split.state === "Vide").length;
  const generated = splits.filter((split: any) => split.generated).length;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Royalties LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Split Sheets</h1><p className="mt-3 max-w-3xl text-zinc-500">Contrôle les bénéficiaires et les pourcentages avant toute génération de royalties.</p></div>
      <div className="flex flex-wrap gap-3"><Link href="/splits/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Nouveau split</Link><Link href="/royalties" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">Voir les royalties</Link></div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Splits complets" value={String(complete)} detail="Total égal à 100 %" tone="good" />
      <Metric label="Splits incomplets" value={String(incomplete)} detail="Pourcentages à corriger" tone={incomplete ? "warning" : "default"} />
      <Metric label="Sans participant" value={String(empty)} detail="Répartition à commencer" tone={empty ? "warning" : "default"} />
      <Metric label="Royalties générées" value={String(generated)} detail={`Sur ${splits.length} split(s)`} />
    </section>

    <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Registre des droits</p><h2 className="mt-2 text-2xl font-bold">Toutes les répartitions</h2><p className="mt-2 text-sm text-zinc-500">{filtered.length} résultat(s) sur {splits.length}</p></div>{(q || etat) && <Link href="/splits" className="text-sm font-semibold text-zinc-400 hover:text-white">Réinitialiser les filtres →</Link>}</div>
      <form method="get" className="mt-6 grid gap-3 md:grid-cols-[1fr_260px_auto]">
        <label className="sr-only" htmlFor="split-search">Rechercher</label><input id="split-search" name="q" defaultValue={value(filters.q)} placeholder="Titre, artiste ou projet…" className="min-h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm outline-none placeholder:text-zinc-700 focus:border-zinc-600" />
        <select name="etat" defaultValue={etat} aria-label="État du split" className="min-h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm outline-none focus:border-zinc-600"><option value="">Tous les états</option><option>Complet</option><option>Incomplet</option><option>Vide</option></select>
        <button className="min-h-12 rounded-xl bg-zinc-100 px-5 text-sm font-bold text-black">Filtrer</button>
      </form>
      {!filtered.length ? <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-10 text-center"><p className="font-semibold">Aucun split sheet trouvé</p><p className="mt-2 text-sm text-zinc-600">{splits.length ? "Modifie ou réinitialise les filtres." : "Crée la première répartition de LMG."}</p></div> : <div className="mt-5 grid gap-4 lg:grid-cols-2">{filtered.map((split: any) => <SplitCard key={split.id} split={split} />)}</div>}
    </section>

    <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Contrôle des droits</p><h2 className="mt-2 text-2xl font-bold">Un split n’est exploitable qu’à 100 %</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Vérifie l’identité, le rôle, l’email et le pourcentage de chaque participant avant de générer les royalties. Un split incomplet reste bloqué dans le workflow de génération.</p></div><Link href="/royalties/generer" className="shrink-0 text-sm font-semibold text-zinc-400 hover:text-white">Générer des royalties →</Link></div></section>
  </div></main>;
}

type Tone = "default" | "good" | "warning";
function Metric({ label, value: amount, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: Tone }) { const styles = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", warning: "border-yellow-500/25 bg-yellow-500/[0.06]" }; return <div className={`rounded-2xl border p-5 ${styles[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{amount}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function SplitCard({ split }: { split: any }) {
  const artist = relation(split.artistes); const project = relation(split.projets);
  const style = split.state === "Complet" ? "bg-green-500/10 text-green-300" : split.state === "Incomplet" ? "bg-yellow-500/10 text-yellow-300" : "bg-zinc-900 text-zinc-500";
  return <Link href={`/splits/${split.id}`} className="group rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-lg font-semibold group-hover:text-yellow-400">{split.titre || "Split sans titre"}</p><p className="mt-1 text-xs text-zinc-600">{artist?.nom || "Artiste non lié"} · {project?.titre || "Projet non lié"}</p></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${style}`}>{split.state}</span></div>
    <div className="mt-5 grid grid-cols-3 gap-3"><Mini label="Total" value={`${split.total}%`} danger={split.state === "Incomplet"} /><Mini label="Participants" value={String(split.participants.length)} /><Mini label="Royalties" value={split.generated ? "Générées" : "Non"} /></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-900"><div className={`h-full rounded-full ${split.total === 100 ? "bg-green-400" : split.total > 100 ? "bg-red-400" : "bg-yellow-400"}`} style={{ width: `${Math.min(split.total, 100)}%` }} /></div>
    <p className="mt-4 text-right text-xs text-zinc-700">Ouvrir le split →</p></Link>;
}
function Mini({ label, value: amount, danger = false }: { label: string; value: string; danger?: boolean }) { return <div><p className="text-[11px] text-zinc-700">{label}</p><p className={`mt-1 text-sm font-bold ${danger ? "text-yellow-400" : "text-zinc-300"}`}>{amount}</p></div>; }
function relation(input: any) { return Array.isArray(input) ? input[0] : input; }
function value(input?: string | string[]) { return Array.isArray(input) ? input[0] || "" : input || ""; }
