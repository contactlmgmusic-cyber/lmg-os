import Image from "next/image";
import Link from "next/link";

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3a2a00_0%,#050505_45%,#000_100%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
            Legacy Music Group
          </p>

          <h1 className="text-5xl font-black uppercase md:text-8xl">
            Notre Équipe
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
            Legacy Music Group accompagne les artistes dans leur développement
            grâce à une approche moderne, humaine et orientée résultats.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <div className="mb-8 h-40 w-40 overflow-hidden rounded-full border-2 border-yellow-500">
              <Image
  src="/team/joseph.jpg"
  alt="Joseph"
  width={128}
  height={128}
  className="h-full w-full scale-150 object-cover object-[center_1%]"
/>
            </div>

            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              CEO
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Joseph
            </h2>

            <p className="mt-6 leading-8 text-zinc-400">
              Joseph pilote la vision stratégique de Legacy Music Group.
              Il supervise le développement des artistes, les partenariats,
              les opportunités business et la croissance de la structure.
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <div className="mb-8 h-40 w-40 overflow-hidden rounded-full border-2 border-yellow-500">
              <Image
  src="/team/yliana.jpg"
  alt="Yliana Faidherbe"
  width={128}
  height={128}
  className="h-full w-full object-cover object-[center_20%]"
/>
            </div>

            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              Artist Development & Operations
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Yliana Faidherbe
            </h2>

            <p className="mt-6 leading-8 text-zinc-400">
              Yliana coordonne les opérations, le développement artistique,
              le marketing, les relations partenaires et l'expérience
              des artistes au sein de Legacy Music Group.
            </p>
          </div>

        </div>
      </section>

      <section className="border-t border-zinc-900 px-6 py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
            Notre Mission
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Construire des carrières durables
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
            Nous aidons les artistes à développer leur image, leur audience,
            leur catalogue et leur activité grâce à un accompagnement
            stratégique sur le long terme.
          </p>

          <Link
            href="/site/rejoindre"
            className="mt-12 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
          >
            Rejoindre LMG
          </Link>
        </div>

        <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-28">
  <div className="mx-auto max-w-6xl">
    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
      Nos valeurs
    </p>

    <h2 className="text-4xl font-black md:text-6xl">
      Ce qui guide Legacy Music Group
    </h2>

    <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[
        ["Vision long terme", "Construire des carrières solides, pas des coups d’un soir."],
        ["Transparence", "Avancer avec des objectifs clairs et une relation saine avec les artistes."],
        ["Exigence", "Chaque projet mérite une vraie stratégie, une vraie image et une vraie exécution."],
        ["Croissance", "Développer les artistes, leur audience, leur catalogue et leur valeur."],
      ].map(([title, text]) => (
        <div
          key={title}
          className="rounded-3xl border border-zinc-800 bg-black p-6"
        >
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p>
        </div>
      ))}
    </div>
  </div>
</section>
      </section>
    </main>
  );
}