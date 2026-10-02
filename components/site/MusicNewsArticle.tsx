"use client";

import Image from "next/image";
import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

type NewsArticle = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  content_fr: string | null;
  content_en: string | null;
  category_fr: string | null;
  category_en: string | null;
  image_url: string | null;
  featured: boolean;
  published_at: string | null;
};

export default function MusicNewsArticle({
  article,
}: {
  article: NewsArticle;
}) {
  const { locale } = useSiteLanguage();

  const isEn = locale === "en";

  const title = isEn
    ? article.title_en || article.title_fr
    : article.title_fr || article.title_en;

  const excerpt = isEn
    ? article.excerpt_en || article.excerpt_fr
    : article.excerpt_fr || article.excerpt_en;

  const body = isEn
    ? article.content_en || article.content_fr
    : article.content_fr || article.content_en;

  const category = isEn
    ? article.category_en || article.category_fr || "News"
    : article.category_fr || article.category_en || "Actualité";

  const date = article.published_at
    ? new Intl.DateTimeFormat(
        isEn ? "en-GB" : "fr-FR",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ).format(new Date(article.published_at))
    : null;

  const ui = isEn
    ? {
        news: "News",
        published: "Published on",
        editorial: "LMG Music Editorial",
        article: "IN THIS ARTICLE",
        articleLabel: "Article",
        back: "← All News",
        discover: "KEEP EXPLORING",
        discoverTitle: "More from LMG Music.",
        discoverText:
          "Discover the latest releases, artists and projects shaping LMG Music.",
        discoverLink: "Explore all News",
      }
    : {
        news: "Actualités",
        published: "Publié le",
        editorial: "La rédaction LMG Music",
        article: "DANS CET ARTICLE",
        articleLabel: "Article",
        back: "← Toutes les actualités",
        discover: "POUR ALLER PLUS LOIN",
        discoverTitle: "La suite chez LMG Music.",
        discoverText:
          "Découvrez les dernières sorties, les artistes et les projets qui façonnent LMG Music.",
        discoverLink: "Voir toutes les actualités",
      };

  return (
    <article>
      {/* Editorial intro */}
      <header className="border-b border-zinc-900 bg-[#070707] px-6 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-12 flex items-center gap-3 text-[10px] text-zinc-600"
          >
            <Link
              href="/news"
              className="transition hover:text-white"
            >
              {ui.news}
            </Link>

            <span>/</span>

            <span className="text-zinc-400">
              {category}
            </span>
          </nav>

          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            {category}
          </p>

          <h1 className="mt-6 max-w-5xl text-[clamp(2.5rem,5vw,4.8rem)] font-medium leading-[1.04] tracking-[-0.045em]">
            {title}
          </h1>

          {excerpt && (
            <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
              {excerpt}
            </p>
          )}
        </div>
      </header>

      {/* Metadata */}
      <div className="border-b border-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-3 px-6 py-5 text-[11px] text-zinc-500 md:px-8">
          <span className="text-yellow-500">
            {category}
          </span>

          {date && (
            <span>
              {ui.published}{" "}
              <time dateTime={article.published_at || undefined}>
                {date}
              </time>
            </span>
          )}

          <span>{ui.editorial}</span>
        </div>
      </div>

      {/* Cover */}
      {article.image_url && (
        <div className="px-6 pt-12 md:px-8 md:pt-16">
          <div className="relative mx-auto aspect-[16/8] max-w-7xl overflow-hidden bg-zinc-950">
            <Image
              src={article.image_url}
              alt={title || ""}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Article */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[190px_minmax(0,760px)] lg:gap-20">
          <aside>
            <div className="lg:sticky lg:top-32">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                {ui.article}
              </p>

              <div className="mt-6 border-t border-zinc-800 pt-5">
                <p className="text-sm text-zinc-400">
                  {ui.articleLabel}
                </p>

                {date && (
                  <p className="mt-2 text-xs leading-6 text-zinc-600">
                    {date}
                  </p>
                )}
              </div>
            </div>
          </aside>

          <div>
            {body ? (
              <div className="whitespace-pre-line text-[17px] leading-[1.9] text-zinc-300 md:text-lg">
                {body}
              </div>
            ) : excerpt ? (
              <div className="text-[17px] leading-[1.9] text-zinc-300 md:text-lg">
                {excerpt}
              </div>
            ) : null}

            <div className="mt-16 border-t border-zinc-800 pt-8">
              <Link
                href="/news"
                className="inline-flex border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
              >
                {ui.back}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Continue */}
      <section className="border-t border-zinc-900 bg-[#090909] px-6 py-14 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {ui.discover}
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              {ui.discoverTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
              {ui.discoverText}
            </p>
          </div>

          <Link
            href="/news"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {ui.discoverLink} ↗
          </Link>
        </div>
      </section>
    </article>
  );
}
