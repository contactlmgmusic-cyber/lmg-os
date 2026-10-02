"use client";

import Image from "next/image";
import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function TeamContent() {
  const { locale } = useSiteLanguage();
  const en = locale === "en";

  const c = en
    ? {
        label: "Team",
        title: "Different expertise.\nOne direction.",
        intro:
          "LMG Music brings together complementary profiles across strategy, communication and artistic direction. A compact team built to work closely with artists and their projects.",

        joseph: {
          role: "FOUNDER / LMG",
          name: "Joseph Kayaya",
          title: "Founder",
          text:
            "Joseph leads the development of LMG and its ecosystem. He works on the structure, strategic development and tools that support the group's projects and long-term growth.",
          areas: ["Strategy", "Development", "Digital", "LMG Ecosystem"],
        },

        yli: {
          role: "CO-FOUNDER / LMG MUSIC",
          name: "Yliana Faidherbe",
          title: "Communication & Brand Direction",
          text:
            "Yliana works across communication, branding and project development. Within LMG Music, she helps shape the positioning, image and development strategy surrounding artists and their projects.",
          areas: [
            "Communication",
            "Branding",
            "Project Development",
            "Partnerships",
          ],
        },

        marie: {
          role: "ARTISTIC DIRECTION / LMG MUSIC",
          name: "Marie Heveraet",
          title: "Music Artistic Director",
          text:
            "Marie leads the musical artistic direction of LMG Music. She works closely with artists on their identity, musical direction, repertoire and the artistic coherence of their projects.",
          areas: [
            "Artistic Direction",
            "Music",
            "Repertoire",
            "Artist Development",
          ],
        },

        togetherLabel: "HOW WE WORK TOGETHER",
        togetherTitle:
          "Strategy, image and music are not separate conversations.",
        togetherText:
          "The team works collaboratively around each project. Artistic decisions inform communication. Positioning influences opportunities. Strategy adapts to the artist and the music. This cross-functional approach keeps the project coherent while allowing each area to retain its own expertise.",

        pillars: [
          ["01", "Music", "Artistic identity and direction."],
          ["02", "Image", "Positioning, branding and communication."],
          ["03", "Development", "Strategy, opportunities and structure."],
        ],

        nextLabel: "WORKING WITH LMG MUSIC",
        nextTitle: "Have a project you want to introduce?",
        nextText:
          "Tell us about your music, your project and where you want to take it.",
        nextLink: "Present a project",
      }
    : {
        label: "Équipe",
        title: "Des expertises différentes.\nUne même direction.",
        intro:
          "LMG Music réunit des profils complémentaires autour de la stratégie, de la communication et de la direction artistique. Une équipe resserrée, pensée pour travailler au plus près des artistes et de leurs projets.",

        joseph: {
          role: "FONDATEUR / LMG",
          name: "Joseph Kayaya",
          title: "Fondateur",
          text:
            "Joseph pilote le développement de LMG et de son écosystème. Il intervient sur la structuration, le développement stratégique et les outils qui accompagnent les projets et la croissance du groupe.",
          areas: [
            "Stratégie",
            "Développement",
            "Digital",
            "Écosystème LMG",
          ],
        },

        yli: {
          role: "COFONDATRICE / LMG MUSIC",
          name: "Yliana Faidherbe",
          title: "Direction communication & branding",
          text:
            "Yliana intervient sur la communication, le branding et le développement des projets. Au sein de LMG Music, elle contribue au positionnement, à l’image et à la stratégie de développement autour des artistes et de leurs projets.",
          areas: [
            "Communication",
            "Branding",
            "Développement",
            "Partenariats",
          ],
        },

        marie: {
          role: "DIRECTION ARTISTIQUE / LMG MUSIC",
          name: "Marie Heveraet",
          title: "Directrice artistique musicale",
          text:
            "Marie pilote la direction artistique musicale de LMG Music. Elle travaille au plus près des artistes sur leur identité, leur direction musicale, leur répertoire et la cohérence artistique de leurs projets.",
          areas: [
            "Direction artistique",
            "Musique",
            "Répertoire",
            "Développement artiste",
          ],
        },

        togetherLabel: "NOTRE FAÇON DE TRAVAILLER",
        togetherTitle:
          "La stratégie, l’image et la musique ne se construisent pas séparément.",
        togetherText:
          "L’équipe travaille de manière transversale autour de chaque projet. Les choix artistiques nourrissent la communication. Le positionnement influence les opportunités. La stratégie s’adapte à l’artiste et à sa musique. Cette approche permet de préserver une direction cohérente tout en conservant des expertises clairement définies.",

        pillars: [
          ["01", "Musique", "Identité et direction artistique."],
          ["02", "Image", "Positionnement, branding et communication."],
          ["03", "Développement", "Stratégie, opportunités et structuration."],
        ],

        nextLabel: "TRAVAILLER AVEC LMG MUSIC",
        nextTitle: "Vous avez un projet à nous présenter ?",
        nextText:
          "Parlez-nous de votre musique, de votre projet et de la direction que vous souhaitez lui donner.",
        nextLink: "Présenter un projet",
      };

  return (
    <>
      {/* HERO */}
      <section className="border-b border-zinc-900 bg-[#050505] px-6 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
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

      {/* JOSEPH — OPENING PROFILE */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden border border-zinc-800 bg-[#0c0c0c] md:grid-cols-[0.82fr_1.18fr]">
            <div className="relative min-h-[520px] bg-zinc-900 md:min-h-[680px]">
              <Image
                src="/team/joseph.jpg"
                alt="Joseph Kayaya"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 42vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

              <span className="absolute bottom-6 left-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/70">
                01 / FOUNDER
              </span>
            </div>

            <div className="flex min-h-[520px] flex-col p-7 md:min-h-[680px] md:p-10 lg:p-14">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                {c.joseph.role}
              </p>

              <div className="my-auto py-12">
                <h2 className="text-[clamp(3rem,5vw,5.4rem)] font-medium leading-[0.98] tracking-[-0.055em]">
                  Joseph
                  <br />
                  Kayaya
                </h2>

                <p className="mt-5 text-sm uppercase tracking-[0.15em] text-zinc-500">
                  {c.joseph.title}
                </p>

                <p className="mt-8 max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
                  {c.joseph.text}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-6">
                {c.joseph.areas.map((area) => (
                  <span
                    key={area}
                    className="border border-zinc-800 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-zinc-500"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YLIANA */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_0.9fr] md:gap-20">
            <div className="order-2 md:order-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                {c.yli.role}
              </p>

              <p className="mt-10 text-[8rem] font-medium leading-[0.65] tracking-[-0.09em] text-white/[0.035] md:text-[12rem]">
                02
              </p>

              <h2 className="mt-10 text-[clamp(2.8rem,5vw,5rem)] font-medium leading-[1] tracking-[-0.05em]">
                {c.yli.name}
              </h2>

              <p className="mt-5 text-sm uppercase tracking-[0.14em] text-zinc-500">
                {c.yli.title}
              </p>

              <p className="mt-8 max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
                {c.yli.text}
              </p>

              <div className="mt-9 grid grid-cols-2 border-t border-zinc-800">
                {c.yli.areas.map((area, index) => (
                  <div
                    key={area}
                    className={[
                      "border-b border-zinc-800 py-5",
                      index % 2 === 0
                        ? "border-r pr-5"
                        : "pl-5",
                    ].join(" ")}
                  >
                    <span className="text-[9px] text-yellow-500">
                      0{index + 1}
                    </span>
                    <p className="mt-2 text-xs text-zinc-400">
                      {area}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative mx-auto aspect-[3/4] max-w-[520px] overflow-hidden bg-zinc-900">
                <Image
                  src="/team/yli.jpg"
                  alt="Yliana Faidherbe"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 42vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARIE */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden bg-[#111315] md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[480px] md:min-h-[620px]">
              <Image
                src="/team/marie.jpg"
                alt="Marie Heveraet"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 48vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-7 right-7">
                <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-yellow-500">
                  03 / ARTISTIC DIRECTION
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between border border-zinc-800 p-7 md:p-10 lg:p-12">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  {c.marie.role}
                </p>

                <h2 className="mt-12 text-[clamp(2.8rem,5vw,5rem)] font-medium leading-[1] tracking-[-0.05em]">
                  {c.marie.name}
                </h2>

                <p className="mt-5 text-sm uppercase tracking-[0.14em] text-zinc-500">
                  {c.marie.title}
                </p>

                <p className="mt-8 max-w-xl text-sm leading-8 text-zinc-400 md:text-base">
                  {c.marie.text}
                </p>
              </div>

              <div className="mt-16">
                {c.marie.areas.map((area, index) => (
                  <div
                    key={area}
                    className="flex items-center justify-between border-t border-zinc-800 py-4"
                  >
                    <span className="text-sm text-zinc-400">
                      {area}
                    </span>
                    <span className="text-[9px] text-yellow-500">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIVE */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {c.togetherLabel}
          </p>

          <div className="mt-8 grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:gap-20">
            <h2 className="max-w-4xl text-[clamp(2.5rem,4.5vw,4.8rem)] font-medium leading-[1.04] tracking-[-0.05em]">
              {c.togetherTitle}
            </h2>

            <p className="self-end text-sm leading-8 text-zinc-400">
              {c.togetherText}
            </p>
          </div>

          <div className="mt-16 grid border-t border-zinc-800 md:grid-cols-3">
            {c.pillars.map(([number, title, text], index) => (
              <div
                key={number}
                className={[
                  "border-b border-zinc-800 py-8 md:min-h-[210px] md:px-8",
                  index < 2 ? "md:border-r" : "",
                  index === 0 ? "md:pl-0" : "",
                ].join(" ")}
              >
                <span className="text-[10px] text-yellow-500">
                  {number}
                </span>

                <h3 className="mt-10 text-2xl font-medium">
                  {title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
            href="/rejoindre"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {c.nextLink} ↗
          </Link>
        </div>
      </section>
    </>
  );
}
