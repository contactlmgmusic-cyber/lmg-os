import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Legacy Music Group",
  description:
    "Management, marketing, booking et développement artistique pour les artistes accompagnés par Legacy Music Group.",
};

const services = [
  {
    title: "Artist Development",
    text: "Nous accompagnons les artistes dans la construction de leur identité, leur direction artistique et leur vision long terme.",
    points: [
      "Positionnement artistique",
      "Développement de l’image",
      "Stratégie de carrière",
      "Préparation des sorties",
    ],
  },
  {
    title: "Management",
    text: "Nous aidons les artistes à structurer leur projet, organiser leur activité et avancer avec une stratégie claire.",
    points: [
      "Accompagnement quotidien",
      "Organisation du projet",
      "Coordination des équipes",
      "Suivi des objectifs",
    ],
  },
  {
    title: "Marketing",
    text: "Nous développons la visibilité des artistes grâce à une approche moderne du contenu, des réseaux sociaux et du branding.",
    points: [
      "Stratégie réseaux sociaux",
      "Branding artiste",
      "Campagnes de sortie",
      "Développement d’audience",
    ],
  },
  {
    title: "Booking",
    text: "Nous travaillons sur les opportunités de scène, les événements, les showcases et les connexions professionnelles.",
    points: [
      "Recherche de dates",
      "Showcases",
      "Événements",
      "Mise en relation",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3a2a00_0%,#050505_45%,#000_100%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <Link
  href="/site"
  className="text-sm text-zinc-400 hover:text-white"
>
  ← Retour au site
</Link>
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
            Legacy Music Group
          </p>

          <h1 className="text-5xl font-black uppercase md:text-8xl">
            Nos Services
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
            Legacy Music Group accompagne les artistes dans leur développement,
            leur image, leur marketing et leur croissance professionnelle.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-6xl gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="grid gap-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 lg:grid-cols-[35%_65%]"
            >
              <div>
                <p className="text-sm text-yellow-500">
                  0{index + 1}
                </p>

                <h2 className="mt-4 text-3xl font-black">
                  {service.title}
                </h2>
              </div>

              <div>
                <p className="text-lg leading-8 text-zinc-400">
                  {service.text}
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {service.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-300"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-900 px-6 py-28 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
          Rejoindre LMG
        </p>

        <h2 className="text-4xl font-black md:text-6xl">
          Prêt à construire ton héritage ?
        </h2>

        <Link
          href="/site/rejoindre"
          className="mt-12 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
        >
          Rejoindre LMG
        </Link>
      </section>
    </main>
  );
}