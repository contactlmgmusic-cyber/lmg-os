"use client";

import Link from "next/link";
import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";
import CareersHeader from "@/components/careers/CareersHeader";

const worlds = [
  {
    number: "01",
    title: "MUSIC",
    subtitle: "Shape the sound.",
    description:
      "Artist development, A&R, releases, production and live. Work alongside the people building the next chapter of our artists.",
    roles: ["A&R", "Artist Projects", "Production", "Live"],
  },
  {
    number: "02",
    title: "CREATIVE",
    subtitle: "Build the image.",
    description:
      "Turn ideas into identities, campaigns and moments. From social content to visual direction, creativity lives across everything we do.",
    roles: ["Communication", "Content", "Design", "Social"],
  },
  {
    number: "03",
    title: "BUSINESS",
    subtitle: "Create opportunities.",
    description:
      "Build relationships, partnerships and strategies that move projects forward and create new opportunities for artists and LMG.",
    roles: ["Partnerships", "Development", "Booking", "Operations"],
  },
  {
    number: "04",
    title: "TECH & DIGITAL",
    subtitle: "Build the tools.",
    description:
      "Create the platforms and digital systems behind our ecosystem. Technology is part of how LMG works, grows and experiments.",
    roles: ["Development", "Platforms", "Data", "Digital"],
  },
];

const principles = [
  {
    number: "01",
    title: "Own your part.",
    text: "You don't need to know everything. But what you own, you push forward.",
  },
  {
    number: "02",
    title: "Think beyond your role.",
    text: "Music, image, business and technology overlap. So do we.",
  },
  {
    number: "03",
    title: "Build together.",
    text: "Ideas move faster when people share them, challenge them and improve them.",
  },
];

export default function CareersHome() {
  const { locale } = useCareersLanguage();

  const fr = locale === "fr";

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden px-6 pb-10 pt-36 md:px-10 md:pb-14">
        <div className="relative mx-auto w-full max-w-[1600px]">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.32em]">
            {fr ? "Carrières chez LMG" : "Careers at LMG"}
          </p>

          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <h1 className="max-w-[900px] text-[16vw] font-black uppercase leading-[0.78] tracking-[-0.075em] sm:text-[13vw] lg:text-[7.5vw]">
              {fr ? (
                <>
                  Construisez
                  <br />
                  la suite.
                </>
              ) : (
                <>
                  Build
                  <br />
                  what&apos;s
                  <br />
                  next.
                </>
              )}
            </h1>

            <div className="hidden min-h-[430px] items-end overflow-hidden rounded-[0.35rem] bg-white/[0.06] lg:flex">
              <div className="w-full border-t border-white/10 p-7">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/35">
                  {fr ? "Les talents derrière la musique" : "People behind the music"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 border-t border-white/20 pt-8 md:grid-cols-2">
            <p className="max-w-xl text-xl leading-8 tracking-[-0.02em] md:text-2xl">
              {fr ? "La musique avance grâce à celles et ceux qui la font." : "Music moves because people do."}
            </p>

            <div className="max-w-xl md:justify-self-end">
              <p className="text-sm leading-7 text-white/60 md:text-base">
                {fr
                  ? "Derrière chaque sortie, chaque image et chaque opportunité, il y a des personnes qui construisent la suite. Apportez votre regard. Prenez part à l'histoire."
                  : "Behind every release, every image and every opportunity are people building the next chapter. Bring your perspective. Build your part of it."}
              </p>

              <Link
                href="/jobs"
                className="mt-7 inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.18em]"
              >
                {fr ? "Découvrir les opportunités" : "Explore opportunities"}
                <span className="text-lg">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INSIDE LMG */}
      <section
        id="life"
        className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40"
      >
        <div className="mb-20 flex items-end justify-between border-b border-white/15 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
            {fr ? "Au cœur de LMG" : "Inside LMG"}
          </p>

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
            {fr ? "Talents · Idées · Musique" : "People · Ideas · Music"}
          </span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Future LMG photo */}
          <div className="relative min-h-[650px] overflow-hidden bg-white/[0.06]">
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/35">
                {fr ? "La vie derrière les projets" : "Life behind the projects"}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#d5ad58]">
                {fr ? "La vie chez LMG" : "Life at LMG"}
              </p>

              <h2 className="max-w-4xl text-5xl font-medium leading-[0.98] tracking-[-0.055em] md:text-7xl xl:text-8xl">
                {fr
                  ? "Nous construisons l'entreprise en même temps que nous construisons les projets."
                  : <>We&apos;re building the company while building the work.</>}
              </h2>
            </div>

            <div className="mt-16 lg:mt-24">
              <div className="grid gap-8 border-t border-white/15 pt-8 md:grid-cols-2">
                <p className="text-sm leading-7 text-white/55">
                  {fr
                    ? "LMG est un écosystème musical indépendant en développement. Ici, chacun peut proposer, expérimenter et prendre pleinement part à ce qu'il construit."
                    : <>LMG is an independent music ecosystem in development. There&apos;s room to propose, experiment and take real ownership of what you build.</>}
                </p>

                <p className="text-sm leading-7 text-white/55">
                  {fr
                    ? "Musique, image, business et technologie avancent ensemble. Des expertises différentes, une ambition commune, une même direction."
                    : "Music, image, business and technology work together here. Different expertise, shared ambition, one direction."}
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
                {(fr
                  ? ["Indépendant", "Collaboratif", "Music-first", "En construction"]
                  : ["Independent", "Collaborative", "Music-first", "Building"]).map((item) => (
                  <span
                    key={item}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-28 grid border-t border-white/20 md:grid-cols-3">
          {(fr
            ? [
                ["01", "Apportez votre regard."],
                ["02", "Prenez des initiatives."],
                ["03", "Construisez avec les autres."],
              ]
            : [
                ["01", "Bring your perspective."],
                ["02", "Take ownership."],
                ["03", "Build with others."],
              ]).map(([number, text], index) => (
            <div
              key={number}
              className={`py-8 ${
                index < 2
                  ? "md:border-r md:border-white/15 md:px-8 first:md:pl-0"
                  : "md:pl-8"
              }`}
            >
              <span className="text-[10px] text-[#d5ad58]">
                {number}
              </span>

              <p className="mt-8 text-xl tracking-[-0.03em]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WORLDS */}
      <section
        id="worlds"
        className="border-t border-white/10 bg-black px-6 py-28 text-white md:px-10 md:py-40"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-20 grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                {fr ? "Trouvez votre place" : "Find your place"}
              </p>

              <h2 className="text-5xl font-medium leading-[0.95] tracking-[-0.055em] md:text-8xl">
                {fr ? (
                  <>
                    Que pouvez-vous
                    <br />
                    construire ici ?
                  </>
                ) : (
                  <>
                    What can you
                    <br />
                    build here?
                  </>
                )}
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/50 md:col-span-4 md:justify-self-end">
              {fr ? "Carrières chez LMG" : "Careers at LMG"} can take different forms. Explore the disciplines
              working together behind the music.
            </p>
          </div>

          <div className="border-t border-white/20">
            {(fr
              ? [
                  {
                    number: "01",
                    title: "MUSIC",
                    subtitle: "Façonnez le son.",
                    description: "Développement artistique, A&R, sorties, production et live. Travaillez aux côtés de celles et ceux qui construisent la prochaine étape des artistes.",
                    roles: ["A&R", "Projets artistes", "Production", "Live"],
                  },
                  {
                    number: "02",
                    title: "CREATIVE",
                    subtitle: "Construisez l'image.",
                    description: "Transformez les idées en identités, campagnes et moments. Du contenu social à la direction visuelle, la créativité traverse tout ce que nous faisons.",
                    roles: ["Communication", "Contenu", "Design", "Social"],
                  },
                  {
                    number: "03",
                    title: "BUSINESS",
                    subtitle: "Créez des opportunités.",
                    description: "Développez les relations, partenariats et stratégies qui font avancer les projets et créent de nouvelles opportunités pour les artistes et LMG.",
                    roles: ["Partenariats", "Développement", "Booking", "Opérations"],
                  },
                  {
                    number: "04",
                    title: "TECH & DIGITAL",
                    subtitle: "Construisez les outils.",
                    description: "Créez les plateformes et systèmes digitaux qui soutiennent notre écosystème. La technologie fait partie de la manière dont LMG travaille, évolue et expérimente.",
                    roles: ["Développement", "Plateformes", "Data", "Digital"],
                  },
                ]
              : worlds
            ).map((world, index) => (
              <article
                key={world.number}
                className="group relative grid gap-8 overflow-hidden border-b border-white/20 py-12 md:grid-cols-12 md:items-start md:py-16"
              >
                <span className="text-[10px] text-[#d5ad58] md:col-span-1">
                  {world.number}
                </span>

                <div className="md:col-span-4">
                  <h3 className="text-4xl font-semibold tracking-[-0.055em] transition-transform duration-500 group-hover:translate-x-2 md:text-6xl">
                    {world.title}
                  </h3>

                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-[#d5ad58]">
                    {world.subtitle}
                  </p>
                </div>

                <div className="md:col-span-4">
                  <p className="max-w-md text-sm leading-7 text-white/50">
                    {world.description}
                  </p>
                </div>
