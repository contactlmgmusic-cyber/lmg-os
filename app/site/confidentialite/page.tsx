"use client";

import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function ConfidentialitePage() {
  const { locale } = useSiteLanguage();
  const fr = locale === "fr";

  const sections = fr
    ? [
        ["Données collectées", "LMG Music peut collecter les informations que vous transmettez par ses formulaires : identité ou nom d’artiste, coordonnées, ville, réseaux sociaux, liens musicaux, message et, pour la newsletter, votre adresse e-mail."],
        ["Finalités et bases légales", "Les données sont utilisées pour répondre aux demandes, étudier les projets artistiques, gérer les candidatures et assurer leur suivi. L’adresse e-mail destinée à la newsletter est utilisée uniquement après votre consentement explicite afin de vous transmettre les actualités, sorties et événements de LMG Music."],
        ["Newsletter et double confirmation", "L’inscription à la newsletter utilise une double confirmation : après l’envoi du formulaire, vous devez confirmer votre adresse depuis l’e-mail reçu. Vous pouvez retirer votre consentement à tout moment grâce au lien de désinscription présent dans chaque newsletter."],
        ["Destinataires et prestataires", "Les données sont accessibles aux membres habilités de LMG Music. Brevo intervient comme prestataire pour l’envoi de la newsletter et des e-mails de confirmation. Les données ne sont ni vendues ni transmises à des tiers à des fins commerciales indépendantes."],
        ["Durée de conservation", "Les données liées aux demandes et candidatures sont conservées pendant la durée nécessaire à leur traitement, puis archivées ou supprimées selon les obligations applicables. Les données de newsletter sont conservées jusqu’à votre désinscription ou au retrait de votre consentement."],
        ["Mesure d’audience", "Google Analytics est chargé uniquement après votre accord depuis le gestionnaire de cookies. Vous pouvez refuser ou retirer cet accord à tout moment depuis le lien « Personnaliser les cookies » présent dans le pied de page."],
        ["Vos droits", "Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation du traitement de vos données, vous opposer à certains traitements ou retirer votre consentement à tout moment."],
      ]
    : [
        ["Data we collect", "LMG Music may collect information you submit through its forms: identity or artist name, contact details, city, social media accounts, music links, message and, for the newsletter, your email address."],
        ["Purposes and legal bases", "Data is used to answer enquiries, review artistic projects, manage applications and provide follow-up. Newsletter email addresses are used only after your explicit consent to send LMG Music news, releases and events."],
        ["Newsletter and double confirmation", "Newsletter registration uses double opt-in: after submitting the form, you must confirm your address through the email you receive. You may withdraw your consent at any time using the unsubscribe link included in every newsletter."],
        ["Recipients and providers", "Data is accessible to authorised LMG Music team members. Brevo acts as a service provider for newsletter delivery and confirmation emails. Data is never sold or shared with third parties for their own commercial purposes."],
        ["Retention", "Enquiry and application data is kept for as long as necessary to process it, then archived or deleted in accordance with applicable requirements. Newsletter data is retained until you unsubscribe or withdraw your consent."],
        ["Audience measurement", "Google Analytics is loaded only after you consent through the cookie manager. You may refuse or withdraw this consent at any time through the “Customize Cookies” link in the footer."],
        ["Your rights", "You may request access, rectification, deletion or restriction of your data, object to certain processing activities, or withdraw your consent at any time."],
      ];

  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white md:px-8">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-zinc-400 transition hover:text-white">
          {fr ? "← Retour au site" : "← Back to website"}
        </Link>

        <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-500">LMG MUSIC</p>
        <h1 className="mt-5 text-4xl font-semibold uppercase tracking-[-0.03em] md:text-6xl">
          {fr ? "Politique de confidentialité" : "Privacy Policy"}
        </h1>
        <p className="mt-6 text-sm leading-7 text-zinc-400">
          {fr
            ? "Responsable du traitement : LMG Music, société en cours de création — 138 Avenue Victor Hugo, 75016 Paris, France."
            : "Data controller: LMG Music, company being incorporated — 138 Avenue Victor Hugo, 75016 Paris, France."}
        </p>

        <div className="mt-14 space-y-12 text-zinc-300">
          {sections.map(([title, body]) => (
            <section key={title} className="border-t border-zinc-900 pt-8">
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="mt-4 text-sm leading-8 text-zinc-400">{body}</p>
            </section>
          ))}

          <section className="border-t border-zinc-900 pt-8">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p className="mt-4 text-sm leading-8 text-zinc-400">
              {fr ? "Pour exercer vos droits ou poser une question : " : "To exercise your rights or ask a question: "}
              <a href="mailto:contact@legacymusicgroup.fr" className="text-white underline underline-offset-4">contact@legacymusicgroup.fr</a>.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
