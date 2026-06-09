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

  const { data } = await supabase
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
    .eq("slug", slug)
    .limit(1);

  const projet = data?.[0];

  if (!projet) notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-28">
        {projet.cover_url && (
          <Image
            src={projet.cover_url}
            alt={projet.titre || "Projet LMG"}
            fill
            className="absolute inset-0 object-cover opacity-20 blur-2xl"
          />
        )}

        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Link href="/site#releases" className="text-sm text-zinc-400 hover:text-white">
            ← Retour aux releases
          </Link>

          <div className="mt-12 grid gap-12 lg:grid-cols-[42%_58%]">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900">
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

              <h1 className="mt-4 text-5xl font-black uppercase md:text-8xl">
                {projet.titre}
              </h1>

              <div className="mt-6 h-[2px] w-24 bg-yellow-500" />

              <p className="mt-6 text-xl text-zinc-300">
                {projet.artistes?.nom || "Legacy Music Group"}
              </p>

              <p className="mt-3 text-zinc-500">
                Sortie :{" "}
                {projet.date_sortie
                  ? new Date(projet.date_sortie).toLocaleDateString("fr-FR")
                  : "Non renseignée"}
              </p>

              <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-8 text-zinc-300">
                {projet.description ||
                  projet.notes ||
                  "Projet développé et accompagné par Legacy Music Group."}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                {projet.spotify_url && (
                  <a href={projet.spotify_url} target="_blank" className="rounded-full bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400">
                    Spotify
                  </a>
                )}

                {projet.youtube_url && (
                  <a href={projet.youtube_url} target="_blank" className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    YouTube
                  </a>
                )}

                {projet.apple_music_url && (
                  <a href={projet.apple_music_url} target="_blank" className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    Apple Music
                  </a>
                )}

                {projet.artistes?.slug && (
                  <Link href={`/site/artistes/${projet.artistes.slug}`} className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    Voir l’artiste
                  </Link>
                )}
              </div>
            </div>
          </div>

          {projet.credits && (
            <section className="mt-24 rounded-[2rem] border border-zinc-800 bg-black/70 p-8">
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
                Credits
              </p>

              <p className="whitespace-pre-line text-lg leading-8 text-zinc-300">
                {projet.credits}
              </p>
            </section>
          )}

          <OtherReleases currentProjectId={projet.id} artistId={projet.artiste_id} />

        </div>
      </section>
    </main>
  );
}
async function OtherReleases({
  currentProjectId,
  artistId,
}: {
  currentProjectId: string;
  artistId: string | null;
}) {
  if (!artistId) return null;

  const { data: releases } = await supabase
    .from("projets")
    .select("id, titre, slug, cover_url, date_sortie, type")
    .eq("artiste_id", artistId)
    .neq("id", currentProjectId)
    .limit(3);

  if (!releases || releases.length === 0) return null;

  return (
    <section className="mt-24">
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
        Other Releases
      </p>

      <h2 className="text-4xl font-black">Autres sorties</h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {releases.map((release) => (
          <Link
            key={release.id}
            href={release.slug ? `/site/projets/${release.slug}` : "#"}
            className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-black transition hover:border-yellow-500"
          >
            <div className="relative aspect-square bg-zinc-900">
              {release.cover_url ? (
                <Image
                  src={release.cover_url}
                  alt={release.titre || "Release LMG"}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  No Cover
                </div>
              )}
            </div>

            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
                {release.type || "Release"}
              </p>

              <h3 className="mt-3 text-2xl font-black">{release.titre}</h3>

              <p className="mt-2 text-sm text-zinc-500">
                {release.date_sortie || "Date à venir"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}