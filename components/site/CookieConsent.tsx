"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

const STORAGE_KEY = "lmg-music-cookie-consent";
const GA_ID = "G-WX2YGFMR7B";

type Consent = {
  necessary: true;
  analytics: boolean;
};

export default function CookieConsent() {
  const { locale } = useSiteLanguage();
  const fr = locale === "fr";

  const [consent, setConsent] = useState<Consent | null>(null);
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setOpen(true);
        return;
      }

      const parsed = JSON.parse(saved) as Consent;

      setConsent(parsed);
      setAnalytics(Boolean(parsed.analytics));
    } catch {
      setOpen(true);
    }

    const handleOpen = () => {
      setCustomize(true);
      setOpen(true);
    };

    window.addEventListener("lmg-open-cookie-settings", handleOpen);

    return () => {
      window.removeEventListener(
        "lmg-open-cookie-settings",
        handleOpen
      );
    };
  }, []);

  function save(next: Consent) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );

    setConsent(next);
    setAnalytics(next.analytics);
    setOpen(false);
    setCustomize(false);
  }

  function acceptAll() {
    save({
      necessary: true,
      analytics: true,
    });
  }

  function rejectOptional() {
    save({
      necessary: true,
      analytics: false,
    });
  }

  function saveCustom() {
    save({
      necessary: true,
      analytics,
    });
  }

  return (
    <>
      {consent?.analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />

          <Script id="lmg-google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[200] border-t border-zinc-800 bg-[#080808] text-white shadow-[0_-20px_60px_rgba(0,0,0,0.45)]">
          <div className="mx-auto max-w-7xl px-6 py-7 md:px-8">
            {!customize ? (
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-500">
                    LMG MUSIC
                  </p>

                  <h2 className="mt-3 text-xl font-semibold">
                    {fr
                      ? "Votre confidentialité compte."
                      : "Your privacy matters."}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {fr
                      ? "Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies de mesure d’audience pour mieux comprendre son utilisation."
                      : "We use cookies required for the website to function and, with your permission, audience measurement cookies to better understand how the site is used."}
                  </p>

                  <Link
                    href="/cookies"
                    className="mt-3 inline-block text-xs text-zinc-500 underline underline-offset-4 transition hover:text-white"
                  >
                    {fr
                      ? "En savoir plus sur les cookies"
                      : "Learn more about cookies"}
                  </Link>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={rejectOptional}
                    className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-white"
                  >
                    {fr ? "Tout refuser" : "Reject all"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomize(true)}
                    className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
                  >
                    {fr ? "Personnaliser" : "Customize"}
                  </button>

                  <button
                    type="button"
                    onClick={acceptAll}
                    className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
                  >
                    {fr ? "Tout accepter" : "Accept all"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-500">
                      LMG MUSIC
                    </p>

                    <h2 className="mt-3 text-xl font-semibold">
                      {fr
                        ? "Préférences de cookies"
                        : "Cookie preferences"}
                    </h2>
                  </div>

                  {consent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setCustomize(false);
                      }}
                      className="text-2xl text-zinc-500 transition hover:text-white"
                      aria-label={fr ? "Fermer" : "Close"}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mt-7 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800 p-5">
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <p className="font-semibold">
                          {fr
                            ? "Cookies nécessaires"
                            : "Necessary cookies"}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                          {fr
                            ? "Indispensables au fonctionnement du site et à la mémorisation de vos préférences."
                            : "Required for the website to work and to remember your preferences."}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-yellow-500">
                        {fr ? "Toujours actifs" : "Always active"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 p-5">
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <p className="font-semibold">
                          Analytics
                        </p>

                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                          {fr
                            ? "Permet à LMG Music de mesurer l’audience du site via Google Analytics."
                            : "Allows LMG Music to measure website traffic using Google Analytics."}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={analytics}
                        onClick={() =>
                          setAnalytics((current) => !current)
                        }
                        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                          analytics
                            ? "bg-yellow-500"
                            : "bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                            analytics ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={rejectOptional}
                    className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-white"
                  >
                    {fr ? "Tout refuser" : "Reject all"}
                  </button>

                  <button
                    type="button"
                    onClick={saveCustom}
                    className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
                  >
                    {fr
                      ? "Enregistrer mes choix"
                      : "Save preferences"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
