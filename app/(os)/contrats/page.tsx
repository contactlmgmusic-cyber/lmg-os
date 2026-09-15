import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
type SearchParams = Promise<{ q?: string | string[]; statut?: string | string[]; type?: string | string[] }>;

export default async function ContratsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role, artiste_id").eq("id", user.id).single() : { data: null };
  const filters = await searchParams;
  const q = value(filters.q).trim().toLowerCase();
  const status = value(filters.statut);
  const type = value(filters.type);

  let query = supabase.from("contrats").select("*, artistes(id, nom, manager_id), projets(id, titre)").order("created_at", { ascending: false });
  if (profile?.role === ROLES.MANAGER) query = query.eq("artistes.manager_id", user?.id);
  if (profile?.role === ROLES.ARTISTE && profile.artiste_id) query = query.eq("artiste_id", profile.artiste_id);
  if (profile?.role === ROLES.PRESTATAIRE) query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  const { data, error } = await query;

  if (error) return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">LMG Legal</p><h1 className="mt-2 text-3xl font-bold">Contrats indisponibles</h1><p className="mt-3 text-sm text-zinc-400">Le registre n’a pas pu être chargé. Réessaie dans quelques instants.</p></div></main>;

  const contracts = data || [];
  const visible = contracts.filter((contract: any) => {
    const searchable = [contract.titre, contract.type, contract.statut, contract.artistes?.nom, contract.projets?.titre].filter(Boolean).join(" ").toLowerCase();
    return (!q || searchable.includes(q)) && (!status || contract.statut === status) && (!type || contract.type === type);
  });
  const types = Array.from(new Set(contracts.map((contract: any) => contract.type).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), "fr"));
  const canCreate = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER].includes(profile?.role);
  const signed = contracts.filter((contract: any) => contract.statut === "Signé").length;
  const waiting = contracts.filter((contract: any) => contract.statut === "Envoyé").length;
  const drafts = contracts.filter((contract: any) => !contract.statut || contract.statut === "Brouillon").length;
  const withoutFile = contracts.filter((contract: any) => !contract.fichier_url && !contract.fichier_signe_url).length;
  const activeFilters = [q, status, type].filter(Boolean).length;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
    <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Finance & juridique</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Contrats</h1><p className="mt-3 max-w-3xl text-zinc-500">{profile?.role === ROLES.ARTISTE ? "Tes contrats, documents et signatures réunis dans un seul espace." : profile?.role === ROLES.MANAGER ? "Contrats et signatures des artistes que tu accompagnes." : "Pilotage des contrats artistes, booking, prestations et documents juridiques."}</p></div>
      <div className="flex flex-wrap gap-3">{canCreate && <Link href="/contrats/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Nouveau contrat</Link>}{[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(profile?.role) && <Link href="/contrats/validations" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300">Voir les validations</Link>}</div>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Contrats suivis" value={contracts.length} detail="registre accessible" />
      <Metric label="Signés" value={signed} detail={contracts.length ? `${Math.round((signed / contracts.length) * 100)}% du portefeuille` : "aucun contrat"} tone="good" />
      <Metric label="En attente" value={waiting} detail="envoyés à sécuriser" tone={waiting ? "warning" : "default"} />
      <Metric label="Documents manquants" value={withoutFile} detail={drafts ? `${drafts} brouillon(s)` : "aucun brouillon"} tone={withoutFile ? "danger" : "default"} />
    </section>

    <section className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Registre juridique</p><h2 className="mt-2 text-2xl font-bold">Tous les contrats</h2><p className="mt-2 text-sm text-zinc-500">{visible.length} résultat(s) sur {contracts.length}</p></div>{activeFilters > 0 && <Link href="/contrats" className="text-sm font-semibold text-zinc-400 hover:text-white">Réinitialiser les filtres →</Link>}</div>
      <form className="mt-6 grid gap-3 md:grid-cols-[1fr_220px_220px_auto]"><input name="q" defaultValue={value(filters.q)} placeholder="Rechercher un contrat, artiste, projet…" className="control" /><select name="statut" defaultValue={status} className="control"><option value="">Tous les statuts</option><option>Brouillon</option><option>Envoyé</option><option>Signé</option><option>Archivé</option></select><select name="type" defaultValue={type} className="control"><option value="">Tous les types</option>{types.map((item) => <option key={String(item)}>{String(item)}</option>)}</select><button className="rounded-xl bg-zinc-100 px-5 py-3 text-sm font-bold text-black">Filtrer</button></form>
      {!visible.length ? <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-12 text-center"><p className="font-semibold">Aucun contrat trouvé</p><p className="mt-2 text-sm text-zinc-600">{contracts.length ? "Modifie ou réinitialise les filtres." : "Ajoute le premier contrat du registre LMG."}</p>{!contracts.length && canCreate && <Link href="/contrats/nouveau" className="mt-5 inline-block text-sm font-bold text-yellow-400">Créer un contrat →</Link>}</div> : <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black"><div className="hidden grid-cols-[120px_1fr_180px_150px_140px] gap-4 border-b border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 lg:grid"><span>Statut</span><span>Contrat</span><span>Artiste</span><span>Document</span><span className="text-right">Création</span></div>{visible.map((contract: any) => <ContractRow key={contract.id} contract={contract} />)}</div>}
      <style>{`.control{min-height:3rem;width:100%;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.control:focus{border-color:rgb(82 82 91)}`}</style>
    </section>

    {(waiting > 0 || withoutFile > 0) && <section className="mt-8 rounded-[26px] border border-yellow-500/20 bg-yellow-500/[0.04] p-5 md:p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Vigilance juridique</p><h2 className="mt-2 text-2xl font-bold">Le registre contient des éléments à sécuriser</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{waiting ? `${waiting} contrat(s) envoyé(s) attendent une signature. ` : ""}{withoutFile ? `${withoutFile} fiche(s) ne possèdent encore aucun document joint.` : ""}</p></section>}
  </div></main>;
}

type Tone = "default" | "good" | "warning" | "danger";
function Metric({ label, value, detail, tone = "default" }: { label: string; value: number; detail: string; tone?: Tone }) { const style = { default: "border-zinc-800 bg-zinc-950", good: "border-green-500/20 bg-green-500/[0.05]", warning: "border-yellow-500/20 bg-yellow-500/[0.05]", danger: "border-red-500/20 bg-red-500/[0.05]" }; return <div className={`rounded-2xl border p-5 ${style[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>; }
function ContractRow({ contract }: { contract: any }) { return <Link href={`/contrats/${contract.id}`} className="group grid gap-4 border-b border-zinc-900 px-5 py-5 last:border-0 hover:bg-white/[0.02] lg:grid-cols-[120px_1fr_180px_150px_140px] lg:items-center"><Status status={contract.statut || "Brouillon"} /><div className="min-w-0"><p className="truncate font-semibold group-hover:text-yellow-400">{contract.titre || "Contrat sans titre"}</p><p className="mt-1 truncate text-xs text-zinc-600">{contract.type || "Type non renseigné"} · {contract.projets?.titre || "Sans projet"}</p></div><p className="truncate text-sm text-zinc-400">{contract.artistes?.nom || "Non lié"}</p><p className={`text-sm font-semibold ${contract.fichier_signe_url ? "text-green-400" : contract.fichier_url ? "text-zinc-300" : "text-red-400"}`}>{contract.fichier_signe_url ? "PDF signé" : contract.fichier_url ? "PDF original" : "Manquant"}</p><p className="text-sm text-zinc-500 lg:text-right">{formatDate(contract.created_at)}</p></Link>; }
function Status({ status }: { status: string }) { const style = status === "Signé" ? "border-green-500/30 bg-green-500/10 text-green-300" : status === "Envoyé" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" : status === "Archivé" ? "border-zinc-700 text-zinc-500" : "border-blue-500/30 bg-blue-500/10 text-blue-300"; return <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${style}`}>{status}</span>; }
function value(input?: string | string[]) { return Array.isArray(input) ? input[0] || "" : input || ""; }
function formatDate(input?: string) { if (!input) return "Date inconnue"; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(input)); }
