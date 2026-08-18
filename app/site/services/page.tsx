import Link from "next/link";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Accompagnement artistique | Legacy Music Group",
  description:
    "Artist development, management, marketing et booking : découvrez l'accompagnement proposé par Legacy Music Group.",
};

const pillars = [
  {
    number: "01",
    title: "Artist Development",
    text: "Construire une identité artistique forte, cohérente et capable de s'inscrire dans le temps.",
    points: [
      "Positionnement artistique",
      "Direction & identité",
      "Stratégie de carrière",
      "Développement long terme",
    ],
  },
  {
    number: "02",
    title: "Management",
    text: "Structurer le projet et coordonner les différentes dimensions de la carrière de l'artiste.",
    points: [
      "Pilotage du projet",
      "Coordination des équipes",
      "Suivi des objectifs",
      "Opportunités professionnelles",
    ],
  },
  {
    number: "03",
    title: "Marketing",
    text: "Créer une stratégie cohérente autour de chaque sortie et développer durablement l'audience de l'artiste.",
    points: [
      "Stratégie de sortie",
      "Contenu & réseaux sociaux",
      "Branding",
      "Développement d'audience",
    ],
  },
  {
    number: "04",
    title: "Booking",
    text: "Développer la présence scénique de l'artiste et créer de nouvelles opportunités avec les professionnels du live.",
    points: [
      "Recherche de dates",
      "Showcases",
      "Événements",
      "Relations professionnelles",
    ],
  },
];

const method = [
  {
    number: "01",
    title: "Comprendre",
    text: "Analyser l'univers, les ambitions, le positionnement et les besoins réels de l'artiste.",
  },
  {
    number: "02",
    title: "Structurer",
    text: "Définir une direction, des priorités et une stratégie cohérente autour du projet.",
  },
  {
    number: "03",
    title: "Développer",
    text: "Mettre en œuvre les actions nécessaires autour de la musique, de l'image et des opportunités.",
  },
  {
    number: "04",
    title: "Faire grandir",
    text: "Mesurer, ajuster et construire une trajectoire capable de durer dans le temps.",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 px-6 pb-24 pt-36 md:px-8 md:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#3a2a00_0%,#090700_25%,#000_65%)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Link
            href="/site"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Retour au site
          </Link>

          <p className="mt-16 text-sm uppercase tracking-[0.4em] text-yellow-500">
            Legacy Music Group
          </p>

          <h1 className="mt-5 max-w-5xl text-6xl font-black uppercase leading-[0.95] md:text-8xl">
            Construire des carrières.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
            LMG accompagne les artistes dans leur développement, leur
            structuration et la construction d&apos;une trajectoire artistique
            durable.
          </p>
        </div>
      </section>

      {/* POSITIONNEMENT */}
      <section className="border-b border-zinc-900 px-6 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[38%_62%]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Notre approche
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase leading-tight md:text-6xl">
              Plus qu&apos;une liste de services.
            </h2>
          </div>

          <div className="flex items-center">
            <div>
              <p className="max-w-3xl text-xl leading-9 text-zinc-300 md:text-2xl">
                Chaque artiste possède une identité, une histoire et des
                ambitions différentes. Notre rôle est de construire
                l&apos;accompagnement adapté à son projet plutôt que
                d&apos;appliquer une formule standard.
              </p>

              <p className="mt-8 max-w-3xl leading-8 text-zinc-500">
                LMG intervient comme partenaire du développement de
                l&apos;artiste : stratégie, management, marketing, image,
                réseau et opportunités avancent dans une même direction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PILIERS */}
      <section className="bg-zinc-950 px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Nos expertises
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              Quatre piliers. Une seule direction.
            </h2>
          </div>

          <div className="space-y-5">
            {pillars.map((pillar) => (
              <div
                key={pillar.number}
                className="group grid gap-8 border-t border-zinc-800 py-10 transition lg:grid-cols-[12%_28%_60%]"
              >
                <div>
                  <p className="text-sm font-bold text-yellow-500">
                    {pillar.number}
                  </p>
                </div>

                <div>
                  <h3 className="text-3xl font-black uppercase transition group-hover:text-yellow-500">
                    {pillar.title}
                  </h3>
                </div>

                <div>
                  <p className="max-w-2xl text-lg leading-8 text-zinc-400">
                    {pillar.text}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {pillar.points.map((point) => (
                      <span
                        key={point}
                        className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-400"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-zinc-800" />
          </div>
        </div>
      </section>

      {/* MÉTHODE */}
      <section className="border-b border-zinc-900 px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Notre méthode
          </p>

          <h2 className="mt-5 max-w-4xl text-4xl font-black uppercase md:text-6xl">
            De l&apos;univers artistique à la trajectoire.
          </h2>

          <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-900 md:grid-cols-4">
            {method.map((step) => (
              <div
                key={step.number}
                className="bg-black p-8 md:min-h-[300px]"
              >
                <p className="text-2xl font-black text-yellow-500">
                  {step.number}
                </p>

                <h3 className="mt-12 text-2xl font-black uppercase">
                  {step.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-zinc-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTENARIAT */}
      <section className="bg-zinc-950 px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Une vision commune
          </p>

          <h2 className="mx-auto mt-5 max-w-5xl text-4xl font-black uppercase leading-tight md:text-6xl">
            Nous construisons avec les artistes que nous accompagnons.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
  Notre objectif n&apos;est pas de multiplier les projets, mais de
  construire des collaborations fortes et de nous investir durablement
  dans le développement de chaque artiste que nous accompagnons.
</p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 px-6 py-28 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Build Your Legacy
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
  Prêt à construire la suite ?
</h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Présente-nous ton univers, ta musique et ta vision.
          </p>

          <Link
            href="/site/rejoindre"
            className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
          >
            Présenter mon projet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}