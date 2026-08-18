import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/site",
        "/site/",
      ],
      disallow: [
        "/login",
        "/signup",
        "/dashboard",
        "/admin",
        "/artistes",
        "/projets",
        "/booking",
        "/medias",
        "/influenceurs",
        "/campagnes",
        "/contrats",
        "/splits",
        "/royalties",
        "/finances",
        "/taches",
        "/mes-taches",
        "/calendrier",
        "/rollout",
        "/drive",
        "/assistant",
        "/chat",
        "/equipe",
        "/api/",
      ],
    },
    sitemap: "https://legacymusicgroup.fr/sitemap.xml",
    host: "https://legacymusicgroup.fr",
  };
}