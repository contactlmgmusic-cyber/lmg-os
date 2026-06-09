import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://legacymusicgroup.fr",
      priority: 1,
    },
    {
      url: "https://legacymusicgroup.fr/site",
      priority: 0.9,
    },
  ];
}