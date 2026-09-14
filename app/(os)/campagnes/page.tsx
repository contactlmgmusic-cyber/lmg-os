import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import CampaignPortfolio from "@/components/CampaignPortfolio";

export const dynamic = "force-dynamic";

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("fr-FR");
}

export default async function CampagnesPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const profile = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
  ]);

  const isManager = profile.role === ROLES.MANAGER;
  let campaignsQuery = supabase
    .from("campagnes")
    .select(isManager ? `
      *, artistes!inner (id, nom, manager_id), projets (id, titre)
    ` : `
      *,
      artistes (
        id,
        nom
      ),
      projets (
        id,
        titre
      )
    `).order("created_at", { ascending: false });
  if (isManager) campaignsQuery = campaignsQuery.eq("artistes.manager_id", profile.id);
  const { data: campagnes, error } = await campaignsQuery;

  const { data: medias } = await supabase
    .from("medias")
    .select("*");

  const { data: influenceurs } = await supabase
    .from("influenceurs")
    .select("*");

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  const allCampagnes = campagnes || [];
  const allMedias = medias || [];
  const allInfluenceurs = influenceurs || [];

  const budgetTotal = allCampagnes.reduce(
    (acc: number, campagne: any) => acc + Number(campagne.budget || 0),
    0
  );

  const campagnesActives = allCampagnes.filter(
    (campagne: any) => campagne.statut !== "Terminée"
  ).length;

  const publicationsMedias = allMedias.filter(
    (media: any) => media.statut === "Publié"
  ).length;

  const publicationsInfluenceurs = allInfluenceurs.filter(
    (influenceur: any) => influenceur.statut === "Publié"
  ).length;

  const audienceInfluenceurs = allInfluenceurs.reduce(
    (acc: number, influenceur: any) =>
      acc + Number(influenceur.audience || 0),
    0
  );

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
            Développement · LMG Music
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Campagnes</h1>

          <p className="mt-3 text-zinc-400">
            Pilotage des campagnes médias, influenceurs et sorties.
          </p>
        </div>

        <Link
          href="/campagnes/nouveau"
          className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-black hover:bg-zinc-200"
        >
          + Nouvelle campagne
        </Link>
      </header>
      <CampaignPortfolio campaigns={allCampagnes} publications={publicationsMedias + publicationsInfluenceurs} audience={audienceInfluenceurs} />
    </main>
  );
}
