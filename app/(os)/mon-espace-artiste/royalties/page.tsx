import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ArtistRoyaltiesPage() {
  await requireRole([ROLES.ARTISTE]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: royalties } = await supabase.from("royalties").select("id, montant_du, statut, created_at, projet_id, projets(titre)").eq("email", user?.email || "__no_email__").order("created_at", { ascending: false });
  const rows = royalties || [];
  const due = rows.filter((item: any) => item.statut !== "Payé").reduce((sum: number, item: any) => sum + Number(item.montant_du || 0), 0);
  const paid = rows.filter((item: any) => item.statut === "Payé").reduce((sum: number, item: any) => sum + Number(item.montant_du || 0), 0);

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1200px]">
    <header className="border-b border-zinc-900 pb-8"><Link href="/mon-espace-artiste" className="text-sm text-zinc-500 hover:text-white">← Mon espace artiste</Link><p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Suivi financier personnel</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Mes royalties</h1><p className="mt-3 max-w-2xl text-zinc-500">Uniquement les montants qui te concernent et leur état de paiement.</p></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="À recevoir" value={money(due)} tone="warning" /><Metric label="Déjà payé" value={money(paid)} tone="good" /><Metric label="Historique" value={String(rows.length)} /></section>
    <section className="mt-8 overflow-hidden rounded-[26px] border border-zinc-800 bg-zinc-950"><div className="border-b border-zinc-800 p-5"><h2 className="text-xl font-bold">Historique des répartitions</h2></div>{!rows.length ? <p className="p-10 text-center text-zinc-600">Aucune royalty disponible pour le moment.</p> : rows.map((item: any) => <div key={item.id} className="flex flex-col gap-3 border-b border-zinc-900 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{relationTitle(item.projets) || "Projet LMG"}</p><p className="mt-1 text-xs text-zinc-600">Générée le {new Intl.DateTimeFormat("fr-FR").format(new Date(item.created_at))}</p></div><div className="flex items-center gap-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.statut === "Payé" ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>{item.statut || "À payer"}</span><p className="min-w-24 text-right text-xl font-bold">{money(item.montant_du)}</p></div></div>)}</section>
  </div></main>;
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "good" }) { const style = tone === "warning" ? "border-yellow-500/25 bg-yellow-500/[0.06]" : tone === "good" ? "border-green-500/20 bg-green-500/[0.05]" : "border-zinc-800 bg-zinc-950"; return <div className={`rounded-2xl border p-5 ${style}`}><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>; }
function money(value: number) { return `${Number(value || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`; }
function relationTitle(value: any) { return Array.isArray(value) ? value[0]?.titre : value?.titre; }
