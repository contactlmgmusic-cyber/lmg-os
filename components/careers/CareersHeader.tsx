"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";
import CareersLanguageSwitcher from "@/components/careers/CareersLanguageSwitcher";

const translations = {
  en: {
    life: "Life at LMG",
    worlds: "What you can do",
    jobs: "Jobs",
    faq: "FAQ",
    viewJobs: "View jobs",
    introduce: "Introduce yourself",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },

  fr: {
    life: "La vie chez LMG",
    worlds: "Nos métiers",
    jobs: "Offres",
    faq: "FAQ",
    viewJobs: "Voir les offres",
    introduce: "Candidature spontanée",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
} as const;

export default function CareersHeader() {
  const { locale } = useCareersLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const t = translations[locale];

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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
            className="hidden rounded-full bg-[#d5ad58] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:opacity-80 md:inline-flex"
          >
            {t.viewJobs}
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={menuOpen}
            aria-controls="careers-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 md:hidden"
          >
            <span className="sr-only">{menuOpen ? t.closeMenu : t.openMenu}</span>
            <span className="relative block h-4 w-5">
              <span className={`absolute left-0 top-1 h-px w-5 bg-white transition duration-300 ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`absolute bottom-1 left-0 h-px w-5 bg-white transition duration-300 ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="careers-mobile-menu"
        aria-hidden={!menuOpen}
        className={`fixed inset-x-0 bottom-0 top-20 overflow-y-auto border-t border-white/10 bg-black px-6 py-10 transition duration-300 md:hidden ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"}`}
      >
        <nav className="mx-auto flex min-h-full max-w-xl flex-col" aria-label={locale === "fr" ? "Navigation mobile" : "Mobile navigation"}>
          <div className="flex flex-col">
            {[
              ["01", t.life, "/#life"],
              ["02", t.worlds, "/#worlds"],
              ["03", t.jobs, "/jobs"],
              ["04", t.faq, "/faq"],
              ["05", t.introduce, "/spontaneous"],
            ].map(([number, label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-white/15 py-5"
              >
                <span className="text-[9px] font-bold tracking-[0.18em] text-[#d5ad58]">{number}</span>
                <span className="text-2xl font-black uppercase tracking-[-0.04em]">{label}</span>
                <span className="text-lg text-white/35 transition group-hover:translate-x-1 group-hover:text-[#d5ad58]">→</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-10">
            <Link
              href="/jobs"
              onClick={closeMenu}
              className="flex w-full items-center justify-between rounded-full bg-[#d5ad58] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black"
            >
              {t.viewJobs}
              <span>↗</span>
            </Link>
            <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">Build Your Legacy.</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
