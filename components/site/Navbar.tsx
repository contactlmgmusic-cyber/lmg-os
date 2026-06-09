"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-zinc-900 bg-black/90 backdrop-blur-xl" : "bg-black/40 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/site" className="flex items-center gap-3">
          <Image
            src="/logo-lmg-v2.png"
            alt="Legacy Music Group"
            width={42}
            height={42}
            className="h-10 w-10 object-contain"
          />

          <div>
            <p className="text-sm font-bold leading-tight text-white md:text-base">
              Legacy Music Group
            </p>
            <p className="hidden text-xs uppercase tracking-[0.2em] text-zinc-500 md:block">
              Management • Marketing • Booking
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#services" className="text-zinc-300 hover:text-white">
            Services
          </a>
          <a href="#artists" className="text-zinc-300 hover:text-white">
            Artistes
          </a>
          <a href="#contact" className="text-zinc-300 hover:text-white">
            Contact
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-zinc-800 px-5 py-2 text-sm hover:border-zinc-600"
          >
            Connexion
          </Link>

          <a
            href="#contact"
            className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
          >
            Rejoindre LMG
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold text-white md:hidden"
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
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
            >
              Fermer
            </button>
          </div>

          <nav className="mt-16 flex flex-col gap-8 text-3xl font-black">
            <a onClick={() => setMobileOpen(false)} href="#services">
              Services
            </a>
            <a onClick={() => setMobileOpen(false)} href="#artists">
              Artistes
            </a>
            <Link href="/site/rejoindre">
  Rejoindre LMG
</Link>
            <a onClick={() => setMobileOpen(false)} href="#contact">
              Contact
            </a>
            <Link onClick={() => setMobileOpen(false)} href="/login">
              Connexion
            </Link>
          </nav>

          <a
            onClick={() => setMobileOpen(false)}
            href="#contact"
            className="mt-12 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black"
          >
            Rejoindre LMG
          </a>
        </div>
      )}
    </header>
  );
}