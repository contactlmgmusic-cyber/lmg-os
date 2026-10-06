"use client";

import Link from "next/link";

import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

const translations = {
  en: {
    tagline: "Build your part of what's next in music.",
    discover: "Discover LMG Music",
    jobs: "Jobs",
    introduce: "Introduce yourself",
    about: "About",
    artists: "Artists",
    news: "News",
    contact: "Contact",
    follow: "Follow LMG Music",
    legal: "Legal",
    privacy: "Privacy",
  },
  fr: {
    tagline: "Construisez votre place dans la suite de la musique.",
    discover: "Découvrir LMG Music",
    jobs: "Offres",
    introduce: "Présentez-vous",
    about: "À propos",
    artists: "Artistes",
    news: "Actualités",
    contact: "Contact",
    follow: "Suivre LMG Music",
    legal: "Mentions légales",
    privacy: "Confidentialité",
  },
} as const;

export default function CareersFooter() {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  return (
    <footer className="border-t border-white/10 bg-black px-6 pb-8 pt-16 text-white md:px-10 md:pt-20">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-14 pb-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              <img
                src="/careers/lmg-music-logo.png"
                alt="LMG Music"
                className="h-12 w-12 object-contain"
              />

              <span className="h-6 w-px bg-white/20" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Careers
              </span>
            </div>

            <p className="mt-8 max-w-sm text-sm leading-7 text-white/45">
              {t.tagline}
            </p>

            <a
              href="https://www.lmgmusic.fr"
              className="mt-7 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d5ad58]"
            >
              {t.discover}
              <span>↗</span>
            </a>
          </div>

          <div className="md:col-span-2">
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
              Careers
            </p>

            <div className="flex flex-col items-start gap-4 text-sm">
              <Link
                href="/jobs"
                className="transition hover:text-[#d5ad58]"
              >
                {t.jobs}
              </Link>

              <Link
                href="/spontaneous"
                className="transition hover:text-[#d5ad58]"
              >
                {t.introduce}
              </Link>

              <Link
                href="/faq"
                className="transition hover:text-[#d5ad58]"
              >
                FAQ
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
              LMG Music
            </p>

            <div className="flex flex-col items-start gap-4 text-sm">
              <a
                href="https://www.lmgmusic.fr/about"
                className="transition hover:text-[#d5ad58]"
              >
                {t.about}
              </a>

              <a
                href="https://www.lmgmusic.fr/artistes"
                className="transition hover:text-[#d5ad58]"
              >
                {t.artists}
              </a>

              <a
                href="https://www.lmgmusic.fr/news"
                className="transition hover:text-[#d5ad58]"
              >
                {t.news}
              </a>

              <a
                href="https://www.lmgmusic.fr/contact"
                className="transition hover:text-[#d5ad58]"
              >
                {t.contact}
              </a>
            </div>
          </div>

          <div className="md:col-span-3 md:text-right">
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
              {t.follow}
            </p>

            <div className="flex flex-col items-start gap-4 text-sm md:items-end">
              <a
                href="https://www.instagram.com/music.lmg/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#d5ad58]"
              >
                Instagram ↗
              </a>

              <a
                href="https://www.tiktok.com/@music.lmg"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#d5ad58]"
              >
                TikTok ↗
              </a>

              <a
                href="https://www.youtube.com/@LMGMusic"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#d5ad58]"
              >
                YouTube ↗
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[9px] uppercase tracking-[0.16em] text-white/35">
            <span>
              © {new Date().getFullYear()} LMG
            </span>

            <a
              href="https://www.lmgmusic.fr/mentions-legales"
              className="transition hover:text-white"
            >
              {t.legal}
            </a>

            <a
              href="https://www.lmgmusic.fr/confidentialite"
              className="transition hover:text-white"
            >
              {t.privacy}
            </a>

            <a
              href="https://www.lmgmusic.fr/cookies"
              className="transition hover:text-white"
            >
              Cookies
            </a>
          </div>

          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#d5ad58]">
            Build Your Legacy.
          </p>
        </div>
      </div>
    </footer>
  );
}
