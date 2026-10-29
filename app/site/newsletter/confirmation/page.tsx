"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function NewsletterConfirmationPage() {
  const { locale } = useSiteLanguage();
  const english = locale === "en";

  return (
    <main className="flex min-h-[75vh] items-center bg-black px-6 py-32 text-white md:px-8">
      <section className="mx-auto w-full max-w-4xl border-y border-zinc-900 py-16 md:py-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-yellow-500">LMG MUSIC · NEWSLETTER</p>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold uppercase leading-[1.02] tracking-[-0.03em] md:text-7xl">
          {english ? "You’re on the list." : "Vous êtes dans la liste."}
        </h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400">
          {english
            ? "Your subscription is confirmed. The next chapter of LMG Music will arrive directly in your inbox."
            : "Votre inscription est confirmée. La suite de l’histoire LMG Music arrivera directement dans votre boîte mail."}
        </p>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-yellow-500 px-7 py-3.5 text-sm font-bold text-black transition hover:bg-yellow-400">
          {english ? "Back to LMG Music" : "Retour à LMG Music"}
        </Link>
      </section>
    </main>
  );
}
