import Link from "next/link";

export default async function ConvertirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href={`/dashboard/candidatures/${id}`}
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour à la candidature
      </Link>

      <h1 className="mt-8 text-5xl font-bold">
        Conversion artiste
      </h1>

      <p className="mt-4 text-zinc-400">
        Candidature : {id}
      </p>
    </main>
  );
}