import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatEuro(value?: number | null) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function formatNumber(value?: number | null) {
  return Number(value || 0).toLocaleString("fr-FR");
}

export default async function CampagneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: campagne, error } = await supabase
    .from("campagnes")
    .select(`
      *,
      artistes (
        id,
        nom,
        style,
        photo_url
      ),
      projets (
        id,
        titre,
        type,
        statut,
        date_sortie
      )
    `)
    .eq("id", id)
    .single();

  if (error || !campagne) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">Campagne introuvable.</p>
      </main>
    );
  }

  const { data: medias } = await supabase
    .from("medias")
    .select("*")
    .eq("projet_id", campagne.projet_id)
    .order("created_at", { ascending: false });

  const { data: influenceurs } = await supabase
    .from("influenceurs")
    .select("*")
    .eq("projet_id", campagne.projet_id)
    .order("created_at", { ascending: false });

  const allMedias = medias || [];
  const allInfluenceurs = influenceurs || [];

  const mediasPublies = allMedias.filter((media: any) => media.statut === "Publié").length;
  const influenceursPublies = allInfluenceurs.filter((item: any) => item.statut === "Publié").length;

  const audiencePotentielle = allInfluenceurs.reduce(
    (acc: number, item: any) => acc + Number(item.audience || 0),
    0
  );

  const budgetInfluence = allInfluenceurs.reduce(
    (acc: number, item: any) => acc + Number(item.tarif || 0),
    0
  );

  const totalActions = allMedias.length + allInfluenceurs.length;
  const actionsPubliees = mediasPublies + influenceursPublies;

  const progression =
    totalActions > 0 ? Math.round((actionsPubliees / totalActions) * 100) : 0;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href="/campagnes"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour campagnes
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {campagne.statut || "En préparation"}
          </p>

          <h1 className="mt-3 text-5xl font-bold">{campagne.titre}</h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            {campagne.objectif || "Aucun objectif renseigné."}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Budget campagne" value={formatEuro(campagne.budget)} />
            <KpiCard label="Budget influence" value={formatEuro(budgetInfluence)} />
            <KpiCard label="Médias liés" value={allMedias.length} />
            <KpiCard label="Influenceurs liés" value={allInfluenceurs.length} />
            <KpiCard label="Publications médias" value={mediasPublies} />
            <KpiCard label="Publications influence" value={influenceursPublies} />
            <KpiCard label="Audience potentielle" value={formatNumber(audiencePotentielle)} />
            <KpiCard label="Progression" value={`${progression}%`} />
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Progression campagne</h2>
              <p className="text-2xl font-bold">{progression}%</p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-green-400"
                style={{ width: `${progression}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              {actionsPubliees} / {totalActions} actions publiées.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes internes</h2>

            <p className="mt-4 leading-relaxed text-zinc-400">
              {campagne.notes || "Aucune note renseignée."}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Panel title="Médias de la campagne">
              {allMedias.length === 0 && (
                <p className="text-zinc-500">Aucun média lié au projet.</p>
              )}

              {allMedias.map((media: any) => (
                <Link
                  key={media.id}
                  href={`/medias/${media.id}`}
                  className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-600"
                >
                  <h3 className="text-lg font-semibold">{media.nom}</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    {media.type || "Média"} · {media.statut || "À contacter"}
                  </p>
                </Link>
              ))}
            </Panel>

            <Panel title="Influenceurs de la campagne">
              {allInfluenceurs.length === 0 && (
                <p className="text-zinc-500">Aucun influenceur lié au projet.</p>
              )}

              {allInfluenceurs.map((influenceur: any) => (
                <Link
                  key={influenceur.id}
                  href={`/influenceurs/${influenceur.id}`}
                  className="block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-600"
                >
                  <h3 className="text-lg font-semibold">{influenceur.nom}</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    {influenceur.plateforme || "Plateforme"} ·{" "}
                    {influenceur.statut || "À contacter"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Audience : {formatNumber(influenceur.audience)} · Tarif :{" "}
                    {formatEuro(influenceur.tarif)}
                  </p>
                </Link>
              ))}
            </Panel>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Projet lié</h2>

            {campagne.projets ? (
              <Link
                href={`/projets/${campagne.projets.id}`}
                className="mt-6 block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <p className="text-sm text-zinc-500">
                  {campagne.projets.type || "Projet"}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {campagne.projets.titre}
                </h3>

                <p className="mt-2 text-zinc-500">
                  {campagne.projets.date_sortie || "Date non renseignée"}
                </p>
              </Link>
            ) : (
              <p className="mt-5 text-zinc-500">Aucun projet lié.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Artiste lié</h2>

            {campagne.artistes ? (
              <Link
                href={`/artistes/${campagne.artistes.id}`}
                className="mt-6 block overflow-hidden rounded-2xl border border-zinc-800 bg-black hover:border-zinc-600"
              >
                <div className="h-48 bg-zinc-800">
                  {campagne.artistes.photo_url ? (
                    <img
                      src={campagne.artistes.photo_url}
                      alt={campagne.artistes.nom}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      Aucun visuel
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-bold">
                    {campagne.artistes.nom}
                  </h3>

                  <p className="mt-1 text-zinc-500">
                    {campagne.artistes.style || "Style non renseigné"}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="mt-5 text-zinc-500">Aucun artiste lié.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              <Link
                href="/medias/nouveau"
                className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
              >
                Ajouter média
              </Link>

              <Link
                href="/influenceurs/nouveau"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Ajouter influenceur
              </Link>

              <Link
                href="/campagnes"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Retour dashboard campagnes
              </Link>
            </div>
          </div>
        </aside>
      </div>
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
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-6">
      <h2 className="mb-5 text-2xl font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}