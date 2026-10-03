"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

const content = {
  en: {
    eyebrow: "LMG Music / Sitemap",
    title: "Sitemap",
    intro: "Find the main sections and resources available on LMG Music.",
    groups: [
      {
        title: "LMG Music",
        links: [
          ["Home", "/"],
          ["About LMG Music", "/about"],
          ["What We Do", "/about/what-we-do"],
          ["Live & Entertainment", "/about/live"],
          ["Team", "/team"],
          ["Contact", "/contact"],
        ],
      },
      {
        title: "Music",
        links: [
          ["Artists", "/artistes"],
          ["Releases", "/releases"],
          ["News", "/news"],
          ["Press & Releases", "/press"],
        ],
      },
      {
        title: "Artists",
        links: [
          ["Artist Portal", "https://artistportal.lmgmusic.fr"],
          ["Present a project", "/rejoindre"],
        ],
      },
      {
        title: "Information",
        links: [
          ["FAQ", "/faq"],
          ["Accessibility", "/accessibilite"],
          ["Legal notice", "/mentions-legales"],
          ["Privacy", "/confidentialite"],
          ["Cookies", "/cookies"],
        ],
      },
    ],
  },

  fr: {
    eyebrow: "LMG Music / Plan du site",
    title: "Plan du site",
    intro:
      "Retrouvez les principales sections et ressources disponibles sur LMG Music.",
    groups: [
      {
        title: "LMG Music",
        links: [
          ["Accueil", "/"],
          ["À propos de LMG Music", "/about"],
          ["Ce que nous faisons", "/about/what-we-do"],
          ["Live & Entertainment", "/about/live"],
          ["Équipe", "/team"],
          ["Contact", "/contact"],
        ],
      },
      {
        title: "Musique",
        links: [
          ["Artistes", "/artistes"],
          ["Sorties", "/releases"],
          ["Actualités", "/news"],
          ["Presse & actualités", "/press"],
        ],
      },
      {
        title: "Artistes",
        links: [
          ["Artist Portal", "https://artistportal.lmgmusic.fr"],
          ["Présenter un projet", "/rejoindre"],
        ],
      },
      {
        title: "Informations",
        links: [
          ["FAQ", "/faq"],
          ["Accessibilité", "/accessibilite"],
          ["Mentions légales", "/mentions-legales"],
          ["Confidentialité", "/confidentialite"],
          ["Cookies", "/cookies"],
        ],
      },
    ],
  },
} as const;

export default function SiteMapContent() {
  const { locale } = useSiteLanguage();
  const c = content[locale];

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white md:px-8 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <header className="max-w-3xl border-b border-zinc-900 pb-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
            {c.eyebrow}
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            {c.title}
          </h1>

          <p className="mt-6 text-base leading-7 text-zinc-400">
            {c.intro}
          </p>
        </header>

        <div className="grid md:grid-cols-2">
          {c.groups.map((group, index) => (
            <section
              key={group.title}
              className={[
                "border-b border-zinc-900 py-10 md:p-10",
                index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0",
              ].join(" ")}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                0{index + 1}
              </p>

              <h2 className="mt-4 text-xl font-semibold">
                {group.title}
              </h2>

              <div className="mt-7 flex flex-col">
                {group.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center justify-between border-t border-zinc-900 py-3.5 text-sm text-zinc-400 transition hover:text-white"
                  >
                    <span>{label}</span>

                    <span className="text-zinc-700 transition group-hover:text-yellow-500">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
