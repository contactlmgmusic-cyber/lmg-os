"use client";

import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function WhatWeDoContent() {
  const { locale } = useSiteLanguage();

  const content =
    locale === "en"
      ? {
          parent: "About LMG Music",
          label: "What We Do",
          title: "From artistic vision\nto real development.",
          intro:
            "LMG Music works across the key stages of a music project. We connect artistic direction, strategy and execution to help artists build coherent projects and move them forward over time.",

          modelLabel: "HOW WE WORK",
          modelTitle:
            "One project. Different stages. One direction.",
          modelText:
            "We do not approach artist development as a collection of disconnected services. Each decision — music, image, release, live or opportunity — is considered as part of the same trajectory.",

          areasLabel: "OUR AREAS OF WORK",

          areas: [
            {
              number: "01",
              title: "Artistic Development",
              text:
                "Defining and strengthening the artistic identity, positioning and long-term direction of a project.",
              items: [
                "Artistic positioning",
                "Creative direction",
                "Project identity",
                "Development roadmap",
              ],
            },
            {
              number: "02",
              title: "Music & Repertoire",
              text:
                "Supporting the musical direction of projects and creating coherence between repertoire, artistic ambitions and future releases.",
              items: [
                "Musical direction",
                "Repertoire development",
                "Creative coordination",
                "Release preparation",
              ],
            },
            {
              number: "03",
              title: "Release Strategy",
              text:
                "Building structured release plans designed around the project, its audience and its stage of development.",
              items: [
                "Release planning",
                "Rollout strategy",
                "Project coordination",
                "Release follow-up",
              ],
            },
            {
              number: "04",
              title: "Artist Image",
              text:
                "Connecting the music with a clear and consistent artistic universe across visual identity, content and communication.",
              items: [
                "Creative universe",
                "Visual direction",
                "Content coherence",
                "Artist positioning",
              ],
            },
            {
              number: "05",
              title: "Live & Opportunities",
              text:
                "Identifying and developing opportunities that can strengthen the artist's visibility, experience and professional growth.",
              items: [
                "Live development",
                "Performance opportunities",
                "Collaborations",
                "Strategic connections",
              ],
            },
            {
              number: "06",
              title: "Career Development",
              text:
                "Building a longer-term perspective around the artist and helping structure the next stages of their development.",
              items: [
                "Career strategy",
                "Project structuring",
                "Development priorities",
                "Long-term planning",
              ],
            },
          ],

          processLabel: "THE PROCESS",
          processTitle:
            "A development process built around the project.",

          process: [
            {
              number: "01",
              title: "Understand",
              text:
                "We start with the artist, the music, the ambitions and the current stage of the project.",
            },
            {
              number: "02",
              title: "Define",
              text:
                "We establish the priorities, positioning and direction needed to move the project forward.",
            },
            {
              number: "03",
              title: "Build",
              text:
                "We coordinate the creative and operational work around music, image, releases and opportunities.",
            },
            {
              number: "04",
              title: "Develop",
              text:
                "We follow the project over time, evaluate progress and prepare the next stage.",
            },
          ],

          ecosystemLabel: "THE LMG ECOSYSTEM",
          ecosystemTitle:
            "Music at the centre. More expertise when the project needs it.",
          ecosystemText:
            "As part of LMG Group, LMG Music can connect music projects with complementary expertise across communication, branding, digital development and creative production. These resources are activated when they serve the artist's project — while LMG Music remains focused on the musical and artistic direction.",

          liveLabel: "LIVE & ENTERTAINMENT",
          liveTitle:
            "Taking projects beyond the release.",
          liveText:
            "Live performance is part of an artist's development. LMG Music works on formats and opportunities that allow projects to exist beyond digital platforms and connect directly with audiences.",

          liveLink: "Explore Live & Entertainment",

          nextLabel: "OUR ARTISTS",
          nextTitle:
            "Discover the artists we're building with.",
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
          modelTitle:
            "Un projet. Plusieurs étapes. Une même direction.",
          modelText:
            "Nous ne considérons pas le développement artistique comme une succession de prestations indépendantes. Chaque décision — musique, image, sortie, live ou opportunité — s’inscrit dans une même trajectoire.",

          areasLabel: "NOS DOMAINES D’INTERVENTION",

          areas: [
            {
              number: "01",
              title: "Développement artistique",
              text:
                "Définir et renforcer l’identité artistique, le positionnement et la direction à long terme du projet.",
              items: [
                "Positionnement artistique",
                "Direction créative",
                "Identité du projet",
                "Feuille de route",
              ],
            },
            {
              number: "02",
              title: "Musique & répertoire",
              text:
                "Accompagner la direction musicale et créer une cohérence entre le répertoire, les ambitions artistiques et les prochaines sorties.",
              items: [
                "Direction musicale",
                "Développement du répertoire",
                "Coordination créative",
                "Préparation des sorties",
              ],
            },
            {
              number: "03",
              title: "Stratégie de sortie",
              text:
                "Construire des plans de sortie structurés selon le projet, son public et son niveau de développement.",
              items: [
                "Planification des sorties",
                "Stratégie de rollout",
                "Coordination du projet",
                "Suivi des sorties",
              ],
            },
            {
              number: "04",
              title: "Image artiste",
              text:
                "Relier la musique à un univers artistique clair et cohérent à travers l’identité visuelle, les contenus et la communication.",
              items: [
                "Univers créatif",
                "Direction visuelle",
                "Cohérence des contenus",
                "Positionnement artiste",
              ],
            },
            {
              number: "05",
              title: "Live & opportunités",
              text:
                "Identifier et développer les opportunités capables de renforcer la visibilité, l’expérience et l’évolution professionnelle de l’artiste.",
              items: [
                "Développement live",
                "Opportunités de scène",
                "Collaborations",
                "Mises en relation stratégiques",
              ],
            },
            {
              number: "06",
              title: "Développement de carrière",
              text:
                "Construire une vision à plus long terme autour de l’artiste et structurer les prochaines étapes de son développement.",
              items: [
                "Stratégie de carrière",
                "Structuration du projet",
                "Priorités de développement",
                "Planification long terme",
              ],
            },
          ],

          processLabel: "LE PROCESSUS",
          processTitle:
            "Un développement construit autour du projet.",

          process: [
            {
              number: "01",
              title: "Comprendre",
              text:
                "Nous partons de l’artiste, de sa musique, de ses ambitions et du stade actuel de son projet.",
            },
            {
              number: "02",
              title: "Définir",
              text:
                "Nous établissons les priorités, le positionnement et la direction nécessaires pour faire avancer le projet.",
            },
            {
              number: "03",
              title: "Construire",
              text:
                "Nous coordonnons le travail créatif et opérationnel autour de la musique, de l’image, des sorties et des opportunités.",
            },
            {
              number: "04",
              title: "Développer",
              text:
                "Nous suivons le projet dans le temps, évaluons son évolution et préparons l’étape suivante.",
            },
          ],

          ecosystemLabel: "L’ÉCOSYSTÈME LMG",
          ecosystemTitle:
            "La musique au centre. Des expertises complémentaires quand le projet en a besoin.",
          ecosystemText:
            "Au sein de LMG Group, LMG Music peut connecter les projets musicaux à des expertises complémentaires en communication, branding, développement digital et production créative. Ces ressources sont mobilisées lorsqu’elles servent le projet de l’artiste, tandis que LMG Music conserve une direction centrée sur la musique et le développement artistique.",

          liveLabel: "LIVE & ENTERTAINMENT",
          liveTitle:
            "Faire vivre les projets au-delà des sorties.",
          liveText:
            "La scène fait partie du développement d’un artiste. LMG Music travaille sur des formats et des opportunités permettant aux projets d’exister au-delà des plateformes digitales et de rencontrer directement leurs publics.",

          liveLink: "Découvrir Live & Entertainment",

          nextLabel: "NOS ARTISTES",
          nextTitle:
            "Découvrez les artistes avec qui nous construisons.",
          nextText:
            "Explorez les artistes et les projets actuellement développés au sein de LMG Music.",
          nextLink: "Nos artistes",
        };

  return (
    <>
      <section className="border-b border-zinc-900 bg-[#070707] px-6 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 text-[10px] text-zinc-600">
            <Link href="/about" className="transition hover:text-white">
              {content.parent}
            </Link>
            <span>/</span>
            <span className="text-zinc-400">{content.label}</span>
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

      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.modelLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.modelTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.modelText}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.areasLabel}
          </p>

          <div className="mt-10 border-t border-zinc-800">
            {content.areas.map((area) => (
              <div
                key={area.number}
                className="grid gap-7 border-b border-zinc-800 py-10 md:grid-cols-[80px_0.8fr_1fr] md:gap-12 md:py-12"
              >
                <span className="text-[10px] font-semibold tracking-[0.2em] text-yellow-500">
                  {area.number}
                </span>

                <div>
                  <h2 className="text-2xl font-medium tracking-[-0.035em] md:text-3xl">
                    {area.title}
                  </h2>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-500">
                    {area.text}
                  </p>
                </div>

                <div className="grid content-start gap-3 md:grid-cols-2">
                  {area.items.map((item) => (
                    <div
                      key={item}
                      className="border-t border-zinc-800 pt-3 text-xs text-zinc-400"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.processLabel}
          </p>

          <h2 className="mt-6 max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
            {content.processTitle}
          </h2>

          <div className="mt-14 grid border-t border-zinc-800 md:grid-cols-4">
            {content.process.map((step, index) => (
              <div
                key={step.number}
                className={[
                  "border-b border-zinc-800 py-8 md:min-h-[280px] md:px-7 md:py-9",
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

      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {content.ecosystemLabel}
            </p>

            <h2 className="mt-6 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.ecosystemTitle}
            </h2>
          </div>

          <div className="self-end">
            <p className="max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.ecosystemText}
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

      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {content.liveLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.04em] md:text-5xl">
              {content.liveTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {content.liveText}
            </p>

            <Link
              href="/about/live"
              className="mt-8 inline-flex border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
            >
              {content.liveLink} ↗
            </Link>
          </div>
        </div>
      </section>

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
