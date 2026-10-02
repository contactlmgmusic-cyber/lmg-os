"use client";

import Link from "next/link";

import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";
import CareersLanguageSwitcher from "@/components/careers/CareersLanguageSwitcher";

const translations = {
  en: {
    life: "Life at LMG",
    worlds: "What you can do",
    jobs: "Jobs",
    faq: "FAQ",
    viewJobs: "View jobs",
  },

  fr: {
    life: "La vie chez LMG",
    worlds: "Nos métiers",
    jobs: "Offres",
    faq: "FAQ",
    viewJobs: "Voir les offres",
  },
} as const;

export default function CareersHeader() {
  const { locale } = useCareersLanguage();

  const t = translations[locale];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <img
            src="/careers/lmg-music-logo.png"
            alt="LMG Music"
            className="h-11 w-11 object-contain"
          />

          <span className="h-5 w-px bg-white/25" />

          <span className="text-xs font-semibold uppercase tracking-[0.22em]">
            Careers
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.12em] md:flex">
          <Link
            href="/#life"
            className="transition-opacity hover:opacity-50"
          >
            {t.life}
          </Link>

          <Link
            href="/#worlds"
            className="transition-opacity hover:opacity-50"
          >
            {t.worlds}
          </Link>

          <Link
            href="/jobs"
            className="transition-opacity hover:opacity-50"
          >
            {t.jobs}
          </Link>

          <Link
            href="/faq"
            className="transition-opacity hover:opacity-50"
          >
            {t.faq}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <CareersLanguageSwitcher />

          <Link
            href="/jobs"
            className="rounded-full bg-[#d5ad58] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:opacity-80"
          >
            {t.viewJobs}
          </Link>
        </div>
      </div>
    </header>
  );
}
