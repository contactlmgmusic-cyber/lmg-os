import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://lmg-os-tupf.vercel.app",
      priority: 1,
    },
    {
      url: "https://lmg-os-tupf.vercel.app/site",
      priority: 0.9,
    },
  ];
}