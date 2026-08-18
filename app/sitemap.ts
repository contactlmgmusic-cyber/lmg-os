import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://legacymusicgroup.fr";

  const [{ data: artists }, { data: releases }] = await Promise.all([
    supabase
      .from("artistes")
      .select("slug, updated_at")
      .eq("is_public", true)
      .not("slug", "is", null),

    supabase
      .from("projets")
      .select("slug, updated_at, date_sortie")
      .eq("is_public", true)
      .not("slug", "is", null),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/site`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/site/artistes`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/site/releases`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/site/services`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/site/team`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/site/rejoindre`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/site/mentions-legales`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/site/confidentialite`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const artistPages: MetadataRoute.Sitemap =
    artists?.map((artist) => ({
      url: `${baseUrl}/site/artistes/${artist.slug}`,
      lastModified: artist.updated_at
        ? new Date(artist.updated_at)
        : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    })) || [];

  const releasePages: MetadataRoute.Sitemap =
    releases?.map((release) => ({
      url: `${baseUrl}/site/projets/${release.slug}`,
      lastModified: release.updated_at
        ? new Date(release.updated_at)
        : release.date_sortie
          ? new Date(release.date_sortie)
          : undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    })) || [];

  return [
    ...staticPages,
    ...artistPages,
    ...releasePages,
  ];
}