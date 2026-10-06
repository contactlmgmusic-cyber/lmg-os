import type { MetadataRoute } from "next";
import { publicDomain } from "@/lib/public-domains.server";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { kind, origin } = await publicDomain();
  if (kind === "os" || kind === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/site/", "/careers/", "/artistportal/"] }, sitemap: `${origin}/sitemap.xml`, host: origin };
}
