import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Image from "next/image";
import FeaturedArtists from "@/components/site/FeaturedArtists";
import FeaturedReleases from "@/components/site/FeaturedReleases";
import Footer from "@/components/site/Footer";
import ApplicationForm from "@/components/site/ApplicationForm";
import ReleasesCarousel from "@/components/site/ReleasesCarousel";

export default function SitePage() {
  return (
    <main className="min-h-screen bg-black text-white">
        <Navbar />
      <section className="relative flex min-h-screen items-center justify-center px-6 text-center">
        <>
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 h-full w-full object-cover"
  >
    <source src="/videos.mp4" type="video/mp4" />
  </video>

  <div className="absolute inset-0 bg-black/70" />
</>

        <div className="relative z-10 max-w-5xl">
          <p className="mb-4 hidden text-sm uppercase tracking-[0.4em] text-yellow-500 md:block">
  Legacy Music Group
</p>

          <h1 className="text-5xl font-black uppercase leading-tight md:text-9xl">
  Build Your <br />
  Legacy
</h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-300 md:text-xl">
  Nous accompagnons les artistes dans la construction d’une carrière durable
  grâce au management, au marketing et au développement stratégique.
</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
  href="/site/rejoindre"
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

      <section className="bg-zinc-950 px-6 py-28">
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

    <p className="max-w-xl text-zinc-400">
      Découvrez les artistes que nous accompagnons dans leur développement,
      leur image et leur stratégie de carrière.
    </p>
  </div>

  <FeaturedArtists />
</div>
</section>

<ReleasesCarousel />

      <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-28 text-center">
  <div className="mx-auto max-w-4xl">
    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
      Build Your Legacy
    </p>

    <h2 className="text-4xl font-black md:text-6xl">
      Ton projet mérite une vraie stratégie.
    </h2>

    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
      Si tu es prêt à travailler ton image, structurer ta carrière et construire
      sur le long terme, présente ton projet à LMG.
    </p>

    <Link
      href="/site/rejoindre"
      className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
    >
      Rejoindre LMG
    </Link>
  </div>
</section>

      <Footer />
    </main>
  );
}