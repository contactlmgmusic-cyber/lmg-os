import Link from "next/link";

export default function ParticipantsPage() {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href="/splits"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour
      </Link>

      <div className="mt-10">
        <h1 className="text-5xl font-bold">
          Participants Split Sheet
        </h1>

        <p className="mt-3 text-zinc-400">
          Gestion des participants.
        </p>
      </div>
    </main>
  );
}