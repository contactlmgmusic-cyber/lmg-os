"use client";

import { publicReleaseArtist } from "@/lib/public-release-artist";
import Image from "next/image";
import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

type Artist = {
  nom?: string | null;
  slug?: string | null;
  style?: string | null;
  ville?: string | null;
  photo_url?: string | null;
  spotify_image_url?: string | null;
  youtube_image_url?: string | null;
};

type Release = {
  id: string;
  artiste_id: string | null;
  titre: string | null;
  slug: string | null;
  type: string | null;
  cover_url: string | null;
  hero_image_url: string | null;
  date_sortie: string | null;
  description: string | null;
  credits: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  youtube_url: string | null;
  artistes: Artist | Artist[] | null;
};

type OtherRelease = {
  id: string;
  titre: string | null;
  slug: string | null;
  cover_url: string | null;
  date_sortie: string | null;
  type: string | null;
};

type Props = {
  release: Release;
  otherReleases: OtherRelease[];
};

const copy = {
  en: {
    back: "Back to releases",
    outNow: "Out now",
    comingSoon: "Coming soon",
    listenNow: "Listen now",
    discoverRelease: "Discover release",
    listen: "Listen",
    listenTitle: "Listen to the release",
    about: "About the release",
    aboutTitle: "About this project",
    fallbackDescription: "A project developed alongside LMG Music.",
    credits: "Credits",
    artist: "Artist",
    artistDescription: (name: string) =>
      `Discover ${name}'s world, discography and projects with LMG Music.`,
    artistCta: "Discover the artist",
    other: "Other releases",
    otherTitle: "More from this artist",
    allReleases: "View all releases",
    contactEyebrow: "LMG Music",
    contactTitle: "Booking, media & collaborations",
    contactText:
      "For professional enquiries regarding this release or artist, contact the LMG Music team.",
    contact: "Contact LMG Music",
    unavailable: "Cover unavailable",
  },

  fr: {
    back: "Retour aux releases",
    outNow: "Disponible",
    comingSoon: "À venir",
    listenNow: "Écouter maintenant",
    discoverRelease: "Découvrir la sortie",
    listen: "Écouter",
    listenTitle: "Écouter la sortie",
    about: "À propos",
    aboutTitle: "À propos du projet",
    fallbackDescription: "Un projet développé aux côtés de LMG Music.",
    credits: "Crédits",
    artist: "Artiste",
    artistDescription: (name: string) =>
      `Découvrez l'univers, la discographie et les projets de ${name} avec LMG Music.`,
    artistCta: "Découvrir l'artiste",
    other: "Autres sorties",
    otherTitle: "À découvrir aussi",
    allReleases: "Voir toutes les sorties",
    contactEyebrow: "LMG Music",
    contactTitle: "Booking, médias & collaborations",
    contactText:
      "Pour toute demande professionnelle autour de cette sortie ou de l'artiste, contactez l'équipe LMG Music.",
    contact: "Contacter LMG Music",
    unavailable: "Cover indisponible",
  },
} as const;

function getArtist(artists: Artist | Artist[] | null) {
  return Array.isArray(artists) ? artists[0] : artists;
}

export default function ReleaseDetailContent({
  release,
  otherReleases,
}: Props) {
  const { locale } = useSiteLanguage();
  const c = copy[locale];

  const artist = getArtist(publicReleaseArtist(release.artistes, release.slug));

  const heroImage = release.hero_image_url || release.cover_url;

  const artistImage =
    artist?.photo_url ||
    artist?.spotify_image_url ||
    artist?.youtube_image_url ||
    null;

  const releaseDate = release.date_sortie
    ? new Date(release.date_sortie).toLocaleDateString(
        locale === "fr" ? "fr-FR" : "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : null;

  const releaseYear = release.date_sortie
    ? new Date(release.date_sortie).getFullYear()
    : null;

  const isReleased = release.date_sortie
    ? new Date(release.date_sortie) <= new Date()
    : false;

  const mainListenUrl =
    release.spotify_url ||
    release.apple_music_url ||
    release.youtube_url;

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}

        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1200px] items-end px-6 pb-16 pt-32 md:px-8 md:pb-20">
          <div className="max-w-3xl">
            <Link
              href="/releases"
              className="text-xs font-medium text-white/45 transition hover:text-white"
            >
              ← {c.back}
            </Link>

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                {release.type || "Release"}
              </span>

              {releaseYear && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
                    {releaseYear}
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.045em] md:text-6xl lg:text-7xl">
              {release.titre}
            </h1>

            {artist?.nom && (
              <Link
                href={artist.slug ? `/artistes/${artist.slug}` : "#"}
                className="mt-6 inline-block text-base font-medium text-white/65 transition hover:text-yellow-500 md:text-lg"
              >
                {artist.nom}
              </Link>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <span
                className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
                  isReleased
                    ? "border-yellow-500/70 text-yellow-500"
                    : "border-white/20 text-white/60"
                }`}
              >
                {isReleased ? c.outNow : c.comingSoon}
              </span>

              {releaseDate && (
                <span className="text-sm text-white/40">
                  {releaseDate}
                </span>
              )}
            </div>

            {mainListenUrl && (
              <a
                href={mainListenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-yellow-500"
              >
                {isReleased ? c.listenNow : c.discoverRelease}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* LISTEN */}
      {(release.spotify_url ||
        release.apple_music_url ||
        release.youtube_url) && (
        <section className="border-b border-white/10 px-6 py-12 md:px-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                {c.listen}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] md:text-3xl">
                {c.listenTitle}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {release.spotify_url && (
                <a
                  href={release.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Spotify
                </a>
              )}

              {release.apple_music_url && (
                <a
                  href={release.apple_music_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Apple Music
                </a>
              )}

              {release.youtube_url && (
                <a
                  href={release.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-zinc-950">
            {release.cover_url ? (
              <Image
                src={release.cover_url}
                alt={release.titre || "LMG Music release"}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/25">
                {c.unavailable}
              </div>
            )}
          </div>

          <div className="lg:pt-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.about}
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              {c.aboutTitle}
            </h2>

            <p className="mt-7 max-w-2xl whitespace-pre-line text-base leading-8 text-white/55 md:text-lg">
              {release.description || c.fallbackDescription}
            </p>

            {release.credits && (
              <div className="mt-10 border-t border-white/10 pt-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/35">
                  {c.credits}
                </p>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/45">
                  {release.credits}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ARTIST */}
      {artist?.nom && (
        <section className="border-y border-white/10 bg-zinc-950/50 px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.artist}
            </p>

            <div className="mt-7 grid overflow-hidden rounded-[1.5rem] border border-white/10 bg-black lg:grid-cols-[42%_58%]">
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 lg:aspect-auto lg:min-h-[520px]">
                {artistImage ? (
                  <Image
                    src={artistImage}
                    alt={artist.nom}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/25">
                    {artist.nom}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center p-7 md:p-10 lg:p-14">
                {artist.style && (
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                    {artist.style}
                  </p>
                )}

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl lg:text-5xl">
                  {artist.nom}
                </h2>

                {artist.ville && (
                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-white/30">
                    {artist.ville}
                  </p>
                )}

                <p className="mt-6 max-w-xl text-base leading-8 text-white/50">
                  {c.artistDescription(artist.nom)}
                </p>

                {artist.slug && (
                  <Link
                    href={`/artistes/${artist.slug}`}
                    className="mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-medium transition hover:border-yellow-500 hover:text-yellow-500"
                  >
                    {c.artistCta}
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* OTHER RELEASES */}
      {otherReleases.length > 0 && (
        <section className="px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                  {c.other}
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                  {c.otherTitle}
                </h2>
              </div>

              <Link
                href="/releases"
                className="text-xs font-medium text-white/40 transition hover:text-white"
              >
                {c.allReleases} →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherReleases.map((item) => (
                <Link
                  key={item.id}
                  href={`/projets/${item.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[1rem] bg-zinc-950">
                    {item.cover_url ? (
                      <Image
                        src={item.cover_url}
                        alt={item.titre || "LMG Music release"}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/25">
                        {c.unavailable}
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                      <span>{item.type || "Release"}</span>

                      {item.date_sortie && (
                        <>
                          <span className="text-white/20">•</span>
                          <span>
                            {new Date(item.date_sortie).getFullYear()}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] transition group-hover:text-yellow-500 md:text-2xl">
                      {item.titre}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className="border-t border-white/10 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
            {c.contactEyebrow}
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            {c.contactTitle}
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/45 md:text-base">
            {c.contactText}
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-yellow-500"
          >
            {c.contact}
          </Link>
        </div>
      </section>
    </main>
  );
}
