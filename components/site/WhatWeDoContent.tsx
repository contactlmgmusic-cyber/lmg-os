"use client";

import Link from "next/link";

import EditorialStack from "@/components/site/EditorialStack";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function WhatWeDoContent() {
  const { locale } = useSiteLanguage();
  const en = locale === "en";

  const c = en
    ? {
        parent: "About LMG Music",
        label: "What We Do",
        title: "From artistic vision\nto real development.",
        intro:
          "LMG Music works across the key stages of a music project. We connect artistic direction, strategy and execution to help artists build coherent projects and move them forward over time.",

        modelLabel: "HOW WE WORK",
        modelTitle: "One project. Different stages. One direction.",
        modelText:
          "We do not approach artist development as a collection of disconnected services. Music, image, releases, live opportunities and career development are considered as parts of the same trajectory.",

        areasLabel: "OUR AREAS OF WORK",
        areasTitle: "Building the project\nfrom every angle.",

        artistic: {
          title: "Artistic Development",
          statement: "Start with the artist. Not the format.",
          text:
            "We define and strengthen the artistic identity, positioning and long-term direction of each project.",
          items: [
            "Artistic positioning",
            "Creative direction",
            "Project identity",
            "Development roadmap",
          ],
        },

        music: {
          title: "Music & Repertoire",
          text:
            "We support the musical direction of the project and create coherence between repertoire, artistic ambitions and future releases.",
          items: [
            "Musical direction",
            "Repertoire development",
            "Creative coordination",
            "Release preparation",
          ],
        },

        release: {
          title: "Release Strategy",
          text:
            "A release is not a single date. It is a sequence of decisions designed to give the project the right momentum.",
          steps: [
            ["01", "Prepare"],
            ["02", "Position"],
            ["03", "Release"],
            ["04", "Develop"],
          ],
        },

        image: {
          title: "Artist Image",
          statement: "Music should have a world around it.",
          text:
            "We connect music with a clear artistic universe across visual direction, content, communication and positioning.",
          items: ["IDENTITY", "VISUALS", "CONTENT", "POSITIONING"],
        },

        live: {
          title: "Live & Opportunities",
          text:
            "We connect projects with formats and opportunities that strengthen visibility, experience and professional development.",
          items: ["LIVE", "SHOWCASES", "COLLABORATIONS", "CONNECTIONS"],
          link: "Explore Live & Entertainment",
        },

        career: {
          title: "Career Development",
          statement: "Build beyond the next release.",
          text:
            "We create a longer-term perspective around the artist, define priorities and structure the next stages of development.",
          items: [
            "Career strategy",
            "Project structuring",
            "Development priorities",
            "Long-term planning",
          ],
        },

        processLabel: "THE PROCESS",
        processTitle: "A clear direction from idea to development.",
        process: [
          ["01", "Understand", "Artist, music, ambitions and context."],
          ["02", "Define", "Priorities, positioning and direction."],
          ["03", "Build", "Music, image, releases and opportunities."],
          ["04", "Develop", "Progress, next steps and long-term growth."],
        ],

        ecosystemLabel: "THE LMG ECOSYSTEM",
        ecosystemTitle:
          "Music at the centre. More expertise when the project needs it.",
        ecosystemText:
          "As part of LMG Group, LMG Music can connect projects with complementary expertise across communication, branding, digital development and creative production — while keeping the musical and artistic direction at the centre.",

        nextLabel: "OUR ARTISTS",
        nextTitle: "Discover the artists we're building with.",
        nextText:
          "Explore the artists and projects currently developing within LMG Music.",
        nextLink: "Our Artists",
      }
    : {
        parent: "À propos de LMG Music",
        label: "Ce que nous faisons",
        title: "De la vision artistique\nau développement concret.",
        intro:
          "LMG Music intervient sur les étapes clés d’un projet musical. Nous relions direction artistique, stratégie et exécution afin d’aider les artistes à construire des projets cohérents et à les faire évoluer dans le temps.",

        modelLabel: "NOTRE FAÇON DE TRAVAILLER",
        modelTitle: "Un projet. Plusieurs étapes. Une même direction.",
        modelText:
          "Nous ne considérons pas le développement artistique comme une succession de prestations indépendantes. Musique, image, sorties, live et développement de carrière s’inscrivent dans une même trajectoire.",

        areasLabel: "NOS DOMAINES D’INTERVENTION",
        areasTitle: "Construire le projet\nsous tous ses angles.",

        artistic: {
          title: "Développement artistique",
          statement: "Partir de l’artiste. Pas du format.",
          text:
            "Nous définissons et renforçons l’identité artistique, le positionnement et la direction à long terme de chaque projet.",
          items: [
            "Positionnement artistique",
            "Direction créative",
            "Identité du projet",
            "Feuille de route",
          ],
        },

        music: {
          title: "Musique & répertoire",
          text:
            "Nous accompagnons la direction musicale et créons une cohérence entre le répertoire, les ambitions artistiques et les prochaines sorties.",
          items: [
            "Direction musicale",
            "Développement du répertoire",
            "Coordination créative",
            "Préparation des sorties",
          ],
        },

        release: {
          title: "Stratégie de sortie",
          text:
            "Une sortie n’est pas une simple date. C’est une succession de décisions pensées pour donner au projet la bonne dynamique.",
          steps: [
            ["01", "Préparer"],
            ["02", "Positionner"],
            ["03", "Sortir"],
            ["04", "Développer"],
          ],
        },

        image: {
          title: "Image artiste",
          statement: "La musique doit avoir un univers autour d’elle.",
          text:
            "Nous relions la musique à un univers artistique clair à travers direction visuelle, contenus, communication et positionnement.",
          items: ["IDENTITÉ", "VISUELS", "CONTENU", "POSITIONNEMENT"],
        },

        live: {
          title: "Live & opportunités",
          text:
            "Nous connectons les projets à des formats et opportunités capables de renforcer leur visibilité, leur expérience et leur développement professionnel.",
          items: ["LIVE", "SHOWCASES", "COLLABORATIONS", "CONNEXIONS"],
          link: "Découvrir Live & Entertainment",
        },

        career: {
          title: "Développement de carrière",
          statement: "Construire au-delà de la prochaine sortie.",
          text:
            "Nous construisons une vision à plus long terme autour de l’artiste, définissons les priorités et structurons les prochaines étapes.",
          items: [
            "Stratégie de carrière",
            "Structuration du projet",
            "Priorités de développement",
            "Planification long terme",
          ],
        },

        processLabel: "LE PROCESSUS",
        processTitle: "Une direction claire, de l’idée au développement.",
        process: [
          ["01", "Comprendre", "L’artiste, la musique, les ambitions et le contexte."],
          ["02", "Définir", "Les priorités, le positionnement et la direction."],
          ["03", "Construire", "La musique, l’image, les sorties et les opportunités."],
          ["04", "Développer", "L’évolution, les prochaines étapes et le long terme."],
        ],

        ecosystemLabel: "L’ÉCOSYSTÈME LMG",
        ecosystemTitle:
          "La musique au centre. Des expertises complémentaires quand le projet en a besoin.",
        ecosystemText:
          "Au sein de LMG Group, LMG Music peut connecter les projets à des expertises complémentaires en communication, branding, développement digital et production créative, tout en conservant la direction musicale et artistique au centre.",

        nextLabel: "NOS ARTISTES",
        nextTitle: "Découvrez les artistes avec qui nous construisons.",
        nextText:
          "Explorez les artistes et les projets actuellement développés au sein de LMG Music.",
        nextLink: "Nos artistes",
      };

  const panel =
    "overflow-hidden rounded-[22px] border border-zinc-800 bg-[#111315] shadow-[0_-12px_40px_rgba(0,0,0,0.32)]";

  return (
    <>
      {/* HERO */}
      <section className="border-b border-zinc-900 bg-[#050505] px-6 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 text-[10px] text-zinc-400">
            <Link href="/about" className="transition hover:text-white">
              {c.parent}
            </Link>
            <span>/</span>
            <span className="text-zinc-400">{c.label}</span>
          </div>

          <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            {c.label}
          </p>

          <h1 className="mt-7 max-w-5xl whitespace-pre-line text-[clamp(2.7rem,5.5vw,5.2rem)] font-medium leading-[1.02] tracking-[-0.05em]">
            {c.title}
          </h1>

          <p className="mt-8 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
            {c.intro}
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {c.modelLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {c.modelTitle}
            </h2>
            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {c.modelText}
            </p>
          </div>
        </div>
      </section>

      {/* EDITORIAL STACK */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {c.areasLabel}
          </p>

          <h2 className="mt-6 max-w-3xl whitespace-pre-line text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
            {c.areasTitle}
          </h2>

          <EditorialStack className="mt-14">
            {/* 01 — STATEMENT + VISUAL */}
            <div className={panel}>
              <div className="grid min-h-[430px] md:grid-cols-[1.15fr_0.85fr]">
                <div className="flex flex-col p-7 md:p-10 lg:p-12">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                    01 / {c.artistic.title}
                  </span>

                  <div className="my-auto py-10">
                    <p className="max-w-2xl text-[clamp(2.2rem,4vw,4.5rem)] font-medium leading-[1.03] tracking-[-0.05em]">
                      {c.artistic.statement}
                    </p>

                    <p className="mt-7 max-w-xl text-sm leading-8 text-zinc-400">
                      {c.artistic.text}
                    </p>
                  </div>
                </div>

                <div className="relative min-h-[260px] overflow-hidden border-t border-zinc-800 bg-[#090909] md:border-l md:border-t-0">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(234,179,8,0.16),transparent_34%),linear-gradient(145deg,#171717,#080808_70%)]" />

                  <div className="relative flex h-full flex-col justify-between p-8">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-yellow-500">
                      LMG MUSIC
                    </span>

                    <span className="text-[clamp(3rem,7vw,7rem)] font-medium leading-none tracking-[-0.08em] text-white/[0.1]">
                      ARTIST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 — CAPABILITIES */}
            <div className={panel}>
              <div className="min-h-[430px] p-7 md:p-10 lg:p-12">
                <div className="flex justify-between gap-8">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                    02
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-400">
                    MUSIC DEVELOPMENT
                  </span>
                </div>

                <div className="mt-16 grid gap-12 md:grid-cols-2">
                  <div>
                    <h3 className="text-3xl font-medium tracking-[-0.04em] md:text-5xl">
                      {c.music.title}
                    </h3>

                    <p className="mt-6 max-w-lg text-sm leading-8 text-zinc-400">
                      {c.music.text}
                    </p>
                  </div>

                  <div className="grid content-start md:grid-cols-2">
                    {c.music.items.map((item, index) => (
                      <div
                        key={item}
                        className="border-t border-zinc-700 py-5 md:min-h-[110px] md:p-5"
                      >
                        <span className="text-[9px] text-yellow-500">
                          0{index + 1}
                        </span>
                        <p className="mt-4 text-sm text-zinc-300">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 03 — TIMELINE */}
            <div className={panel}>
              <div className="min-h-[430px] p-7 md:p-10 lg:p-12">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                  03 / {c.release.title}
                </span>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
                  {c.release.text}
                </p>

                <div className="mt-16 grid border-t border-zinc-700 md:grid-cols-4">
                  {c.release.steps.map(([number, title], index) => (
                    <div
                      key={number}
                      className={[
                        "relative border-b border-zinc-700 py-7 md:min-h-[170px] md:border-b-0 md:p-6",
                        index < 3 ? "md:border-r" : "",
                        index === 0 ? "md:pl-0" : "",
                      ].join(" ")}
                    >
                      <span className="text-[9px] text-yellow-500">
                        {number}
                      </span>

                      <p className="mt-12 text-xl font-medium">
                        {title}
                      </p>

                      {index < 3 && (
                        <span className="absolute bottom-5 right-5 hidden text-zinc-400 md:block">
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 04 — VISUAL / BRAND WORLD */}
            <div className={panel}>
              <div className="grid min-h-[430px] md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[280px] overflow-hidden bg-[#090909]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_60%,rgba(234,179,8,0.13),transparent_30%),linear-gradient(45deg,#080808,#181818)]" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="-rotate-6 text-[clamp(3rem,7vw,7rem)] font-medium tracking-[-0.08em] text-white/[0.09]">
                      IMAGE
                    </span>
                  </div>

                  <div className="relative flex h-full flex-col justify-between p-8">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-yellow-500">
                      04 / ARTIST WORLD
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {c.image.items.map((item) => (
                        <span
                          key={item}
                          className="border border-zinc-700 px-3 py-2 text-[9px] tracking-[0.16em] text-zinc-400"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center border-t border-zinc-800 p-7 md:border-l md:border-t-0 md:p-10 lg:p-12">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-500">
                    {c.image.title}
                  </p>

                  <h3 className="mt-7 max-w-xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] md:text-5xl">
                    {c.image.statement}
                  </h3>

                  <p className="mt-6 max-w-lg text-sm leading-8 text-zinc-400">
                    {c.image.text}
                  </p>
                </div>
              </div>
            </div>

            {/* 05 — NETWORK */}
            <div className={panel}>
              <div className="min-h-[430px] p-7 md:p-10 lg:p-12">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                    05
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-400">
                    OPPORTUNITIES
                  </span>
                </div>

                <div className="mt-14 grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <h3 className="text-3xl font-medium tracking-[-0.04em] md:text-5xl">
                      {c.live.title}
                    </h3>

                    <p className="mt-6 max-w-lg text-sm leading-8 text-zinc-400">
                      {c.live.text}
                    </p>

                    <Link
                      href="/about/live"
                      className="mt-8 inline-flex border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
                    >
                      {c.live.link} ↗
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-px overflow-hidden border border-zinc-800 bg-zinc-800">
                    {c.live.items.map((item, index) => (
                      <div
                        key={item}
                        className="flex min-h-[125px] flex-col justify-between bg-[#0c0c0c] p-5"
                      >
                        <span className="text-[9px] text-yellow-500">
                          0{index + 1}
                        </span>

                        <span className="text-xs tracking-[0.12em] text-zinc-400">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 06 — MANIFESTO */}
            <div className={panel}>
              <div className="relative min-h-[430px] overflow-hidden p-7 md:p-10 lg:p-12">
                <div className="pointer-events-none absolute -right-24 -top-32 text-[18rem] font-medium leading-none tracking-[-0.1em] text-white/[0.018]">
                  06
                </div>

                <div className="relative flex min-h-[350px] flex-col">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                    06 / {c.career.title}
                  </span>

                  <div className="my-auto py-10">
                    <h3 className="max-w-4xl text-[clamp(2.4rem,5vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.055em]">
                      {c.career.statement}
                    </h3>

                    <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400">
                      {c.career.text}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-7 gap-y-3 border-t border-zinc-800 pt-5">
                    {c.career.items.map((item) => (
                      <span
                        key={item}
                        className="text-[9px] uppercase tracking-[0.16em] text-zinc-400"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </EditorialStack>
        </div>
      </section>

      {/* PROCESS — OUTSIDE STACK */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {c.processLabel}
          </p>

          <h2 className="mt-6 max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
            {c.processTitle}
          </h2>

          <div className="mt-12 grid border-t border-zinc-800 md:grid-cols-4">
            {c.process.map(([number, title, text], index) => (
              <div
                key={number}
                className={[
                  "border-b border-zinc-800 py-8 md:min-h-[230px] md:px-7",
                  index < 3 ? "md:border-r" : "",
                  index === 0 ? "md:pl-0" : "",
                ].join(" ")}
              >
                <span className="text-[10px] text-yellow-500">
                  {number}
                </span>

                <h3 className="mt-10 text-xl font-medium">
                  {title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {c.ecosystemLabel}
            </p>

            <h2 className="mt-6 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {c.ecosystemTitle}
            </h2>
          </div>

          <div className="self-end">
            <p className="max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
              {c.ecosystemText}
            </p>

            <Link
              href="https://www.legacymusicgroup.fr"
              className="mt-8 inline-flex border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
            >
              LMG Group ↗
            </Link>
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

            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              {c.nextTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
              {c.nextText}
            </p>
          </div>

          <Link
            href="/artistes"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {c.nextLink} ↗
          </Link>
        </div>
      </section>
    </>
  );
}
