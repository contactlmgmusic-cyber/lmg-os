"use client";

import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function LiveEntertainmentContent() {
  const { locale } = useSiteLanguage();

  const content =
    locale === "en"
      ? {
          parent: "About LMG Music",
          label: "Live & Entertainment",

          title: "Music happens\nbeyond the release.",
          intro:
            "LMG Music develops live formats, performances and experiences that give artists another space to express their projects, meet audiences and create moments that exist beyond digital platforms.",

          statement:
            "A release can introduce a project. Live makes people experience it.",

          roleLabel: "OUR APPROACH TO LIVE",
          roleTitle:
            "Creating the right moment for the right project.",
          roleText:
            "We see live performance as part of artist development. The objective is not simply to put an artist on a stage, but to build formats and opportunities that make sense for their identity, their audience and the stage of their career.",

          formatsLabel: "LIVE FORMATS",

          formats: [
            {
              number: "01",
              title: "Live Performances",
              text:
                "Performance opportunities designed to showcase the artist, their music and their stage identity.",
            },
            {
              number: "02",
              title: "Showcases",
              text:
                "Focused formats built around discovery, project presentation and direct connection with audiences and industry professionals.",
            },
            {
              number: "03",
              title: "LMG Sessions",
              text:
                "Original content and performance formats combining music, image and storytelling around artists and their projects.",
            },
            {
              number: "04",
              title: "Events & Experiences",
              text:
                "Music-led events and collaborative experiences connecting artists, audiences, venues and creative partners.",
            },
          ],

          developmentLabel: "ARTIST DEVELOPMENT",
          developmentTitle:
            "The stage is part of the artist's development.",
          developmentText:
            "Live reveals dimensions of a project that cannot exist through a release alone. Performance, presence, audience response and experience all contribute to the way an artist develops. We integrate these elements into the broader direction of the project.",

          networkLabel: "COLLABORATION",
          networkTitle:
            "Artists, venues, creatives and partners.",
          networkText:
            "Live projects are built through collaboration. LMG Music develops relationships with venues, studios, event professionals, creative partners and other industry actors to create relevant opportunities around its artists and projects.",

          processLabel: "FROM IDEA TO EXPERIENCE",
          process: [
            {
              number: "01",
              title: "Concept",
              text:
                "Define the format, purpose and creative direction.",
            },
            {
              number: "02",
              title: "Production",
              text:
                "Coordinate the people, location and resources required.",
            },
            {
              number: "03",
              title: "Performance",
              text:
                "Bring the project to life in front of its audience.",
            },
            {
              number: "04",
              title: "Content",
              text:
                "Extend the experience through images, video and storytelling.",
            },
          ],

          opportunityLabel: "OPPORTUNITIES",
          opportunityTitle:
            "Building connections through music.",
          opportunityText:
            "Beyond our own formats, we identify collaborations, performances and external opportunities that can contribute to an artist's visibility and development.",

          nextLabel: "DISCOVER LMG MUSIC",
          nextTitle:
            "Meet the artists behind the projects.",
          nextText:
            "Discover the artists currently developing their music and projects with LMG Music.",
          nextLink: "Our Artists",
        }
      : {
          parent: "À propos de LMG Music",
          label: "Live & Entertainment",

          title: "La musique se vit\naussi au-delà des sorties.",
          intro:
            "LMG Music développe des formats live, des performances et des expériences qui offrent aux artistes un autre espace pour exprimer leurs projets, rencontrer leurs publics et créer des moments qui dépassent les plateformes digitales.",

          statement:
            "Une sortie peut faire découvrir un projet. Le live permet de le vivre.",

          roleLabel: "NOTRE APPROCHE DU LIVE",
          roleTitle:
            "Créer le bon moment pour le bon projet.",
          roleText:
            "Nous considérons la scène comme une composante du développement artistique. L’objectif n’est pas simplement de placer un artiste sur une scène, mais de construire des formats et des opportunités cohérents avec son identité, son public et le stade de son développement.",

          formatsLabel: "NOS FORMATS",

          formats: [
            {
              number: "01",
              title: "Performances live",
              text:
                "Des opportunités de performance pensées pour mettre en valeur l’artiste, sa musique et son identité scénique.",
            },
            {
              number: "02",
              title: "Showcases",
              text:
                "Des formats ciblés autour de la découverte, de la présentation de projets et de la rencontre avec le public ou les professionnels.",
            },
            {
              number: "03",
              title: "LMG Sessions",
              text:
                "Des formats originaux mêlant performance, image et narration autour des artistes et de leurs projets.",
            },
            {
              number: "04",
              title: "Événements & expériences",
              text:
                "Des événements musicaux et expériences collaboratives reliant artistes, publics, lieux et partenaires créatifs.",
            },
          ],

          developmentLabel: "DÉVELOPPEMENT ARTISTIQUE",
          developmentTitle:
            "La scène fait partie du développement de l’artiste.",
          developmentText:
            "Le live révèle des dimensions d’un projet qu’une sortie seule ne peut pas exprimer. Performance, présence, réaction du public et expérience participent à l’évolution de l’artiste. Nous intégrons ces éléments à la direction globale du projet.",

          networkLabel: "COLLABORATION",
          networkTitle:
            "Artistes, lieux, créatifs et partenaires.",
          networkText:
            "Les projets live se construisent par la collaboration. LMG Music développe des relations avec des lieux, studios, professionnels de l’événementiel, partenaires créatifs et autres acteurs de l’industrie afin de créer des opportunités pertinentes autour de ses artistes et de ses projets.",

          processLabel: "DE L’IDÉE À L’EXPÉRIENCE",
          process: [
            {
              number: "01",
              title: "Concept",
              text:
                "Définir le format, son objectif et sa direction créative.",
            },
            {
              number: "02",
              title: "Production",
              text:
                "Coordonner les personnes, le lieu et les ressources nécessaires.",
            },
            {
              number: "03",
              title: "Performance",
              text:
                "Faire vivre le projet face à son public.",
            },
            {
              number: "04",
              title: "Contenu",
              text:
                "Prolonger l’expérience par l’image, la vidéo et la narration.",
            },
          ],

          opportunityLabel: "OPPORTUNITÉS",
          opportunityTitle:
            "Créer des connexions par la musique.",
          opportunityText:
            "Au-delà de nos propres formats, nous identifions des collaborations, performances et opportunités externes susceptibles de contribuer à la visibilité et au développement des artistes.",

          nextLabel: "DÉCOUVRIR LMG MUSIC",
          nextTitle:
            "Découvrez les artistes derrière les projets.",
          nextText:
            "Découvrez les artistes qui développent actuellement leur musique et leurs projets avec LMG Music.",
          nextLink: "Nos artistes",
        };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 bg-[#050505] px-6 py-14 md:px-8 md:py-20">
        <div className="pointer-events-none absolute -right-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-yellow-500/[0.035] blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center gap-3 text-[10px] text-zinc-600">
            <Link
              href="/about"
              className="transition hover:text-white"
            >
              {content.parent}
            </Link>

            <span>/</span>

            <span className="text-zinc-400">
              {content.label}
            </span>
          </div>

          <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            {content.label}
          </p>

          <h1 className="mt-7 max-w-5xl whitespace-pre-line text-[clamp(2.7rem,5.5vw,5.2rem)] font-medium leading-[1.02] tracking-[-0.05em]">
            {content.title}
          </h1>

          <p className="mt-8 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
            {content.intro}
          </p>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="px-6 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="max-w-5xl text-[clamp(2rem,4.5vw,4.4rem)] font-medium leading-[1.08] tracking-[-0.045em]">
            {content.statement}
          </p>
        </div>
      </section>

      {/* APPROACH */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.roleLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.roleTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.roleText}
            </p>
          </div>
        </div>
      </section>

      {/* FORMATS */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.formatsLabel}
          </p>

          <div className="mt-10 grid border-t border-zinc-800 md:grid-cols-2">
            {content.formats.map((format, index) => (
              <div
                key={format.number}
                className={[
                  "border-b border-zinc-800 py-10 md:min-h-[300px] md:p-10",
                  index % 2 === 0
                    ? "md:border-r md:pl-0"
                    : "md:pr-0",
                ].join(" ")}
              >
                <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                  {format.number}
                </span>

                <h2 className="mt-16 text-2xl font-medium tracking-[-0.035em] md:text-3xl">
                  {format.title}
                </h2>

                <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-500">
                  {format.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVELOPMENT */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {content.developmentLabel}
            </p>

            <h2 className="mt-6 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.developmentTitle}
            </h2>
          </div>

          <p className="max-w-xl self-end text-sm leading-8 text-zinc-400 md:text-base">
            {content.developmentText}
          </p>
        </div>
      </section>

      {/* PROCESS */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.processLabel}
          </p>

          <div className="mt-10 grid border-t border-zinc-800 md:grid-cols-4">
            {content.process.map((step, index) => (
              <div
                key={step.number}
                className={[
                  "border-b border-zinc-800 py-8 md:min-h-[270px] md:px-7 md:py-9",
                  index < content.process.length - 1
                    ? "md:border-r"
                    : "",
                  index === 0 ? "md:pl-0" : "",
                ].join(" ")}
              >
                <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                  {step.number}
                </span>

                <h3 className="mt-12 text-xl font-medium tracking-[-0.025em]">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NETWORK */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.networkLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.networkTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.networkText}
            </p>
          </div>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {content.opportunityLabel}
            </p>

            <h2 className="mt-6 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.opportunityTitle}
            </h2>
          </div>

          <p className="max-w-xl self-end text-sm leading-8 text-zinc-400 md:text-base">
            {content.opportunityText}
          </p>
        </div>
      </section>

      {/* NEXT */}
      <section className="border-t border-zinc-900 bg-[#090909] px-6 py-14 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {content.nextLabel}
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              {content.nextTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
              {content.nextText}
            </p>
          </div>

          <Link
            href="/artistes"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {content.nextLink} ↗
          </Link>
        </div>
      </section>
    </>
  );
}
