import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("projets")
    .select(`
      *,
      artistes (
        nom,
        slug,
        style,
        photo_url
      )
    `)
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .limit(1);

  const projet = data?.[0];

  if (!projet || error) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-28">
        <Link
          href="/site"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Retour au site
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[45%_55%]">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-zinc-900">
            {projet.cover_url ? (
              <Image
                src={projet.cover_url}
                alt={projet.titre || "Projet LMG"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-600">
                Cover indisponible
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              {projet.type || "Release"}
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase md:text-7xl">
              {projet.titre}
            </h1>

            <div className="mt-6 h-[2px] w-24 bg-yellow-500" />

            <p className="mt-6 text-xl text-zinc-300">
              {projet.artistes?.nom || "Legacy Music Group"}
            </p>

            <p className="mt-3 text-zinc-500">
              Sortie prévue :{" "}
              {projet.date_sortie
                ? new Date(projet.date_sortie).toLocaleDateString("fr-FR")
                : "Non renseignée"}
            </p>

            <p className="mt-8 whitespace-pre-line text-lg leading-8 text-zinc-300">
              {projet.notes ||
                "Projet développé et accompagné par Legacy Music Group."}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {projet.artistes?.slug && (
                <Link
                  href={`/site/artistes/${projet.artistes.slug}`}
                  className="rounded-full border border-zinc-700 px-6 py-3 transition hover:border-yellow-500"
                >
                  Voir l'artiste
                </Link>
              )}

              <Link
                href="/site#contact"
                className="rounded-full bg-yellow-500 px-6 py-3 font-bold text-black transition hover:bg-yellow-400"
              >
                Contacter LMG
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-zinc-900 pt-16">
          <h2 className="text-3xl font-black uppercase">
            À propos du projet
          </h2>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-zinc-400">
            {projet.notes ||
              "Ce projet fait partie du développement artistique accompagné par Legacy Music Group. Plus d’informations seront bientôt disponibles."}
          </p>
        </div>
      </section>
    </main>
  );
}