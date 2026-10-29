"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

type State = "idle" | "loading" | "success" | "error";

export default function NewsletterSignup() {
  const { locale } = useSiteLanguage();
  const fr = locale === "fr";
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/site/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
          locale,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Subscription failed");
      form.reset();
      setState("success");
      setMessage(fr
        ? "Presque terminé : consultez votre boîte mail pour confirmer votre inscription."
        : "Almost there: check your inbox to confirm your subscription.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : fr
        ? "Une erreur est survenue. Réessayez plus tard."
        : "Something went wrong. Please try again later.");
    }
  }

  return (
    <section className="border-b border-zinc-900 bg-[#0a0a0a] px-6 py-14 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-yellow-500">LMG MUSIC · NEWSLETTER</p>
          <h2 className="mt-5 max-w-xl text-3xl font-semibold uppercase leading-[1.02] tracking-[-0.03em] md:text-5xl">
            {fr ? "Entrez dans les coulisses." : "Step behind the scenes."}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
            {fr
              ? "Sorties, actualités, événements et trajectoires de nos artistes — directement dans votre boîte mail."
              : "Releases, news, events and artist journeys — delivered straight to your inbox."}
          </p>
        </div>

        <form onSubmit={submit} className="relative">
          <label htmlFor="newsletter-email" className="sr-only">
            {fr ? "Adresse e-mail" : "Email address"}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder={fr ? "Votre adresse e-mail" : "Your email address"}
              className="min-h-14 flex-1 rounded-full border border-zinc-700 bg-black px-6 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="min-h-14 shrink-0 rounded-full bg-yellow-500 px-7 text-sm font-bold text-black transition hover:bg-yellow-400 disabled:cursor-wait disabled:opacity-60"
            >
              {state === "loading"
                ? (fr ? "Inscription…" : "Subscribing…")
                : (fr ? "S’inscrire" : "Subscribe")}
            </button>
          </div>

          <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="newsletter-website">Website</label>
            <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-zinc-500">
            <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-yellow-500" />
            <span>
              {fr ? "J’accepte de recevoir les actualités de LMG Music par e-mail. Je peux me désinscrire à tout moment." : "I agree to receive LMG Music news by email. I can unsubscribe at any time."}{" "}
              <Link href="/confidentialite" className="underline underline-offset-2 transition hover:text-white">
                {fr ? "Politique de confidentialité" : "Privacy Policy"}
              </Link>
            </span>
          </label>

          {message && (
            <p role="status" className={`mt-4 text-sm ${state === "success" ? "text-yellow-500" : "text-red-400"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
