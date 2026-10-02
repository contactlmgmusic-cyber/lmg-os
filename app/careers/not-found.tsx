"use client";

import Link from "next/link";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

const translations = {
  en: {
    wrong: "Wrong",
    turn: "turn.",
    text:
      "The opportunity or page you're looking for isn't here anymore. Your next move might be.",
    jobs: "View open positions",
    home: "Careers home",
  },
  fr: {
    wrong: "Mauvaise",
    turn: "direction.",
    text:
      "L'opportunité ou la page que vous recherchez n'est plus ici. La prochaine pourrait l'être.",
    jobs: "Voir les offres",
    home: "Accueil Careers",
  },
} as const;

export default function CareersNotFound() {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="mx-auto flex min-h-[75vh] max-w-[1600px] flex-col justify-center px-5 pb-20 pt-36 md:px-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d5ad58]">
          404
        </p>

        <h1 className="mt-7 max-w-5xl text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-[0.8] tracking-[-0.07em]">
          {t.wrong}
          <br />
          {t.turn}
        </h1>

        <p className="mt-10 max-w-xl text-lg leading-8 text-white/55">
          {t.text}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/jobs"
            className="rounded-full bg-[#d5ad58] px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-black transition hover:bg-white"
          >
            {t.jobs}
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/30 px-7 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:border-white hover:bg-white hover:text-black"
          >
            {t.home}
          </Link>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
