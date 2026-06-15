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
  <div className="mx-auto max-w-6xl">
    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
      Artistes en développement
    </p>

    <h2 className="text-4xl font-black md:text-6xl">
      Les talents accompagnés par LMG.
    </h2>

    <p className="mt-6 max-w-3xl text-lg text-zinc-400">
      Découvrez les artistes que nous accompagnons dans leur développement,
      leur image et leur stratégie de carrière.
    </p>

    <div className="mt-14">
      <FeaturedArtists />
    </div>
  </div>
</section>

<ReleasesCarousel />

<section className="border-t border-zinc-900 bg-black px-6 py-28">
  <div className="mx-auto max-w-6xl">
    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
      Notre vision
    </p>

    <h2 className="text-4xl font-black md:text-6xl">
      Construire des carrières, pas seulement des sorties.
    </h2>

    <p className="mt-8 max-w-4xl text-lg leading-8 text-zinc-400">
      Legacy Music Group accompagne les artistes dans la construction d’une
      carrière durable : identité artistique, stratégie, image, marketing,
      booking et développement global.
    </p>

    <p className="mt-6 max-w-4xl text-lg leading-8 text-zinc-400">
      Notre objectif est simple : bâtir une structure solide autour d’artistes
      à fort potentiel comme LAAM et YHN, en avançant avec une vision long terme
      et une vraie exigence professionnelle.
    </p>

    <div className="mt-14 grid gap-6 md:grid-cols-4">
      {[
        ["Vision long terme", "Développer des artistes capables de durer."],
        ["Stratégie sur mesure", "Chaque projet mérite une trajectoire claire."],
        ["Image forte", "Construire une identité reconnaissable."],
        ["Croissance réelle", "Transformer le potentiel en résultats."],
      ].map(([title, text]) => (
        <div
          key={title}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 hover:border-yellow-500"
        >
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="border-t border-zinc-900 bg-zinc-950 px-6 py-28">
  <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[45%_55%]">
    <div>
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
        Événement
      </p>

      <h2 className="text-4xl font-black md:text-6xl">
        LMG Launch Night
      </h2>

      <p className="mt-8 text-lg leading-8 text-zinc-400">
        Une réception de lancement à Paris pensée comme une expérience immersive :
        présentation des artistes, show live, networking, projections LMG et
        univers Black & Gold.
      </p>
    </div>

    <div className="rounded-[2rem] border border-zinc-800 bg-black p-8">
      <div className="grid gap-6 md:grid-cols-2">
        {[
          ["Lieu", "Paris"],
          ["Dress code", "Black & Gold"],
          ["Format", "Réception privée"],
          ["Expérience", "Show live & networking"],
        ].map(([title, text]) => (
          <div key={title} className="border-l border-yellow-500 pl-5">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-500">
              {title}
            </p>
            <p className="mt-3 text-xl font-bold text-white">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

<section className="border-t border-zinc-900 bg-black px-6 py-28">
  <div className="mx-auto max-w-6xl">
    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
      Pour qui ?
    </p>

    <h2 className="text-4xl font-black md:text-6xl">
      Nous ne cherchons pas seulement des talents.
    </h2>

    <p className="mt-8 max-w-4xl text-lg leading-8 text-zinc-400">
      LMG accompagne des artistes sérieux, réguliers, ambitieux et prêts à
      construire une carrière durable. Le talent est important, mais la vision,
      le travail et la discipline font la différence.
    </p>

    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {[
        ["Artistes ambitieux", "Tu veux construire une vraie trajectoire, pas juste sortir un morceau."],
        ["Projets sérieux", "Tu es prêt à travailler ton image, ton contenu, ta stratégie et ton audience."],
        ["Vision long terme", "Tu veux bâtir une marque artistique solide avec une équipe impliquée."],
      ].map(([title, text]) => (
        <div
          key={title}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 hover:border-yellow-500"
        >
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p>
        </div>
      ))}
    </div>
  </div>
</section>

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

      <section className="border-t border-zinc-900 bg-black px-6 py-28">
  <div className="mx-auto max-w-6xl">
    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
      Projets récents
    </p>

    <h2 className="text-4xl font-black md:text-6xl">
      Les dernières sorties accompagnées par LMG.
    </h2>

    <p className="mt-6 max-w-3xl text-lg text-zinc-400">
      Découvrez les projets, sorties et développements artistiques
      actuellement portés par Legacy Music Group.
    </p>

    <div className="mt-14">
      <FeaturedReleases />
    </div>
  </div>
</section>

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

      <ApplicationForm />
      <Footer />
    </main>
  );
}