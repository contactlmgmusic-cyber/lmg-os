"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute left-0 right-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/site" className="flex items-center gap-3">
          <Image
            src="/logo-lmg-v2.png"
            alt="Legacy Music Group"
            width={46}
            height={46}
            priority
            className="h-11 w-11 object-contain"
          />

          <div>
            <p className="text-sm font-bold leading-tight text-white drop-shadow md:text-base">
              Legacy Music Group
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/site/services" className="text-sm font-medium text-white/80 transition hover:text-white">
            Services
          </Link>

          <a href="#artists" className="text-sm font-medium text-white/80 transition hover:text-white">
            Artistes
          </a>

          <Link href="/site/team" className="text-sm font-medium text-white/80 transition hover:text-white">
            Team
          </Link>

          <Link href="/site/rejoindre" className="text-sm font-medium text-white/80 transition hover:text-white">
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition hover:border-white"
          >
            Connexion
          </Link>

          <Link
            href="/site/rejoindre"
            className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
          >
            Rejoindre LMG
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white md:hidden"
        >
          Menu
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black px-6 py-6 text-white md:hidden">
          <div className="flex items-center justify-between">
            <Image
              src="/logo-lmg-v2.png"
              alt="Legacy Music Group"
              width={48}
              height={48}
              className="object-contain"
            />

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
            >
              Fermer
            </button>
          </div>

          <nav className="mt-16 flex flex-col gap-8 text-3xl font-black">
            <Link onClick={() => setMobileOpen(false)} href="/site/services">
              Services
            </Link>

            <a onClick={() => setMobileOpen(false)} href="#artists">
              Artistes
            </a>

            <Link onClick={() => setMobileOpen(false)} href="/site/team">
              Team
            </Link>

            <Link onClick={() => setMobileOpen(false)} href="/site/rejoindre">
              Rejoindre LMG
            </Link>

            <Link onClick={() => setMobileOpen(false)} href="/login">
              Connexion
            </Link>
          </nav>

          <Link
            onClick={() => setMobileOpen(false)}
            href="/site/rejoindre"
            className="mt-12 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black"
          >
            Rejoindre LMG
          </Link>
        </div>
      )}
    </header>
  );
}