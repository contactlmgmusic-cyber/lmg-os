"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

const content = {
  en: {
    eyebrow: "LMG Music / Artist Portal",
    title1: "Your music.",
    title2: "Your space.",
    intro:
      "Your private LMG Music workspace. Follow your projects, releases, schedule, documents and key decisions from one place.",
    login: "Discover the app",
    secure: "Secure artist access",

    previewLabel: "Artist Portal",
    previewStatus: "Private workspace",
    current: "Current project",
    project: "New release",
    projectStatus: "In progress",
    next: "Next milestone",
    nextDate: "18 OCT",
    nextTask: "Visual approval",
    documents: "Documents",
    documentsValue: "Available",
    schedule: "Schedule",
    scheduleValue: "Up to date",

    ecosystem: [
      "Projects",
      "Releases",
      "Calendar",
      "Documents",
      "Royalties",
      "Validations",
    ],

    sectionEyebrow: "Your workspace",
    sectionTitle: "Everything in one place.",
    sectionText:
      "The essentials of your activity with LMG Music, organized around your projects.",

    features: [
      {
        number: "01",
        title: "Projects",
        text: "Follow the development of your projects and the work connected to your artistic direction.",
        tag: "Development",
      },
      {
        number: "02",
        title: "Calendar",
        text: "Find your important dates, events, deadlines and upcoming milestones.",
        tag: "Planning",
      },
      {
        number: "03",
        title: "Documents",
        text: "Keep contracts, shared files and essential project documents within reach.",
        tag: "Resources",
      },
      {
        number: "04",
        title: "Validations",
        text: "Review elements awaiting your attention and keep track of ongoing decisions.",
        tag: "Workflow",
      },
    ],

    accessEyebrow: "Artist access",
    accessTitle: "Already part of LMG Music?",
    accessText:
      "Artist Portal access is reserved for artists with an active LMG Music account. If you need help accessing your space, contact the team.",
    contact: "Contact the team",
    enter: "Discover the app",
  },

  fr: {
    eyebrow: "LMG Music / Artist Portal",
    title1: "Votre musique.",
    title2: "Votre espace.",
    intro:
      "Votre espace privé LMG Music. Suivez vos projets, sorties, échéances, documents et décisions essentielles depuis un seul endroit.",
    login: "Découvrir l’application",
    secure: "Accès artiste sécurisé",

    previewLabel: "Artist Portal",
    previewStatus: "Espace privé",
    current: "Projet en cours",
    project: "Nouvelle sortie",
    projectStatus: "En cours",
    next: "Prochaine échéance",
    nextDate: "18 OCT",
    nextTask: "Validation visuelle",
    documents: "Documents",
    documentsValue: "Disponibles",
    schedule: "Calendrier",
    scheduleValue: "À jour",

    ecosystem: [
      "Projets",
      "Sorties",
      "Calendrier",
      "Documents",
      "Royalties",
      "Validations",
    ],

    sectionEyebrow: "Votre espace",
    sectionTitle: "Tout au même endroit.",
    sectionText:
      "L’essentiel de votre activité avec LMG Music, organisé autour de vos projets.",

    features: [
      {
        number: "01",
        title: "Projets",
        text: "Suivez le développement de vos projets et les actions liées à votre direction artistique.",
        tag: "Développement",
      },
      {
        number: "02",
        title: "Calendrier",
        text: "Retrouvez vos dates importantes, événements, échéances et prochaines étapes.",
        tag: "Planning",
      },
      {
        number: "03",
        title: "Documents",
        text: "Gardez vos contrats, fichiers partagés et documents essentiels à portée de main.",
        tag: "Ressources",
      },
      {
        number: "04",
        title: "Validations",
        text: "Consultez les éléments qui attendent votre attention et suivez les décisions en cours.",
        tag: "Workflow",
      },
    ],

    accessEyebrow: "Accès artiste",
    accessTitle: "Vous faites déjà partie de LMG Music ?",
    accessText:
      "Artist Portal est réservé aux artistes disposant d’un compte LMG Music actif. Si vous rencontrez un problème d’accès, contactez l’équipe.",
    contact: "Contacter l’équipe",
    enter: "Découvrir l’application",
  },
} as const;

export default function ArtistPortalContent() {
  const { locale } = useSiteLanguage();
  const c = content[locale];

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      {/* HERO */}
      <section className="relative border-b border-zinc-900 px-6 py-20 md:px-8 md:py-24">
        <div className="pointer-events-none absolute right-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-yellow-500/[0.035] blur-[120px]" />

        <div className="relative mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[0.9fr_0.7fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
              {c.eyebrow}
            </p>

            <h1 className="mt-8 text-5xl font-semibold leading-[0.98] tracking-[-0.05em] md:text-6xl lg:text-7xl">
              <span className="block">{c.title1}</span>
              <span className="block text-zinc-400">{c.title2}</span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-zinc-400">
              {c.intro}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a
                href="https://artistportal.lmgmusic.fr"
                className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-yellow-500"
              >
                {c.login}
                <span aria-hidden="true">↗</span>
              </a>

              <span className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                {c.secure}
              </span>
            </div>
          </div>

          {/* PORTAL PREVIEW */}
          <div className="relative lg:pl-8">
            <div className="absolute -inset-10 bg-yellow-500/[0.025] blur-3xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-500">
                    LMG Music
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {c.previewLabel}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    {c.previewStatus}
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  {c.current}
                </p>

                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-end overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black p-2">
                    <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-yellow-500">
                      LMG
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.project}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      LMG Music
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {c.projectStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      {c.next}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className="text-xl font-semibold tracking-[-0.03em]">
                        {c.nextDate}
                      </p>
                      <p className="text-right text-[10px] text-zinc-400">
                        {c.nextTask}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                      <span className="text-xs text-zinc-400">
                        {c.documents}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-300">
                        {c.documentsValue}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs text-zinc-400">
                        {c.schedule}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-300">
                        {c.scheduleValue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 border-b border-zinc-900 pb-12 md:grid-cols-[0.65fr_1fr] md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
                {c.sectionEyebrow}
              </p>

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                {c.sectionTitle}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-zinc-400 md:justify-self-end">
              {c.sectionText}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {c.features.map((item) => (
              <div
                key={item.number}
                className="group rounded-[24px] border border-zinc-900 bg-zinc-950/70 p-6 transition duration-300 hover:border-zinc-700 hover:bg-zinc-950 md:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-yellow-500">
                    {item.number}
                  </span>

                  <span className="rounded-full border border-zinc-800 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                    {item.tag}
                  </span>
                </div>

                <div className="mt-12">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">
                    {item.title}
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESS */}
      <section className="border-t border-zinc-900 bg-zinc-950/40 px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[0.65fr_1fr]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
            {c.accessEyebrow}
          </p>

          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
              {c.accessTitle}
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
              {c.accessText}
            </p>

            <div className="mt-8 flex flex-wrap gap-5">
              <a
                href="https://artistportal.lmgmusic.fr"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-xs font-semibold transition hover:border-white hover:bg-white hover:text-black"
              >
                {c.enter} ↗
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center px-1 py-3 text-xs font-semibold text-zinc-400 transition hover:text-yellow-500"
              >
                {c.contact} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
