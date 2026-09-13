"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

  const [checkingAccess, setCheckingAccess] = useState(true);
  const loadingRef = useRef(false);
  const pendingRef = useRef(false);

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
  if (loadingRef.current) {
    pendingRef.current = true;
    return;
  }

  loadingRef.current = true;

  try {

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

  const monthKey = `${date.getFullYear()}-${String(
  date.getMonth() + 1
).padStart(2, "0")}`;

const mois = date.toLocaleDateString("fr-FR", {
  month: "short",
  year: "numeric",
});

const current = monthlyMap.get(monthKey) || {
  monthKey,
  mois,
  revenus: 0,
  depenses: 0,
  resultat: 0,
};

  if (f.type === "Revenu") current.revenus += Number(f.montant || 0);
  if (f.type === "Dépense") current.depenses += Number(f.montant || 0);

  current.resultat = current.revenus - current.depenses;

  monthlyMap.set(monthKey, current);
});

const chartData = Array.from(
  monthlyMap.values()
)
  .sort((a: any, b: any) =>
    a.monthKey.localeCompare(b.monthKey)
  )
  .slice(-6);

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

  const [
    { data: projects },
    { data: next30 },
    { data: tasks },
    { data: lateTasksData },
    { data: urgentReleasesData },
    { data: relances },
    { data: mediaRelances },
    { data: logs },
    { data: royalties },
    { data: analytics },
    { data: sortiesMoisData },
    { data: releaseTasks },
  ] = await Promise.all([
    supabaseBrowser.from("projets")
      .select("id, titre, date_sortie, statut")
      .not("date_sortie", "is", null)
      .gte("date_sortie", today)
      .order("date_sortie", { ascending: true }).limit(5),
    supabaseBrowser.from("projets")
      .select("id, titre, date_sortie, statut")
      .gte("date_sortie", today).lte("date_sortie", in30DaysString)
      .order("date_sortie", { ascending: true }),
    supabaseBrowser.from("taches")
      .select("id, titre, deadline, priorite, statut")
      .eq("priorite", "Haute").neq("statut", "Terminé")
      .order("deadline", { ascending: true }).limit(5),
    supabaseBrowser.from("taches")
      .select("id, titre, deadline, priorite, statut")
      .lt("deadline", today).neq("statut", "Terminé")
      .order("deadline", { ascending: true }).limit(5),
    supabaseBrowser.from("projets")
      .select("id, titre, date_sortie, statut")
      .gte("date_sortie", today).lte("date_sortie", in7DaysString)
      .order("date_sortie", { ascending: true }).limit(5),
    supabaseBrowser.from("bookings")
      .select("id, evenement, prochaine_relance, statut")
      .not("prochaine_relance", "is", null).lte("prochaine_relance", today)
      .order("prochaine_relance", { ascending: true }),
    supabaseBrowser.from("medias")
      .select("id, nom, contact_nom, prochaine_relance, statut, priorite")
      .not("prochaine_relance", "is", null).lte("prochaine_relance", today)
      .order("prochaine_relance", { ascending: true }),
    supabaseBrowser.from("activity_logs")
      .select("id, type, titre, description, created_at")
      .order("created_at", { ascending: false }).limit(8),
    supabaseBrowser.from("royalties").select("statut, montant_du"),
    supabaseBrowser.from("analytics").select(`
      streams, followers, vues, revenus,
      artistes ( id, nom ), sorties ( id, titre )
    `),
    supabaseBrowser.from("sorties")
      .select("id, titre, date_sortie").gte("date_sortie", start),
    supabaseBrowser.from("release_tasks").select("statut"),
  ]);

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
    setFollowUps(
  (relances || [])
    .filter(
      (booking: any) =>
        !["Confirmé", "Annulé"].includes(
          booking.statut
        )
    )
    .slice(0, 5)
);

setMediaFollowUps(
  (mediaRelances || [])
    .filter(
      (media: any) =>
        !["Publié", "Refusé"].includes(
          media.statut
        )
    )
    .slice(0, 5)
);
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
    setCheckingAccess(false);
  } finally {
    loadingRef.current = false;
    if (pendingRef.current) {
      pendingRef.current = false;
      void loadDashboard();
    }
  }
  }

  useEffect(() => {
  void loadDashboard();

  let timer: ReturnType<typeof setTimeout> | undefined;

  const channel = supabaseBrowser
    .channel("dashboard-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activity_logs",
      },
      () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          void loadDashboard();
        }, 1500);
      }
    )
    .subscribe();

  return () => {
    clearTimeout(timer);
    supabaseBrowser.removeChannel(channel);
  };
}, []);

if (checkingAccess) {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      Chargement...
    </main>
  );
}

const priorityCount =
  lateTasks.length +
  urgentReleases.length +
  stats.contratsASigner +
  stats.validationsArtisteEnAttente +
  stats.validationsContratsEnAttente +
  stats.mediasRelanceAujourdhui;

const healthPenalty =
  lateTasks.length * 5 +
  stats.contratsASigner * 3 +
  Math.min(Math.round(stats.royaltiesDues / 100), 20) +
  urgentReleases.length * 2 +
  stats.mediasRelanceAujourdhui;

const healthScore = Math.max(0, 100 - healthPenalty);
const healthLabel =
  healthScore >= 80 ? "Maîtrisée" : healthScore >= 60 ? "À surveiller" : "Prioritaire";

const todayLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

return (
  <main className="min-h-screen bg-black px-5 py-8 text-white md:px-8 lg:px-10 lg:py-10">
    <div className="mx-auto max-w-[1600px]">
      <header className="flex flex-col gap-6 border-b border-zinc-900 pb-8 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">
            Cockpit de direction
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
            Vue d’ensemble
          </h1>
          <p className="mt-3 text-sm capitalize text-zinc-500">{todayLabel}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <QuickAction href="/projets/nouveau" label="Nouveau projet" primary />
          <QuickAction href="/taches/nouveau" label="Nouvelle tâche" />
          <QuickAction href="/calendrier/global" label="Voir le calendrier" />
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          eyebrow="Résultat du mois"
          value={formatCurrency(stats.resultatMois)}
          detail={`${formatCurrency(stats.revenusMois)} encaissés`}
          tone={stats.resultatMois >= 0 ? "positive" : "danger"}
          href="/finances/dashboard"
        />
        <MetricCard
          eyebrow="Artistes actifs"
          value={stats.artistes}
          detail={`${stats.managersActifs} manager${stats.managersActifs > 1 ? "s" : ""}`}
          href="/artistes"
        />
        <MetricCard
          eyebrow="Projets suivis"
          value={stats.projets}
          detail={`${stats.sortiesMois} sortie${stats.sortiesMois > 1 ? "s" : ""} ce mois`}
          href="/projets"
        />
        <MetricCard
          eyebrow="Actions requises"
          value={priorityCount}
          detail={priorityCount > 0 ? "Décisions à prendre" : "Aucune urgence"}
          tone={priorityCount > 0 ? "warning" : "positive"}
          href="/taches"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
          <SectionHeading
            eyebrow="Priorités"
            title="À traiter maintenant"
            description="Les points qui demandent une attention aujourd’hui."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <PriorityCard
              label="Tâches en retard"
              value={lateTasks.length}
              href="/taches"
              urgent={lateTasks.length > 0}
            />
            <PriorityCard
              label="Contrats à signer"
              value={stats.contratsASigner}
              href="/contrats"
              urgent={stats.contratsASigner > 0}
            />
            <PriorityCard
              label="Sorties à moins de 7 jours"
              value={urgentReleases.length}
              href="/release-planner"
              urgent={urgentReleases.length > 0}
            />
            <PriorityCard
              label="Validations en attente"
              value={
                stats.validationsArtisteEnAttente +
                stats.validationsContratsEnAttente
              }
              href="/validations-artiste"
              urgent={
                stats.validationsArtisteEnAttente +
                  stats.validationsContratsEnAttente >
                0
              }
            />
            <PriorityCard
              label="Relances médias aujourd’hui"
              value={stats.mediasRelanceAujourdhui}
              href="/medias/dashboard"
              urgent={stats.mediasRelanceAujourdhui > 0}
            />
            <PriorityCard
              label="Royalties à payer"
              value={formatCurrency(stats.royaltiesDues)}
              href="/royalties"
              urgent={stats.royaltiesDues > 0}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[28px] border border-zinc-800 bg-white p-6 text-black md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
              Santé opérationnelle
            </p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="text-7xl font-black tracking-tighter">{healthScore}</p>
              <p className="pb-2 text-sm font-semibold text-zinc-500">/100</p>
            </div>
            <p className="mt-3 text-xl font-bold">{healthLabel}</p>
          </div>

          <div className="mt-10">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
              <div
                className={`h-full rounded-full ${
                  healthScore >= 80
                    ? "bg-green-500"
                    : healthScore >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-5">
              <HealthStat label="Score LMG" value={stats.lmgGlobalScore} />
              <HealthStat label="Tâches" value={stats.taches} />
              <HealthStat label="Sorties" value={stats.sortiesMois} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Finance"
            title="Performance du label"
            description="Revenus, dépenses et évolution sur les six derniers mois."
          />
          <Link
            href="/finances/dashboard"
            className="w-fit rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Ouvrir la finance →
          </Link>
        </div>

        <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_2fr]">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <FinanceLine label="Chiffre d’affaires" value={stats.revenusMois} positive />
            <FinanceLine label="Dépenses" value={stats.depensesMois} />
            <FinanceLine
              label="Résultat net"
              value={stats.resultatMois}
              positive={stats.resultatMois >= 0}
              highlighted
            />
          </div>
          <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-900 bg-black p-4">
            <RevenueChart data={revenueChartData} />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeading
          eyebrow="Opérations"
          title="Ce qui avance"
          description="Une lecture directe des prochaines échéances du label."
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ActionPanel title="Prochaines sorties" href="/release-planner">
            {next30Projects.length === 0 ? (
              <EmptyState text="Aucune sortie prévue dans les 30 prochains jours." />
            ) : (
              next30Projects.slice(0, 5).map((project: any) => (
                <ProjectRow key={project.id} project={project} />
              ))
            )}
          </ActionPanel>

          <ActionPanel title="Tâches prioritaires" href="/taches">
            {[...lateTasks, ...urgentTasks]
              .filter(
                (task: any, index: number, items: any[]) =>
                  items.findIndex((item) => item.id === task.id) === index
              )
              .slice(0, 5)
              .map((task: any) => (
                <ItemRow
                  key={task.id}
                  href={`/taches/${task.id}`}
                  title={task.titre}
                  meta={task.deadline || "Sans échéance"}
                  status={task.priorite || "Priorité normale"}
                  danger={
                    Boolean(task.deadline) &&
                    new Date(task.deadline).getTime() < Date.now()
                  }
                />
              ))}
            {lateTasks.length === 0 && urgentTasks.length === 0 && (
              <EmptyState text="Aucune tâche prioritaire." />
            )}
          </ActionPanel>

          <ActionPanel title="Relances commerciales" href="/booking">
            {followUps.slice(0, 3).map((booking: any) => (
              <ItemRow
                key={booking.id}
                href={`/booking/${booking.id}`}
                title={booking.evenement}
                meta={booking.prochaine_relance || "Date non renseignée"}
                status="Booking"
              />
            ))}
            {mediaFollowUps.slice(0, 2).map((media: any) => (
              <ItemRow
                key={media.id}
                href={`/medias/${media.id}`}
                title={media.nom}
                meta={media.prochaine_relance || "Date non renseignée"}
                status="Média"
              />
            ))}
            {followUps.length === 0 && mediaFollowUps.length === 0 && (
              <EmptyState text="Aucune relance à effectuer." />
            )}
          </ActionPanel>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <ActionPanel title="Pipeline artistes" href="/dashboard/candidatures">
          <div className="grid grid-cols-3 gap-2 pb-3">
            <PipelineStat label="Nouvelles" value={stats.nouvellesCandidatures} />
            <PipelineStat label="En étude" value={stats.candidaturesEnEtude} />
            <PipelineStat label="Signées" value={stats.candidaturesSignees} />
          </div>
          {latestCandidatures.slice(0, 3).map((item: any) => (
            <ItemRow
              key={item.id}
              href={`/dashboard/candidatures/${item.id}`}
              title={item.nom_artiste || "Artiste"}
              meta={item.ville || "Ville non renseignée"}
              status={item.statut || "Nouvelle"}
            />
          ))}
        </ActionPanel>

        <ActionPanel title="Activité récente" href="/activity">
          {activityLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 border-b border-zinc-900 py-3 last:border-0"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{log.titre || "Action"}</p>
                <p className="mt-1 truncate text-sm text-zinc-500">
                  {log.description || log.type || "Activité LMG"}
                </p>
              </div>
              <time className="shrink-0 text-xs text-zinc-600">
                {formatShortDate(log.created_at)}
              </time>
            </div>
          ))}
          {activityLogs.length === 0 && (
            <EmptyState text="Aucune activité récente." />
          )}
        </ActionPanel>
      </section>
    </div>
  </main>
);
}

function QuickAction({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        primary
          ? "border-white bg-white text-black hover:bg-zinc-200"
          : "border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function MetricCard({
  eyebrow,
  value,
  detail,
  href,
  tone = "default",
}: {
  eyebrow: string;
  value: string | number;
  detail: string;
  href: string;
  tone?: "default" | "positive" | "warning" | "danger";
}) {
  const toneClass = {
    default: "border-zinc-800 bg-zinc-950",
    positive: "border-green-500/20 bg-green-500/[0.06]",
    warning: "border-yellow-500/25 bg-yellow-500/[0.07]",
    danger: "border-red-500/25 bg-red-500/[0.07]",
  }[tone];

  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-zinc-600 ${toneClass}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {eyebrow}
      </p>
      <p className="mt-4 text-4xl font-bold tracking-tight">{value}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-500">
        <span>{detail}</span>
        <span className="transition group-hover:translate-x-1 group-hover:text-white">→</span>
      </div>
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-yellow-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function PriorityCard({
  label,
  value,
  href,
  urgent,
}: {
  label: string;
  value: string | number;
  href: string;
  urgent: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition hover:border-zinc-600 ${
        urgent ? "border-red-500/20 bg-red-500/[0.06]" : "border-zinc-900 bg-black"
      }`}
    >
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className={`mt-2 text-xs font-semibold ${urgent ? "text-red-300" : "text-green-400"}`}>
          {urgent ? "À traiter" : "À jour"}
        </p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Link>
  );
}

function HealthStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  );
}

function FinanceLine({
  label,
  value,
  positive = false,
  highlighted = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${highlighted ? "border-yellow-500/20 bg-yellow-500/[0.06]" : "border-zinc-900 bg-black"}`}>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${positive ? "text-green-400" : value > 0 ? "text-white" : "text-zinc-400"}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function ActionPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <Link href={href} className="text-xs font-semibold text-zinc-500 transition hover:text-white">
          Voir tout →
        </Link>
      </div>
      <div>{children}</div>
    </section>
  );
}

function ItemRow({
  href,
  title,
  meta,
  status,
  danger = false,
}: {
  href: string;
  title: string;
  meta: string;
  status: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 border-b border-zinc-900 py-3 last:border-0"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold group-hover:text-yellow-400">{title}</p>
        <p className={`mt-1 truncate text-xs ${danger ? "text-red-400" : "text-zinc-600"}`}>{meta}</p>
      </div>
      <span className="shrink-0 rounded-full border border-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
        {status}
      </span>
    </Link>
  );
}

function ProjectRow({ project }: { project: any }) {
  const releaseDate = project.date_sortie ? new Date(project.date_sortie) : null;
  const diffDays = releaseDate
    ? Math.ceil((releaseDate.getTime() - Date.now()) / 86400000)
    : null;

  return (
    <ItemRow
      href={`/projets/${project.id}`}
      title={project.titre}
      meta={project.date_sortie ? formatShortDate(project.date_sortie) : "Date non définie"}
      status={diffDays === null ? "À planifier" : diffDays <= 0 ? "Aujourd’hui" : `J-${diffDays}`}
      danger={diffDays !== null && diffDays <= 7}
    />
  );
}

function PipelineStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-black p-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-[10px] text-zinc-600">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-7 text-center text-sm text-zinc-600">
      {text}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

