"use client";

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
  titre: string | null;
  slug: string | null;
  type: string | null;
  cover_url: string | null;
  hero_image_url: string | null;
  date_sortie: string | null;
  featured: boolean | null;
  artistes: Artist | Artist[] | null;
};

type ArtistOption = {
  slug: string;
  nom: string;
};

type Props = {
  releases: Release[];
  artists: ArtistOption[];
  years: number[];
  types: string[];
  selectedArtist?: string;
  selectedYear?: string;
  selectedType?: string;
};

const copy = {
  en: {
    eyebrow: "LMG Music / Releases",
    title: "Releases",
    intro:
      "Explore the latest releases and catalogue from artists developed alongside LMG Music.",
    featured: "Featured release",
    discover: "Discover release",
    artist: "Artist",
    year: "Year",
    format: "Format",
    all: "All",
    reset: "Reset",
    upcoming: "Upcoming",
    release: "release",
    releases: "releases",
    empty: "No releases match these filters.",
    resetFilters: "Reset filters",
    unavailable: "Cover unavailable",
  },

  fr: {
    eyebrow: "LMG Music / Sorties",
    title: "Sorties",
    intro:
      "Découvrez les dernières sorties et le catalogue des artistes développés aux côtés de LMG Music.",
    featured: "À la une",
    discover: "Découvrir la sortie",
    artist: "Artiste",
    year: "Année",
    format: "Format",
    all: "Tous",
    reset: "Réinitialiser",
    upcoming: "À venir",
    release: "sortie",
    releases: "sorties",
    empty: "Aucune sortie ne correspond à ces filtres.",
    resetFilters: "Réinitialiser les filtres",
    unavailable: "Pochette indisponible",
  },
} as const;

function getArtist(artists: Artist | Artist[] | null) {
  return Array.isArray(artists) ? artists[0] : artists;
}

function buildFilterUrl({
  artist,
  year,
  type,
}: {
  artist?: string;
  year?: string;
  type?: string;
}) {
  const params = new URLSearchParams();

  if (artist) params.set("artist", artist);
  if (year) params.set("year", year);
  if (type) params.set("type", type);

  const query = params.toString();

  return query ? `/releases?${query}` : "/releases";
}

export default function ReleasesContent({
  releases,
  artists,
  years,
  types,
  selectedArtist,
  selectedYear,
  selectedType,
}: Props) {
  const { locale } = useSiteLanguage();
  const c = copy[locale];

  const hasActiveFilters = Boolean(
    selectedArtist || selectedYear || selectedType
  );

  const filteredReleases = releases.filter((release) => {
    const artist = getArtist(release.artistes);

    const releaseYear = release.date_sortie
      ? String(new Date(release.date_sortie).getFullYear())
      : null;

    if (selectedArtist && artist?.slug !== selectedArtist) return false;
    if (selectedYear && releaseYear !== selectedYear) return false;
    if (selectedType && release.type !== selectedType) return false;

    return true;
  });

  const featuredRelease = !hasActiveFilters
    ? filteredReleases.find((release) => release.featured === true)
    : null;

  const releasesByYear = filteredReleases.reduce<
    Record<string, Release[]>
  >((groups, release) => {
    const year = release.date_sortie
      ? String(new Date(release.date_sortie).getFullYear())
      : "upcoming";

    if (!groups[year]) groups[year] = [];

    groups[year].push(release);

    return groups;
  }, {});

  const groupedYears = Object.keys(releasesByYear).sort((a, b) => {
    if (a === "upcoming") return -1;
    if (b === "upcoming") return 1;

    return Number(b) - Number(a);
  });

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="border-b border-white/10 px-6 pb-16 pt-32 md:px-8 md:pb-20 md:pt-36">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
            {c.eyebrow}
          </p>

          <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 className="text-5xl font-semibold tracking-[-0.045em] md:text-6xl lg:text-7xl">
                {c.title}
              </h1>
            </div>

            <div className="lg:col-span-5 lg:pb-1">
              <p className="max-w-md text-base leading-7 text-white/50">
                {c.intro}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featuredRelease && (
        <section className="border-b border-white/10 px-6 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.featured}
            </p>

            <Link
              href={`/projets/${featuredRelease.slug}`}
              className="group grid overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950 lg:grid-cols-[58%_42%]"
            >
              <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[500px]">
                {featuredRelease.hero_image_url ||
                featuredRelease.cover_url ? (
                  <Image
                    src={
                      featuredRelease.hero_image_url ||
                      featuredRelease.cover_url ||
                      ""
                    }
                    alt={featuredRelease.titre || "LMG Music release"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-center transition duration-700 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/25">
                    {c.unavailable}
                  </div>
                )}
              </div>

              <div className="flex min-h-[330px] flex-col justify-between p-7 md:p-10 lg:p-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-500">
                    {featuredRelease.type || "Release"}
                  </p>

                  <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                    {featuredRelease.titre}
                  </h2>

                  <p className="mt-4 text-sm text-white/45">
                    {getArtist(featuredRelease.artistes)?.nom || ""}
                  </p>
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-sm font-medium text-white/70">
                    {c.discover}
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

      {/* FILTERS */}
      <section className="border-b border-white/10 px-6 py-10 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                {c.artist}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildFilterUrl({
                    year: selectedYear,
                    type: selectedType,
                  })}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    !selectedArtist
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {c.all}
                </Link>

                {artists.map((artist) => (
                  <Link
                    key={artist.slug}
                    href={buildFilterUrl({
                      artist:
                        selectedArtist === artist.slug
                          ? undefined
                          : artist.slug,
                      year: selectedYear,
                      type: selectedType,
                    })}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      selectedArtist === artist.slug
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {artist.nom}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                {c.year}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildFilterUrl({
                    artist: selectedArtist,
                    type: selectedType,
                  })}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    !selectedYear
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {c.all}
                </Link>

                {years.map((year) => (
                  <Link
                    key={year}
                    href={buildFilterUrl({
                      artist: selectedArtist,
                      year:
                        selectedYear === String(year)
                          ? undefined
                          : String(year),
                      type: selectedType,
                    })}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      selectedYear === String(year)
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </div>

            {types.length > 0 && (
              <div>
                <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                  {c.format}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildFilterUrl({
                      artist: selectedArtist,
                      year: selectedYear,
                    })}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      !selectedType
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {c.all}
                  </Link>

                  {types.map((type) => (
                    <Link
                      key={type}
                      href={buildFilterUrl({
                        artist: selectedArtist,
                        year: selectedYear,
                        type:
                          selectedType === type
                            ? undefined
                            : type,
                      })}
                      className={`rounded-full border px-4 py-2 text-xs capitalize transition ${
                        selectedType === type
                          ? "border-white bg-white text-black"
                          : "border-white/15 text-white/55 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {type}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-7 border-t border-white/10 pt-5">
              <Link
                href="/releases"
                className="text-xs font-medium text-white/40 transition hover:text-white"
              >
                {c.reset} ×
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          {filteredReleases.length > 0 ? (
            <div className="space-y-20">
              {groupedYears.map((year) => (
                <section key={year}>
                  <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-5">
                    <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                      {year === "upcoming" ? c.upcoming : year}
                    </h2>

                    <p className="text-xs text-white/30">
                      {releasesByYear[year].length}{" "}
                      {releasesByYear[year].length === 1
                        ? c.release
                        : c.releases}
                    </p>
                  </div>

                  <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {releasesByYear[year].map((release) => {
                      const artist = getArtist(release.artistes);

                      return (
                        <Link
                          key={release.id}
                          href={`/projets/${release.slug}`}
                          className="group"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-[1rem] bg-zinc-950">
                            {release.cover_url ? (
                              <Image
                                src={release.cover_url}
                                alt={release.titre || "LMG Music release"}
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
                              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                                <span>{release.type || "Release"}</span>

                                {release.date_sortie && (
                                  <>
                                    <span className="text-white/20">•</span>
                                    <span>
                                      {new Date(
                                        release.date_sortie
                                      ).getFullYear()}
                                    </span>
                                  </>
                                )}
                              </div>

                              <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] md:text-2xl">
                                {release.titre}
                              </h3>

                              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/35">
                                {artist?.nom || ""}
                              </p>
                            </div>

                            <span className="text-lg text-white/25 transition group-hover:translate-x-1 group-hover:text-yellow-500">
                              →
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-sm text-white/40">{c.empty}</p>

              <Link
                href="/releases"
                className="mt-6 inline-block text-sm font-medium text-yellow-500 transition hover:text-yellow-400"
              >
                {c.resetFilters} →
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
