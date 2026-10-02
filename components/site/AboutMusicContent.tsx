"use client";

import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function AboutMusicContent() {
  const { locale } = useSiteLanguage();

  const content =
    locale === "en"
      ? {
          label: "About LMG Music",
          title: "Music first.\nBuilt for what comes next.",
          intro:
            "LMG Music is the music division of LMG Group. We develop artists, projects and creative strategies designed to grow over time — from artistic direction to releases, live opportunities and long-term career development.",

          identityLabel: "WHO WE ARE",
          identityTitle:
            "An independent structure built around artists.",
          identityText:
            "LMG Music brings together artistic development, project strategy and execution within one ecosystem. Our role is not simply to release music. We work alongside artists to build coherent identities, stronger projects and sustainable trajectories.",

          visionLabel: "OUR VISION",
          visionTitle:
            "Develop the artist. Structure the project. Build the future.",
          visionText:
            "Every artist and every project has its own direction. Our approach starts there. We connect creative vision with strategy, organisation and the right opportunities to help projects move forward without losing what makes them distinctive.",

          approachLabel: "OUR APPROACH",
          approachTitle:
            "Creative direction meets real development.",
          approachText:
            "Music development requires more than isolated services. LMG Music works across the different stages of an artist's project, creating continuity between artistic choices, image, releases, audience development, live opportunities and professional growth.",

          points: [
            {
              number: "01",
              title: "Artist development",
              text:
                "Supporting artistic identity, positioning and the long-term direction of each project.",
            },
            {
              number: "02",
              title: "Music & releases",
              text:
                "Structuring releases and the creative, strategic and operational work surrounding them.",
            },
            {
              number: "03",
              title: "Image & audience",
              text:
                "Building coherence between music, visual identity, communication and the relationship with audiences.",
            },
            {
              number: "04",
              title: "Live & opportunities",
              text:
                "Connecting projects with live formats, collaborations and opportunities that contribute to their development.",
            },
          ],

          groupLabel: "PART OF LMG GROUP",
          groupTitle:
            "One music division. A wider creative ecosystem.",
          groupText:
            "LMG Music operates within LMG Group, alongside complementary expertise designed to connect music, communication, creative development and new opportunities. This structure allows projects to access broader capabilities while keeping a dedicated music-focused direction.",

          nextLabel: "DISCOVER OUR WORK",
          nextTitle: "See how LMG Music works.",
          nextText:
            "Explore our areas of expertise and the way we support music projects from development to execution.",
          nextLink: "What We Do",
        }
      : {
          label: "À propos de LMG Music",
          title: "La musique d’abord.\nConstruire la suite.",
          intro:
            "LMG Music est le pôle musical de LMG Group. Nous développons des artistes, des projets et des stratégies créatives pensées pour évoluer dans le temps — de la direction artistique aux sorties, au live et au développement de carrière.",

          identityLabel: "QUI SOMMES-NOUS",
          identityTitle:
            "Une structure indépendante construite autour des artistes.",
          identityText:
            "LMG Music réunit développement artistique, stratégie de projet et exécution au sein d’un même écosystème. Notre rôle ne se limite pas à sortir de la musique. Nous travaillons aux côtés des artistes pour construire des identités cohérentes, renforcer leurs projets et développer des trajectoires durables.",

          visionLabel: "NOTRE VISION",
          visionTitle:
            "Développer l’artiste. Structurer le projet. Construire la suite.",
          visionText:
            "Chaque artiste et chaque projet possède sa propre direction. Notre approche commence par là. Nous relions vision créative, stratégie, organisation et opportunités afin de faire avancer les projets sans perdre ce qui les rend singuliers.",

          approachLabel: "NOTRE APPROCHE",
          approachTitle:
            "La direction créative au service du développement.",
          approachText:
            "Le développement musical ne peut pas reposer sur une succession de prestations isolées. LMG Music intervient sur les différentes étapes du projet afin de créer une continuité entre choix artistiques, image, sorties, développement d’audience, live et évolution professionnelle.",

          points: [
            {
              number: "01",
              title: "Développement artistique",
              text:
                "Accompagner l’identité artistique, le positionnement et la direction à long terme de chaque projet.",
            },
            {
              number: "02",
              title: "Musique & sorties",
              text:
                "Structurer les sorties et le travail créatif, stratégique et opérationnel qui les accompagne.",
            },
            {
              number: "03",
              title: "Image & audience",
              text:
                "Construire une cohérence entre musique, identité visuelle, communication et relation avec les publics.",
            },
            {
              number: "04",
              title: "Live & opportunités",
              text:
                "Connecter les projets à des formats live, des collaborations et des opportunités utiles à leur développement.",
            },
          ],

          groupLabel: "AU SEIN DE LMG GROUP",
          groupTitle:
            "Un pôle musical. Un écosystème créatif plus large.",
          groupText:
            "LMG Music évolue au sein de LMG Group, aux côtés d’expertises complémentaires qui permettent de relier musique, communication, développement créatif et nouvelles opportunités. Cette organisation donne aux projets accès à des compétences plus larges tout en conservant une direction entièrement dédiée à la musique.",

          nextLabel: "DÉCOUVRIR NOTRE TRAVAIL",
          nextTitle: "Découvrez comment travaille LMG Music.",
          nextText:
            "Explorez nos expertises et notre manière d’accompagner les projets musicaux, du développement à l’exécution.",
          nextLink: "What We Do",
        };

  return (
    <>
      <section className="border-b border-zinc-900 bg-[#070707] px-6 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
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

      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.identityLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.identityTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.identityText}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.visionLabel}
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-20">
            <h2 className="max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.visionTitle}
            </h2>

            <p className="max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.visionText}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 md:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                {content.approachLabel}
              </p>

              <h2 className="mt-6 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
                {content.approachTitle}
              </h2>
            </div>

            <p className="max-w-xl self-end text-sm leading-8 text-zinc-400 md:text-base">
              {content.approachText}
            </p>
          </div>

          <div className="mt-14 grid border-t border-zinc-800 md:grid-cols-2">
            {content.points.map((point, index) => (
              <div
                key={point.number}
                className={[
                  "border-b border-zinc-800 py-8 md:p-10",
                  index % 2 === 0
                    ? "md:border-r md:pl-0"
                    : "md:pr-0",
                ].join(" ")}
              >
                <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                  {point.number}
                </span>

                <h3 className="mt-5 text-xl font-medium tracking-[-0.025em] md:text-2xl">
                  {point.title}
                </h3>

                <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-500">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.groupLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.groupTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.groupText}
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

      <section className="px-6 py-14 md:px-8 md:py-16">
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
            href="/about/what-we-do"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {content.nextLink} ↗
          </Link>
        </div>
      </section>
    </>
  );
}
