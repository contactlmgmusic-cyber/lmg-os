import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RevenueChart from "@/components/RevenueChart";
import FinanceChart from "@/components/FinanceChart";
import BudgetAllocationChart from "@/components/BudgetAllocationChart";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default async function FinancesDashboardPage() {

await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
]);

  const { data: finances } = await supabase.from("finances").select(`
    *,
    projets ( id, titre )
  `);

  const { data: royalties } = await supabase.from("royalties").select("*");
  const { data: contrats } = await supabase.from("contrats").select("*");
  const { data: bookings } = await supabase.from("bookings").select("*");
  const { data: campagnes } = await supabase.from("campagnes").select("*");

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
  const allContrats = contrats || [];
  const allBookings = bookings || [];
  const allCampagnes = campagnes || [];
  const allProjets = projets || [];

  const revenus = allFinances
    .filter((item: any) => item.type === "Revenu")
    .reduce((acc: number, item: any) => acc + Number(item.montant || 0), 0);

  const depenses = allFinances
    .filter((item: any) => item.type === "Dépense")
    .reduce((acc: number, item: any) => acc + Number(item.montant || 0), 0);

  const resultat = revenus - depenses;

  const monthlyFinanceMap = new Map();

allFinances.forEach((item: any) => {
  if (!item.date_operation) return;

  const date = new Date(item.date_operation);

  const monthKey = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

  const mois = date.toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });

  const current = monthlyFinanceMap.get(monthKey) || {
    monthKey,
    mois,
    revenus: 0,
    depenses: 0,
    resultat: 0,
  };

  if (item.type === "Revenu") {
    current.revenus += Number(item.montant || 0);
  }

  if (item.type === "Dépense") {
    current.depenses += Number(item.montant || 0);
  }

  current.resultat =
    current.revenus - current.depenses;

  monthlyFinanceMap.set(monthKey, current);
});

const financeChartData = Array.from(
  monthlyFinanceMap.values()
)
  .sort((a: any, b: any) =>
    a.monthKey.localeCompare(b.monthKey)
  )
  .slice(-6);

  const roiGlobal =
  depenses > 0
    ? Math.round(((revenus - depenses) / depenses) * 100)
    : 0;


const margeNette =
  revenus > 0
    ? Math.round((resultat / revenus) * 100)
    : 0;

const ratioInvestissement =
  depenses > 0
    ? Number((revenus / depenses).toFixed(2))
    : 0;


  const royaltiesPayees = allRoyalties
    .filter((item: any) => item.statut === "Payé")
    .reduce((acc: number, item: any) => acc + Number(item.montant_du || 0), 0);

  const royaltiesAPayer = allRoyalties
    .filter((item: any) => item.statut !== "Payé")
    .reduce((acc: number, item: any) => acc + Number(item.montant_du || 0), 0);

  const budgetCampagnes = allCampagnes.reduce(
    (acc: number, campagne: any) => acc + Number(campagne.budget || 0),
    0
  );

  const budgetProjets = allProjets.reduce((acc: number, projet: any) => {
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

  const budgetAllocation = {
  clip: 0,
  cover: 0,
  promo: 0,
  studio: 0,
  influence: 0,
  rp: 0,
};

allProjets.forEach((projet: any) => {
  budgetAllocation.clip += Number(
    projet.budget_clip || 0
  );

  budgetAllocation.cover += Number(
    projet.budget_cover || 0
  );

  budgetAllocation.promo += Number(
    projet.budget_promo || 0
  );

  budgetAllocation.studio += Number(
    projet.budget_studio || 0
  );

  budgetAllocation.influence += Number(
    projet.budget_influence || 0
  );

  budgetAllocation.rp += Number(
    projet.budget_rp || 0
  );
});

const budgetChartData = [
  {
    name: "Clips",
    value: budgetAllocation.clip,
  },
  {
    name: "Promotion",
    value: budgetAllocation.promo,
  },
  {
    name: "Studio",
    value: budgetAllocation.studio,
  },
  {
    name: "Influence",
    value: budgetAllocation.influence,
  },
  {
    name: "Relations presse",
    value: budgetAllocation.rp,
  },
  {
    name: "Cover",
    value: budgetAllocation.cover,
  },
];

  const contratsSignes = allContrats.filter(
    (contrat: any) => contrat.statut === "Signé"
  ).length;

  const bookingsConfirmes = allBookings.filter(
    (booking: any) => booking.statut === "Confirmé"
  ).length;

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

   const financeScore = Math.max(
  0,
  Math.min(
    100,
    Math.round(
      50 +
      Math.min(roiGlobal, 50) +
      Math.min(margeNette, 20) -
      Math.min(deficitaires.length * 5, 20) -
      Math.min(royaltiesAPayer / 1000, 15)
    )
  )
);

  const projetsRentablesPourcentage =
  projetsRentabilite.length > 0
    ? Math.round(
        (projetsRentabilite.filter(
          (projet:any) => projet.resultat > 0
        ).length / projetsRentabilite.length) * 100
      )
    : 0;

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
      value: formatEuro(budgetProjets),
      className: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    },
    {
      label: "Budget campagnes",
      value: formatEuro(budgetCampagnes),
      className: "border-pink-500/30 bg-pink-500/10 text-pink-300",
    },
    {
      label: "Contrats signés",
      value: contratsSignes,
      className: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    },
    {
      label: "Bookings confirmés",
      value: bookingsConfirmes,
      className: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    },
  ];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
    Legacy Music Group
  </p>

  <h1 className="mt-3 text-6xl font-bold">
    Executive Finance
  </h1>

  <p className="mt-3 max-w-2xl text-zinc-400">
    Vue stratégique de la performance financière du label :
    revenus, investissements, royalties et rentabilité.
  </p>
</div>

<section className="mb-10 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-cyan-200">

  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

    <div>

      <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-300">
        LMG Finance Score
      </p>

      <h2 className="text-6xl font-bold">
        {financeScore}
        <span className="text-3xl text-cyan-200/50">
          /100
        </span>
      </h2>

      <p className="mt-3 text-sm text-cyan-100/80">
        Score basé sur la rentabilité, le ROI, la marge nette,
        les projets déficitaires et les royalties en attente.
      </p>

    </div>


    <div className="w-full md:w-80">

      <div className="h-4 overflow-hidden rounded-full bg-black/40">

        <div
          className="h-full rounded-full bg-cyan-300 transition-all"
          style={{
            width:`${financeScore}%`
          }}
        />

      </div>

    </div>

  </div>

</section>

      <section className="mb-10">
  <div className="mb-5">
    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
      Performance financière
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      Business Overview
    </h2>
  </div>


  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

    {kpis.map((kpi) => (
      <div
        key={kpi.label}
        className={`rounded-3xl border p-6 transition hover:border-zinc-600 ${kpi.className}`}
      >

        <p className="text-sm opacity-80">
          {kpi.label}
        </p>

        <p className="mt-4 text-4xl font-bold">
          {kpi.value}
        </p>

      </div>
    ))}

  </div>
</section>

<section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <div className="mb-6">
    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
      Analyse financière
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      Évolution revenus & dépenses
    </h2>
  </div>


  <RevenueChart data={financeChartData} />

</section>

<div className="mt-10 flex flex-col gap-10">

<section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <div className="mb-6">
    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
      Rentabilité
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      Performance investissement
    </h2>
  </div>

  <FinanceChart data={financeChartData} />

  <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
      <p className="text-sm text-green-300">
        ROI global
      </p>

      <p className="mt-3 text-4xl font-bold">
        {roiGlobal}%
      </p>
    </div>

    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
      <p className="text-sm text-cyan-300">
        Marge nette
      </p>

      <p className="mt-3 text-4xl font-bold">
        {margeNette}%
      </p>
    </div>

    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
      <p className="text-sm text-purple-300">
        Ratio revenus / dépenses
      </p>

      <p className="mt-3 text-4xl font-bold">
        x{ratioInvestissement}
      </p>
    </div>

    <div className="rounded-2xl border border-zinc-700 bg-black p-5">
      <p className="text-sm text-zinc-400">
        Projets rentables
      </p>

      <p className="mt-3 text-4xl font-bold">
        {projetsRentablesPourcentage}%
      </p>
    </div>
  </div>
</section>

<section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <div className="mb-6">
    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
      Investissements
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      Répartition des budgets
    </h2>
  </div>

  <BudgetAllocationChart data={budgetChartData} />

  <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {[
      {
        label: "Clips",
        value: budgetAllocation.clip,
      },
      {
        label: "Promotion",
        value: budgetAllocation.promo,
      },
      {
        label: "Studio",
        value: budgetAllocation.studio,
      },
      {
        label: "Influence",
        value: budgetAllocation.influence,
      },
      {
        label: "Relations presse",
        value: budgetAllocation.rp,
      },
      {
        label: "Cover",
        value: budgetAllocation.cover,
      },
    ].map((item) => (
      <div
        key={item.label}
        className="rounded-2xl border border-zinc-800 bg-black p-5"
      >
        <p className="text-sm text-zinc-500">
          {item.label}
        </p>

        <p className="mt-3 text-3xl font-bold">
          {formatEuro(item.value)}
        </p>
      </div>
    ))}
  </div>
</section>
</div>
      <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">

  {/* TOP PROJETS */}

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

    <div className="mb-6">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Rentabilité
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Top projets rentables
      </h2>
    </div>


    <div className="space-y-4">

      {topRentables.length === 0 && (
        <p className="text-zinc-500">
          Aucun projet financier disponible.
        </p>
      )}


      {topRentables.map((projet:any, index:number)=>(

        <Link
          key={projet.id}
          href={`/projets/${projet.id}`}
          className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-sm font-bold text-zinc-400">
              {index + 1}
            </div>


            <div>

              <h3 className="font-semibold">
                {projet.titre || "Projet sans titre"}
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Revenus {formatEuro(projet.revenus)} · Dépenses {formatEuro(projet.depenses)}
              </p>

            </div>

          </div>


          <p
            className={`font-bold ${
              projet.resultat >= 0
                ? "text-green-300"
                : "text-red-300"
            }`}
          >
            {formatEuro(projet.resultat)}
          </p>


        </Link>

      ))}

    </div>

  </div>



  {/* ALERTES */}

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">


    <div className="mb-6">

      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Monitoring
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Alertes financières
      </h2>

    </div>


    <div className="space-y-4">


      {royaltiesAPayer > 0 && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-300">

          <p className="text-sm">
            Royalties en attente
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatEuro(royaltiesAPayer)}
          </p>

        </div>
      )}



      {deficitaires.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">

          <p className="text-sm">
            Projets déficitaires
          </p>

          <p className="mt-2 text-2xl font-bold">
            {deficitaires.length}
          </p>

        </div>
      )}



      {resultat < 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">

          <p className="text-sm">
            Résultat global négatif
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatEuro(resultat)}
          </p>

        </div>
      )}



      {royaltiesAPayer === 0 &&
       deficitaires.length === 0 &&
       resultat >= 0 && (

        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-green-300">

          Situation financière saine

        </div>

      )}


    </div>


  </div>


</section>
    </main>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>
    </div>
  );
}