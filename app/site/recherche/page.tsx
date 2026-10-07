import { publicReleaseArtist } from "@/lib/public-release-artist";
import type { Metadata } from "next";

import MusicSearchContent from "@/components/site/MusicSearchContent";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Search | LMG Music",
  description:
    "Search artists, releases, news and pages across LMG Music.",
  alternates: {
    canonical: "/recherche",
  },
};

type SearchItem = {
  id: string;
  type: "artist" | "release" | "news" | "page";
  title: string;
  subtitle?: string | null;
  href: string;
  keywords?: string;
};

function getArtist(artistes: any) {
  if (Array.isArray(artistes)) {
    return artistes[0];
  }

  return artistes;
}

export default async function MusicSearchPage() {
  const [artistsResponse, releasesResponse, newsResponse] =
    await Promise.all([
      supabase
        .from("public_artistes")
        .select("id, nom, slug, style, ville")
        .eq("is_public", true)
        .not("slug", "is", null),

      supabase
        .from("public_projets")
        .select(
          "id, titre, slug, type, date_sortie, artistes"
        )
        .eq("is_public", true)
        .not("slug", "is", null),

      supabase
        .from("site_news")
        .select(
          "id, slug, title_fr, title_en, excerpt_fr, excerpt_en, status, published_at"
        )
        .eq("status", "published")
    .neq("slug", "test")
        .order("published_at", { ascending: false }),
    ]);

  const items: SearchItem[] = [];

  for (const artist of artistsResponse.data || []) {
    items.push({
      id: String(artist.id),
      type: "artist",
      title: artist.nom || "LMG Music Artist",
      subtitle: [artist.style, artist.ville]
        .filter(Boolean)
        .join(" · "),
      href: `/artistes/${artist.slug}`,
      keywords: [
        "artist",
        "artiste",
        "roster",
        artist.style,
        artist.ville,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  for (const release of releasesResponse.data || []) {
    const artist = getArtist(publicReleaseArtist(release.artistes, release.slug));

    items.push({
      id: String(release.id),
      type: "release",
      title: release.titre || "LMG Music Release",
      subtitle: [artist?.nom, release.type]
        .filter(Boolean)
        .join(" · "),
      href: `/projets/${release.slug}`,
      keywords: [
        "release",
        "sortie",
        "music",
        "musique",
        release.type,
        artist?.nom,
        release.date_sortie
          ? new Date(release.date_sortie)
              .getFullYear()
              .toString()
          : null,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  for (const article of newsResponse.data || []) {
    items.push({
      id: String(article.id),
      type: "news",
      title:
        article.title_en ||
        article.title_fr ||
        "LMG Music News",
      subtitle:
        article.excerpt_en ||
        article.excerpt_fr ||
        null,
      href: `/news/${article.slug}`,
      keywords: [
        "news",
        "actualite",
        "actualites",
        article.title_fr,
        article.title_en,
        article.excerpt_fr,
        article.excerpt_en,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  const pages: SearchItem[] = [
    {
      id: "about",
      type: "page",
      title: "About LMG Music",
      subtitle: "À propos de LMG Music",
      href: "/about",
      keywords:
        "about à propos vision identity identité LMG Music",
    },
    {
      id: "what-we-do",
      type: "page",
      title: "What We Do",
      subtitle: "Nos activités",
      href: "/about/what-we-do",
      keywords:
        "artist development développement artistique management production strategy stratégie services activités",
    },
    {
      id: "live",
      type: "page",
      title: "Live & Entertainment",
      subtitle: "Performances, showcases and live experiences",
      href: "/about/live",
      keywords:
        "live entertainment booking performance showcase concert scène",
    },
    {
      id: "team",
      type: "page",
      title: "Team",
      subtitle: "L'équipe LMG Music",
      href: "/team",
      keywords:
        "team équipe people personnes LMG Music",
    },
    {
      id: "artists",
      type: "page",
      title: "Artists",
      subtitle: "Artistes LMG Music",
      href: "/artistes",
      keywords:
        "artists artistes roster talents LMG Music",
    },
    {
      id: "releases",
      type: "page",
      title: "Releases",
      subtitle: "Sorties LMG Music",
      href: "/releases",
      keywords:
        "releases sorties music musique catalogue discography discographie",
    },
    {
      id: "news",
      type: "page",
      title: "Newsroom",
      subtitle: "Actualités LMG Music",
      href: "/news",
      keywords:
        "news actualités newsroom annonces LMG Music",
    },
    {
      id: "faq",
      type: "page",
      title: "FAQ",
      subtitle: "Questions & answers",
      href: "/faq",
      keywords:
        "faq questions answers réponses aide help",
    },
    {
      id: "contact",
      type: "page",
      title: "Contact",
      subtitle: "Contact LMG Music",
      href: "/contact",
      keywords:
        "contact email partnership partenariat media presse business",
    },
    {
      id: "project",
      type: "page",
      title: "Present a project",
      subtitle: "Présenter un projet",
      href: "/rejoindre",
      keywords:
        "present project présenter projet submit music artiste candidature rejoindre",
    },
  ];

  items.push(...pages);

  return <MusicSearchContent items={items} />;
}
