"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

const content = {
  en: {
    eyebrow: "LMG Music / Accessibility",
    title: "Accessibility",
    intro:
      "LMG Music aims to make its website accessible and comfortable to use for as many people as possible.",
    sections: [
      {
        title: "Our approach",
        text:
          "We pay attention to readability, navigation, contrast, responsive layouts and keyboard-friendly interactions when designing and maintaining the LMG Music website.",
      },
      {
        title: "Continuous improvement",
        text:
          "Accessibility is an ongoing process. As the website evolves, we continue to review its content and interfaces and improve them where necessary.",
      },
      {
        title: "Need assistance?",
        text:
          "If you encounter difficulty accessing content or using a feature of this website, you can contact the LMG Music team and describe the issue you encountered.",
      },
    ],
    contact: "Contact LMG Music",
  },

  fr: {
    eyebrow: "LMG Music / Accessibilité",
    title: "Accessibilité",
    intro:
      "LMG Music souhaite rendre son site accessible et confortable à utiliser pour le plus grand nombre.",
    sections: [
      {
        title: "Notre approche",
        text:
          "Nous portons une attention particulière à la lisibilité, à la navigation, aux contrastes, à l’adaptation aux différents écrans et aux interactions accessibles au clavier lors de la conception et de la maintenance du site LMG Music.",
      },
      {
        title: "Amélioration continue",
        text:
          "L’accessibilité est une démarche continue. À mesure que le site évolue, nous continuons à examiner ses contenus et ses interfaces afin de les améliorer lorsque cela est nécessaire.",
      },
      {
        title: "Besoin d’aide ?",
        text:
          "Si vous rencontrez une difficulté pour accéder à un contenu ou utiliser une fonctionnalité de ce site, vous pouvez contacter l’équipe LMG Music en décrivant le problème rencontré.",
      },
    ],
    contact: "Contacter LMG Music",
  },
} as const;

export default function AccessibilityContent() {
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

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            {c.intro}
          </p>
        </header>

        <div className="mt-6">
          {c.sections.map((section, index) => (
            <section
              key={section.title}
              className="grid gap-5 border-b border-zinc-900 py-10 md:grid-cols-[180px_1fr]"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-yellow-500">
                0{index + 1}
              </span>

              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                  {section.title}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                  {section.text}
                </p>
              </div>
            </section>
          ))}
        </div>

        <Link
          href="/contact"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-xs font-semibold transition hover:border-white hover:bg-white hover:text-black"
        >
          {c.contact} →
        </Link>
      </div>
    </main>
  );
}
