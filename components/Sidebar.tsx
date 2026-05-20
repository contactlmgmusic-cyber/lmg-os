import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-white">
        LMG OS
      </h1>

      <nav className="space-y-4">
        <Link href="/" className="block text-zinc-300 hover:text-white transition">
          Dashboard
        </Link>

        <Link href="/artistes" className="block text-zinc-300 hover:text-white transition">
          Artistes
        </Link>

        <Link href="/projets" className="block text-zinc-300 hover:text-white transition">
          Projets
        </Link>

        <Link href="/taches" className="block text-zinc-300 hover:text-white transition">
          Rollout
        </Link>

        <Link href="/booking" className="block text-zinc-300 hover:text-white transition">
          Booking
        </Link>

        <Link href="/calendrier" className="block text-zinc-300 hover:text-white transition">
          Calendrier
        </Link>

        <Link href="/contrats" className="block text-zinc-300 hover:text-white transition">
          Contrats
        </Link>

        <Link href="/finances" className="block text-zinc-300 hover:text-white transition">
          Finances
        </Link>
      </nav>
    </aside>
  );
}