import { publicReleaseArtist } from "@/lib/public-release-artist";
import type { Metadata } from "next";

import ReleasesContent from "@/components/site/ReleasesContent";
import { supabase } from "@/lib/supabase";

type SearchParams = Promise<{
  artist?: string;
  year?: string;
  type?: string;
}>;

type ArtistRelation = {
  nom?: string | null;
  slug?: string | null;
};

function getArtist(artists: ArtistRelation | ArtistRelation[] | null) {
  return Array.isArray(artists) ? artists[0] : artists;
}

export const metadata: Metadata = {
  title: "Releases | LMG Music",
  description:
    "Explore the latest releases and catalogue from artists developed alongside LMG Music.",
  alternates: {
    canonical: "/releases",
  },
};

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = await searchParams;

  const { data } = await supabase
    .from("public_projets")
    .select(`
      id,
      titre,
      slug,
      type,
      cover_url,
      hero_image_url,
      date_sortie,
      featured,
      artistes
    `)
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("date_sortie", { ascending: false });

  const releases = data || [];

  const artistsMap = new Map<string, string>();

  releases.forEach((release) => {
    const artist = getArtist(publicReleaseArtist(release.artistes, release.slug));

    if (artist?.nom) {
      artistsMap.set(artist.slug || artist.nom, artist.nom);
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
        .filter((year): year is number => year !== null)
    )
  ).sort((a, b) => b - a);

  const types = Array.from(
    new Set(
      releases
        .map((release) => release.type)
        .filter((type): type is string => Boolean(type))
    )
  );

  return (
    <ReleasesContent
      releases={releases}
      artists={artists}
      years={years}
      types={types}
      selectedArtist={filters.artist}
      selectedYear={filters.year}
      selectedType={filters.type}
    />
  );
}
