"use client";

import { useEffect, useRef, useState } from "react";
import {
  useCareersLanguage,
  type CareersLocale,
} from "@/components/careers/CareersLanguageProvider";

const languages = [
  {
    code: "en",
    short: "EN",
    name: "English",
    region: "Global",
    enabled: true,
  },
  {
    code: "fr",
    short: "FR",
    name: "Français",
    region: "France",
    enabled: true,
  },
  {
    code: "es",
    short: "ES",
    name: "Español",
    region: "España · LATAM",
    enabled: false,
  },
  {
    code: "pt",
    short: "PT",
    name: "Português",
    region: "Portugal · Brasil",
    enabled: false,
  },
  {
    code: "de",
    short: "DE",
    name: "Deutsch",
    region: "Deutschland",
    enabled: false,
  },
  {
    code: "it",
    short: "IT",
    name: "Italiano",
    region: "Italia",
    enabled: false,
  },
  {
    code: "ar",
    short: "AR",
    name: "العربية",
    region: "MENA",
    enabled: false,
  },
  {
    code: "ja",
    short: "JA",
    name: "日本語",
    region: "日本",
    enabled: false,
  },
] as const;

export default function CareersLanguageSwitcher() {
  const { locale, setLocale } = useCareersLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current =
    languages.find((language) => language.code === locale) ??
    languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectLanguage(code: CareersLocale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="group flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em]"
      >
        <span className="text-white/45">
          {current.short}
        </span>

        <span className="hidden text-white transition group-hover:text-[#d5ad58] lg:inline">
          {current.name}
        </span>

        <span
          className={`text-[9px] text-[#d5ad58] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+22px)] z-[100] w-[min(92vw,620px)] overflow-hidden border border-white/15 bg-[#080808] shadow-2xl">
          <div className="flex items-end justify-between border-b border-white/10 px-6 py-6 md:px-8">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#d5ad58]">
                LMG Careers
              </p>

              <p className="mt-2 text-xl font-medium tracking-[-0.03em]">
                {locale === "fr"
                  ? "Choisissez votre langue"
                  : "Choose your language"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close language menu"
              className="text-lg text-white/40 transition hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {languages.map((language) => {
              const active = language.code === locale;

              return (
                <button
                  key={language.code}
                  type="button"
                  disabled={!language.enabled}
                  onClick={() => {
                    if (language.enabled) {
                      selectLanguage(
                        language.code as CareersLocale
                      );
                    }
                  }}
                  className={`group relative min-h-[128px] border-b border-r border-white/10 p-5 text-left transition ${
                    language.enabled
                      ? "hover:bg-white/[0.05]"
                      : "cursor-default opacity-35"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-[9px] font-bold tracking-[0.18em] ${
                        active
                          ? "text-[#d5ad58]"
                          : "text-white/30"
                      }`}
                    >
                      {language.short}
                    </span>

                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d5ad58]" />
                    )}
                  </div>

                  <p className="mt-7 text-sm font-medium">
                    {language.name}
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/30">
                    {language.enabled
                      ? language.region
                      : locale === "fr"
                        ? "Bientôt"
                        : "Soon"}
                  </p>

                  {language.enabled && (
                    <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#d5ad58] transition-transform duration-300 group-hover:scale-x-100" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-6 px-6 py-4 md:px-8">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
              {locale === "fr"
                ? "D'autres langues seront ajoutées progressivement."
                : "More languages will be added progressively."}
            </p>

            <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d5ad58]">
              Build Your Legacy.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
