import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { publicDomain } from "@/lib/public-domains.server";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { kind, origin } = await publicDomain();
  if (kind === "os" || kind === "preview") return [];
  const paths = kind === "careers" ? ["", "/jobs", "/spontaneous", "/faq", "/privacy"] : kind === "artist" ? [""] : ["", "/artistes", "/releases", "/about", "/services", "/team", "/news", "/press", "/contact", "/faq", "/mentions-legales", "/confidentialite", "/cookies"];
  const pages: MetadataRoute.Sitemap = paths.map(path => ({ url: `${origin}${path}`, changeFrequency: "weekly" }));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || kind === "artist") return pages;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  if (kind === "careers") {
    const { data, error } = await db.from("careers_jobs").select("slug").eq("status", "published");
    if (error) console.error("Careers sitemap unavailable", error.code);
    return [...pages, ...(data ?? []).map(job => ({ url: `${origin}/jobs/${encodeURIComponent(job.slug)}` }))];
  }
  const [artists, releases, news] = await Promise.all([
    db.from("public_artistes").select("slug").not("slug", "is", null),
    db.from("public_projets").select("slug").not("slug", "is", null),
    db.from("site_news").select("slug").eq("status", "published").neq("slug", "test"),
  ]);
  for (const result of [artists, releases, news]) if (result.error) console.error("Music sitemap source unavailable", result.error.code);
  return [...pages,
    ...(artists.data ?? []).map(row => ({ url: `${origin}/artistes/${encodeURIComponent(row.slug)}` })),
    ...(releases.data ?? []).map(row => ({ url: `${origin}/projets/${encodeURIComponent(row.slug)}` })),
    ...(news.data ?? []).map(row => ({ url: `${origin}/news/${encodeURIComponent(row.slug)}` })),
  ];
}
