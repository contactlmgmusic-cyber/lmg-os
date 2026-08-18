import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

function getArtist(artistes: any) {
  if (Array.isArray(artistes)) {
    return artistes[0];
  }

  return artistes;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data } = await supabase
    .from("projets")
    .select(`
      titre,
      description,
      cover_url,
      hero_image_url,
      artistes (
        nom
      )
    `)
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const projet = data?.[0];

  if (!projet) {
    return {
      title: "Release introuvable | Legacy Music Group",
    };
  }

  const artist = getArtist(projet.artistes);

  const description =
    projet.description?.slice(0, 160) ||
    `Découvrez ${projet.titre}${
      artist?.nom ? ` de ${artist.nom}` : ""
    } sur Legacy Music Group.`;

  const image = projet.hero_image_url || projet.cover_url;

  return {
  title: `${projet.titre}${
    artist?.nom ? ` — ${artist.nom}` : ""
  } | Legacy Music Group`,

  description,

  alternates: {
    canonical: `https://legacymusicgroup.fr/site/projets/${slug}`,
  },

  openGraph: {
    title: `${projet.titre}${
      artist?.nom ? ` — ${artist.nom}` : ""
    } | Legacy Music Group`,
    description,
    url: `https://legacymusicgroup.fr/site/projets/${slug}`,
    siteName: "Legacy Music Group",
    type: "music.song",
    images: image
      ? [
          {
            url: image,
            alt: projet.titre || "Release Legacy Music Group",
          },
        ]
      : [],
  },

  twitter: {
    card: "summary_large_image",
    title: `${projet.titre}${
      artist?.nom ? ` — ${artist.nom}` : ""
    } | Legacy Music Group`,
    description,
    images: image ? [image] : [],
  },
};
}

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
        id,
        nom,
        slug,
        style,
        photo_url,
        spotify_image_url
      )
    `)
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const projet = data?.[0];

  if (!projet) {
    notFound();
  }

  const artist = getArtist(projet.artistes);

  const releaseDate = projet.date_sortie
    ? new Date(projet.date_sortie).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const releaseYear = projet.date_sortie
    ? new Date(projet.date_sortie).getFullYear()
    : null;

  const isReleased = projet.date_sortie
    ? new Date(projet.date_sortie) <= new Date()
    : false;

  const heroImage = projet.hero_image_url || projet.cover_url;

  const mainListenUrl =
    projet.spotify_url ||
    projet.apple_music_url ||
    projet.youtube_url;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[760px] overflow-hidden border-b border-zinc-900">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/35" />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl items-end px-6 pb-20 pt-36 md:px-8 md:pb-24">
          <div className="max-w-4xl">
            <Link
              href="/site/releases"
              className="text-sm text-white/60 transition hover:text-white"
            >
              ← Retour aux releases
            </Link>

            <div className="mt-16 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-500">
                {projet.type || "Release"}
              </span>

              {releaseYear && (
                <>
                  <span className="text-zinc-700">•</span>

                  <span className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                    {releaseYear}
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-5 text-6xl font-black uppercase leading-[0.9] md:text-8xl xl:text-9xl">
              {projet.titre}
            </h1>

            {artist?.nom && (
              <Link
                href={
                  artist.slug
                    ? `/site/artistes/${artist.slug}`
                    : "#"
                }
                className="mt-7 inline-block text-xl font-medium uppercase tracking-[0.25em] text-zinc-300 transition hover:text-yellow-500"
              >
                {artist.nom}
              </Link>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span
                className={`rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                  isReleased
                    ? "border-yellow-500 text-yellow-500"
                    : "border-white/20 text-white/70"
                }`}
              >
                {isReleased ? "Out Now" : "Coming Soon"}
              </span>

              {releaseDate && (
                <span className="text-sm text-zinc-400">
                  {releaseDate}
                </span>
              )}
            </div>

            {mainListenUrl && (
              <a
                href={mainListenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
              >
                {isReleased ? "Écouter maintenant" : "Découvrir la sortie"}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ECOUTER */}
      {(projet.spotify_url ||
        projet.apple_music_url ||
        projet.youtube_url) && (
        <section className="border-b border-zinc-900 px-6 py-16 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                Listen
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase md:text-4xl">
                Écouter la sortie
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {projet.spotify_url && (
                <a
                  href={projet.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
                >
                  Spotify
                </a>
              )}

              {projet.apple_music_url && (
                <a
                  href={projet.apple_music_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
                >
                  Apple Music
                </a>
              )}

              {projet.youtube_url && (
                <a
                  href={projet.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* A PROPOS + COVER */}
      <section className="px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[42%_58%] lg:items-start">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950">
            {projet.cover_url ? (
              <Image
                src={projet.cover_url}
                alt={projet.titre || "Cover release LMG"}
                fill
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-600">
                Cover indisponible
              </div>
            )}
          </div>

          <div className="lg:pl-8">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              About the release
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              À propos du projet
            </h2>

            <p className="mt-8 whitespace-pre-line text-lg leading-9 text-zinc-300 md:text-xl">
              {projet.description ||
                projet.notes ||
                "Projet développé et accompagné par Legacy Music Group."}
            </p>

            {projet.credits && (
              <div className="mt-12 border-t border-zinc-900 pt-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                  Credits
                </p>

                <p className="mt-5 whitespace-pre-line leading-8 text-zinc-400">
                  {projet.credits}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ARTISTE */}
      {artist && (
        <section className="border-y border-zinc-900 bg-zinc-950 px-6 py-24 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Artist
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-[38%_62%] lg:items-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-zinc-900">
                {artist.photo_url || artist.spotify_image_url ? (
                  <Image
                    src={
                      artist.photo_url ||
                      artist.spotify_image_url
                    }
                    alt={artist.nom || "Artiste LMG"}
                    fill
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600">
                    Photo indisponible
                  </div>
                )}
              </div>

              <div>
                {artist.style && (
                  <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                    {artist.style}
                  </p>
                )}

                <h2 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
                  {artist.nom}
                </h2>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
                  Découvrez l&apos;univers, la discographie et les projets de{" "}
                  {artist.nom} au sein de Legacy Music Group.
                </p>

                {artist.slug && (
                  <Link
                    href={`/site/artistes/${artist.slug}`}
                    className="mt-9 inline-block rounded-full border border-zinc-700 px-7 py-3 font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
                  >
                    Découvrir l&apos;artiste →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AUTRES SORTIES */}
      <OtherReleases
        currentProjectId={projet.id}
        artistId={projet.artiste_id}
      />

      {/* CONTACT */}
      <section className="border-t border-zinc-900 px-6 py-28 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Legacy Music Group
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            Booking, médias & collaborations
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Pour toute demande professionnelle autour de cette sortie ou de
            l&apos;artiste, contactez Legacy Music Group.
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

async function OtherReleases({
  currentProjectId,
  artistId,
}: {
  currentProjectId: string;
  artistId: string | null;
}) {
  if (!artistId) {
    return null;
  }

  const { data: releases } = await supabase
    .from("projets")
    .select(`
      id,
      titre,
      slug,
      cover_url,
      date_sortie,
      type
    `)
    .eq("artiste_id", artistId)
    .eq("is_public", true)
    .neq("id", currentProjectId)
    .not("slug", "is", null)
    .order("date_sortie", { ascending: false })
    .limit(3);

  if (!releases || releases.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-24 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Other Releases
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              Découvrez aussi
            </h2>
          </div>

          <Link
            href="/site/releases"
            className="text-sm font-semibold text-zinc-400 transition hover:text-yellow-500"
          >
            Voir toutes les sorties →
          </Link>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <Link
              key={release.id}
              href={`/site/projets/${release.slug}`}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-zinc-900 bg-zinc-900 transition duration-500 group-hover:border-zinc-700">
                {release.cover_url ? (
                  <Image
                    src={release.cover_url}
                    alt={release.titre || "Release LMG"}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600">
                    No Cover
                  </div>
                )}
              </div>

              <div className="pt-5">
                <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  <span>{release.type || "Release"}</span>

                  {release.date_sortie && (
                    <>
                      <span className="text-zinc-700">•</span>

                      <span>
                        {new Date(
                          release.date_sortie
                        ).getFullYear()}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="mt-3 text-3xl font-black uppercase leading-none transition group-hover:text-yellow-500">
                  {release.titre}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}