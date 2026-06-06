"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-900 bg-black/90 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <Link href="/site" className="flex items-center gap-3">
          <Image
  src="/logo-lmg-v2.png"
  alt="Legacy Music Group"
  width={44}
  height={44}
  className="h-11 w-11 object-contain"
/>

          <div>
            <p className="font-bold">Legacy Music Group</p>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              MANAGEMENT • MARKETING • BOOKING
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

        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}