import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Mentions légales | LMG For Artist" },
  alternates: { canonical: "https://artistportal.lmgmusic.fr/mentions-legales" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#030303] px-6 py-16 text-zinc-300">
      <div className="mx-auto max-w-3xl space-y-8 text-sm leading-7">
        <Link href="/" className="inline-block rounded text-zinc-300 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">← Retour à LMG For Artist</Link>
          <section id="mentions-legales" className="scroll-mt-24" aria-labelledby="legal-title">
            <h1 id="legal-title" className="text-3xl font-semibold text-white">Mentions légales</h1>
            <p className="mt-3">Éditeur : LMG Music, société en cours de création. Les informations d’immatriculation seront ajoutées après sa création.</p>
            <p>Responsable de publication : LMG.</p>
            <p>Adresse de contact : 138 avenue Victor-Hugo, 75016 Paris, France.</p>
            <p>Téléphone : <a href="tel:+33615953374" className="underline underline-offset-4">06 15 95 33 74</a>.</p>
            <p>Contact : <a href="mailto:contact@legacymusicgroup.fr" className="break-words underline underline-offset-4">contact@legacymusicgroup.fr</a>.</p>
            <p>Hébergement de cette page : Vercel Inc.</p>
          </section>
      </div>
    </main>
  );
}
