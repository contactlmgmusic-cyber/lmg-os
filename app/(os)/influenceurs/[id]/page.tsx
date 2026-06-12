import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";

export const dynamic = "force-dynamic";

function formatNumber(value?: number | null) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function formatEuro(value?: number | null) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default async function InfluenceurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await requireRole(["super_admin", "admin", "manager"]);

  const { data: influenceur, error } = await supabase
    .from("influenceurs")
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
        statut
      )
    `)
    .eq("id", id)
    .single();

  if (error || !influenceur) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">Influenceur introuvable.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href="/influenceurs"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour CRM Influenceurs
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {influenceur.plateforme || "Plateforme"}
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            {influenceur.nom}
          </h1>

          <p className="mt-3 text-xl text-zinc-400">
            {influenceur.pseudo || "Pseudo non renseigné"}
          </p>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {influenceur.statut || "À contacter"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Audience</p>
              <p className="mt-2 text-xl font-semibold">
                {formatNumber(influenceur.audience)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Tarif estimé</p>
              <p className="mt-2 text-xl font-semibold">
                {formatEuro(influenceur.tarif)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Catégorie</p>
              <p className="mt-2 text-xl font-semibold">
                {influenceur.categorie || "Non renseignée"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Pays</p>
              <p className="mt-2 text-xl font-semibold">
                {influenceur.pays || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Email</p>
              <p className="mt-2 text-xl font-semibold break-all">
                {influenceur.email || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Téléphone</p>
              <p className="mt-2 text-xl font-semibold">
                {influenceur.telephone || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Prochaine relance</p>
              <p className="mt-2 text-xl font-semibold">
                {influenceur.prochaine_relance || "Non planifiée"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes</h2>

            <p className="mt-4 leading-relaxed text-zinc-400">
              {influenceur.notes || "Aucune note renseignée."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Artiste lié</h2>

            {influenceur.artistes ? (
              <Link
                href={`/artistes/${influenceur.artistes.id}`}
                className="mt-6 block overflow-hidden rounded-2xl border border-zinc-800 bg-black hover:border-zinc-600"
              >
                <div className="h-56 bg-zinc-800">
                  {influenceur.artistes.photo_url ? (
                    <img
                      src={influenceur.artistes.photo_url}
                      alt={influenceur.artistes.nom}
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
                    {influenceur.artistes.nom}
                  </h3>

                  <p className="mt-1 text-zinc-500">
                    {influenceur.artistes.style || "Style non renseigné"}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="mt-5 text-zinc-500">Aucun artiste lié.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Projet lié</h2>

            {influenceur.projets ? (
              <Link
                href={`/projets/${influenceur.projets.id}`}
                className="mt-6 block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <p className="text-sm text-zinc-500">
                  {influenceur.projets.type || "Projet"}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {influenceur.projets.titre}
                </h3>

                <p className="mt-2 text-zinc-500">
                  {influenceur.projets.statut || "Statut non renseigné"}
                </p>
              </Link>
            ) : (
              <p className="mt-5 text-zinc-500">Aucun projet lié.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              {influenceur.email && (
                <a
                  href={`mailto:${influenceur.email}`}
                  className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
                >
                  Envoyer un email
                </a>
              )}

              <Link
                href={`/influenceurs/${influenceur.id}/modifier`}
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Modifier influenceur
              </Link>

              <Link
                href="/influenceurs"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Retour pipeline
              </Link>

<Link
  href={`/influenceurs/${influenceur.id}/supprimer`}
  className="block rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-center font-medium text-red-400 hover:bg-red-500/20"
>
  Supprimer influenceur
</Link>

            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}