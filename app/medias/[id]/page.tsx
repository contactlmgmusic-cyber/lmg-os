import Link from "next/link";

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href="/medias"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour CRM Médias
      </Link>

      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-5xl font-bold">
          Contact média
        </h1>

        <p className="mt-4 text-zinc-400">
          ID : {id}
        </p>

        <p className="mt-6 text-zinc-500">
          Fiche détail média à compléter.
        </p>
      </div>
    </main>
  );
}