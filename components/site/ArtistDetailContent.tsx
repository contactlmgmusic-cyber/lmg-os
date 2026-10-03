"use client";

import Image from "next/image";
import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

type Project = {
  id: string;
  titre: string | null;
  slug: string | null;
  type: string | null;
  cover_url: string | null;
  hero_image_url: string | null;
  date_sortie: string | null;
  description: string | null;
  credits: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  apple_music_url: string | null;
};

type Artist = {
  id: string;
  nom: string | null;
  slug: string | null;
  style: string | null;
  ville: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  spotify_url: string | null;
  spotify: string | null;
  youtube_url: string | null;
  youtube: string | null;
  apple_music: string | null;
  deezer: string | null;
  photo_url: string | null;
  spotify_image_url: string | null;
  youtube_image_url: string | null;
};

const copy = {
  en: {
    back: "All artists",
    latestEyebrow: "Latest release",
    latestTitle: "Latest release",
    discoverRelease: "Discover release",
    discographyEyebrow: "Discography",
    discographyTitle: "Releases",
    biography: "Biography",
    aboutArtist: "About the artist",
    noBio: "Artist developed alongside LMG Music.",
    unavailable: "Image unavailable",
    bookingEyebrow: "Booking & collaborations",
    bookingTitle: "Work with",
    bookingText:
      "For booking, media, collaborations, partnerships and professional enquiries, contact the LMG Music team.",
    contact: "Contact LMG Music",
  },

  fr: {
    back: "Tous les artistes",
    latestEyebrow: "Dernière sortie",
    latestTitle: "Dernière sortie",
    discoverRelease: "Découvrir la sortie",
    discographyEyebrow: "Discographie",
    discographyTitle: "Les sorties",
    biography: "Biographie",
    aboutArtist: "À propos de l’artiste",
    noBio: "Artiste développé aux côtés de LMG Music.",
    unavailable: "Image indisponible",
    bookingEyebrow: "Booking & collaborations",
    bookingTitle: "Travailler avec",
    bookingText:
      "Pour toute demande de booking, média, collaboration, partenariat ou demande professionnelle, contactez l’équipe LMG Music.",
    contact: "Contacter LMG Music",
  },
} as const;

function formatDate(date: string, locale: "en" | "fr") {
  return new Intl.DateTimeFormat(
    locale === "fr" ? "fr-FR" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}

export default function ArtistDetailContent({
  artist,
  projects,
}: {
  artist: Artist;
  projects: Project[];
}) {
  const { locale } = useSiteLanguage();
  const c = copy[locale];

  const spotifyLink = artist.spotify_url || artist.spotify;
  const youtubeLink = artist.youtube_url || artist.youtube;

  const artistImage =
    artist.photo_url ||
    artist.spotify_image_url ||
    artist.youtube_image_url;

  const latestProject = projects[0];
  const latestImage =
    latestProject?.hero_image_url || latestProject?.cover_url;

  const platforms = [
    ["Spotify", spotifyLink],
    ["Apple Music", artist.apple_music],
    ["Deezer", artist.deezer],
    ["YouTube", youtubeLink],
    ["Instagram", artist.instagram],
    ["TikTok", artist.tiktok],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        {artistImage && (
          <Image
            src={artistImage}
            alt=""
            fill
            priority
            className="scale-110 object-cover object-center opacity-15 blur-3xl"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/70 to-black" />

        <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-32 md:px-8 md:pb-24 md:pt-36">
          <Link
            href="/artistes"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/45 transition hover:text-white"
          >
            ← {c.back}
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950">
                {artistImage ? (
                  <Image
                    src={artistImage}
                    alt={artist.nom || "LMG Music artist"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/25">
                    {c.unavailable}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 lg:pl-8">
              <div className="flex flex-wrap items-center gap-3">
                {artist.style && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                    {artist.style}
                  </span>
                )}

                {artist.style && artist.ville && (
                  <span className="text-white/20">•</span>
                )}

                {artist.ville && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {artist.ville}
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-6xl lg:text-7xl">
                {artist.nom}
              </h1>

              {platforms.length > 0 && (
                <div className="mt-9 flex flex-wrap gap-2">
                  {platforms.map(([label, href], index) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        index === 0
                          ? "rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-yellow-500"
                          : "rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-white/65 transition hover:border-white/40 hover:text-white"
                      }
                    >
                      {label}
                    </a>
                  ))}
                </div>
              )}

              {artist.bio && (
                <p className="mt-10 max-w-xl line-clamp-4 text-sm leading-7 text-white/45">
                  {artist.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LATEST RELEASE */}
      {latestProject && (
        <section className="border-b border-white/10 px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                  {c.latestEyebrow}
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                  {c.latestTitle}
                </h2>
              </div>

              <span className="hidden text-xs text-white/30 md:block">
                LMG Music
              </span>
            </div>

            <Link
              href={`/projets/${latestProject.slug}`}
              className="group grid overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950 lg:grid-cols-2"
            >
              <div className="relative aspect-square overflow-hidden lg:aspect-auto lg:min-h-[500px]">
                {latestImage ? (
                  <Image
                    src={latestImage}
                    alt={latestProject.titre || "LMG Music release"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition duration-700 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/25">
                    {c.unavailable}
                  </div>
                )}
              </div>

              <div className="flex min-h-[360px] flex-col justify-between p-7 md:p-10 lg:p-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-500">
                    {latestProject.type || "Release"}
                  </p>

                  <h3 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                    {latestProject.titre}
                  </h3>

                  {latestProject.date_sortie && (
                    <p className="mt-4 text-xs uppercase tracking-[0.14em] text-white/35">
                      {formatDate(latestProject.date_sortie, locale)}
                    </p>
                  )}

                  {latestProject.description && (
                    <p className="mt-8 max-w-lg line-clamp-4 text-sm leading-7 text-white/45">
                      {latestProject.description}
                    </p>
                  )}
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-sm font-medium text-white/70">
                    {c.discoverRelease}
                  </span>

                  <span className="text-xl text-white/30 transition group-hover:translate-x-1 group-hover:text-yellow-500">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* DISCOGRAPHY */}
      {projects.length > 0 && (
        <section className="border-b border-white/10 px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.discographyEyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              {c.discographyTitle}
            </h2>

            <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projets/${project.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[1rem] bg-zinc-950">
                    {project.cover_url ? (
                      <Image
                        src={project.cover_url}
                        alt={project.titre || "LMG Music release"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/25">
                        {c.unavailable}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                        {project.type || "Release"}
                      </p>

                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                        {project.titre}
                      </h3>

                      {project.date_sortie && (
                        <p className="mt-2 text-xs text-white/30">
                          {formatDate(project.date_sortie, locale)}
                        </p>
                      )}
                    </div>

                    <span className="text-lg text-white/25 transition group-hover:translate-x-1 group-hover:text-yellow-500">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BIOGRAPHY */}
      <section className="border-b border-white/10 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.biography}
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              {c.aboutArtist}
            </h2>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <p className="whitespace-pre-line text-base leading-8 text-white/60 md:text-lg md:leading-9">
              {artist.bio || c.noBio}
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-7 md:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.bookingEyebrow}
            </p>

            <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                  {c.bookingTitle} {artist.nom}
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
                  {c.bookingText}
                </p>
              </div>

              <div className="lg:col-span-4 lg:text-right">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-yellow-500"
                >
                  {c.contact}
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
