import "server-only";
import { createClient } from "@supabase/supabase-js";

type SupabaseClientLike = any;
export type LmgSource = { type: string; id: string; label: string };

const AGENCY_REFERENCE = {
  mission: "LMG Agency accompagne marques, entreprises, entrepreneurs et talents sur leur identité, leur communication et leur présence digitale.",
  positionnement: "Creative & Digital Agency — Strategy, Creative, Digital — Paris et Lille.",
  expertises: ["Identité de marque", "Communication et réseaux sociaux", "Création de contenu", "Sites et digital", "Marketing et développement", "Accompagnement 360°"],
  methode: ["Échange et compréhension", "Stratégie", "Création et production", "Lancement et accompagnement"],
  offres: ["Identité Essentielle — dès 690 € HT", "Identité Signature — dès 1 490 € HT", "Site Essentiel — dès 1 890 € HT", "Lancement 360 — dès 2 990 € HT", "Social Essentiel — 590 € HT/mois", "Social Growth — 990 € HT/mois", "Direction 360 — dès 1 690 € HT/mois", "Projet sur mesure"],
  direction: ["Joseph Kayaya — Président et Fondateur — vision stratégique, développement, partenariats", "Yliana Faidherbe — Directrice de LMG Agency — direction opérationnelle, communication, image"],
};

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function tokens(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter((word) => word.length > 2); }
function score(row: any, words: string[]) {
  const haystack = JSON.stringify(row).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return words.reduce((total, word) => total + (haystack.includes(word) ? 2 : 0), 0);
}
function selectRelevant(rows: any[], query: string, limit: number) {
  const words = tokens(query);
  return [...rows].map((row) => ({ row, score: score(row, words) })).sort((a, b) => b.score - a.score).slice(0, limit).map((item) => item.row);
}
function cleanRows(rows: any[], fields: string[]) {
  return rows.map((row) => Object.fromEntries(fields.filter((field) => row?.[field] !== undefined && row?.[field] !== null && row?.[field] !== "").map((field) => [field, row[field]])));
}
function summary(rows: any[], field = "statut") {
  const counts: Record<string, number> = {};
  for (const row of rows) { const value = text(row?.[field]) || "non_renseigne"; counts[value] = (counts[value] || 0) + 1; }
  return { total: rows.length, repartition: counts };
}
function overdue(rows: any[]) {
  const now = new Date();
  const closed = ["termine", "terminee", "terminé", "terminée", "complete", "completed", "fait", "valide", "validé", "annule", "annulé"];
  return rows.filter((row) => {
    const raw = row?.deadline || row?.date_echeance || row?.date_fin;
    return raw && new Date(raw) < now && !closed.includes(text(row?.statut).toLowerCase());
  }).length;
}

async function agencyLeads() {
  if (!process.env.AGENCY_SUPABASE_URL || !process.env.AGENCY_SUPABASE_SERVICE_ROLE_KEY) return [];
  const agency = createClient(process.env.AGENCY_SUPABASE_URL, process.env.AGENCY_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await agency.from("agency_leads")
    .select("id, nom, entreprise, profil, service, offre, budget, delai, source, message, statut, priorite, origine, created_at, updated_at")
    .order("created_at", { ascending: false }).limit(120);
  if (error) { console.error("Assistant Agency context error", error.code || error.message); return []; }
  return data || [];
}

export async function buildLmgKnowledge(supabase: SupabaseClientLike, query: string) {
  const table = (name: string, limit = 120) => supabase.from(name).select("*").limit(limit);
  const results = await Promise.all([
    table("artistes", 100), table("projets", 120), table("sorties", 120), table("bookings", 120),
    supabase.from("taches").select("id, titre, description, statut, priorite, deadline, responsable_id, assigned_to, created_by, projet_id, task_assignees(user_id)").limit(180),
    table("objectifs_artistes", 120), table("analytics", 120), table("artiste_events", 120), table("contrats", 100),
    table("campagnes", 120), table("medias", 120), table("influenceurs", 100), table("partenaires", 100),
    table("rollout_events", 150), table("release_tasks", 150), table("spotify_releases", 100), table("youtube_videos", 100),
    table("equipe_artiste", 120), table("finances", 180), table("royalties", 150), table("splits", 120),
    table("prospects_lmg", 150), table("candidatures", 120), table("internal_projects", 120), table("internal_project_milestones", 150),
    table("internal_project_updates", 150), table("company_objectives", 120), table("company_objective_updates", 150),
    table("weekly_reviews", 80), table("weekly_review_decisions", 150), table("profiles", 120), agencyLeads(),
  ]);
  const all = results.map((result: any) => result?.data || (Array.isArray(result) ? result : []));
  const [artists, projects, releases, bookings, tasks, goals, analytics, events, contracts, campaigns, medias, influencers, partners, rollouts, releaseTasks, spotify, youtube, artistTeam, finances, royalties, splits, prospects, applications, internalProjects, milestones, internalUpdates, companyObjectives, objectiveUpdates, weeklyReviews, weeklyDecisions, profiles, agency] = all;

  const progression = {
    lmg_global: {
      artistes: summary(artists), projets_musicaux: summary(projects), sorties: summary(releases),
      taches: { ...summary(tasks), en_retard: overdue(tasks) },
      projets_internes: { ...summary(internalProjects), en_retard: overdue(internalProjects) },
      objectifs_societe: { ...summary(companyObjectives), en_retard: overdue(companyObjectives) },
    },
    lmg_music: { campagnes: summary(campaigns), medias: summary(medias), bookings: summary(bookings), contrats: summary(contracts), objectifs_artistes: { ...summary(goals), en_retard: overdue(goals) } },
    lmg_agency: { prospects: summary(agency), priorites: summary(agency, "priorite") },
    finances: { operations: summary(finances), royalties: summary(royalties) },
    calcule_le: new Date().toISOString(),
  };

  const groups = [
    ["artistes", "Artiste", artists, 12, ["id", "nom", "style", "statut", "bio", "ville", "objectifs", "manager_id"]],
    ["projets_musicaux", "Projet musical", projects, 12, ["id", "titre", "type", "statut", "date_sortie", "artiste_id", "notes"]],
    ["sorties", "Sortie", releases, 12, ["id", "titre", "type", "statut", "date_sortie", "artiste_id", "projet_id"]],
    ["bookings", "Booking", bookings, 10, ["id", "evenement", "ville", "date_event", "statut", "artiste_id", "cachet"]],
    ["taches", "Tâche", tasks, 16, ["id", "titre", "description", "statut", "priorite", "deadline", "projet_id", "created_by", "assigned_to"]],
    ["objectifs_artistes", "Objectif artiste", goals, 12, ["id", "titre", "objectif", "actuel", "valeur_actuelle", "valeur_cible", "statut", "deadline", "artiste_id"]],
    ["analytics", "KPI artiste", analytics, 12, ["id", "plateforme", "streams", "vues", "followers", "revenus", "periode", "artiste_id"]],
    ["evenements", "Événement", events, 10, ["id", "titre", "type", "date_event", "heure", "lieu", "statut", "artiste_id"]],
    ["contrats", "Contrat", contracts, 10, ["id", "titre", "type", "statut", "date_signature", "date_debut", "date_fin", "artiste_id"]],
    ["campagnes", "Campagne", campaigns, 10, ["id", "nom", "titre", "type", "statut", "objectif", "budget", "date_debut", "date_fin", "artiste_id"]],
    ["medias", "Média", medias, 10, ["id", "nom", "type", "statut", "date_relance", "artiste_id"]],
    ["influenceurs", "Influenceur", influencers, 8, ["id", "nom", "plateforme", "statut", "audience", "artiste_id"]],
    ["partenaires", "Partenaire", partners, 8, ["id", "nom", "type", "statut", "artiste_id"]],
    ["rollouts", "Étape rollout", rollouts, 12, ["id", "titre", "type", "statut", "date_event", "projet_id", "artiste_id"]],
    ["taches_sorties", "Tâche sortie", releaseTasks, 12, ["id", "titre", "statut", "deadline", "projet_id", "artiste_id"]],
    ["streaming", "Donnée streaming", [...spotify, ...youtube], 12, ["id", "name", "title", "type", "release_date", "views", "streams", "artiste_id"]],
    ["equipe_artiste", "Collaborateur artiste", artistTeam, 10, ["id", "nom", "role", "poste", "artiste_id"]],
    ["finances", "Opération financière", finances, 14, ["id", "titre", "type", "categorie", "montant", "statut", "date_operation", "artiste_id", "projet_id"]],
    ["royalties", "Royalty", royalties, 12, ["id", "montant", "statut", "periode", "artiste_id", "projet_id", "beneficiaire"]],
    ["splits", "Split", splits, 10, ["id", "titre", "statut", "projet_id", "artiste_id"]],
    ["crm_lmg", "Prospect LMG", prospects, 12, ["id", "nom", "entreprise", "type", "statut", "priorite", "service", "budget", "prochaine_relance"]],
    ["candidatures", "Candidature", applications, 10, ["id", "nom", "nom_artiste", "style", "statut", "created_at"]],
    ["projets_internes", "Projet interne", internalProjects, 12, ["id", "titre", "description", "statut", "priorite", "deadline", "owner_id"]],
    ["jalons_internes", "Jalon interne", milestones, 12, ["id", "titre", "statut", "deadline", "internal_project_id"]],
    ["avancement_interne", "Mise à jour projet", internalUpdates, 12, ["id", "contenu", "statut", "progression", "internal_project_id", "created_at"]],
    ["objectifs_societe", "Objectif société", companyObjectives, 12, ["id", "titre", "description", "statut", "valeur_initiale", "valeur_actuelle", "valeur_cible", "deadline", "owner_id"]],
    ["historique_objectifs", "Progression objectif", objectiveUpdates, 12, ["id", "valeur", "commentaire", "objective_id", "created_at"]],
    ["revues_hebdomadaires", "Revue hebdomadaire", weeklyReviews, 8, ["id", "week_start", "resume", "victoires", "blocages", "priorites", "created_at"]],
    ["decisions", "Décision", weeklyDecisions, 12, ["id", "decision", "deadline", "owner_id", "internal_project_id", "statut"]],
    ["collaborateurs", "Collaborateur LMG", profiles, 14, ["id", "nom", "full_name", "role", "poste"]],
    ["agency_prospects", "Prospect Agency", agency, 14, ["id", "nom", "entreprise", "profil", "service", "offre", "budget", "delai", "source", "message", "statut", "priorite", "created_at", "updated_at"]],
  ] as Array<[string, string, any[], number, string[]]>;

  const sources: LmgSource[] = [];
  const context: Record<string, unknown> = { identite_lmg_agency: AGENCY_REFERENCE, progression };
  for (const [key, type, rows, limit, fields] of groups) {
    const cleaned = cleanRows(selectRelevant(rows, query, limit), fields);
    if (!cleaned.length) continue;
    context[key] = cleaned;
    for (const row of cleaned) {
      const id = text(row.id); const label = text(row.nom) || text(row.titre) || text(row.evenement) || text(row.entreprise) || type;
      if (id) sources.push({ type, id, label });
    }
  }
  return { context: JSON.stringify(context, null, 2).slice(0, 42_000), sources: sources.slice(0, 30), scope: "Super Admin — LMG Global complet : LMG Music, LMG Agency, opérations internes, CRM et finances" };
}
