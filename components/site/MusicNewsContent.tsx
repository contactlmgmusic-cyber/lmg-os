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
  category_fr: string | null;
  category_en: string | null;
  image_url: string | null;
  featured: boolean;
  published_at: string | null;
};

export default function MusicNewsContent({
  articles,
}: {
  articles: NewsArticle[];
}) {
  const { locale } = useSiteLanguage();

  const content =
    locale === "en"
      ? {
          label: "News",
          title: "Inside LMG Music.\nWhat comes next.",
          description:
            "Releases, artists, projects and milestones shaping the development of LMG Music.",
          journal: "THE JOURNAL / LATEST STORIES",
          empty: "The latest LMG Music news will be published here.",
          read: "Read article",
        }
      : {
          label: "Actualités",
          title: "Dans LMG Music.\nEt pour la suite.",
          description:
            "Sorties, artistes, projets et étapes clés qui accompagnent le développement de LMG Music.",
          journal: "LE JOURNAL / DERNIÈRES PUBLICATIONS",
          empty:
            "Les prochaines actualités de LMG Music seront à retrouver ici.",
          read: "Lire l’article",
        };

  return (
    <>
      <section className="border-b border-zinc-900 bg-[#070707] px-6 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            {content.label}
          </p>

          <h1 className="mt-7 max-w-4xl whitespace-pre-line text-[clamp(2.5rem,5vw,4.8rem)] font-medium leading-[1.04] tracking-[-0.045em]">
            {content.title}
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            {content.description}
          </p>
        </div>
      </section>

      <section className="px-6 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.journal}
          </p>

          {!articles.length && (
            <p className="border-t border-zinc-800 py-10 text-sm text-zinc-500">
              {content.empty}
            </p>
          )}

          <div className="space-y-8">
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
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group grid overflow-hidden border border-zinc-800 bg-[#090909] transition-colors hover:border-zinc-700 md:grid-cols-[0.9fr_1.1fr]"
                >
                  <div className="relative min-h-[260px] overflow-hidden bg-[#0c0c0c] md:min-h-[340px]">
                    {article.image_url ? (
                      <>
                        <Image
                          src={article.image_url}
                          alt=""
                          fill
                          className="object-cover transition duration-700 group-hover:scale-[1.025]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

                        <div className="absolute left-7 right-7 top-7 flex justify-between gap-6 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                          <span>LMG MUSIC</span>
                          <span>{category}</span>
                        </div>

                        <div className="absolute bottom-7 left-7 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                          LMG MUSIC JOURNAL ↗
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full min-h-[260px] flex-col justify-between p-8 md:min-h-[340px] md:p-10">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          LMG MUSIC
                        </span>

                        <strong className="text-3xl font-medium leading-[1.05] tracking-[-0.04em] text-white md:text-5xl">
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

                  <div className="flex flex-col justify-center p-7 md:p-10 lg:p-14">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-yellow-500">
                      {category}
                    </p>

                    {date && (
                      <time className="mt-5 text-[11px] text-zinc-500">
                        {date}
                      </time>
                    )}

                    <h2 className="mt-5 text-[clamp(1.7rem,2.6vw,2.7rem)] font-medium leading-[1.1] tracking-[-0.035em] transition-colors group-hover:text-yellow-500">
                      {title}
                    </h2>

                    {excerpt && (
                      <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500">
                        {excerpt}
                      </p>
                    )}

                    <span className="mt-7 w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-200 transition-colors group-hover:text-yellow-500">
                      {content.read} ↗
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
