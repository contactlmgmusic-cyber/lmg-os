import Link from "next/link";
import CandidatureConvertClient from "@/components/CandidatureConvertClient";

export const dynamic = "force-dynamic";

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

      <CandidatureConvertClient id={id} />
    </main>
  );
}