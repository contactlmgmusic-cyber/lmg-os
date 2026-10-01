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

  const [article, setArticle] = useState<NewsArticle | null>(null);
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
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error(
          "Impossible de charger la dernière actualité:",
          error
        );
        setArticle(null);
      } else {
        setArticle(data as NewsArticle | null);
      }

      setLoading(false);
    }

    loadNews();

    return () => {
      active = false;
    };
  }, []);

  const title = article
    ? locale === "en"
      ? article.title_en || article.title_fr
      : article.title_fr || article.title_en
    : "";

  const excerpt = article
    ? locale === "en"
      ? article.excerpt_en || article.excerpt_fr
      : article.excerpt_fr || article.excerpt_en
    : "";

  const category = article
    ? locale === "en"
      ? article.category_en ||
        article.category_fr ||
        "News"
      : article.category_fr ||
        article.category_en ||
        "Actualité"
    : "";

  const date =
    article?.published_at
      ? new Intl.DateTimeFormat(
          locale === "en" ? "en-GB" : "fr-FR",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        ).format(new Date(article.published_at))
      : null;

  return (
    <section className="border-t border-zinc-900 bg-[#070707] px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
              {t.home.newsEyebrow}
            </p>

            <h2 className="text-3xl font-medium tracking-[-0.035em] md:text-5xl">
              {t.home.newsTitle}
            </h2>
          </div>

          <Link
            href="/news"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {t.home.newsAll} ↗
          </Link>
        </div>

        {loading ? (
          <div className="grid min-h-[330px] animate-pulse border border-zinc-900 bg-black md:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-zinc-900" />
            <div className="p-8 md:p-12">
              <div className="h-3 w-24 bg-zinc-900" />
              <div className="mt-8 h-8 w-4/5 bg-zinc-900" />
              <div className="mt-4 h-8 w-2/3 bg-zinc-900" />
            </div>
          </div>
        ) : article ? (
          <Link
            href={`/news/${article.slug}`}
            className="group grid overflow-hidden border border-zinc-800 bg-black transition-colors hover:border-zinc-700 md:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="relative min-h-[260px] overflow-hidden bg-[#0c0c0c] md:min-h-[330px]">
              {article.image_url ? (
                <>
                  <Image
                    src={article.image_url}
                    alt=""
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.025]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

                  <div className="absolute left-7 right-7 top-7 flex justify-between gap-6 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                    <span>LMG MUSIC</span>
                    <span>{category}</span>
                  </div>

                  <div className="absolute bottom-7 left-7 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                    LMG MUSIC JOURNAL ↗
                  </div>
                </>
              ) : (
                <div className="flex h-full min-h-[260px] flex-col justify-between p-8 md:min-h-[330px] md:p-10">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                    LMG MUSIC
                  </span>

                  <strong className="text-3xl font-medium leading-[1.05] tracking-[-0.04em] md:text-5xl">
                    Music.
                    <br />
                    Artists.
                    <br />
                    Culture.
                  </strong>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    LMG MUSIC JOURNAL ↗
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-yellow-500">
                {category}
              </p>

              {date && (
                <time className="mt-4 text-[11px] text-zinc-500">
                  {date}
                </time>
              )}

              <h3 className="mt-5 max-w-2xl text-2xl font-medium leading-[1.12] tracking-[-0.035em] transition group-hover:text-yellow-500 md:text-4xl">
                {title}
              </h3>

              {excerpt && (
                <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500">
                  {excerpt}
                </p>
              )}

              <span className="mt-7 w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition group-hover:text-yellow-500">
                {locale === "en"
                  ? "Read article"
                  : "Lire l’article"}{" "}
                ↗
              </span>
            </div>
          </Link>
        ) : (
          <div className="border-y border-zinc-900 py-12">
            <p className="text-sm text-zinc-600">
              {t.home.newsEmpty}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
