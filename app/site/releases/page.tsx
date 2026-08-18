import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Metadata } from "next";

type SearchParams = Promise<{
  artist?: string;
  year?: string;
  type?: string;
}>;

function getArtist(artistes: any) {
  if (Array.isArray(artistes)) {
    return artistes[0];
  }

  return artistes;
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

  return query ? `/site/releases?${query}` : "/site/releases";
}

export const metadata: Metadata = {
  title: "Releases | Legacy Music Group",
  description:
    "Découvrez les dernières sorties et le catalogue des artistes Legacy Music Group.",
  alternates: {
    canonical: "https://legacymusicgroup.fr/site/releases",
  },
};

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = await searchParams;

  const selectedArtist = filters.artist;
  const selectedYear = filters.year;
  const selectedType = filters.type;

  const { data } = await supabase
    .from("projets")
    .select(`
      id,
      titre,
      slug,
      type,
      cover_url,
      hero_image_url,
      date_sortie,
      featured,
      artistes (
        nom,
        slug
      )
    `)
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("date_sortie", { ascending: false });

  const releases = data || [];

  // ─────────────────────────────────────
  // OPTIONS DE FILTRES
  // ─────────────────────────────────────

  const artistsMap = new Map<string, string>();

  releases.forEach((release) => {
    const artist = getArtist(release.artistes);

    if (artist?.slug && artist?.nom) {
      artistsMap.set(artist.slug, artist.nom);
    }
  });

  const artists = Array.from(artistsMap.entries()).map(
    ([slug, nom]) => ({
      slug,
      nom,
    })
  );

  const years = Array.from(
    new Set(
      releases
        .map((release) =>
          release.date_sortie
            ? new Date(release.date_sortie).getFullYear()
            : null
        )
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a));

  const types = Array.from(
    new Set(
      releases
        .map((release) => release.type)
        .filter(Boolean)
    )
  );

  // ─────────────────────────────────────
  // FILTRAGE
  // ─────────────────────────────────────

  const filteredReleases = releases.filter((release) => {
    const artist = getArtist(release.artistes);

    const releaseYear = release.date_sortie
      ? String(new Date(release.date_sortie).getFullYear())
      : null;

    if (
      selectedArtist &&
      artist?.slug !== selectedArtist
    ) {
      return false;
    }

    if (
      selectedYear &&
      releaseYear !== selectedYear
    ) {
      return false;
    }

    if (
      selectedType &&
      release.type !== selectedType
    ) {
      return false;
    }

    return true;
  });

  const hasActiveFilters =
    selectedArtist ||
    selectedYear ||
    selectedType;

  // ─────────────────────────────────────
  // FEATURED
  // ─────────────────────────────────────

  const featuredRelease = !hasActiveFilters
    ? filteredReleases.find(
        (release) => release.featured === true
      )
    : null;

  // ─────────────────────────────────────
  // GROUPES PAR ANNÉE
  // ─────────────────────────────────────

  const releasesByYear = filteredReleases.reduce(
    (
      groups: Record<string, typeof filteredReleases>,
      release
    ) => {
      const year = release.date_sortie
        ? String(
            new Date(
              release.date_sortie
            ).getFullYear()
          )
        : "À venir";

      if (!groups[year]) {
        groups[year] = [];
      }

      groups[year].push(release);

      return groups;
    },
    {}
  );

  const groupedYears = Object.keys(
    releasesByYear
  ).sort((a, b) => {
    if (a === "À venir") return -1;
    if (b === "À venir") return 1;

    return Number(b) - Number(a);
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="border-b border-zinc-900 px-6 pb-20 pt-36 md:px-8 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/site"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Retour au site
          </Link>

          <p className="mt-16 text-sm uppercase tracking-[0.4em] text-yellow-500">
            Legacy Music Group
          </p>

          <h1 className="mt-5 text-6xl font-black uppercase leading-none md:text-8xl">
            Releases
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Découvrez les sorties des artistes accompagnés
            par Legacy Music Group.
          </p>
        </div>
      </section>

      {/* FEATURED RELEASE */}
      {featuredRelease && (
        <section className="border-b border-zinc-900 bg-zinc-950 px-6 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-8 text-sm uppercase tracking-[0.35em] text-yellow-500">
              Featured Release
            </p>

            <Link
              href={`/site/projets/${featuredRelease.slug}`}
              className="group relative block min-h-[520px] overflow-hidden rounded-[2rem] border border-zinc-800 bg-black"
            >
              {featuredRelease.hero_image_url ||
              featuredRelease.cover_url ? (
                <Image
                  src={
                    featuredRelease.hero_image_url ||
                    featuredRelease.cover_url
                  }
                  alt={
                    featuredRelease.titre ||
                    "Release LMG"
                  }
                  fill
                  priority
                  className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

              <div className="relative z-10 flex min-h-[520px] max-w-3xl flex-col justify-end p-8 md:p-14">
                <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                  {featuredRelease.type || "Release"}
                </p>

                <h2 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
                  {featuredRelease.titre}
                </h2>

                <p className="mt-5 text-xl text-zinc-300">
                  {getArtist(
                    featuredRelease.artistes
                  )?.nom || "Legacy Music Group"}
                </p>

                <span className="mt-8 font-semibold">
                  Découvrir la sortie →
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* FILTRES */}
<section className="border-b border-zinc-900 px-6 py-10 md:px-8">
  <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">

      {/* ARTISTES */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          Artiste
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildFilterUrl({
              year: selectedYear,
              type: selectedType,
            })}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              !selectedArtist
                ? "border-yellow-500 bg-yellow-500 text-black"
                : "border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-white"
            }`}
          >
            Tous
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
              className={`rounded-full border px-5 py-2 text-sm transition ${
                selectedArtist === artist.slug
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-white"
              }`}
            >
              {artist.nom}
            </Link>
          ))}
        </div>
      </div>

      {/* ANNÉES */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          Année
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildFilterUrl({
              artist: selectedArtist,
              type: selectedType,
            })}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              !selectedYear
                ? "border-yellow-500 bg-yellow-500 text-black"
                : "border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-white"
            }`}
          >
            Toutes
          </Link>

          {years.map((year) => (
            <Link
              key={String(year)}
              href={buildFilterUrl({
                artist: selectedArtist,
                year:
                  selectedYear === String(year)
                    ? undefined
                    : String(year),
                type: selectedType,
              })}
              className={`rounded-full border px-5 py-2 text-sm transition ${
                selectedYear === String(year)
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-white"
              }`}
            >
              {year}
            </Link>
          ))}
        </div>
      </div>

      {/* TYPES */}
      {types.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            Format
          </p>

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildFilterUrl({
                artist: selectedArtist,
                year: selectedYear,
              })}
              className={`rounded-full border px-5 py-2 text-sm transition ${
                !selectedType
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-white"
              }`}
            >
              Tous
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
                className={`rounded-full border px-5 py-2 text-sm capitalize transition ${
                  selectedType === type
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-white"
                }`}
              >
                {type}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* RESET */}
      {hasActiveFilters && (
        <Link
          href="/site/releases"
          className="pb-2 text-xs uppercase tracking-[0.2em] text-zinc-500 transition hover:text-white"
        >
          Réinitialiser ×
        </Link>
      )}
    </div>
  </div>
</section>

      {/* CATALOGUE */}
      <section className="px-6 pb-24 pt-14 md:px-8 md:pb-28 md:pt-16">
        <div className="mx-auto max-w-7xl">
          {filteredReleases.length > 0 ? (
            <div className="space-y-28">
              {groupedYears.map((year) => (
                <section key={year}>
                  <div className="mb-12 flex items-end justify-between border-b border-zinc-900 pb-6">
                    <h2 className="text-5xl font-black uppercase md:text-7xl">
                      {year}
                    </h2>

                    <p className="text-sm text-zinc-500">
                      {releasesByYear[year].length}{" "}
                      {releasesByYear[year].length > 1
                        ? "sorties"
                        : "sortie"}
                    </p>
                  </div>

                  <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                    {releasesByYear[year].map(
                      (release) => {
                        const artist = getArtist(
                          release.artistes
                        );

                        return (
                          <Link
                            key={release.id}
                            href={`/site/projets/${release.slug}`}
                            className="group"
                          >
                            <div className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-zinc-900 bg-zinc-900 transition duration-500 group-hover:border-zinc-700">
                              {release.cover_url ? (
                                <Image
                                  src={release.cover_url}
                                  alt={
                                    release.titre ||
                                    "Release LMG"
                                  }
                                  fill
                                  className="object-cover transition duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-zinc-600">
                                  No Cover
                                </div>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                            </div>

                            <div className="pt-5">
  <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
    <span>{release.type || "Release"}</span>

    {release.date_sortie && (
      <>
        <span className="text-zinc-700">•</span>

        <span>
          {new Date(release.date_sortie).getFullYear()}
        </span>
      </>
    )}
  </div>

  <h3 className="mt-3 text-3xl font-black uppercase leading-none text-white transition duration-300 group-hover:text-yellow-500">
    {release.titre}
  </h3>

  <div className="mt-3 flex items-center justify-between gap-4">
    <p className="text-sm uppercase tracking-[0.18em] text-zinc-400">
      {artist?.nom || "Legacy Music Group"}
    </p>

    <span className="translate-x-2 text-sm text-zinc-600 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100">
      Découvrir →
    </span>
  </div>
</div>
                          </Link>
                        );
                      }
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-xl text-zinc-400">
                Aucune sortie ne correspond à ces filtres.
              </p>

              <Link
                href="/site/releases"
                className="mt-8 inline-block text-yellow-500 hover:text-yellow-400"
              >
                Réinitialiser les filtres
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}