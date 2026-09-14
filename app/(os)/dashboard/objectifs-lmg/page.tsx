import Link from "next/link";
import CompanyObjectivesWorkspace from "@/components/CompanyObjectivesWorkspace";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];

export default async function CompanyObjectivesPage() {
  await requireRole(allowed); const supabase = await createAuthenticatedSupabaseClient();
  const { label: currentQuarter, end: quarterEnd } = getQuarter();
  const [{ data: objectives }, { data: profiles }, { data: projects }] = await Promise.all([
    supabase.from("company_objectives").select("*, owner:profiles!company_objectives_owner_id_fkey(nom, full_name), project:internal_projects!company_objectives_internal_project_id_fkey(id, titre)").eq("trimestre", currentQuarter).order("created_at"),
    supabase.from("profiles").select("id, nom, full_name").in("role", ["super_admin","admin","artistic_director","manager"]).order("nom"),
    supabase.from("internal_projects").select("id, titre").not("statut", "in", '("Terminé","Archivé")').order("titre"),
  ]);
  const active = (objectives || []).filter((item: any) => item.statut === "En cours").length;
  const atRisk = (objectives || []).filter((item: any) => ["À surveiller","Critique"].includes(item.niveau_risque)).length;
  const achieved = (objectives || []).filter((item: any) => item.statut === "Atteint").length;
  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]"><header className="flex flex-col gap-5 border-b border-zinc-900 pb-8 md:flex-row md:items-end md:justify-between"><div><Link href="/dashboard/revue-hebdomadaire" className="text-sm text-zinc-500 hover:text-white">← Revue hebdomadaire</Link><p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Pilotage trimestriel</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Objectifs LMG · {currentQuarter}</h1><p className="mt-3 text-zinc-500">Des résultats mesurables, rattachés aux responsables et aux projets qui les produisent.</p></div></header><section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Objectifs" value={(objectives || []).length} /><Metric label="En cours" value={active} /><Metric label="À risque" value={atRisk} danger={atRisk > 0} /><Metric label="Atteints" value={achieved} good={achieved > 0} /></section><div className="mt-8"><CompanyObjectivesWorkspace objectives={(objectives || []) as any} profiles={(profiles || []).map((item: any) => ({ id: item.id, label: item.nom || item.full_name || "Membre LMG" }))} projects={(projects || []).map((item: any) => ({ id: item.id, label: item.titre }))} currentQuarter={currentQuarter} quarterEnd={quarterEnd} /></div></div></main>;
}
function Metric({ label, value, danger = false, good = false }: { label: string; value: number; danger?: boolean; good?: boolean }) { return <div className={`rounded-2xl border p-5 ${danger ? "border-red-500/25 bg-red-500/[0.06]" : good ? "border-green-500/20 bg-green-500/[0.05]" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-4xl font-bold">{value}</p></div>; }
function getQuarter() { const now = new Date(); const quarter = Math.floor(now.getUTCMonth() / 3) + 1; const endMonth = quarter * 3; const end = new Date(Date.UTC(now.getUTCFullYear(), endMonth, 0)).toISOString().split("T")[0]; return { label: `${now.getUTCFullYear()}-T${quarter}`, end }; }
