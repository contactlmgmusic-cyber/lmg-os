"use client";
import Link from "next/link";
import CareersHeader from "./CareersHeader";
import CareersFooter from "./CareersFooter";
import { useCareersLanguage } from "./CareersLanguageProvider";
export default function CareersUnavailable() {
  const { locale } = useCareersLanguage();
  return <main className="min-h-screen bg-black text-white"><CareersHeader /><section className="mx-auto max-w-3xl px-6 py-40"><h1 className="text-4xl font-bold">{locale === "fr" ? "Les candidatures seront bientôt ouvertes." : "Applications will open soon."}</h1><p className="mt-6 text-zinc-400">{locale === "fr" ? "Nous finalisons l’ouverture des candidatures. Aucun CV ne peut être envoyé via ce formulaire pour le moment." : "We are preparing to open applications. CV uploads are currently paused."}</p><Link href="/privacy" className="mt-8 inline-block underline">{locale === "fr" ? "Confidentialité des candidats" : "Candidate privacy"}</Link></section><CareersFooter /></main>;
}
