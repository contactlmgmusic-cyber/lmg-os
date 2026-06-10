import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-yellow-500">
          Error 404
        </p>

        <h1 className="mt-6 text-6xl font-black md:text-8xl">
          Page introuvable
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/site"
            className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
          >
            Retour à l'accueil
          </Link>

          <Link
            href="/site/rejoindre"
            className="rounded-full border border-zinc-700 px-8 py-4 font-bold text-white hover:border-yellow-500"
          >
            Rejoindre LMG
          </Link>
        </div>
      </div>
    </main>
  );
}