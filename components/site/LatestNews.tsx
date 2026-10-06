"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

type Article = {
  id: string; slug: string; title_fr: string | null; title_en: string | null;
  excerpt_fr: string | null; excerpt_en: string | null; image_url: string | null;
  published_at: string | null;
};

export default function LatestNews() {
  const { locale, t } = useSiteLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.from("site_news")
        .select("id, slug, title_fr, title_en, excerpt_fr, excerpt_en, image_url, published_at")
        .eq("status", "published").neq("slug", "test").not("slug", "is", null)
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false }).limit(3);
      if (active) { setArticles(data || []); setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);
  return (
    <section className="border-t border-zinc-900 bg-[#070707] px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-xs tracking-[0.2em] text-yellow-500">{t.home.newsEyebrow}</p>
            <h2 className="text-3xl font-medium md:text-5xl">{t.home.newsTitle}</h2>
          </div>
          <Link href="/news" className="border-b border-yellow-500 pb-2 text-sm text-zinc-300">{t.home.newsAll} ↗</Link>
        </div>
        {loading ? <p className="text-zinc-400">{locale === "fr" ? "Chargement des actualités…" : "Loading news…"}</p> : articles.length ? (
          <div className="grid gap-8 md:grid-cols-3">
            {articles.map(article => {
              const title = locale === "fr" ? article.title_fr || article.title_en : article.title_en || article.title_fr;
              const excerpt = locale === "fr" ? article.excerpt_fr || article.excerpt_en : article.excerpt_en || article.excerpt_fr;
              return (
                <Link key={article.id} href={`/news/${article.slug}`} className="group rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500">
                  {article.image_url && <div className="relative aspect-[16/10] overflow-hidden"><Image src={article.image_url} alt={title || "LMG Music"} fill className="object-cover" /></div>}
                  {article.published_at && <time dateTime={article.published_at} className="mt-5 block text-xs text-zinc-400">{new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.published_at))}</time>}
                  <h3 className="mt-4 text-2xl font-semibold group-hover:text-yellow-500">{title}</h3>
                  {excerpt && <p className="mt-4 text-sm leading-7 text-zinc-400">{excerpt}</p>}
                  <span className="mt-5 inline-block text-sm text-zinc-300">{locale === "fr" ? "Lire l’article" : "Read article"} ↗</span>
                </Link>
              );
            })}
          </div>
        ) : <p className="py-8 text-zinc-400">{t.home.newsEmpty}</p>}
      </div>
    </section>
  );
}
