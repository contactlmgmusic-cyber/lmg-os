"use client";

import Link from "next/link";
import { useState } from "react";

const worlds = [
  {
    number: "01",
    title: "MUSIC",
    subtitle: "Shape the sound.",
    description:
      "Artist development, A&R, releases, production and live. Work alongside the people building the next chapter of our artists.",
    roles: ["A&R", "Artist Projects", "Production", "Live"],
  },
  {
    number: "02",
    title: "CREATIVE",
    subtitle: "Build the image.",
    description:
      "Turn ideas into identities, campaigns and moments. From social content to visual direction, creativity lives across everything we do.",
    roles: ["Communication", "Content", "Design", "Social"],
  },
  {
    number: "03",
    title: "BUSINESS",
    subtitle: "Create opportunities.",
    description:
      "Build relationships, partnerships and strategies that move projects forward and create new opportunities for artists and LMG.",
    roles: ["Partnerships", "Development", "Booking", "Operations"],
  },
  {
    number: "04",
    title: "TECH & DIGITAL",
    subtitle: "Build the tools.",
    description:
      "Create the platforms and digital systems behind our ecosystem. Technology is part of how LMG works, grows and experiments.",
    roles: ["Development", "Platforms", "Data", "Digital"],
  },
];

const principles = [
  {
    number: "01",
    title: "Own your part.",
    text: "You don't need to know everything. But what you own, you push forward.",
  },
  {
    number: "02",
    title: "Think beyond your role.",
    text: "Music, image, business and technology overlap. So do we.",
  },
  {
    number: "03",
    title: "Build together.",
    text: "Ideas move faster when people share them, challenge them and improve them.",
  },
];

export default function CareersHome() {
  const [locale, setLocale] = useState<"EN" | "FR">("EN");

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/careers/lmg-music-logo.png"
              alt="LMG Music"
              className="h-11 w-11 object-contain"
            />
            <span className="h-5 w-px bg-white/25" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">
              Careers
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.12em] md:flex">
            <a href="#life" className="transition-opacity hover:opacity-50">
              Life at LMG
            </a>
            <a href="#worlds" className="transition-opacity hover:opacity-50">
              What you can do
            </a>
            <Link href="/jobs" className="transition-opacity hover:opacity-50">
              Jobs
            </Link>
            <Link href="/faq" className="transition-opacity hover:opacity-50">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === "EN" ? "FR" : "EN")}
              className="text-xs font-semibold"
            >
              {locale}
            </button>

            <Link
              href="/jobs"
              className="rounded-full bg-[#d5ad58] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:opacity-80"
            >
              View jobs
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden px-6 pb-10 pt-36 md:px-10 md:pb-14">
        <div className="relative mx-auto w-full max-w-[1600px]">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.32em]">
            Careers at LMG
          </p>

          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <h1 className="max-w-[900px] text-[16vw] font-black uppercase leading-[0.78] tracking-[-0.075em] sm:text-[13vw] lg:text-[7.5vw]">
              Build
              <br />
              what&apos;s
              <br />
              next.
            </h1>

            <div className="hidden min-h-[430px] items-end overflow-hidden rounded-[0.35rem] bg-white/[0.06] lg:flex">
              <div className="w-full border-t border-white/10 p-7">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/35">
                  People behind the music
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 border-t border-white/20 pt-8 md:grid-cols-2">
            <p className="max-w-xl text-xl leading-8 tracking-[-0.02em] md:text-2xl">
              Music moves because people do.
            </p>

            <div className="max-w-xl md:justify-self-end">
              <p className="text-sm leading-7 text-white/60 md:text-base">
                Behind every release, every image and every opportunity are
                people building the next chapter. Bring your perspective.
                Build your part of it.
              </p>

              <Link
                href="/jobs"
                className="mt-7 inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.18em]"
              >
                Explore opportunities
                <span className="text-lg">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INSIDE LMG */}
      <section
        id="life"
        className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40"
      >
        <div className="mb-20 flex items-end justify-between border-b border-white/15 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
            Inside LMG
          </p>

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
            People · Ideas · Music
          </span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Future LMG photo */}
          <div className="relative min-h-[650px] overflow-hidden bg-white/[0.06]">
            <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/35">
                Life behind the projects
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#d5ad58]">
                Life at LMG
              </p>

              <h2 className="max-w-4xl text-5xl font-medium leading-[0.98] tracking-[-0.055em] md:text-7xl xl:text-8xl">
                We&apos;re building the company while building the work.
              </h2>
            </div>

            <div className="mt-16 lg:mt-24">
              <div className="grid gap-8 border-t border-white/15 pt-8 md:grid-cols-2">
                <p className="text-sm leading-7 text-white/55">
                  LMG is an independent music ecosystem in development.
                  There&apos;s room to propose, experiment and take real
                  ownership of what you build.
                </p>

                <p className="text-sm leading-7 text-white/55">
                  Music, image, business and technology work together here.
                  Different expertise, shared ambition, one direction.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
                {[
                  "Independent",
                  "Collaborative",
                  "Music-first",
                  "Building",
                ].map((item) => (
                  <span
                    key={item}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-28 grid border-t border-white/20 md:grid-cols-3">
          {[
            ["01", "Bring your perspective."],
            ["02", "Take ownership."],
            ["03", "Build with others."],
          ].map(([number, text], index) => (
            <div
              key={number}
              className={`py-8 ${
                index < 2
                  ? "md:border-r md:border-white/15 md:px-8 first:md:pl-0"
                  : "md:pl-8"
              }`}
            >
              <span className="text-[10px] text-[#d5ad58]">
                {number}
              </span>

              <p className="mt-8 text-xl tracking-[-0.03em]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WORLDS */}
      <section
        id="worlds"
        className="border-t border-white/10 bg-black px-6 py-28 text-white md:px-10 md:py-40"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-20 grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                Find your place
              </p>

              <h2 className="text-5xl font-medium leading-[0.95] tracking-[-0.055em] md:text-8xl">
                What can you
                <br />
                build here?
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/50 md:col-span-4 md:justify-self-end">
              Careers at LMG can take different forms. Explore the disciplines
              working together behind the music.
            </p>
          </div>

          <div className="border-t border-white/20">
            {worlds.map((world, index) => (
              <article
                key={world.number}
                className="group relative grid gap-8 overflow-hidden border-b border-white/20 py-12 md:grid-cols-12 md:items-start md:py-16"
              >
                <span className="text-[10px] text-[#d5ad58] md:col-span-1">
                  {world.number}
                </span>

                <div className="md:col-span-4">
                  <h3 className="text-4xl font-semibold tracking-[-0.055em] transition-transform duration-500 group-hover:translate-x-2 md:text-6xl">
                    {world.title}
                  </h3>

                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-[#d5ad58]">
                    {world.subtitle}
                  </p>
                </div>

                <div className="md:col-span-4">
                  <p className="max-w-md text-sm leading-7 text-white/50">
                    {world.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:col-span-3 md:justify-end">
                  {world.roles.map((role) => (
                    <span
                      key={role}
                      className="border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-white/55"
                    >
                      {role}
                    </span>
                  ))}
                </div>

                <div
                  className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[#d5ad58] transition-all duration-700 group-hover:w-full"
                  aria-hidden="true"
                />
              </article>
            ))}
          </div>

          <div className="mt-16 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <p className="max-w-xl text-xl leading-8 tracking-[-0.025em] text-white/75">
              Your role may sit in one discipline. Your work probably
              won&apos;t.
            </p>

            <Link
              href="/jobs"
              className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d5ad58]"
            >
              Explore all opportunities
              <span className="text-base">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="bg-black px-6 py-28 text-white md:px-10 md:py-40">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                How we work
              </p>

              <p className="mt-8 max-w-xs text-sm leading-7 text-white/45">
                We keep the way we work simple: responsibility, curiosity
                and collaboration.
              </p>
            </div>

            <div className="lg:col-span-8">
              <h2 className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.055em] md:text-8xl">
                Good work starts with how we work together.
              </h2>

              <div className="mt-20 border-t border-white/20">
                {principles.map((principle) => (
                  <article
                    key={principle.number}
                    className="group grid gap-8 border-b border-white/15 py-10 md:grid-cols-[80px_1fr_1fr] md:items-start md:py-12"
                  >
                    <span className="text-[10px] text-[#d5ad58]">
                      {principle.number}
                    </span>

                    <h3 className="text-3xl font-medium tracking-[-0.045em] transition-transform duration-500 group-hover:translate-x-2 md:text-4xl">
                      {principle.title}
                    </h3>

                    <p className="max-w-md text-sm leading-7 text-white/50">
                      {principle.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-28 border-t border-white/10 pt-8">
            <p className="max-w-4xl text-2xl leading-[1.35] tracking-[-0.035em] text-white/75 md:text-4xl">
              Different perspectives make the work stronger.
              <span className="text-white/30">
                {" "}What matters is what you bring, what you learn and what
                you build with the people around you.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="px-3 pb-3 md:px-5 md:pb-5">
        <div className="rounded-[2rem] bg-[#d5ad58] px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-[1500px]">
            <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em]">
              Open opportunities
            </p>

            <div className="grid gap-12 md:grid-cols-2">
              <h2 className="text-6xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-8xl">
                Your next
                <br />
                chapter?
              </h2>

              <div className="flex flex-col justify-end md:items-start">
                <p className="max-w-md text-sm leading-7 text-white/60">
                  Explore current opportunities across LMG. If nothing matches
                  your profile today, you can still introduce yourself.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/jobs"
                    className="rounded-full bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                  >
                    View open positions
                  </Link>

                  <Link
                    href="/spontaneous"
                    className="rounded-full border border-black/30 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em]"
                  >
                    Introduce yourself
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black px-6 pb-8 pt-16 text-white md:px-10 md:pt-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-14 pb-16 md:grid-cols-12">
            {/* Brand */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-4">
                <img
                  src="/careers/lmg-music-logo.png"
                  alt="LMG Music"
                  className="h-12 w-12 object-contain"
                />

                <span className="h-6 w-px bg-white/20" />

                <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Careers
                </span>
              </div>

              <p className="mt-8 max-w-sm text-sm leading-7 text-white/45">
                Build your part of what&apos;s next in music.
              </p>

              <a
                href="https://www.lmgmusic.fr"
                className="mt-7 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d5ad58]"
              >
                Discover LMG Music
                <span>↗</span>
              </a>
            </div>

            {/* Careers */}
            <div className="md:col-span-2">
              <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
                Careers
              </p>

              <div className="flex flex-col items-start gap-4 text-sm">
                <Link href="/jobs" className="transition hover:text-[#d5ad58]">
                  Jobs
                </Link>

                <Link
                  href="/spontaneous"
                  className="transition hover:text-[#d5ad58]"
                >
                  Introduce yourself
                </Link>

                <Link href="/faq" className="transition hover:text-[#d5ad58]">
                  FAQ
                </Link>
              </div>
            </div>

            {/* LMG */}
            <div className="md:col-span-2">
              <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
                LMG Music
              </p>

              <div className="flex flex-col items-start gap-4 text-sm">
                <a
                  href="https://www.lmgmusic.fr/about"
                  className="transition hover:text-[#d5ad58]"
                >
                  About
                </a>

                <a
                  href="https://www.lmgmusic.fr/artistes"
                  className="transition hover:text-[#d5ad58]"
                >
                  Artists
                </a>

                <a
                  href="https://www.lmgmusic.fr/news"
                  className="transition hover:text-[#d5ad58]"
                >
                  News
                </a>

                <a
                  href="https://www.lmgmusic.fr/contact"
                  className="transition hover:text-[#d5ad58]"
                >
                  Contact
                </a>
              </div>
            </div>

            {/* Follow */}
            <div className="md:col-span-3 md:text-right">
              <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
                Follow LMG Music
              </p>

              <div className="flex flex-col items-start gap-4 text-sm md:items-end">
                <a
                  href="https://www.instagram.com/music.lmg/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#d5ad58]"
                >
                  Instagram ↗
                </a>

                <a
                  href="https://www.tiktok.com/@music.lmg"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#d5ad58]"
                >
                  TikTok ↗
                </a>

                <a
                  href="https://www.youtube.com/@LMGMusic"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#d5ad58]"
                >
                  YouTube ↗
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[9px] uppercase tracking-[0.16em] text-white/35">
              <span>
                © {new Date().getFullYear()} LMG
              </span>

              <a
                href="https://www.lmgmusic.fr/mentions-legales"
                className="transition hover:text-white"
              >
                Legal
              </a>

              <a
                href="https://www.lmgmusic.fr/confidentialite"
                className="transition hover:text-white"
              >
                Privacy
              </a>

              <a
                href="https://www.lmgmusic.fr/cookies"
                className="transition hover:text-white"
              >
                Cookies
              </a>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#d5ad58]">
              Build Your Legacy.
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
