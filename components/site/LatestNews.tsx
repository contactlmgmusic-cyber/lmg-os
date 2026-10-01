"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

type NewsArticle = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  category_fr: string | null;
  category_en: string | null;
  image_url: string | null;
  featured: boolean;
  published_at: string | null;
};

export default function LatestNews() {
  const { locale, t } = useSiteLanguage();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadNews() {
      const { data, error } = await supabase
        .from("site_news")
        .select(`
          id,
          slug,
          title_fr,
          title_en,
          excerpt_fr,
          excerpt_en,
          category_fr,
          category_en,
          image_url,
          featured,
          published_at
        `)
        .eq("status", "published")
        .not("slug", "is", null)
        .order("featured", { ascending: false })
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .limit(3);

      if (!active) return;

      if (error) {
        console.error(
          "Impossible de charger les actualités LMG Music:",
          error
        );

        setArticles([]);
      } else {
        setArticles((data || []) as NewsArticle[]);
      }

      setLoading(false);
    }

    loadNews();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-t border-zinc-900 bg-black px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-yellow-500">
              {t.home.newsEyebrow}
            </p>

            <h2 className="text-3xl font-semibold uppercase tracking-[-0.025em] md:text-5xl">
              {t.home.newsTitle}
            </h2>
          </div>

          <Link
            href="/news"
            className="hidden text-sm font-semibold text-zinc-400 transition hover:text-yellow-500 md:block"
          >
            {t.home.newsAll} ↗
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item}>
                <div className="aspect-[16/10] animate-pulse rounded-[1.5rem] bg-zinc-900" />
                <div className="mt-5 h-3 w-24 animate-pulse rounded bg-zinc-900" />
                <div className="mt-4 h-6 w-4/5 animate-pulse rounded bg-zinc-900" />
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="mt-12 grid gap-x-7 gap-y-12 md:grid-cols-3">
              {articles.map((article) => {
                const title =
                  locale === "en"
                    ? article.title_en || article.title_fr
                    : article.title_fr || article.title_en;

                const excerpt =
                  locale === "en"
                    ? article.excerpt_en || article.excerpt_fr
                    : article.excerpt_fr || article.excerpt_en;

                const category =
                  locale === "en"
                    ? article.category_en ||
                      article.category_fr ||
                      "News"
                    : article.category_fr ||
                      article.category_en ||
                      "Actualité";

                const date = article.published_at
                  ? new Date(
                      article.published_at
                    ).toLocaleDateString(
                      locale === "en" ? "en-GB" : "fr-FR",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : null;

                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-zinc-900 bg-zinc-950">
                      {article.image_url ? (
                        <Image
                          src={article.image_url}
                          alt={title || "LMG Music"}
                          fill
                          className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-700">
                            LMG Music
                          </span>
                        </div>
                      )}

                      {article.featured && (
                        <div className="absolute left-4 top-4 rounded-full bg-yellow-500 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-black">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="pt-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                          {category}
                        </span>

                        {date && (
                          <>
                            <span className="text-zinc-700">
                              •
                            </span>

                            <span className="text-xs text-zinc-600">
                              {date}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.02em] transition group-hover:text-yellow-500 md:text-2xl">
                        {title}
                      </h3>

                      {excerpt && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500">
                          {excerpt}
                        </p>
                      )}

                      <p className="mt-5 text-xs font-semibold text-zinc-300 transition group-hover:text-yellow-500">
                        {locale === "en"
                          ? "Read story"
                          : "Lire l’actualité"}{" "}
                        ↗
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/news"
              className="mt-12 inline-flex text-sm font-semibold text-zinc-400 transition hover:text-yellow-500 md:hidden"
            >
              {t.home.newsAll} ↗
            </Link>
          </>
        ) : (
          <div className="mt-12 border-y border-zinc-900 py-16">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-600">
              {t.home.newsEmpty}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
