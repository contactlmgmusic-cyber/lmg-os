"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

type PressArticle = {
  id: string;
  slug: string;
  title_fr: string | null;
  title_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  published_at: string | null;
};

type Props = {
  articles: PressArticle[];
};

const copy = {
  en: {
    eyebrow: "LMG Music / Press",
    title1: "PRESS",
    title2: "& RELEASES.",
    intro:
      "Official news, announcements and media resources from LMG Music.",
    latest: "Latest releases",
    allNews: "All news",
    read: "Read release",
    empty: "No press releases published yet.",
    mediaLabel: "Media enquiries",
    mediaTitle: "PRESS & MEDIA.",
    mediaText:
      "For interviews, media requests, editorial enquiries or information about LMG Music and its artists, contact our team.",
    contact: "Contact LMG Music",
    resourcesLabel: "Media resources",
    resourcesTitle: "LOOKING FOR ASSETS?",
    resourcesText:
      "Logos, approved visuals, artist materials and other media assets can be requested directly from the LMG Music team.",
    request: "Request media assets",
  },

  fr: {
    eyebrow: "LMG Music / Presse",
    title1: "PRESSE",
    title2: "& ACTUALITÉS.",
    intro:
      "Actualités officielles, annonces et ressources médias de LMG Music.",
    latest: "Dernières publications",
    allNews: "Toutes les actualités",
    read: "Lire la publication",
    empty: "Aucune publication presse pour le moment.",
    mediaLabel: "Demandes médias",
    mediaTitle: "PRESSE & MÉDIAS.",
    mediaText:
      "Pour une interview, une demande média, un sujet éditorial ou des informations concernant LMG Music et ses artistes, contactez notre équipe.",
    contact: "Contacter LMG Music",
    resourcesLabel: "Ressources médias",
    resourcesTitle: "BESOIN DE CONTENUS ?",
    resourcesText:
      "Logos, visuels validés, éléments artistes et autres ressources médias peuvent être demandés directement auprès de l’équipe LMG Music.",
    request: "Demander des ressources",
  },
} as const;

function formatDate(date: string | null, locale: "en" | "fr") {
  if (!date) return null;

  return new Intl.DateTimeFormat(
    locale === "fr" ? "fr-FR" : "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(date));
}

export default function MusicPressContent({ articles }: Props) {
  const { locale } = useSiteLanguage();
  const c = copy[locale];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-zinc-900 px-6 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-yellow-500">
            {c.eyebrow}
          </p>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block">{c.title1}</span>
              <span className="block text-zinc-600">{c.title2}</span>
            </h1>

            <p className="max-w-md text-lg leading-8 text-zinc-400">
              {c.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex items-end justify-between gap-8 border-b border-zinc-800 pb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
                01 / Newsroom
              </p>

              <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.035em] md:text-4xl">
                {c.latest}
              </h2>
            </div>

            <Link
              href="/news"
              className="hidden text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-white md:block"
            >
              {c.allNews} ↗
            </Link>
          </div>

          {articles.length > 0 ? (
            <div>
              {articles.map((article, index) => {
                const title =
                  locale === "fr"
                    ? article.title_fr || article.title_en
                    : article.title_en || article.title_fr;

                const excerpt =
                  locale === "fr"
                    ? article.excerpt_fr || article.excerpt_en
                    : article.excerpt_en || article.excerpt_fr;

                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="group grid gap-5 border-b border-zinc-900 py-9 transition hover:border-zinc-600 md:grid-cols-[80px_1fr_180px_40px] md:items-center md:py-12"
                  >
                    <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h3 className="max-w-4xl text-xl font-bold uppercase leading-[1.15] tracking-[-0.025em] transition group-hover:text-yellow-500 md:text-2xl">
                        {title}
                      </h3>

                      {excerpt && (
                        <p className="mt-4 max-w-2xl line-clamp-2 text-sm leading-6 text-zinc-500">
                          {excerpt}
                        </p>
                      )}
                    </div>

                    <div className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                      {formatDate(article.published_at, locale)}
                    </div>

                    <span className="text-xl text-zinc-700 transition group-hover:translate-x-1 group-hover:text-yellow-500">
                      ↗
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="border-b border-zinc-900 py-16 text-zinc-500">
              {c.empty}
            </p>
          )}

          <Link
            href="/news"
            className="mt-10 inline-block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-white md:hidden"
          >
            {c.allNews} ↗
          </Link>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-[#050505] px-6 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
              02 / {c.mediaLabel}
            </p>

            <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] md:text-5xl">
              {c.mediaTitle}
            </h2>

            <p className="mt-8 max-w-xl text-base leading-8 text-zinc-400">
              {c.mediaText}
            </p>

            <Link
              href="/contact"
              className="mt-10 inline-flex border-b border-yellow-500 pb-2 text-xs font-bold uppercase tracking-[0.2em] transition hover:text-yellow-500"
            >
              {c.contact} ↗
            </Link>
          </div>

          <div className="border-t border-zinc-800 pt-12 lg:border-l lg:border-t-0 lg:pl-20 lg:pt-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
              03 / {c.resourcesLabel}
            </p>

            <h2 className="mt-6 text-3xl font-black uppercase leading-[1] tracking-[-0.035em] md:text-5xl">
              {c.resourcesTitle}
            </h2>

            <p className="mt-8 max-w-xl text-base leading-8 text-zinc-400">
              {c.resourcesText}
            </p>

            <Link
              href="/contact"
              className="mt-10 inline-flex border-b border-yellow-500 pb-2 text-xs font-bold uppercase tracking-[0.2em] transition hover:text-yellow-500"
            >
              {c.request} ↗
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
