"use client";

import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function Footer() {
  const { locale } = useSiteLanguage();
  const fr = locale === "fr";

  return (
    <footer className="border-t border-zinc-900 bg-black text-white">
      {/* SOCIALS */}
      <div className="border-b border-zinc-900 px-6 py-11">
        <div className="mx-auto flex items-center justify-center gap-11">
          <a
            href="https://www.instagram.com/music.lmg/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram LMG Music"
            className="text-white transition hover:text-yellow-500"
          >
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle
                cx="17.4"
                cy="6.7"
                r="0.8"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>

          <a
            href="https://www.tiktok.com/@music.lmg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok LMG Music"
            className="text-white transition hover:text-yellow-500"
          >
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M14.4 3h2.75c.2 1.15.84 2.18 1.78 2.87A6.2 6.2 0 0 0 22 7.05v2.77a8.9 8.9 0 0 1-4.82-1.55v6.6a6.08 6.08 0 1 1-5.24-6.02v2.82a3.33 3.33 0 1 0 2.46 3.2V3Z" />
            </svg>
          </a>

          <a
            href="https://www.youtube.com/@legacy.musicgroup/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube LMG Music"
            className="text-white transition hover:text-yellow-500"
          >
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.58 12 3.58 12 3.58s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.12A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.25 3.6-6.25 3.6Z" />
            </svg>
          </a>
        </div>
      </div>

      {/* NAVIGATION + LEGAL */}
      <div className="px-6 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ROUTES */}
          <nav
            aria-label={
              fr
                ? "Navigation du pied de page"
                : "Footer navigation"
            }
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-zinc-300"
          >
            <Link href="/about" className="transition hover:text-yellow-500">
              {fr ? "À propos" : "About"}
            </Link>

            <Link href="/artistes" className="transition hover:text-yellow-500">
              {fr ? "Artistes" : "Artists"}
            </Link>

            <Link href="/releases" className="transition hover:text-yellow-500">
              {fr ? "Sorties" : "Releases"}
            </Link>

            <Link href="/news" className="transition hover:text-yellow-500">
              {fr ? "Actualités" : "News"}
            </Link>

            <a
              href="https://careers.lmgmusic.fr"
              className="transition hover:text-yellow-500"
            >
              Careers
            </a>

            <Link href="/faq" className="transition hover:text-yellow-500">
              FAQ
            </Link>

            <Link href="/contact" className="transition hover:text-yellow-500">
              Contact
            </Link>

            <Link
              href="/recherche"
              className="transition hover:text-yellow-500"
            >
              {fr ? "Rechercher" : "Search"}
            </Link>
          </nav>

                    {/* LEGAL / COOKIES */}
          <div className="mt-8 pt-7">
            <div className="grid gap-5 text-xs text-zinc-600 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="flex justify-center md:justify-start">
  <button
    type="button"
    onClick={() =>
      window.dispatchEvent(
        new Event("lmg-open-cookie-settings")
      )
    }
    aria-label={
      fr
        ? "Gérer les préférences de cookies"
        : "Manage cookie preferences"
    }
    title={
      fr
        ? "Gérer les cookies"
        : "Manage cookies"
    }
    className="group flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 transition hover:border-yellow-500 hover:text-yellow-500"
  >
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.6a4 4 0 0 0 5.1 5.1 4 4 0 0 0 4.6 4.5Z" />
      <circle cx="8.5" cy="10" r=".8" fill="currentColor" stroke="none" />
      <circle cx="11" cy="15" r=".8" fill="currentColor" stroke="none" />
      <circle cx="6.8" cy="16" r=".8" fill="currentColor" stroke="none" />
    </svg>
  </button>
</div>

              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                <Link
                  href="/mentions-legales"
                  className="transition hover:text-white"
                >
                  {fr ? "Mentions légales" : "Legal Notice"}
                </Link>

                <Link
                  href="/confidentialite"
                  className="transition hover:text-white"
                >
                  {fr
                    ? "Politique de confidentialité"
                    : "Privacy Policy"}
                </Link>

                <Link
                  href="/cookies"
                  className="transition hover:text-white"
                >
                  {fr
                    ? "Politique de cookies"
                    : "Cookie Policy"}
                </Link>

                <button
  type="button"
  onClick={() =>
    window.dispatchEvent(
      new Event("lmg-open-cookie-settings")
    )
  }
  className="transition hover:text-white"
>
  {fr
    ? "Personnaliser les cookies"
    : "Customize Cookies"}
</button>

                <Link
                  href="/accessibilite"
                  className="transition hover:text-white"
                >
                  {fr ? "Accessibilité" : "Accessibility"}
                </Link>

                <Link
                  href="/plan-du-site"
                  className="transition hover:text-white"
                >
                  {fr ? "Plan du site" : "Site Map"}
                </Link>
              </div>

              <p className="text-center text-[11px] text-zinc-700 md:justify-self-end md:text-right">
                © 2026 LMG Music
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
