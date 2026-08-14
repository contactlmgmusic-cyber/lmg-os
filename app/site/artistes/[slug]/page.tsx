import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data } = await supabase
    .from("artistes")
    .select("nom, bio, photo_url, spotify_image_url")
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const artiste = data?.[0];

  if (!artiste) {
    return {
      title: "Artiste introuvable | Legacy Music Group",
    };
  }

  const description =
    artiste.bio?.slice(0, 160) ||
    `Découvrez ${artiste.nom} accompagné par Legacy Music Group.`;

  const image = artiste.photo_url || artiste.spotify_image_url;

  return {
    title: `${artiste.nom} | Legacy Music Group`,
    description,
    openGraph: {
      title: `${artiste.nom} | Legacy Music Group`,
      description,
      images: image
        ? [
            {
              url: image,
              alt: artiste.nom || "Artiste Legacy Music Group",
            },
          ]
        : [],
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: artisteData } = await supabase
    .from("artistes")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const artiste = artisteData?.[0];

  if (!artiste) {
    notFound();
  }

  const spotifyLink = artiste.spotify_url || artiste.spotify;
  const youtubeLink = artiste.youtube_url || artiste.youtube;

  const artistImage =
    artiste.photo_url ||
    artiste.spotify_image_url ||
    artiste.youtube_image_url;

  const { data: projets } = await supabase
    .from("projets")
    .select(`
      id,
      titre,
      slug,
      type,
      cover_url,
      hero_image_url,
      date_sortie,
      description,
      credits,
      spotify_url,
      youtube_url,
      apple_music_url
    `)
    .eq("artiste_id", artiste.id)
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("date_sortie", { ascending: false });

  const latestProject = projets?.[0];
  const discography = projets || [];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO ARTISTE */}
      <section className="relative min-h-screen overflow-hidden">
        {artistImage && (
          <Image
            src={artistImage}
            alt=""
            fill
            priority
            className="scale-110 object-cover object-center opacity-35 blur-3xl"
          />
        )}

        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/30" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32 md:px-8">
          <div className="grid w-full gap-12 lg:grid-cols-[48%_52%] lg:items-center">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl">
              {artistImage ? (
                <Image
                  src={artistImage}
                  alt={artiste.nom || "Artiste LMG"}
                  fill
                  priority
                  className="object-cover object-center transition duration-700 hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  Photo indisponible
                </div>
              )}
            </div>

            <div>
              <Link
                href="/site#artists"
                className="text-sm text-white/60 transition hover:text-white"
              >
                ← Retour aux artistes
              </Link>

              <p className="mt-12 text-sm uppercase tracking-[0.4em] text-yellow-500">
                {artiste.style || "Artist"}
              </p>

              <h1 className="mt-4 text-6xl font-black uppercase leading-none md:text-8xl xl:text-9xl">
                {artiste.nom}
              </h1>

              <div className="mt-7 h-[2px] w-24 bg-yellow-500" />

              {artiste.ville && (
                <p className="mt-7 text-xl text-zinc-300">
                  {artiste.ville}
                </p>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                {spotifyLink && (
                  <a
                    href={spotifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
                  >
                    Spotify
                  </a>
                )}

                {artiste.apple_music && (
                  <a
                    href={artiste.apple_music}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm transition hover:border-yellow-500"
                  >
                    Apple Music
                  </a>
                )}

                {artiste.deezer && (
                  <a
                    href={artiste.deezer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm transition hover:border-yellow-500"
                  >
                    Deezer
                  </a>
                )}

                {youtubeLink && (
                  <a
                    href={youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm transition hover:border-yellow-500"
                  >
                    YouTube
                  </a>
                )}

                {artiste.instagram && (
                  <a
                    href={artiste.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm transition hover:border-yellow-500"
                  >
                    Instagram
                  </a>
                )}

                {artiste.tiktok && (
                  <a
                    href={artiste.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm transition hover:border-yellow-500"
                  >
                    TikTok
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DERNIÈRE SORTIE */}
      {latestProject && (
        <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-28 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                Latest Release
              </p>

              <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
                Dernière sortie
              </h2>
            </div>

            <Link
              href={`/site/projets/${latestProject.slug}`}
              className="group relative block min-h-[560px] overflow-hidden rounded-[2rem] border border-zinc-800 bg-black"
            >
              {latestProject.hero_image_url || latestProject.cover_url ? (
                <Image
                  src={latestProject.hero_image_url || latestProject.cover_url}
                  alt={latestProject.titre || "Release LMG"}
                  fill
                  className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

              <div className="relative z-10 flex min-h-[560px] max-w-3xl flex-col justify-end p-8 md:p-14">
                <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                  {latestProject.type || "Release"}
                </p>

                <h3 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
                  {latestProject.titre}
                </h3>

                {latestProject.date_sortie && (
                  <p className="mt-5 text-zinc-300">
                    {new Date(
                      latestProject.date_sortie
                    ).toLocaleDateString("fr-FR")}
                  </p>
                )}

                <p className="mt-8 font-semibold text-white">
                  Découvrir la sortie →
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* DISCOGRAPHIE */}
      {discography.length > 0 && (
        <section className="border-t border-zinc-900 px-6 py-28 md:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Discography
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              Toutes les sorties
            </h2>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {discography.map((project) => (
                <Link
                  key={project.id}
                  href={`/site/projets/${project.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-zinc-900">
                    {project.cover_url ? (
                      <Image
                        src={project.cover_url}
                        alt={project.titre || "Release LMG"}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        No Cover
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  </div>

                  <div className="pt-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
                      {project.type || "Release"}
                    </p>

                    <h3 className="mt-2 text-2xl font-black uppercase transition group-hover:text-yellow-500">
                      {project.titre}
                    </h3>

                    {project.date_sortie && (
                      <p className="mt-2 text-sm text-zinc-500">
                        {new Date(
                          project.date_sortie
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BIOGRAPHIE */}
      <section className="border-t border-zinc-900 px-6 py-28 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[30%_70%]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Biography
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-5xl">
              L&apos;artiste
            </h2>
          </div>

          <div>
            <p className="whitespace-pre-line text-lg leading-9 text-zinc-300 md:text-xl">
              {artiste.bio ||
                artiste.notes ||
                "Artiste accompagné par Legacy Music Group."}
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING / CONTACT */}
      <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-28 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Booking & collaborations
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            Travailler avec {artiste.nom}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Booking, médias, collaborations, partenariats ou demandes
            professionnelles : contactez directement Legacy Music Group.
          </p>

          <a
            href="mailto:contact@legacymusicgroup.fr"
            className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
          >
            Contacter LMG
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}