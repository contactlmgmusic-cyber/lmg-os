import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-zinc-800 bg-black p-6 text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">LMG OS</h1>
        <p className="mt-1 text-sm text-zinc-500">Label Management System</p>
      </div>

      <nav className="space-y-2">
        <Link href="/" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Dashboard
        </Link>

        <Link href="/mes-taches" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Mes tâches
        </Link>

        <Link href="/taches" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Tâches
        </Link>

        <Link href="/calendrier" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Calendrier
        </Link>

        <Link href="/rollout" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Rollout
        </Link>

        <Link href="/artistes" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Artistes
        </Link>

        <Link href="/projets" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Projets
        </Link>

        <Link
  href="/drive"
  className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white"
>
  Drive
</Link>

        <Link href="/equipe" className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white">
          Équipe
        </Link>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <LogoutButton />
      </div>
    </aside>
  );
}