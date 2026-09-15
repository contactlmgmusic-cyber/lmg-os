import Link from "next/link";
import CompanyObjectivesWorkspace from "@/components/CompanyObjectivesWorkspace";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import { getActiveCompanyQuarter, getCompanyQuarterEnd } from "@/lib/company-quarter";

export const dynamic = "force-dynamic";

const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];
type PageProps = { searchParams: Promise<{ trimestre?: string }> };

export default async function CompanyObjectivesPage({ searchParams }: PageProps) {
  await requireRole(allowed);
  const supabase = await createAuthenticatedSupabaseClient();
  const { trimestre } = await searchParams;
  const activeQuarter = getActiveCompanyQuarter();
  const selectedQuarter = isQuarter(trimestre) ? trimestre : activeQuarter;
  const quarterEnd = getCompanyQuarterEnd(selectedQuarter);

  const [{ data: objectives }, { data: profiles }, { data: projects }, { data: quarterRows }] = await Promise.all([
    supabase.from("company_objectives").select("*, owner:profiles!company_objectives_owner_id_fkey(nom, full_name), project:internal_projects!company_objectives_internal_project_id_fkey(id, titre)").eq("trimestre", selectedQuarter).order("created_at"),
    supabase.from("profiles").select("id, nom, full_name").in("role", ["super_admin", "admin", "artistic_director", "manager"]).order("nom"),
    supabase.from("internal_projects").select("id, titre").not("statut", "in", '("Terminé","Archivé")').order("titre"),
    supabase.from("company_objectives").select("trimestre"),
  ]);

  const quarters = Array.from(new Set([
    activeQuarter,
    ...(quarterRows || []).map((item: { trimestre: string }) => item.trimestre),
  ])).filter(isQuarter).sort((a, b) => b.localeCompare(a));
  const isActiveQuarter = selectedQuarter === activeQuarter;
  const active = (objectives || []).filter((item: any) => item.statut === "En cours").length;
  const atRisk = (objectives || []).filter((item: any) => ["À surveiller", "Critique"].includes(item.niveau_risque)).length;
  const achieved = (objectives || []).filter((item: any) => item.statut === "Atteint").length;

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/dashboard/revue-hebdomadaire" className="text-sm text-zinc-500 hover:text-white">← Revue hebdomadaire</Link>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Pilotage trimestriel</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold md:text-6xl">Objectifs LMG · {selectedQuarter}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${isActiveQuarter ? "bg-green-500/10 text-green-300" : "bg-zinc-900 text-zinc-400"}`}>
                {isActiveQuarter ? "Trimestre actif" : "Historique"}
              </span>
            </div>
            <p className="mt-3 text-zinc-500">Des résultats mesurables, rattachés aux responsables et aux projets qui les produisent.</p>
          </div>
          <nav aria-label="Choisir un trimestre" className="flex flex-wrap gap-2">
            {quarters.map((quarter) => (
              <Link key={quarter} href={`/dashboard/objectifs-lmg?trimestre=${quarter}`} aria-current={quarter === selectedQuarter ? "page" : undefined} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${quarter === selectedQuarter ? "border-yellow-500 bg-yellow-500 text-black" : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}>
                {quarter}
              </Link>
            ))}
          </nav>
        </header>

        {!isActiveQuarter && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Vous consultez un trimestre archivé en lecture et suivi.</span>
            <Link href={`/dashboard/objectifs-lmg?trimestre=${activeQuarter}`} className="font-semibold text-white hover:text-yellow-500">Revenir à {activeQuarter} →</Link>
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Objectifs" value={(objectives || []).length} />
          <Metric label="En cours" value={active} />
          <Metric label="À risque" value={atRisk} danger={atRisk > 0} />
          <Metric label="Atteints" value={achieved} good={achieved > 0} />
        </section>
        <div className="mt-8">
          <CompanyObjectivesWorkspace
            objectives={(objectives || []) as any}
            profiles={(profiles || []).map((item: any) => ({ id: item.id, label: item.nom || item.full_name || "Membre LMG" }))}
            projects={(projects || []).map((item: any) => ({ id: item.id, label: item.titre }))}
            currentQuarter={selectedQuarter}
            quarterEnd={quarterEnd}
            isActiveQuarter={isActiveQuarter}
          />
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value, danger = false, good = false }: { label: string; value: number; danger?: boolean; good?: boolean }) {
  return <div className={`rounded-2xl border p-5 ${danger ? "border-red-500/25 bg-red-500/[0.06]" : good ? "border-green-500/20 bg-green-500/[0.05]" : "border-zinc-800 bg-zinc-950"}`}><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-3 text-4xl font-bold">{value}</p></div>;
}

function isQuarter(value: string | undefined): value is string {
  return /^\d{4}-T[1-4]$/.test(value || "");
}
