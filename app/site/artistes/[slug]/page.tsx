import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArtistDetailContent from "@/components/site/ArtistDetailContent";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data } = await supabase
    .from("public_artistes")
    .select("nom, bio, photo_url, spotify_image_url")
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const artist = data?.[0];

  if (!artist) {
    return {
      title: "Artist | LMG Music",
    };
  }

  const description =
    artist.bio?.slice(0, 160) ||
    `Discover ${artist.nom}, an artist developed alongside LMG Music.`;

  const image =
    artist.photo_url ||
    artist.spotify_image_url;

  return {
    title: `${artist.nom} | LMG Music`,
    description,

    alternates: {
      canonical: `/artistes/${slug}`,
    },

    openGraph: {
      title: `${artist.nom} | LMG Music`,
      description,
      url: `https://www.lmgmusic.fr/artistes/${slug}`,
      siteName: "LMG Music",
      type: "profile",
      images: image
        ? [
            {
              url: image,
              alt: artist.nom || "LMG Music artist",
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: `${artist.nom} | LMG Music`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: artistData } = await supabase
    .from("public_artistes")
    .select(`
      id,
      nom,
      slug,
      style,
      ville,
      bio,
      instagram,
      tiktok,
      spotify_url,
      spotify,
      youtube_url,
      youtube,
      apple_music,
      deezer,
      photo_url,
      spotify_image_url,
      youtube_image_url
    `)
    .eq("slug", slug)
    .eq("is_public", true)
    .limit(1);

  const artist = artistData?.[0];

  if (!artist) {
    notFound();
  }

  const { data: projects } = await supabase
    .from("public_projets")
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
    .eq("artiste_id", artist.id)
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("date_sortie", { ascending: false });

  const spotifyLink =
    artist.spotify_url ||
    artist.spotify;

  const youtubeLink =
    artist.youtube_url ||
    artist.youtube;

  const artistImage =
    artist.photo_url ||
    artist.spotify_image_url ||
    artist.youtube_image_url;

  const artistJsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.nom,
    description:
      artist.bio ||
      "Artist developed alongside LMG Music.",
    url: `https://www.lmgmusic.fr/artistes/${slug}`,
    image: artistImage || undefined,
    sameAs: [
      spotifyLink,
      youtubeLink,
      artist.instagram,
      artist.tiktok,
      artist.apple_music,
      artist.deezer,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(artistJsonLd),
        }}
      />

      <ArtistDetailContent
        artist={artist}
        projects={projects || []}
      />
    </>
  );
}
