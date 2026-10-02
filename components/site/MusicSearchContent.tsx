"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

type SearchItem = {
  id: string;
  type: "artist" | "release" | "news" | "page";
  title: string;
  subtitle?: string | null;
  href: string;
  keywords?: string;
};

type Props = {
  items: SearchItem[];
};

const copy = {
  en: {
    eyebrow: "LMG Music / Search",
    title: "SEARCH.",
    intro:
      "Explore artists, releases, news and everything across LMG Music.",
    placeholder: "Search LMG Music",
    instruction: "Type to start searching.",
    results: "Results",
    noResult: "No results found.",
    noResultText:
      "Try another artist, release, topic or keyword.",
    labels: {
      artist: "Artist",
      release: "Release",
      news: "News",
      page: "LMG Music",
    },
  },

  fr: {
    eyebrow: "LMG Music / Recherche",
    title: "RECHERCHE.",
    intro:
      "Explore les artistes, les sorties, les actualités et l’univers LMG Music.",
    placeholder: "Rechercher sur LMG Music",
    instruction: "Commence à écrire pour lancer la recherche.",
    results: "Résultats",
    noResult: "Aucun résultat.",
    noResultText:
      "Essaie avec un autre artiste, une sortie, un sujet ou un mot-clé.",
    labels: {
      artist: "Artiste",
      release: "Sortie",
      news: "Actualité",
      page: "LMG Music",
    },
  },
} as const;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function MusicSearchContent({ items }: Props) {
  const { locale } = useSiteLanguage();
  const c = copy[locale];

  const [query, setQuery] = useState("");

  const normalizedQuery = normalize(query);

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    const terms = normalizedQuery
      .split(/\s+/)
      .filter(Boolean);

    return items
      .map((item) => {
        const searchable = normalize(
          [
            item.title,
            item.subtitle,
            item.keywords,
            item.type,
          ]
            .filter(Boolean)
            .join(" ")
        );

        const matches = terms.every((term) =>
          searchable.includes(term)
        );

        if (!matches) return null;

        let score = 0;

        const title = normalize(item.title);

        if (title === normalizedQuery) score += 100;
        if (title.startsWith(normalizedQuery)) score += 50;
        if (title.includes(normalizedQuery)) score += 25;

        terms.forEach((term) => {
          if (title.includes(term)) score += 10;
        });

        return { item, score };
      })
      .filter(
        (
          result
        ): result is {
          item: SearchItem;
          score: number;
        } => result !== null
      )
      .sort((a, b) => b.score - a.score)
      .map((result) => result.item)
      .slice(0, 30);
  }, [items, normalizedQuery]);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-zinc-900 bg-[#050505] px-6 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
            {c.eyebrow}
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <h1 className="text-[16vw] font-black uppercase leading-[0.78] tracking-[-0.075em] sm:text-[12vw] lg:text-[7.5vw]">
              {c.title}
            </h1>

            <p className="max-w-md text-base leading-7 text-zinc-400 md:text-lg">
              {c.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative border-b border-zinc-700 pb-5 focus-within:border-yellow-500">
            <label htmlFor="music-search" className="sr-only">
              {c.placeholder}
            </label>

            <div className="flex items-center gap-5">
              <span
                className="h-5 w-5 shrink-0 rounded-full border-2 border-zinc-500"
                aria-hidden="true"
              />

              <input
                id="music-search"
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder={c.placeholder}
                autoComplete="off"
                autoFocus
                className="w-full bg-transparent text-2xl font-semibold tracking-[-0.03em] text-white outline-none placeholder:text-zinc-600 md:text-4xl"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-2xl font-light text-zinc-500 transition hover:text-white"
                  aria-label={
                    locale === "fr"
                      ? "Effacer la recherche"
                      : "Clear search"
                  }
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto max-w-[1500px]">
          {!normalizedQuery ? (
            <div className="border-t border-zinc-900 py-16">
              <p className="text-sm uppercase tracking-[0.18em] text-zinc-600">
                {c.instruction}
              </p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                  {c.results}
                </p>

                <span className="text-xs text-zinc-600">
                  {String(results.length).padStart(2, "0")}
                </span>
              </div>

              <div>
                {results.map((item, index) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="group grid grid-cols-[42px_1fr_auto] items-center gap-4 border-b border-zinc-800 py-7 transition hover:border-zinc-600 md:grid-cols-[75px_1fr_180px_auto] md:py-9"
                  >
                    <span className="text-[10px] font-bold tracking-[0.18em] text-zinc-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h2 className="text-xl font-black uppercase tracking-[-0.035em] transition group-hover:text-yellow-500 md:text-3xl">
                        {item.title}
                      </h2>

                      {item.subtitle && (
                        <p className="mt-2 line-clamp-1 text-sm text-zinc-500">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <span className="hidden text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-600 md:block">
                      {c.labels[item.type]}
                    </span>

                    <span
                      className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-yellow-500"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="border-t border-zinc-800 py-16 md:py-24">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                00
              </p>

              <h2 className="mt-5 text-4xl font-black uppercase tracking-[-0.045em] md:text-6xl">
                {c.noResult}
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-zinc-500">
                {c.noResultText}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
