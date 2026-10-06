"use client";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

const translations = {
  en: {
    eyebrow: "Candidate privacy",
    hero1: "Your data.",
    hero2: "Clearly",
    hero3: "handled.",
    intro:
      "Applying means sharing part of your professional story. We treat that information accordingly.",
    description:
      "This notice explains what information is processed through LMG Careers, why we use it, who may access it and what rights you have over your data.",
    closing1: "Your profile",
    closing2: "stays yours.",
    sections: [
      {
        number: "01",
        title: "Who processes your data?",
        paragraphs: [
          "Applications submitted through LMG Careers are processed by LMG for recruitment purposes.",
          "Full legal identification of the data controller will be published here before the Careers platform enters production.",
        ],
      },
      {
        number: "02",
        title: "What information do we collect?",
        paragraphs: [
          "Depending on your application, we may collect your name, contact details, location, availability, CV, professional experience, LinkedIn profile, portfolio or website, application message, area of interest and information generated during the recruitment process.",
        ],
      },
      {
        number: "03",
        title: "Why do we use it?",
        paragraphs: [
          "We use this information to receive and review applications, assess profiles in relation to current opportunities, communicate with candidates, organise recruitment steps and manage our recruitment process.",
        ],
      },
      {
        number: "04",
        title: "Who can access it?",
        paragraphs: [
          "Access is restricted to people at LMG who need the information for recruitment and, where necessary, to technical service providers involved in operating the Careers platform and securely hosting its data.",
        ],
      },
      {
        number: "05",
        title: "How long do we keep it?",
        paragraphs: [
          "Information is retained for the time necessary to manage the recruitment process.",
          "Where a profile may be relevant for future opportunities, candidate information may be retained for up to two years from the last contact, unless the candidate requests deletion or objects to that continued retention.",
        ],
      },
      {
        number: "06",
        title: "Your rights",
        paragraphs: [
          "Subject to the conditions provided by applicable data protection law, you may request access to your personal data, correction of inaccurate information, deletion, restriction of processing or object to certain uses of your data. Where applicable, you may also exercise your right to data portability.",
        ],
      },
      {
        number: "07",
        title: "Recruitment decisions",
        paragraphs: [
          "Applications are reviewed as part of LMG's recruitment process. LMG Careers is not intended to make hiring decisions based solely on automated processing.",
        ],
      },
      {
        number: "08",
        title: "Questions or requests",
        paragraphs: [
          "A dedicated contact address for privacy and candidate data requests will be displayed here before the platform enters production. Candidates may also lodge a complaint with the competent data protection authority.",
        ],
      },
    ],
  },

  fr: {
    eyebrow: "Confidentialité des candidats",
    hero1: "Vos données.",
    hero2: "Traitées",
    hero3: "clairement.",
    intro:
      "Postuler implique de partager une partie de votre parcours professionnel. Nous traitons ces informations en conséquence.",
    description:
      "Cette notice explique quelles informations sont traitées via LMG Careers, pourquoi nous les utilisons, qui peut y accéder et quels sont vos droits sur vos données.",
    closing1: "Votre profil",
    closing2: "reste le vôtre.",
    sections: [
      {
        number: "01",
        title: "Qui traite vos données ?",
        paragraphs: [
          "Les candidatures transmises via LMG Careers sont traitées par LMG à des fins de recrutement.",
          "L'identification juridique complète du responsable du traitement sera publiée ici avant la mise en production de la plateforme Careers.",
        ],
      },
      {
        number: "02",
        title: "Quelles informations collectons-nous ?",
        paragraphs: [
          "Selon votre candidature, nous pouvons collecter votre nom, vos coordonnées, votre localisation, vos disponibilités, votre CV, votre expérience professionnelle, votre profil LinkedIn, votre portfolio ou site web, votre message de candidature, votre domaine d'intérêt ainsi que les informations générées au cours du processus de recrutement.",
        ],
      },
      {
        number: "03",
        title: "Pourquoi les utilisons-nous ?",
        paragraphs: [
          "Nous utilisons ces informations pour recevoir et examiner les candidatures, évaluer les profils au regard des opportunités en cours, communiquer avec les candidats, organiser les étapes du recrutement et gérer notre processus de recrutement.",
        ],
      },
      {
        number: "04",
        title: "Qui peut y accéder ?",
        paragraphs: [
          "L'accès est limité aux personnes de LMG qui ont besoin de ces informations pour le recrutement et, lorsque cela est nécessaire, aux prestataires techniques participant au fonctionnement de la plateforme Careers et à l'hébergement sécurisé de ses données.",
        ],
      },
      {
        number: "05",
        title: "Combien de temps les conservons-nous ?",
        paragraphs: [
          "Les informations sont conservées pendant la durée nécessaire à la gestion du processus de recrutement.",
          "Lorsqu'un profil peut être pertinent pour de futures opportunités, les informations du candidat peuvent être conservées jusqu'à deux ans à compter du dernier contact, sauf si le candidat demande leur suppression ou s'oppose à cette conservation.",
        ],
      },
      {
        number: "06",
        title: "Vos droits",
        paragraphs: [
          "Sous réserve des conditions prévues par la réglementation applicable en matière de protection des données, vous pouvez demander l'accès à vos données personnelles, la rectification d'informations inexactes, leur suppression, la limitation du traitement ou vous opposer à certaines utilisations de vos données. Lorsque cela s'applique, vous pouvez également exercer votre droit à la portabilité des données.",
        ],
      },
      {
        number: "07",
        title: "Décisions de recrutement",
        paragraphs: [
          "Les candidatures sont examinées dans le cadre du processus de recrutement de LMG. LMG Careers n'a pas vocation à prendre des décisions de recrutement fondées exclusivement sur un traitement automatisé.",
        ],
      },
      {
        number: "08",
        title: "Questions ou demandes",
        paragraphs: [
          "Une adresse de contact dédiée aux demandes relatives à la confidentialité et aux données des candidats sera affichée ici avant la mise en production de la plateforme. Les candidats peuvent également introduire une réclamation auprès de l'autorité compétente en matière de protection des données.",
        ],
      },
    ],
  },
} as const;

export default function CareersPrivacyContent({ identity }: { identity: { name: string; address: string; registration: string; status: string; phone: string; email: string } }) {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d5ad58]">
          {t.eyebrow}
        </p>

        <h1 className="mt-8 max-w-6xl text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
          {t.hero1}
          <br />
          {t.hero2}
          <br />
          {t.hero3}
        </h1>

        <div className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-2 md:gap-20">
          <p className="max-w-xl text-2xl font-semibold leading-tight md:text-4xl">
            {t.intro}
          </p>

          <p className="max-w-xl text-base leading-7 text-white/55">
            {t.description}
          </p>
        </div>
      </section>

      <section className="border-t border-white/15">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          {t.sections.map((section) => (
            <div
              key={section.number}
              className="grid gap-5 border-b border-white/15 py-10 md:grid-cols-[90px_0.8fr_1.2fr] md:gap-10 md:py-14"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#d5ad58]">
                {section.number}
              </span>

              <h2 className="max-w-md text-2xl font-black uppercase leading-[0.95] tracking-[-0.035em] md:text-4xl">
                {section.title}
              </h2>

              <div className="max-w-3xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                {(section.number === "01" ? [identity.name && identity.address ? `${identity.name}${identity.status ? ` — ${locale === "fr" ? identity.status : "Company being formed"}` : ""} — ${identity.address}${identity.registration ? ` — ${identity.registration}` : ""}` : (locale === "fr" ? "La collecte des candidatures est suspendue jusqu’à la finalisation des informations du responsable du traitement." : "Applications are paused until the data controller information is complete.")] : section.number === "08" ? [identity.email ? `${locale === "fr" ? "Contact pour vos données" : "Privacy contact"} : ${identity.email}${identity.phone ? ` — ${identity.phone}` : ""}` : (locale === "fr" ? "Le contact sera communiqué avant la reprise des candidatures." : "A contact will be provided before applications reopen."), locale === "fr" ? "Vous pouvez adresser une réclamation à la CNIL." : "You may lodge a complaint with the CNIL."] : section.paragraphs).map((paragraph, index) => (
                  <p
                    key={index}
                    className={index > 0 ? "mt-5" : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="rounded-[2rem] bg-[#d5ad58] px-6 py-12 text-black md:px-12 md:py-16">
          <p className="text-xs font-black uppercase tracking-[0.2em]">
            LMG Careers
          </p>

          <h2 className="mt-7 max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] md:text-7xl">
            {t.closing1}
            <br />
            {t.closing2}
          </h2>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
