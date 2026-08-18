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

          <p className="text-sm font-bold leading-tight text-white drop-shadow md:text-base">
            Legacy Music Group
          </p>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/site/artistes"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Artistes
          </Link>

          <Link
            href="/site/releases"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Releases
          </Link>

          <Link
            href="/site/services"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Services
          </Link>

          <Link
            href="/site/team"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Team
          </Link>

          <a
            href="mailto:contact@legacymusicgroup.fr"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Contact
          </a>
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
            <Link
              href="/site"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3"
            >
              <Image
                src="/logo-lmg-v2.png"
                alt="Legacy Music Group"
                width={48}
                height={48}
                className="object-contain"
              />

              <span className="font-bold">
                Legacy Music Group
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
            >
              Fermer
            </button>
          </div>

          <nav className="mt-16 flex flex-col gap-7 text-3xl font-black">
            <Link
              onClick={() => setMobileOpen(false)}
              href="/site/artistes"
            >
              Artistes
            </Link>

            <Link
              onClick={() => setMobileOpen(false)}
              href="/site/releases"
            >
              Releases
            </Link>

            <Link
              onClick={() => setMobileOpen(false)}
              href="/site/services"
            >
              Services
            </Link>

            <Link
              onClick={() => setMobileOpen(false)}
              href="/site/team"
            >
              Team
            </Link>

            <a
              onClick={() => setMobileOpen(false)}
              href="mailto:contact@legacymusicgroup.fr"
            >
              Contact
            </a>

            <Link
              onClick={() => setMobileOpen(false)}
              href="/login"
            >
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