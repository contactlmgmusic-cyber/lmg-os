import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Équipe | Legacy Music Group",
  description:
    "Découvrez l'équipe qui porte la vision, le développement et la direction artistique de Legacy Music Group.",
};

const team = [
  {
    name: "Joseph",
    role: "Fondateur & Président",
    image: "/team/joseph.jpg",
    imageClass: "object-cover object-top",
    description:
      "Porte la vision et le développement du pôle musical de Legacy Music Group, du management des artistes aux relations et opportunités professionnelles.",
    areas: [
      "Pôle musical",
      "Management",
      "Partenariats",
      "Opportunités",
    ],
  },
  {
    name: "Yliana Faidherbe",
    role: "Directrice Générale",
    image: "/team/yliana.jpg",
    imageClass: "object-cover object-[center_20%]",
    description:
      "Pilote la stratégie et le développement de Legacy Music Group, avec une implication particulière dans LMG Agency ainsi que dans la communication, le marketing et l'image des artistes.",
    areas: [
      "Direction générale",
      "LMG Agency",
      "Communication",
      "Marketing & image",
    ],
  },
  {
    name: "Deepa Marie Heveraet",
    role: "Directrice Artistique",
    image: "/team/deepa.jpg",
    imageClass: "object-cover object-center",
    description:
      "Imagine et développe la direction créative des artistes et des projets musicaux de LMG, de leur univers visuel aux concepts qui accompagnent leurs sorties.",
    areas: [
      "Direction artistique",
      "Univers visuels",
      "Concepts créatifs",
      "Image des projets",
    ],
  },
];

export default function TeamPage() {
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

          <h1 className="mt-5 text-6xl font-black uppercase leading-none md:text-8xl">
            Notre équipe
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
            Trois expertises complémentaires réunies autour d&apos;une même
            ambition : construire des projets artistiques solides et durables.
          </p>
        </div>
      </section>

      {/* TEAM */}
      <section className="px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Direction
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
              Les personnes derrière LMG.
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {team.map((member) => (
              <article
                key={member.name}
                className="group overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950 transition duration-500 hover:border-zinc-700"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className={`${member.imageClass} transition duration-700 group-hover:scale-[1.03]`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                </div>

                <div className="p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
                    {member.role}
                  </p>

                  <h3 className="mt-4 text-3xl font-black uppercase">
                    {member.name}
                  </h3>

                  <p className="mt-6 leading-8 text-zinc-400">
                    {member.description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {member.areas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-zinc-800 px-4 py-2 text-xs text-zinc-400"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VISION COMMUNE */}
      <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[38%_62%]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Une direction commune
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase leading-tight md:text-6xl">
              Trois regards. Une même vision.
            </h2>
          </div>

          <div className="flex items-center">
            <div>
              <p className="text-xl leading-9 text-zinc-300 md:text-2xl">
                La stratégie, le développement business et la direction
                artistique avancent ensemble pour construire des projets
                cohérents, ambitieux et capables de s&apos;inscrire dans le
                temps.
              </p>

              <p className="mt-8 leading-8 text-zinc-500">
                Cette complémentarité permet à Legacy Music Group de penser
                chaque projet dans son ensemble : musique, image,
                communication, développement et opportunités professionnelles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 px-6 py-28 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Build Your Legacy
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            Construisons la suite.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Artistes, partenaires ou professionnels de l&apos;industrie :
            échangeons autour de votre projet.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/site/rejoindre"
              className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
            >
              Rejoindre LMG
            </Link>

            <a
              href="mailto:contact@legacymusicgroup.fr"
              className="rounded-full border border-zinc-700 px-8 py-4 font-bold text-white transition hover:border-yellow-500"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}