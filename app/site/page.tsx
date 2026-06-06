import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Image from "next/image";
import FeaturedArtists from "@/components/site/FeaturedArtists";
import FeaturedReleases from "@/components/site/FeaturedReleases";
import Footer from "@/components/site/Footer";
import ApplicationForm from "@/components/site/ApplicationForm";

export default function SitePage() {
  return (
    <main className="min-h-screen bg-black text-white">
        <Navbar />
      <section className="relative flex min-h-screen items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3a2a00_0%,#050505_45%,#000_100%)]" />

        <div className="relative z-10 max-w-5xl">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
            Legacy Music Group
          </p>

          <h1 className="text-6xl font-black uppercase leading-tight md:text-9xl">
  Build Your <br />
  Legacy
</h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-300 md:text-xl">
  Nous accompagnons les artistes dans la construction d’une carrière durable
  grâce au management, au marketing et au développement stratégique.
</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#contact"
              className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
            >
              Rejoindre LMG
            </Link>

            <Link
              href="#services"
              className="rounded-full border border-zinc-700 px-8 py-4 font-bold text-white hover:border-yellow-500"
            >
              Découvrir nos services
            </Link>
          </div>
        </div>
      </section>

      <FeaturedArtists />
      <FeaturedReleases />

      <section id="services" className="bg-zinc-950 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
            Expertises
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Ce que LMG construit avec les artistes
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Artist Development", "Développement artistique, vision globale et structuration du projet."],
              ["Management", "Accompagnement stratégique, organisation et pilotage de carrière."],
              ["Marketing", "Image, contenu, réseaux sociaux et croissance d’audience."],
              ["Booking", "Recherche d’opportunités, showcases, événements et mise en relation."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-zinc-800 bg-black p-6 hover:border-yellow-500"
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
            Artists
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Les talents accompagnés
          </h2>

          <div className="mt-14 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              DJ / Performer
            </p>

            <h3 className="mt-4 text-4xl font-black">DJ El Jack</h3>

            <p className="mt-4 max-w-2xl text-zinc-300">
              Open Format • Afrobeat • Amapiano • Urban Music
            </p>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-black md:text-6xl">
            Pourquoi Legacy Music Group ?
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              "Vision long terme",
              "Approche moderne",
              "Accompagnement humain",
              "Réseau professionnel",
            ].map((item, index) => (
              <div key={item} className="border-l border-yellow-500 pl-6">
                <p className="text-sm text-yellow-500">0{index + 1}</p>
                <h3 className="mt-4 text-xl font-bold">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ApplicationForm />
      <Footer />
    </main>
  );
}