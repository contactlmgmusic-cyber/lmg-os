"use client";

import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function AboutMusicContent() {
  const { locale } = useSiteLanguage();
  const en = locale === "en";

  const c = en
    ? {
        label: "About LMG Music",
        title: "Music first.\nBuilt for what comes next.",
        intro:
          "LMG Music is the music division of LMG Group. We work with artists to develop coherent projects, connect creative vision with strategy and build the foundations for long-term development.",

        whoLabel: "WHO WE ARE",
        whoTitle:
          "An artist-focused music structure built around development.",
        whoText:
          "LMG Music works at the intersection of artistic direction, music strategy and project development. Our role is to understand the identity and ambitions behind each project, then help transform that vision into a clear direction.",
        whoStatement:
          "Every artist is different. The structure around them should be too.",

        visionLabel: "OUR VISION",
        visionTitle:
          "Build projects that can grow without losing what makes them unique.",
        visionText:
          "We believe sustainable development begins with clarity: a clear artistic identity, a coherent direction and decisions that serve the project over time. Growth matters, but it should never come at the expense of the artist's identity.",

        approachLabel: "OUR APPROACH",
        approachTitle: "One project.\nFour connected dimensions.",
        approachIntro:
          "We connect the different dimensions of an artist's development rather than treating them as isolated subjects.",

        approach: [
          {
            number: "01",
            title: "Artist Development",
            text:
              "Identity, artistic positioning and long-term direction.",
          },
          {
            number: "02",
            title: "Music & Releases",
            text:
              "Repertoire, musical direction and release strategy.",
          },
          {
            number: "03",
            title: "Image & Audience",
            text:
              "Visual universe, communication and audience development.",
          },
          {
            number: "04",
            title: "Live & Opportunities",
            text:
              "Performance, collaborations and professional opportunities.",
          },
        ],

        groupLabel: "PART OF LMG GROUP",
        groupTitle:
          "Independent in its direction. Connected to a wider creative ecosystem.",
        groupText:
          "LMG Music is part of LMG Group, allowing music projects to connect with complementary expertise when needed — from communication and branding to digital development and creative production.",
        groupLink: "Discover LMG Group",

        nextLabel: "WHAT WE DO",
        nextTitle:
          "See how we turn artistic direction into development.",
        nextText:
          "Explore the areas in which LMG Music works alongside artists and their projects.",
        nextLink: "Explore What We Do",
      }
    : {
        label: "À propos de LMG Music",
        title: "La musique d’abord.\nConstruire la suite.",
        intro:
          "LMG Music est le pôle musique de LMG Group. Nous accompagnons les artistes dans le développement de projets cohérents, en reliant vision créative, stratégie et construction à long terme.",

        whoLabel: "QUI SOMMES-NOUS",
        whoTitle:
          "Une structure musicale centrée sur le développement des artistes.",
        whoText:
          "LMG Music se situe à la rencontre de la direction artistique, de la stratégie musicale et du développement de projet. Notre rôle est de comprendre l’identité et les ambitions derrière chaque projet, puis de transformer cette vision en une direction claire.",
        whoStatement:
          "Chaque artiste est différent. La structure qui l’entoure doit l’être aussi.",

        visionLabel: "NOTRE VISION",
        visionTitle:
          "Construire des projets capables de grandir sans perdre ce qui les rend uniques.",
        visionText:
          "Nous pensons qu’un développement durable commence par de la clarté : une identité artistique définie, une direction cohérente et des décisions qui servent le projet dans le temps. La croissance compte, mais elle ne doit jamais se faire au détriment de l’identité de l’artiste.",

        approachLabel: "NOTRE APPROCHE",
        approachTitle: "Un projet.\nQuatre dimensions connectées.",
        approachIntro:
          "Nous relions les différentes dimensions du développement d’un artiste plutôt que de les traiter comme des sujets indépendants.",

        approach: [
          {
            number: "01",
            title: "Développement artistique",
            text:
              "Identité, positionnement artistique et direction à long terme.",
          },
          {
            number: "02",
            title: "Musique & sorties",
            text:
              "Répertoire, direction musicale et stratégie de sortie.",
          },
          {
            number: "03",
            title: "Image & audience",
            text:
              "Univers visuel, communication et développement du public.",
          },
          {
            number: "04",
            title: "Live & opportunités",
            text:
              "Performance, collaborations et opportunités professionnelles.",
          },
        ],

        groupLabel: "AU SEIN DE LMG GROUP",
        groupTitle:
          "Une direction propre. Un écosystème créatif plus large.",
        groupText:
          "LMG Music fait partie de LMG Group, ce qui permet aux projets musicaux de mobiliser des expertises complémentaires lorsque cela est pertinent — de la communication et du branding au développement digital et à la production créative.",
        groupLink: "Découvrir LMG Group",

        nextLabel: "CE QUE NOUS FAISONS",
        nextTitle:
          "Découvrez comment nous transformons une direction artistique en développement.",
        nextText:
          "Explorez les domaines dans lesquels LMG Music accompagne les artistes et leurs projets.",
        nextLink: "Découvrir notre approche",
      };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 bg-[#050505] px-6 py-14 md:px-8 md:py-20">
        <div className="pointer-events-none absolute -right-20 top-4 text-[16rem] font-medium leading-none tracking-[-0.1em] text-white/[0.015] md:text-[26rem]">
          LMG
        </div>

        <div className="relative mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            {c.label}
          </p>

          <h1 className="mt-8 max-w-5xl whitespace-pre-line text-[clamp(3rem,6vw,5.8rem)] font-medium leading-[0.98] tracking-[-0.055em]">
            {c.title}
          </h1>

          <p className="mt-9 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
            {c.intro}
          </p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden border border-zinc-800 bg-[#0d0d0d] md:grid-cols-[1.05fr_0.95fr]">
            <div className="flex min-h-[430px] flex-col p-7 md:p-10 lg:p-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                {c.whoLabel}
              </p>

              <div className="my-auto py-12">
                <h2 className="max-w-2xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] md:text-5xl">
                  {c.whoTitle}
                </h2>

                <p className="mt-7 max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
                  {c.whoText}
                </p>
              </div>
            </div>

            <div className="relative flex min-h-[320px] items-end overflow-hidden border-t border-zinc-800 bg-[#090909] p-7 md:min-h-[430px] md:border-l md:border-t-0 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(234,179,8,0.14),transparent_34%),linear-gradient(145deg,#171717,#080808_72%)]" />

              <div className="absolute left-[22%] top-0 h-full w-px bg-zinc-800/70" />
              <div className="absolute left-[66%] top-0 h-full w-px bg-zinc-800/70" />

              <div className="relative">
                <p className="max-w-lg text-2xl font-medium leading-[1.15] tracking-[-0.035em] md:text-4xl">
                  {c.whoStatement}
                </p>

                <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.24em] text-yellow-500">
                  LMG MUSIC / ARTIST FIRST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION MANIFESTO */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[0.35fr_1.65fr] md:gap-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {c.visionLabel}
            </p>

            <div>
              <h2 className="max-w-5xl text-[clamp(2.5rem,5vw,5.3rem)] font-medium leading-[1.03] tracking-[-0.055em]">
                {c.visionTitle}
              </h2>

              <div className="mt-12 flex justify-end">
                <p className="max-w-2xl border-l border-yellow-500/60 pl-6 text-sm leading-8 text-zinc-400 md:text-base">
                  {c.visionText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH / ECOSYSTEM */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                {c.approachLabel}
              </p>

              <h2 className="mt-6 whitespace-pre-line text-3xl font-medium leading-[1.08] tracking-[-0.04em] md:text-5xl">
                {c.approachTitle}
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-8 text-zinc-500">
                {c.approachIntro}
              </p>
            </div>

            <div className="relative">
              {/* desktop connecting lines */}
              <div className="absolute left-1/2 top-0 hidden h-full w-px bg-zinc-800 md:block" />
              <div className="absolute left-0 top-1/2 hidden h-px w-full bg-zinc-800 md:block" />

              <div className="relative grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 md:grid-cols-2">
                {c.approach.map((item, index) => (
                  <div
                    key={item.number}
                    className="group relative min-h-[240px] bg-[#0c0c0c] p-7 transition duration-300 hover:bg-[#111111] md:p-8"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-yellow-500">
                        {item.number}
                      </span>

                      <span className="text-zinc-800 transition group-hover:text-yellow-500/50">
                        +
                      </span>
                    </div>

                    <div className="mt-16">
                      <h3 className="text-xl font-medium tracking-[-0.025em] md:text-2xl">
                        {item.title}
                      </h3>

                      <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500">
                        {item.text}
                      </p>
                    </div>

                    <span className="absolute bottom-5 right-6 text-[5rem] font-medium leading-none tracking-[-0.08em] text-white/[0.018]">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-6 flex w-fit items-center gap-3">
                <span className="h-px w-8 bg-zinc-700" />
                <span className="text-[9px] font-semibold tracking-[0.22em] text-zinc-600">
                  ONE ARTIST / ONE DIRECTION
                </span>
                <span className="h-px w-8 bg-zinc-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GROUP CONNECTION */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1fr_0.9fr] md:gap-24">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                {c.groupLabel}
              </p>

              <h2 className="mt-7 max-w-3xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] md:text-5xl">
                {c.groupTitle}
              </h2>
            </div>

            <div className="self-end">
              <p className="max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
                {c.groupText}
              </p>

              <Link
                href="https://www.legacymusicgroup.fr"
                className="mt-8 inline-flex border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
              >
                {c.groupLink} ↗
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 border-y border-zinc-800 py-7 text-center">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                MUSIC
              </span>
            </div>

            <div className="border-x border-zinc-800">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                AGENCY
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                GROUP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* NEXT */}
      <section className="px-6 py-14 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {c.nextLabel}
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              {c.nextTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
              {c.nextText}
            </p>
          </div>

          <Link
            href="/about/what-we-do"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {c.nextLink} ↗
          </Link>
        </div>
      </section>
    </>
  );
}
