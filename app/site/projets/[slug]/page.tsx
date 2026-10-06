import { publicReleaseArtist } from "@/lib/public-release-artist";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ReleaseDetailContent from "@/components/site/ReleaseDetailContent";
import { supabase } from "@/lib/supabase";

type Artist = {
  nom?: string | null;
  slug?: string | null;
  style?: string | null;
  ville?: string | null;
  photo_url?: string | null;
  spotify_image_url?: string | null;
  youtube_image_url?: string | null;
};

function getArtist(artists: Artist | Artist[] | null) {
  return Array.isArray(artists) ? artists[0] : artists;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data } = await supabase
    .from("public_projets")
    .select(`
      titre,
      description,
      cover_url,
      hero_image_url,
      artistes
    `)
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const release = data?.[0];

  if (!release) {
    return {
      title: "Release not found | LMG Music",
    };
  }

  const artist = getArtist(publicReleaseArtist(release.artistes, slug));

  const description =
    release.description?.slice(0, 160) ||
    `Discover ${release.titre}${
      artist?.nom ? ` by ${artist.nom}` : ""
    } on LMG Music.`;

  const image = release.hero_image_url || release.cover_url;

  const title = `${release.titre}${
    artist?.nom ? ` — ${artist.nom}` : ""
  } | LMG Music`;

  return {
    title,
    description,

    alternates: {
      canonical: `/projets/${slug}`,
    },

    openGraph: {
      title,
      description,
      url: `https://www.lmgmusic.fr/projets/${slug}`,
      siteName: "LMG Music",
      type: "website",
      images: image
        ? [
            {
              url: image,
              alt: release.titre || "LMG Music release",
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
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
    .from("public_projets")
    .select(`
      id,
      artiste_id,
      titre,
      slug,
      type,
      cover_url,
      hero_image_url,
      date_sortie,
      description,
      credits,
      spotify_url,
      apple_music_url,
      youtube_url,
      artistes
    `)
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const release = data?.[0];

  if (!release) {
    notFound();
  }

  const artist = getArtist(publicReleaseArtist(release.artistes, slug));

  const { data: otherReleases } = release.artiste_id
    ? await supabase
        .from("public_projets")
        .select(`
          id,
          titre,
          slug,
          cover_url,
          date_sortie,
          type
        `)
        .eq("artiste_id", release.artiste_id)
        .eq("is_public", true)
        .neq("id", release.id)
        .not("slug", "is", null)
        .order("date_sortie", { ascending: false })
        .limit(3)
    : { data: [] };

  const releaseJsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: release.titre,
    description:
      release.description || "Release published by LMG Music.",
    url: `https://www.lmgmusic.fr/projets/${slug}`,
    image:
      release.cover_url ||
      release.hero_image_url ||
      undefined,
    datePublished: release.date_sortie || undefined,

    byArtist: artist?.nom
      ? {
          "@type": "MusicGroup",
          name: artist.nom,
          url: artist.slug
            ? `https://www.lmgmusic.fr/artistes/${artist.slug}`
            : undefined,
        }
      : undefined,

    sameAs: [
      release.spotify_url,
      release.apple_music_url,
      release.youtube_url,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(releaseJsonLd),
        }}
      />

      <ReleaseDetailContent
        release={release}
        otherReleases={otherReleases || []}
      />
    </>
  );
}
