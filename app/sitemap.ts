import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://legacymusicgroup.fr";

  return [
    {
      url: baseUrl,
      priority: 1,
    },
    {
      url: `${baseUrl}/site`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/site/services`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/site/team`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/site/rejoindre`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/site/mentions-legales`,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/site/confidentialite`,
      priority: 0.5,
    },
  ];
}