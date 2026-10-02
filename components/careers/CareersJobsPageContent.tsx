"use client";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import CareersJobsList from "@/components/careers/CareersJobsList";
import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

type Job = {
  id: string;
  title: string;
  slug: string;
  department: string;
  employment_type: string;
  location: string | null;
  remote_policy: string | null;
  short_description: string | null;
};

const translations = {
  en: {
    eyebrow: "Open opportunities",
    hero1: "Find your",
    hero2: "next move.",
    intro:
      "Join the people shaping music, image, business and technology across LMG.",
    singular: "open opportunity",
    plural: "open opportunities",
    findPlace: "Find your place",
    explore: "Explore opportunities.",
    disciplines: "Different disciplines. Shared ambition.",
    difference:
      "Find where your perspective can make a difference.",
    unavailable: "Opportunities are temporarily unavailable.",
    nothingFits: "Nothing fits yet?",
    makeThe: "Make the",
    firstMove: "first move.",
    spontaneousText:
      "The right role may not be open today. Tell us who you are, what you do and what you would like to build with LMG.",
    introduce: "Introduce yourself",
  },
  fr: {
    eyebrow: "Opportunités ouvertes",
    hero1: "Trouvez votre",
    hero2: "prochaine étape.",
    intro:
      "Rejoignez celles et ceux qui façonnent la musique, l’image, le business et la technologie chez LMG.",
    singular: "opportunité ouverte",
    plural: "opportunités ouvertes",
    findPlace: "Trouvez votre place",
    explore: "Explorez les opportunités.",
    disciplines: "Des disciplines différentes. Une ambition commune.",
    difference:
      "Trouvez où votre regard peut faire la différence.",
    unavailable: "Les opportunités sont temporairement indisponibles.",
    nothingFits: "Rien ne correspond pour l’instant ?",
    makeThe: "Faites le",
    firstMove: "premier pas.",
    spontaneousText:
      "Le bon rôle n’est peut-être pas ouvert aujourd’hui. Dites-nous qui vous êtes, ce que vous faites et ce que vous aimeriez construire avec LMG.",
    introduce: "Présentez-vous",
  },
} as const;

export default function CareersJobsPageContent({
  jobs,
  hasError,
}: {
  jobs: Job[];
  hasError: boolean;
}) {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="px-6 pb-24 pt-40 md:px-10 md:pb-32 md:pt-48">
        <div className="mx-auto max-w-[1600px]">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.32em] text-[#d5ad58]">
            {t.eyebrow}
          </p>

          <div className="grid gap-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="text-[15vw] font-black uppercase leading-[0.78] tracking-[-0.075em] sm:text-[12vw] lg:text-[7vw]">
                {t.hero1}
                <br />
                {t.hero2}
              </h1>
            </div>

            <div className="lg:col-span-4 lg:pb-3">
              <p className="max-w-md text-sm leading-7 text-white/55 md:text-base">
                {t.intro}
              </p>

              <div className="mt-9 border-t border-white/15 pt-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  {jobs.length}{" "}
                  {jobs.length === 1 ? t.singular : t.plural}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[1600px] px-6 pt-12 md:px-10 md:pt-16">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                {t.findPlace}
              </p>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.05em] md:text-6xl">
                {t.explore}
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/45 md:col-span-5 md:justify-self-end">
              {t.disciplines}
              <br />
              {t.difference}
            </p>
          </div>
        </div>

        {hasError ? (
          <div className="mx-auto max-w-[1600px] px-6 py-24 text-sm text-white/45 md:px-10">
            {t.unavailable}
          </div>
        ) : (
          <div className="mt-14">
            <CareersJobsList jobs={jobs} />
          </div>
        )}
      </section>

      <section className="px-3 pb-3 pt-28 md:px-5 md:pb-5 md:pt-40">
        <div className="rounded-[2rem] bg-[#d5ad58] px-6 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto max-w-[1500px]">
            <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em]">
              {t.nothingFits}
            </p>

            <div className="grid gap-12 md:grid-cols-2">
              <h2 className="text-6xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-8xl">
                {t.makeThe}
                <br />
                {t.firstMove}
              </h2>

              <div className="flex flex-col justify-end md:items-start">
                <p className="max-w-md text-sm leading-7 text-black/60">
                  {t.spontaneousText}
                </p>

                <a
                  href="/spontaneous"
                  className="mt-8 rounded-full bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                >
                  {t.introduce}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
