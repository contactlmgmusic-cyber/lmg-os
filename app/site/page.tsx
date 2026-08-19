import Link from "next/link";

import Navbar from "@/components/site/Navbar";
import FeaturedArtists from "@/components/site/FeaturedArtists";
import LatestReleases from "@/components/site/LatestReleases";
import Footer from "@/components/site/Footer";
import ReleasesCarousel from "@/components/site/ReleasesCarousel";

export default function SitePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <ReleasesCarousel />

      {/* INTRO LMG */}
      <section className="border-t border-zinc-900 bg-black px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[42%_58%] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Legacy Music Group
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase leading-tight md:text-6xl">
              Music. Strategy. Legacy.
            </h2>
          </div>

          <div>
            <p className="max-w-3xl text-lg leading-8 text-zinc-300 md:text-xl">
              Legacy Music Group développe des artistes et des projets à travers
              une approche qui réunit stratégie, management, image,
              communication et développement artistique.
            </p>

            <p className="mt-6 max-w-3xl leading-8 text-zinc-500">
              Notre ambition : construire des trajectoires cohérentes, créer des
              opportunités et accompagner chaque projet avec une vision long
              terme.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/site/services"
                className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
              >
                Découvrir notre approche →
              </Link>

              <Link
                href="/site/team"
                className="rounded-full border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-400 transition hover:border-white hover:text-white"
              >
                Découvrir l&apos;équipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ARTISTES */}
      <section className="border-t border-zinc-900 bg-zinc-950 px-6 pb-24 pt-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
                Roster
              </p>

              <h2 className="text-4xl font-black uppercase md:text-6xl">
                Artistes LMG
              </h2>
            </div>

            <div className="flex max-w-xl flex-col gap-5">
              <p className="text-zinc-400">
                Découvrez les artistes que nous accompagnons dans leur
                développement, leur image et leur stratégie de carrière.
              </p>

              <Link
                href="/site/artistes"
                className="w-fit text-sm font-semibold text-zinc-400 transition hover:text-yellow-500"
              >
                Voir tous les artistes →
              </Link>
            </div>
          </div>

          <FeaturedArtists />
        </div>
      </section>

      {/* DERNIÈRES SORTIES */}
      <LatestReleases />

      {/* CTA */}
      <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-28 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
            Build Your Legacy
          </p>

          <h2 className="text-4xl font-black uppercase md:text-6xl">
            Ton projet mérite une vraie stratégie.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Si tu es prêt à travailler ton image, structurer ta carrière et
            construire sur le long terme, présente ton projet à LMG.
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