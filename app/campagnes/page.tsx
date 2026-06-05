import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("fr-FR");
}

export default async function CampagnesPage() {
  const { data: campagnes, error } = await supabase
    .from("campagnes")
    .select(`
      *,
      artistes (
        id,
        nom
      ),
      projets (
        id,
        titre
      )
    `)
    .order("created_at", { ascending: false });

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
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Marketing
          </p>

          <h1 className="text-5xl font-bold">Dashboard Campagnes</h1>

          <p className="mt-3 text-zinc-400">
            Pilotage des campagnes médias, influenceurs et sorties.
          </p>
        </div>

        <Link
          href="/campagnes/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouvelle campagne
        </Link>
      </div>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Campagnes" value={allCampagnes.length} />
        <KpiCard label="Actives" value={campagnesActives} />
        <KpiCard label="Budget total" value={formatEuro(budgetTotal)} />
        <KpiCard
          label="Publications"
          value={publicationsMedias + publicationsInfluenceurs}
        />
        <KpiCard
          label="Audience potentielle"
          value={formatNumber(audienceInfluenceurs)}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {allCampagnes.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-zinc-500">Aucune campagne créée.</p>
          </div>
        )}

        {allCampagnes.map((campagne: any) => (
          <Link
            key={campagne.id}
            href={`/campagnes/${campagne.id}`}
            className="block rounded-3xl border border-zinc-800 bg-zinc-900 p-8 hover:border-zinc-600"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                  {campagne.statut || "En préparation"}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {campagne.titre}
                </h2>
              </div>

              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                {formatEuro(Number(campagne.budget || 0))}
              </span>
            </div>

            <div className="space-y-2 text-sm text-zinc-400">
              <p>
                Artiste : {campagne.artistes?.nom || "Non lié"}
              </p>

              <p>
                Projet : {campagne.projets?.titre || "Non lié"}
              </p>

              <p>
                Période : {campagne.date_debut || "?"} →{" "}
                {campagne.date_fin || "?"}
              </p>
            </div>

            {campagne.objectif && (
              <p className="mt-5 rounded-2xl bg-black p-4 text-sm text-zinc-300">
                {campagne.objectif}
              </p>
            )}
          </Link>
        ))}
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}