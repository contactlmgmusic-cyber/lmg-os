"use client";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import CareersSpontaneousForm from "@/components/careers/CareersSpontaneousForm";
import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

const translations = {
  en: {
    eyebrow: "Open application",
    hero1: "Make",
    hero2: "the first",
    hero3: "move.",
    statement:
      "The right role doesn't always exist before the right person shows up.",
    intro1:
      "If you see yourself contributing to LMG but don't see the right opening yet, introduce yourself.",
    intro2:
      "Tell us what you do, what you're building toward and where you think your perspective could make a difference.",
    profile: "Your profile",
    show1: "Show us",
    show2: "what you",
    show3: "bring.",
  },
  fr: {
    eyebrow: "Candidature spontanée",
    hero1: "Faites",
    hero2: "le premier",
    hero3: "pas.",
    statement:
      "Le bon rôle n'existe pas toujours avant que la bonne personne se présente.",
    intro1:
      "Si vous vous voyez contribuer à LMG mais qu'aucune offre ne vous correspond encore, présentez-vous.",
    intro2:
      "Dites-nous ce que vous faites, ce que vous souhaitez construire et où votre regard pourrait faire la différence.",
    profile: "Votre profil",
    show1: "Montrez-nous",
    show2: "ce que vous",
    show3: "apportez.",
  },
} as const;

export default function CareersSpontaneousPageContent() {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d5ad58]">
          {t.eyebrow}
        </p>

        <h1 className="mt-8 max-w-6xl text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
          {t.hero1}
          <br />
          {t.hero2}
          <br />
          {t.hero3}
        </h1>

        <div className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-2 md:gap-20">
          <p className="max-w-xl text-2xl font-semibold leading-tight md:text-4xl">
            {t.statement}
          </p>

          <div className="max-w-xl text-base leading-7 text-white/55">
            <p>{t.intro1}</p>
            <p className="mt-5">{t.intro2}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 md:grid-cols-[0.65fr_1.35fr] md:px-10 md:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d5ad58]">
              {t.profile}
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] md:text-6xl">
              {t.show1}
              <br />
              {t.show2}
              <br />
              {t.show3}
            </h2>
          </div>

          <CareersSpontaneousForm />
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
