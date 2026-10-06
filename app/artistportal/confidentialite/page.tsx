import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Confidentialité | LMG For Artist" },
  alternates: { canonical: "https://artistportal.lmgmusic.fr/confidentialite" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#030303] px-6 py-16 text-zinc-300">
      <div className="mx-auto max-w-3xl space-y-8 text-sm leading-7">
        <Link href="/" className="inline-block rounded text-zinc-300 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">← Retour à LMG For Artist</Link>
          <section id="confidentialite" className="scroll-mt-24" aria-labelledby="privacy-title">
            <h1 id="privacy-title" className="text-3xl font-semibold text-white">Confidentialité de cette page</h1>
            <p className="mt-3">Cette page présente l’application LMG For Artist. Elle ne propose ni connexion artiste ni formulaire de collecte de données, et n’intègre pas d’outil de mesure d’audience.</p>
            <p>L’hébergeur peut traiter des données techniques liées aux requêtes pour assurer le fonctionnement et la sécurité du site.</p>
            <p>Les informations relatives aux données de votre compte artiste concernent l’application et doivent être consultées dans celle-ci.</p>
            <p>Pour toute question concernant vos données ou pour exercer vos droits, contactez <a href="mailto:contact@legacymusicgroup.fr" className="break-words underline underline-offset-4">contact@legacymusicgroup.fr</a>.</p>
          </section>
      </div>
    </main>
  );
}
