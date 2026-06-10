import Link from "next/link";

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="max-w-3xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
          Legacy Music Group
        </p>

        <h1 className="text-5xl font-black uppercase md:text-7xl">
          Site en maintenance
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Nous préparons la prochaine version du site Legacy Music Group.
          Revenez très bientôt.
        </p>

        <Link
          href="/login"
          className="mt-10 inline-block rounded-full border border-zinc-700 px-8 py-4 font-bold text-white hover:border-yellow-500"
        >
          Accès LMG OS
        </Link>
      </section>
    </main>
  );
}