"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import RevenueChart from "@/components/RevenueChart";
import { ROLES } from "@/lib/roles";

type ActivityLog = {
  id: string;
  type: string | null;
  titre: string | null;
  description: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    artistes: 0,
    projets: 0,
    taches: 0,
    contratsASigner: 0,
    bookingsConfirmes: 0,
    mediasRelance: 0,
    nouvellesCandidatures: 0,
    candidaturesEnEtude: 0,
    candidaturesSignees: 0,
    revenusMois: 0,
    depensesMois: 0,
    resultatMois: 0,
    royaltiesDues: 0,
    royaltiesPayees: 0,
    mediasRelanceAujourdhui: 0,
    streamsTotaux: 0,
    followersTotaux: 0,
    vuesTotales: 0,
    revenusAnalytics: 0,
    sortiesMois: 0,
    roiMoyen: 0,
    releaseTasksTotal: 0,
    releaseTasksDone: 0,
    releaseProgressMoyenne: 0,
    validationsArtisteEnAttente: 0,
    validationsContratsEnAttente: 0,
    managersActifs: 0,
    lmgGlobalScore: 0,
  });

  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [upcomingProjects, setUpcomingProjects] = useState<any[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [mediaFollowUps, setMediaFollowUps] = useState<any[]>([]);
  const [topArtistes, setTopArtistes] = useState<any[]>([]);
  const [topProjets, setTopProjets] = useState<any[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [latestCandidatures, setLatestCandidatures] = useState<any[]>([]);
  const [next30Projects, setNext30Projects] = useState<any[]>([]);
  const [lateTasks, setLateTasks] = useState<any[]>([]);
  const [urgentReleases, setUrgentReleases] = useState<any[]>([]);
  const [topSortiesAnalytics, setTopSortiesAnalytics] = useState<any[]>([]);
  const [topArtistesAnalytics, setTopArtistesAnalytics] = useState<any[]>([]);

  function monthStart() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }

  async function loadDashboard() {
  console.time("dashboard");

  const start = monthStart();

  const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
sixMonthsAgo.setDate(1);

const sixMonthsStart = sixMonthsAgo
  .toISOString()
  .split("T")[0];

  const today = new Date().toISOString().split("T")[0];

  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const in30DaysString = in30Days.toISOString().split("T")[0];

  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysString = in7Days.toISOString().split("T")[0];

  const [
    artistesRes,
    projetsRes,
    tachesRes,
    contratsRes,
    bookingsConfirmesRes,
    mediasRelanceRes,
    candidaturesNouvellesRes,
    candidaturesEnEtudeRes,
    candidaturesSigneesRes,
    candidaturesLatestRes,
    mediasRelanceAujourdhuiRes,
    validationsArtisteRes,
    validationsContratsRes,
    managersRes,
  ] = await Promise.all([
    supabaseBrowser
      .from("artistes")
      .select("*", { count: "exact", head: true }),

    supabaseBrowser
      .from("projets")
      .select("*", { count: "exact", head: true }),

    supabaseBrowser
      .from("taches")
      .select("*", { count: "exact", head: true })
      .neq("statut", "Terminé"),

    supabaseBrowser
      .from("contrats")
      .select("*", { count: "exact", head: true })
      .neq("statut", "Signé"),

    supabaseBrowser
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("statut", "Confirmé"),

    supabaseBrowser
      .from("medias")
      .select("*", { count: "exact", head: true })
      .eq("statut", "Relancé"),

    supabaseBrowser
      .from("candidatures")
      .select("*", { count: "exact", head: true })
      .eq("statut", "Nouvelle"),

    supabaseBrowser
      .from("candidatures")
      .select("*", { count: "exact", head: true })
      .eq("statut", "En étude"),

    supabaseBrowser
      .from("candidatures")
      .select("*", { count: "exact", head: true })
      .eq("statut", "Signé"),

    supabaseBrowser
      .from("candidatures")
      .select("id, nom_artiste, email, ville, statut, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabaseBrowser
      .from("medias")
      .select("*", { count: "exact", head: true })
      .eq("prochaine_relance", today),

    supabaseBrowser
      .from("artist_approvals")
      .select("*", { count: "exact", head: true })
      .eq("statut", "En attente"),

    supabaseBrowser
      .from("contract_approvals")
      .select("*", { count: "exact", head: true })
      .eq("statut", "En attente"),

    supabaseBrowser
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", ROLES.MANAGER),
  ]);

  const artistesCount = artistesRes.count || 0;
  const projetsCount = projetsRes.count || 0;
  const tachesCount = tachesRes.count || 0;
  const contratsCount = contratsRes.count || 0;
  const bookingsConfirmesCount = bookingsConfirmesRes.count || 0;
  const mediasRelanceCount = mediasRelanceRes.count || 0;

  const candidaturesCount = candidaturesNouvellesRes.count || 0;
  const candidaturesEnEtudeCount = candidaturesEnEtudeRes.count || 0;
  const candidaturesSigneesCount = candidaturesSigneesRes.count || 0;
  const candidatures = candidaturesLatestRes.data || [];

  const mediasRelanceAujourdhui = mediasRelanceAujourdhuiRes.count || 0;
  const validationsArtisteCount = validationsArtisteRes.count || 0;
  const validationsContratsCount = validationsContratsRes.count || 0;
  const managersCount = managersRes.count || 0;

    const { data: finances } = await supabaseBrowser
  .from("finances")
  .select(`
    *,
    artistes ( id, nom ),
    projets ( id, titre )
  `)
  .gte("date_operation", sixMonthsStart);

  const currentMonthFinances =
  finances?.filter((finance: any) => {
    if (!finance.date_operation) return false;

    return finance.date_operation >= start;
  }) || [];

    const revenus =
      currentMonthFinances
  .filter((f: any) => f.type === "Revenu")
        .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

    const depenses =
      currentMonthFinances
        ?.filter((f: any) => f.type === "Dépense")
        .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

        const monthlyMap = new Map();

finances?.forEach((f: any) => {
  const date = f.date_operation ? new Date(f.date_operation) : null;
  if (!date) return;

  const mois = date.toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });

  const current = monthlyMap.get(mois) || {
    mois,
    revenus: 0,
    depenses: 0,
    resultat: 0,
  };

  if (f.type === "Revenu") current.revenus += Number(f.montant || 0);
  if (f.type === "Dépense") current.depenses += Number(f.montant || 0);

  current.resultat = current.revenus - current.depenses;

  monthlyMap.set(mois, current);
});

const chartData = Array.from(monthlyMap.values()).slice(-6);

const byArtist = new Map();

finances?.forEach((f: any) => {
  if (!f.artistes?.nom) return;

  const current = byArtist.get(f.artistes.nom) || {
    revenus: 0,
    depenses: 0,
  };

  if (f.type === "Revenu") current.revenus += Number(f.montant || 0);
  if (f.type === "Dépense") current.depenses += Number(f.montant || 0);

  byArtist.set(f.artistes.nom, current);
});

const artistRanking = Array.from(byArtist.entries())
  .map(([nom, values]: any) => ({
    nom,
    resultat: values.revenus - values.depenses,
    revenus: values.revenus,
    depenses: values.depenses,
  }))
  .sort((a, b) => b.resultat - a.resultat)
  .slice(0, 5);

const byProject = new Map();

finances?.forEach((f: any) => {
  if (!f.projets?.titre) return;

  const current = byProject.get(f.projets.titre) || {
    revenus: 0,
    depenses: 0,
  };

  if (f.type === "Revenu") current.revenus += Number(f.montant || 0);
  if (f.type === "Dépense") current.depenses += Number(f.montant || 0);

  byProject.set(f.projets.titre, current);
});

const projectRanking = Array.from(byProject.entries())
  .map(([titre, values]: any) => ({
    titre,
    resultat: values.revenus - values.depenses,
    revenus: values.revenus,
    depenses: values.depenses,
  }))
  .sort((a, b) => b.resultat - a.resultat)
  .slice(0, 5);

    const { data: projects } = await supabaseBrowser
      .from("projets")
      .select("id, titre, date_sortie, statut")
      .not("date_sortie", "is", null)
      .order("date_sortie", { ascending: true })
      .limit(5);

      const { data: next30 } = await supabaseBrowser
  .from("projets")
  .select("id, titre, date_sortie, statut")
  .gte("date_sortie", today)
  .lte("date_sortie", in30DaysString)
  .order("date_sortie", { ascending: true });

    const { data: tasks } = await supabaseBrowser
      .from("taches")
      .select("id, titre, deadline, priorite, statut")
      .eq("priorite", "Haute")
      .neq("statut", "Terminé")
      .order("deadline", { ascending: true })
      .limit(5);

      const { data: lateTasksData } = await supabaseBrowser
  .from("taches")
  .select("id, titre, deadline, priorite, statut")
  .lt("deadline", today)
  .neq("statut", "Terminé")
  .order("deadline", { ascending: true })
  .limit(5);

const { data: urgentReleasesData } = await supabaseBrowser
  .from("projets")
  .select("id, titre, date_sortie, statut")
  .gte("date_sortie", today)
  .lte("date_sortie", in7DaysString)
  .order("date_sortie", { ascending: true })
  .limit(5);

    const { data: relances } = await supabaseBrowser
      .from("bookings")
      .select("id, evenement, prochaine_relance, statut")
      .not("prochaine_relance", "is", null)
      .order("prochaine_relance", { ascending: true })
      .limit(5);

      const { data: mediaRelances } = await supabaseBrowser
  .from("medias")
  .select("id, nom, contact_nom, prochaine_relance, statut, priorite")
  .not("prochaine_relance", "is", null)
  .order("prochaine_relance", { ascending: true })
  .limit(5);

    const { data: logs } = await supabaseBrowser
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

      const { data: royalties } = await supabaseBrowser
      .from("royalties")
      .select("*");

const royaltiesDues =
  royalties
    ?.filter((r: any) => r.statut !== "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

const royaltiesPayees =
  royalties
    ?.filter((r: any) => r.statut === "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

    const { data: analytics } = await supabaseBrowser
  .from("analytics")
  .select(`
    *,
    artistes ( id, nom ),
    sorties ( id, titre )
  `);

const { data: sortiesMoisData } = await supabaseBrowser
  .from("sorties")
  .select("id, titre, date_sortie")
  .gte("date_sortie", start);

const streamsTotaux =
  analytics?.reduce((acc: number, item: any) => acc + Number(item.streams || 0), 0) || 0;

const followersTotaux =
  analytics?.reduce((acc: number, item: any) => acc + Number(item.followers || 0), 0) || 0;

const vuesTotales =
  analytics?.reduce((acc: number, item: any) => acc + Number(item.vues || 0), 0) || 0;

const revenusAnalytics =
  analytics?.reduce((acc: number, item: any) => acc + Number(item.revenus || 0), 0) || 0;

const bySortieAnalytics = new Map();

analytics?.forEach((item: any) => {
  if (!item.sorties?.titre) return;

  const current = bySortieAnalytics.get(item.sorties.titre) || {
    titre: item.sorties.titre,
    streams: 0,
    vues: 0,
    revenus: 0,
  };

  current.streams += Number(item.streams || 0);
  current.vues += Number(item.vues || 0);
  current.revenus += Number(item.revenus || 0);

  bySortieAnalytics.set(item.sorties.titre, current);
});

const sortieAnalyticsRanking = Array.from(bySortieAnalytics.values())
  .sort((a: any, b: any) => b.streams + b.vues - (a.streams + a.vues))
  .slice(0, 5);

const byArtisteAnalytics = new Map();

analytics?.forEach((item: any) => {
  if (!item.artistes?.nom) return;

  const current = byArtisteAnalytics.get(item.artistes.nom) || {
    nom: item.artistes.nom,
    streams: 0,
    vues: 0,
    followers: 0,
    revenus: 0,
  };

  current.streams += Number(item.streams || 0);
  current.vues += Number(item.vues || 0);
  current.followers += Number(item.followers || 0);
  current.revenus += Number(item.revenus || 0);

  byArtisteAnalytics.set(item.artistes.nom, current);
});

const artisteAnalyticsRanking = Array.from(byArtisteAnalytics.values())
  .sort((a: any, b: any) => b.streams + b.vues - (a.streams + a.vues))
  .slice(0, 5);

const projectsWithBudget = projectRanking.filter(
  (projet: any) => Number(projet.depenses || 0) > 0
);

const roiMoyen =
  projectsWithBudget.length > 0
    ? Math.round(
        projectsWithBudget.reduce(
          (total: number, projet: any) => {
            const budget = Number(projet.depenses || 0);
            const revenusProjet = Number(projet.revenus || 0);

            return (
              total +
              ((revenusProjet - budget) / budget) * 100
            );
          },
          0
        ) / projectsWithBudget.length
      )
    : 0;

    const { data: releaseTasks } = await supabaseBrowser
  .from("release_tasks")
  .select("*");

const releaseTasksTotal = releaseTasks?.length || 0;

const releaseTasksDone =
  releaseTasks?.filter((task: any) => task.statut === "Terminé").length || 0;

const releaseProgressMoyenne =
  releaseTasksTotal > 0
    ? Math.round((releaseTasksDone / releaseTasksTotal) * 100)
    : 0;

    const lmgGlobalScore = Math.max(
  0,
  Math.min(
    100,
    Math.round(
      50 +
        Math.min(streamsTotaux / 1000000, 1) * 15 +
        Math.min(revenusAnalytics / 10000, 1) * 15 +
        Math.min((bookingsConfirmesCount || 0) / 30, 1) * 10 +
        Math.min((sortiesMoisData?.length || 0) / 10, 1) * 10 -
        Math.min((contratsCount || 0) * 2, 15) -
        Math.min((lateTasksData?.length || 0) * 3, 15) -
        Math.min((validationsArtisteCount || 0) * 2, 10) -
        Math.min((validationsContratsCount || 0) * 2, 10)
    )
  )
);

    setStats({
      artistes: artistesCount || 0,
      projets: projetsCount || 0,
      taches: tachesCount || 0,
      contratsASigner: contratsCount || 0,
      bookingsConfirmes: bookingsConfirmesCount || 0,
      mediasRelance: mediasRelanceCount || 0,
      mediasRelanceAujourdhui: mediasRelanceAujourdhui || 0,
      nouvellesCandidatures: candidaturesCount || 0,
      candidaturesEnEtude: candidaturesEnEtudeCount || 0,
      candidaturesSignees: candidaturesSigneesCount || 0,
      revenusMois: revenus,
      depensesMois: depenses,
      resultatMois: revenus - depenses,
      royaltiesDues,
      royaltiesPayees,
      streamsTotaux,
      followersTotaux,
      vuesTotales,
      revenusAnalytics,
      sortiesMois: sortiesMoisData?.length || 0,
      roiMoyen,
      releaseTasksTotal,
      releaseTasksDone,
      releaseProgressMoyenne,
      validationsArtisteEnAttente: validationsArtisteCount || 0,
      validationsContratsEnAttente: validationsContratsCount || 0,
      managersActifs: managersCount || 0,
      lmgGlobalScore,
    });

    setUpcomingProjects(projects || []);
    setUrgentTasks(tasks || []);
    setFollowUps(relances || []);
    setMediaFollowUps(mediaRelances || []);
    setTopArtistes(artistRanking);
    setTopProjets(projectRanking);
    setRevenueChartData(chartData);
    setActivityLogs(logs || []);
    setLatestCandidatures(candidatures || []);
    setNext30Projects(next30 || []);
    setLateTasks(lateTasksData || []);
    setUrgentReleases(urgentReleasesData || []);
    setTopSortiesAnalytics(sortieAnalyticsRanking);
    setTopArtistesAnalytics(artisteAnalyticsRanking);
    console.timeEnd("dashboard");
  }

useEffect(() => {
  async function checkAccess() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === ROLES.MANAGER) {
      router.push("/manager");
      return;
    }

    if (profile?.role === ROLES.ARTISTE) {
      router.push("/mon-espace-artiste");
      return;
    }

    if (profile?.role === ROLES.PRESTATAIRE) {
      router.push("/mes-taches");
      return;
    }

if (
  profile?.role !== ROLES.SUPER_ADMIN &&
  profile?.role !== ROLES.ADMIN
) {
  router.push("/login");
  return;
}

    setCheckingAccess(false);
  }

  checkAccess();
}, [router]);

  useEffect(() => {
  if (checkingAccess) return;

  loadDashboard();

  const channel = supabaseBrowser
    .channel("dashboard-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activity_logs",
      },
      async () => {
        await loadDashboard();
      }
    )
    .subscribe();

  return () => {
    supabaseBrowser.removeChannel(channel);
  };
}, [checkingAccess]);

if (checkingAccess) {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      Chargement...
    </main>
  );
}

const healthPenalty =
  lateTasks.length * 5 +
  stats.contratsASigner * 3 +
  Math.min(Math.round(stats.royaltiesDues / 100), 20) +
  urgentReleases.length * 2 +
  stats.mediasRelanceAujourdhui;

const healthScore = Math.max(0, 100 - healthPenalty);

const healthLabel =
  healthScore >= 80
    ? "Excellent"
    : healthScore >= 60
    ? "À surveiller"
    : "Critique";

const healthTone =
  healthScore >= 80
    ? "border-green-500/30 bg-green-500/10 text-green-300"
    : healthScore >= 60
    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
    : "border-red-500/30 bg-red-500/10 text-red-300";

  return (
  <main className="min-h-screen bg-black p-10 text-white">

    {/* HEADER */}

    <div className="mb-10">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Legacy Music Group
      </p>

      <h1 className="mt-3 text-6xl font-bold">
        Executive Dashboard
      </h1>

      <p className="mt-3 max-w-2xl text-zinc-400">
        Vue stratégique du label : performance artistique, business,
        finance et opérations.
      </p>
    </div>


    {/* EXECUTIVE OVERVIEW */}

    <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Executive Score
          </p>

          <h2 className="mt-3 text-6xl font-bold">
            {stats.lmgGlobalScore}
            <span className="text-3xl text-zinc-500">
              /100
            </span>
          </h2>

          <p className="mt-3 text-lg text-zinc-400">
            Performance globale du label
          </p>

          <div
  className={`mt-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 ${healthTone}`}
>
  <span className="text-sm font-semibold">
    Santé opérationnelle : {healthLabel}
  </span>

  <span className="text-sm font-black">
    {healthScore}/100
  </span>
</div>

        </div>


        <div className="w-full lg:w-[420px]">

          <div className="h-4 overflow-hidden rounded-full bg-black">

            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${stats.lmgGlobalScore}%`,
              }}
            />

          </div>


          <div className="mt-6 grid grid-cols-2 gap-4">

            <MiniStat
              label="Managers"
              value={stats.managersActifs}
            />

            <MiniStat
              label="Artistes"
              value={stats.artistes}
            />

            <MiniStat
              label="Validations"
              value={
                stats.validationsArtisteEnAttente +
                stats.validationsContratsEnAttente
              }
            />

            <MiniStat
              label="Sorties"
              value={stats.sortiesMois}
            />

          </div>

        </div>

      </div>

    </section>


    {/* FINANCE KPI */}

    <section className="mb-10">

      <div className="mb-5">

        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Performance financière
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Business Overview
        </h2>

      </div>


      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">


        <KpiCard
          label="CA du mois"
          value={`${stats.revenusMois.toFixed(2)} €`}
          tone="green"
        />


        <KpiCard
          label="Dépenses"
          value={`${stats.depensesMois.toFixed(2)} €`}
          tone="red"
        />


        <KpiCard
          label="Résultat"
          value={`${stats.resultatMois.toFixed(2)} €`}
          tone={
            stats.resultatMois >= 0
              ? "green"
              : "red"
          }
        />


      </div>

    </section>

  
    <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <div className="mb-6">
    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
      Priorités opérationnelles
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      À traiter maintenant
    </h2>
  </div>


  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">

    <AlertCard
      label="Tâches en retard"
      value={lateTasks.length}
      href="/taches"
      danger={lateTasks.length > 0}
    />

    <AlertCard
      label="Contrats à signer"
      value={stats.contratsASigner}
      href="/contrats"
      danger={stats.contratsASigner > 0}
    />

    <AlertCard
      label="Sorties J-7"
      value={urgentReleases.length}
      href="/projets"
      danger={urgentReleases.length > 0}
    />

    <AlertCard
      label="Royalties dues"
      value={Math.round(stats.royaltiesDues)}
      href="/royalties"
      danger={stats.royaltiesDues > 0}
    />

    <AlertCard
      label="Relances médias"
      value={stats.mediasRelanceAujourdhui}
      href="/medias/dashboard"
      danger={stats.mediasRelanceAujourdhui > 0}
    />

  </div>

</section>

    <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <div className="mb-6 flex items-center justify-between">

    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Releases
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Release Performance
      </h2>
    </div>


    <Link
      href="/release-planner"
      className="text-sm text-zinc-400 hover:text-white"
    >
      Ouvrir →
    </Link>

  </div>


  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

    <MiniStat
      label="Actions release"
      value={stats.releaseTasksTotal}
    />

    <MiniStat
      label="Terminées"
      value={stats.releaseTasksDone}
    />

    <MiniStat
      label="Progression"
      value={`${stats.releaseProgressMoyenne}%`}
    />

  </div>

</section>

   <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <div className="mb-6 flex items-center justify-between">

    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Pipeline artistes
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Candidatures
      </h2>
    </div>


    <Link
      href="/dashboard/candidatures"
      className="text-sm text-zinc-400 hover:text-white"
    >
      Voir tout →
    </Link>

  </div>


  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

    <MiniStat
      label="Nouvelles"
      value={stats.nouvellesCandidatures}
    />

    <MiniStat
      label="En étude"
      value={stats.candidaturesEnEtude}
    />

    <MiniStat
      label="Signées"
      value={stats.candidaturesSignees}
    />

  </div>


  <div className="space-y-3">

    {latestCandidatures.length === 0 && (
      <p className="text-zinc-500">
        Aucune candidature récente.
      </p>
    )}


    {latestCandidatures.map((candidature:any)=>(
      
      <Link
        key={candidature.id}
        href={`/dashboard/candidatures/${candidature.id}`}
        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-600"
      >

        <div>

          <h3 className="font-semibold">
            {candidature.nom_artiste || "Artiste"}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {candidature.ville || "Ville inconnue"}
          </p>

        </div>


        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
          {candidature.statut}
        </span>


      </Link>

    ))}

  </div>

</section>

    <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <div className="mb-6 flex items-center justify-between">

    <div>

      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Releases
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Calendrier sorties
      </h2>

    </div>


    <Link
      href="/projets"
      className="text-sm text-zinc-400 hover:text-white"
    >
      Voir tout →
    </Link>

  </div>


  {next30Projects.length === 0 && (
    <p className="text-zinc-500">
      Aucune sortie prévue dans les 30 prochains jours.
    </p>
  )}


  <div className="space-y-3">

    {next30Projects.map((project:any)=>{

      const releaseDate = new Date(project.date_sortie);
      const now = new Date();

      const diffTime =
        releaseDate.getTime() - now.getTime();

      const diffDays =
        Math.ceil(
          diffTime / (1000 * 60 * 60 * 24)
        );


      const urgent = diffDays <= 7;


      return (

        <Link
          key={project.id}
          href={`/projets/${project.id}`}
          className={`flex items-center justify-between rounded-2xl border p-5 transition hover:border-zinc-500 ${
            urgent
              ? "border-yellow-500/40 bg-yellow-500/10"
              : "border-zinc-800 bg-black"
          }`}
        >

          <div>

            <h3 className="font-semibold">
              {project.titre}
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              {project.date_sortie} • {project.statut || "En préparation"}
            </p>

          </div>


          <div className="text-right">

            <p
              className={
                urgent
                  ? "text-yellow-300 font-semibold"
                  : "text-zinc-400"
              }
            >
              {diffDays <= 0
                ? "Aujourd'hui"
                : `J-${diffDays}`
              }
            </p>


          </div>


        </Link>

      );

    })}

  </div>

</section>

    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <KpiCard label="Royalties à payer" value={`${stats.royaltiesDues.toFixed(2)} €`} tone="red" />
      <KpiCard label="Royalties payées" value={`${stats.royaltiesPayees.toFixed(2)} €`} tone="green" />
    </div>

    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-6">
  <KpiCard
    label="Streams totaux"
    value={stats.streamsTotaux.toLocaleString("fr-FR")}
  />

  <KpiCard
    label="Followers totaux"
    value={stats.followersTotaux.toLocaleString("fr-FR")}
  />

  <KpiCard
    label="Vues totales"
    value={stats.vuesTotales.toLocaleString("fr-FR")}
  />

  <KpiCard
    label="Revenus analytics"
    value={`${stats.revenusAnalytics.toFixed(2)} €`}
    tone="green"
  />

  <KpiCard
    label="Sorties ce mois"
    value={stats.sortiesMois}
  />

  <KpiCard
    label="ROI moyen"
    value={`${stats.roiMoyen}%`}
    tone={stats.roiMoyen >= 0 ? "green" : "red"}
  />
</div>

    <RevenueChart data={revenueChartData} />

    <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-4">
      <Panel title="Sorties à venir" href="/projets">
        {upcomingProjects.length === 0 && <p className="text-zinc-500">Aucune sortie planifiée.</p>}

        {upcomingProjects.map((project) => (
          <Link key={project.id} href={`/projets/${project.id}`} className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600">
            <h3 className="text-lg font-semibold">{project.titre}</h3>
            <p className="mt-2 text-sm text-zinc-500">
              {project.date_sortie || "Date non renseignée"} • {project.statut || "Statut"}
            </p>
          </Link>
        ))}
      </Panel>

      <Panel title="Tâches urgentes" href="/taches">
        {urgentTasks.length === 0 && <p className="text-zinc-500">Aucune tâche urgente.</p>}

        {urgentTasks.map((task) => (
          <Link key={task.id} href={`/taches/${task.id}`} className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600">
            <h3 className="text-lg font-semibold">{task.titre}</h3>
            <p className="mt-2 text-sm text-zinc-500">
              {task.deadline || "Sans deadline"} • {task.priorite}
            </p>
          </Link>
        ))}
      </Panel>

      <Panel title="Relances booking" href="/booking">
        {followUps.length === 0 && <p className="text-zinc-500">Aucune relance booking.</p>}

        {followUps.map((booking) => (
          <Link key={booking.id} href={`/booking/${booking.id}`} className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600">
            <h3 className="text-lg font-semibold">{booking.evenement}</h3>
            <p className="mt-2 text-sm text-zinc-500">
              {booking.prochaine_relance || "Date non renseignée"} • {booking.statut || "Statut"}
            </p>
          </Link>
        ))}
      </Panel>

      <Panel title="Relances médias" href="/medias/dashboard">
        {mediaFollowUps.length === 0 && <p className="text-zinc-500">Aucune relance média.</p>}

        {mediaFollowUps.map((media) => (
          <Link key={media.id} href={`/medias/${media.id}`} className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600">
            <h3 className="text-lg font-semibold">{media.nom}</h3>
            <p className="mt-2 text-sm text-zinc-500">
              {media.prochaine_relance || "Date non renseignée"} • {media.statut || "Statut"}
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              {media.contact_nom || "Contact non renseigné"} • {media.priorite || "Priorité normale"}
            </p>
          </Link>
        ))}
      </Panel>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

  <Panel title="Top artistes rentables" href="/finances">

    {topArtistes.length === 0 && (
      <p className="text-zinc-500">
        Aucune donnée artiste.
      </p>
    )}


    {topArtistes.map((artist:any, index:number)=>(

      <div
        key={artist.nom}
        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-5"
      >

        <div className="flex items-center gap-4">

          <span className="text-2xl font-bold text-zinc-600">
            #{index + 1}
          </span>


          <div>

            <h3 className="font-semibold">
              {artist.nom}
            </h3>


            <p className="mt-1 text-sm text-zinc-500">
              Revenus {artist.revenus.toFixed(2)} €
            </p>

          </div>

        </div>


        <p
          className={
            artist.resultat >= 0
              ? "text-green-400 font-semibold"
              : "text-red-400 font-semibold"
          }
        >
          {artist.resultat.toFixed(2)} €
        </p>


      </div>

    ))}

  </Panel>



  <Panel title="Top projets rentables" href="/finances">

    {topProjets.length === 0 && (
      <p className="text-zinc-500">
        Aucune donnée projet.
      </p>
    )}


    {topProjets.map((project:any,index:number)=>(

      <div
        key={project.titre}
        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-5"
      >

        <div className="flex items-center gap-4">

          <span className="text-2xl font-bold text-zinc-600">
            #{index + 1}
          </span>


          <div>

            <h3 className="font-semibold">
              {project.titre}
            </h3>


            <p className="mt-1 text-sm text-zinc-500">
              Revenus {project.revenus.toFixed(2)} €
            </p>

          </div>

        </div>


        <p
          className={
            project.resultat >= 0
              ? "text-green-400 font-semibold"
              : "text-red-400 font-semibold"
          }
        >
          {project.resultat.toFixed(2)} €
        </p>


      </div>

    ))}

  </Panel>

</div>

<div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">


  <Panel title="Top artistes analytics" href="/analytics">


    {topArtistesAnalytics.length === 0 && (
      <p className="text-zinc-500">
        Aucune donnée analytics artiste.
      </p>
    )}


    {topArtistesAnalytics.map((artist:any,index:number)=>(

      <div
        key={artist.nom}
        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-5"
      >

        <div className="flex items-center gap-4">

          <span className="text-2xl font-bold text-zinc-600">
            #{index + 1}
          </span>


          <div>

            <h3 className="font-semibold">
              {artist.nom}
            </h3>


            <p className="mt-1 text-sm text-zinc-500">
              {artist.streams.toLocaleString("fr-FR")} streams
            </p>

          </div>


        </div>


        <div className="text-right">

          <p className="font-semibold text-green-400">
            {artist.revenus.toFixed(2)} €
          </p>


          <p className="mt-1 text-xs text-zinc-500">
            {artist.vues.toLocaleString("fr-FR")} vues
          </p>

        </div>


      </div>

    ))}


  </Panel>



  <Panel title="Top sorties analytics" href="/sorties">


    {topSortiesAnalytics.length === 0 && (
      <p className="text-zinc-500">
        Aucune donnée analytics sortie.
      </p>
    )}


    {topSortiesAnalytics.map((sortie:any,index:number)=>(

      <div
        key={sortie.titre}
        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-5"
      >


        <div className="flex items-center gap-4">

          <span className="text-2xl font-bold text-zinc-600">
            #{index + 1}
          </span>


          <div>

            <h3 className="font-semibold">
              {sortie.titre}
            </h3>


            <p className="mt-1 text-sm text-zinc-500">
              {sortie.streams.toLocaleString("fr-FR")} streams
            </p>

          </div>


        </div>



        <div className="text-right">

          <p className="font-semibold text-green-400">
            {sortie.revenus.toFixed(2)} €
          </p>


          <p className="mt-1 text-xs text-zinc-500">
            {sortie.vues.toLocaleString("fr-FR")} vues
          </p>

        </div>


      </div>

    ))}


  </Panel>


</div>

    <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <div className="mb-6 flex items-center justify-between">

    <div>

      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Journal
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Activité récente
      </h2>

    </div>


    <Link
      href="/activity"
      className="text-sm text-zinc-400 hover:text-white"
    >
      Voir tout →
    </Link>

  </div>


  <div className="space-y-3">

    {activityLogs.length === 0 && (
      <p className="text-zinc-500">
        Aucune activité pour le moment.
      </p>
    )}


    {activityLogs.map((log)=>(
      
      <div
        key={log.id}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-black p-5 md:flex-row md:items-center md:justify-between"
      >

        <div>

          <p className="text-xs uppercase tracking-wider text-zinc-500">
            {log.type || "activité"}
          </p>


          <h3 className="mt-1 font-semibold">
            {log.titre || "Action"}
          </h3>


          <p className="mt-1 text-sm text-zinc-400">
            {log.description}
          </p>

        </div>


        <p className="text-xs text-zinc-600">
          {new Date(log.created_at).toLocaleString("fr-FR")}
        </p>


      </div>

    ))}

  </div>

</section>
  </main>
);
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "border-green-500/30 bg-green-500/10"
      : tone === "red"
      ? "border-red-500/30 bg-red-500/10"
      : "border-zinc-800 bg-zinc-900";

  return (
    <div className={`rounded-3xl border p-6 ${toneClass}`}>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

        <Link href={href} className="text-sm text-zinc-400 hover:text-white">
          Voir →
        </Link>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function AlertCard({
  label,
  value,
  href,
  danger,
}: {
  label: string;
  value: number;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-5 transition hover:border-zinc-500 ${
        danger
          ? "border-red-500/30 bg-red-500/10"
          : "border-zinc-800 bg-black"
      }`}
    >
      <p className={danger ? "text-red-300" : "text-zinc-500"}>
        {label}
      </p>

      <p className="mt-3 text-4xl font-bold">
        {value}
      </p>

      <p className="mt-3 text-xs text-zinc-500">
        Ouvrir →
      </p>
    </Link>
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