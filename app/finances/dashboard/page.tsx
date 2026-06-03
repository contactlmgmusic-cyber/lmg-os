import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatEuro(value: number) {
  return `${value.toFixed(2)} €`;
}

export default async function FinancesDashboardPage() {
  const { data: finances } = await supabase.from("finances").select(`
    *,
    projets (
      id,
      titre
    )
  `);

  const { data: royalties } = await supabase.from("royalties").select(`
    *,
    projets (
      id,
      titre
    )
  `);

  const { data: projets } = await supabase.from("projets").select(`
    id,
    titre,
    budget_clip,
    budget_cover,
    budget_promo,
    budget_studio,
    budget_influence,
    budget_rp
  `);

  const allFinances = finances || [];
  const allRoyalties = royalties || [];
  const allProjets = projets || [];

  const revenus = allFinances
    .filter((item: any) => item.type === "Revenu")
    .reduce((acc: number, item: any) => acc + Number(item.montant || 0), 0);

  const depenses = allFinances
    .filter((item: any) => item.type === "Dépense")
    .reduce((acc: number, item: any) => acc + Number(item.montant || 0), 0);

  const resultat = revenus - depenses;

  const royaltiesPayees = allRoyalties
    .filter((item: any) => item.statut === "Payé")
    .reduce((acc: number, item: any) => acc + Number(item.montant_du || 0), 0);

  const royaltiesAPayer = allRoyalties
    .filter((item: any) => item.statut !== "Payé")
    .reduce((acc: number, item: any) => acc + Number(item.montant_du || 0), 0);

  const budgetTotal = allProjets.reduce((acc: number, projet: any) => {
    return (
      acc +
      Number(projet.budget_clip || 0) +
      Number(projet.budget_cover || 0) +
      Number(projet.budget_promo || 0) +
      Number(projet.budget_studio || 0) +
      Number(projet.budget_influence || 0) +
      Number(projet.budget_rp || 0)
    );
  }, 0);

  const projetsRentabilite = allProjets
    .map((projet: any) => {
      const projetFinances = allFinances.filter(
        (item: any) => item.projet_id === projet.id
      );

      const projetRevenus = projetFinances
        .filter((item: any) => item.type === "Revenu")
        .reduce((acc: number, item: any) => acc + Number(item.montant || 0), 0);

      const projetDepenses = projetFinances
        .filter((item: any) => item.type === "Dépense")
        .reduce((acc: number, item: any) => acc + Number(item.montant || 0), 0);

      return {
        id: projet.id,
        titre: projet.titre,
        resultat: projetRevenus - projetDepenses,
        revenus: projetRevenus,
        depenses: projetDepenses,
      };
    })
    .sort((a: any, b: any) => b.resultat - a.resultat);

  const topRentables = projetsRentabilite.slice(0, 5);
  const deficitaires = projetsRentabilite.filter(
    (projet: any) => projet.resultat < 0
  );

  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: formatEuro(revenus),
      className: "border-green-500/30 bg-green-500/10 text-green-300",
    },
    {
      label: "Dépenses",
      value: formatEuro(depenses),
      className: "border-red-500/30 bg-red-500/10 text-red-300",
    },
    {
      label: "Résultat net",
      value: formatEuro(resultat),
      className:
        resultat >= 0
          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
          : "border-red-500/30 bg-red-500/10 text-red-300",
    },
    {
      label: "Royalties à payer",
      value: formatEuro(royaltiesAPayer),
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    },
    {
      label: "Royalties payées",
      value: formatEuro(royaltiesPayees),
      className: "border-zinc-700 bg-zinc-900 text-zinc-300",
    },
    {
      label: "Budget projets",
      value: formatEuro(budgetTotal),
      className: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    },
  ];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Finance
        </p>

        <h1 className="text-5xl font-bold">Dashboard financier</h1>

        <p className="mt-3 text-zinc-400">
          Vue globale des revenus, dépenses, budgets et royalties.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-3xl border p-6 ${kpi.className}`}
          >
            <p className="text-sm opacity-80">{kpi.label}</p>
            <p className="mt-4 text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Top projets rentables</h2>

          <div className="space-y-4">
            {topRentables.length === 0 && (
              <p className="text-zinc-500">Aucun projet financier disponible.</p>
            )}

            {topRentables.map((projet: any) => (
              <Link
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {projet.titre || "Projet sans titre"}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Revenus : {formatEuro(projet.revenus)} · Dépenses :{" "}
                      {formatEuro(projet.depenses)}
                    </p>
                  </div>

                  <p
                    className={`font-bold ${
                      projet.resultat >= 0 ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {formatEuro(projet.resultat)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Projets déficitaires</h2>

          <div className="space-y-4">
            {deficitaires.length === 0 && (
              <p className="text-zinc-500">
                Aucun projet déficitaire pour le moment.
              </p>
            )}

            {deficitaires.map((projet: any) => (
              <Link
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="block rounded-2xl border border-red-500/30 bg-red-500/10 p-5 hover:border-red-400"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {projet.titre || "Projet sans titre"}
                    </h3>

                    <p className="mt-1 text-sm text-red-200/70">
                      Revenus : {formatEuro(projet.revenus)} · Dépenses :{" "}
                      {formatEuro(projet.depenses)}
                    </p>
                  </div>

                  <p className="font-bold text-red-300">
                    {formatEuro(projet.resultat)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}