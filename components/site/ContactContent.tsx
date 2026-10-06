"use client";

import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function ContactContent() {
  const { locale } = useSiteLanguage();
  const en = locale === "en";

  const c = en
    ? {
        label: "Contact",
        title: "Start the right\nconversation.",
        intro:
          "Artist project, partnership, press request or something else? Choose the subject that best matches your request and get in touch with LMG Music.",

        chooseLabel: "GET IN TOUCH",
        chooseTitle: "What would you like to talk about?",

        artist: {
          number: "01",
          label: "ARTIST / PROJECT",
          title: "Present a project",
          text:
            "You are an artist or represent a music project and would like to introduce it to LMG Music.",
          action: "Present your project",
        },

        partnership: {
          number: "02",
          label: "PARTNERSHIPS",
          title: "Build something together",
          text:
            "Brand, venue, studio, creative structure or industry professional: let's explore possible collaborations.",
          action: "Contact us",
        },

        press: {
          number: "03",
          label: "PRESS & MEDIA",
          title: "Press enquiries",
          text:
            "For interviews, information, media requests or enquiries relating to LMG Music and its artists.",
          action: "Press & releases",
        },

        general: {
          number: "04",
          label: "GENERAL",
          title: "General enquiries",
          text:
            "For any request that does not fall into the categories above, contact the LMG team directly.",
          action: "Send an email",
        },

        directLabel: "DIRECT CONTACT",
        directTitle: "Prefer email?",
        directText:
          "For general enquiries, you can contact the LMG team directly.",
        emailLabel: "GENERAL ENQUIRIES",

        responseLabel: "BEFORE CONTACTING US",
        responseTitle: "Help us understand your request.",
        responseText:
          "For project or partnership enquiries, include enough context for the team to understand what you are proposing: who you are, the project, its current stage and what you are looking for.",

        careersLabel: "CAREERS",
        careersTitle: "Looking to work with LMG?",
        careersText:
          "Job opportunities and recruitment are handled through our dedicated Careers platform.",
        careersAction: "Explore Careers",
      }
    : {
        label: "Contact",
        title: "Commencer la bonne\nconversation.",
        intro:
          "Projet artistique, partenariat, demande presse ou autre sujet ? Choisissez l’entrée qui correspond le mieux à votre demande pour contacter LMG Music.",

        chooseLabel: "NOUS CONTACTER",
        chooseTitle: "De quoi souhaitez-vous nous parler ?",

        artist: {
          number: "01",
          label: "ARTISTE / PROJET",
          title: "Présenter un projet",
          text:
            "Vous êtes artiste ou représentez un projet musical et souhaitez le présenter à LMG Music.",
          action: "Présenter votre projet",
        },

        partnership: {
          number: "02",
          label: "PARTENARIATS",
          title: "Construire quelque chose ensemble",
          text:
            "Marque, lieu, studio, structure créative ou professionnel de l’industrie : échangeons autour des collaborations possibles.",
          action: "Nous contacter",
        },

        press: {
          number: "03",
          label: "PRESSE & MÉDIAS",
          title: "Demandes presse",
          text:
            "Pour les interviews, demandes d’informations, sollicitations médias ou sujets concernant LMG Music et ses artistes.",
          action: "Presse & communiqués",
        },

        general: {
          number: "04",
          label: "GÉNÉRAL",
          title: "Demandes générales",
          text:
            "Pour toute demande qui ne correspond pas aux catégories précédentes, contactez directement l’équipe LMG.",
          action: "Envoyer un email",
        },

        directLabel: "CONTACT DIRECT",
        directTitle: "Vous préférez nous écrire ?",
        directText:
          "Pour les demandes générales, vous pouvez contacter directement l’équipe LMG.",
        emailLabel: "DEMANDES GÉNÉRALES",

        responseLabel: "AVANT DE NOUS CONTACTER",
        responseTitle: "Aidez-nous à comprendre votre demande.",
        responseText:
          "Pour un projet ou un partenariat, ajoutez suffisamment de contexte pour que l’équipe puisse comprendre votre proposition : qui vous êtes, le projet, son stade actuel et ce que vous recherchez.",

        careersLabel: "CARRIÈRES",
        careersTitle: "Vous souhaitez travailler avec LMG ?",
        careersText:
          "Les opportunités professionnelles et le recrutement sont regroupés sur notre plateforme Careers dédiée.",
        careersAction: "Découvrir Careers",
      };

  const cards = [
    {
      ...c.artist,
      href: "/rejoindre",
      external: false,
    },
    {
      ...c.partnership,
      href:
        "mailto:contact@legacymusicgroup.fr?subject=Partenariat%20-%20LMG%20Music",
      external: true,
    },
    {
      ...c.press,
      href: "/press",
      external: false,
    },
    {
      ...c.general,
      href:
        "mailto:contact@legacymusicgroup.fr?subject=Contact%20-%20LMG%20Music",
      external: true,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 bg-[#050505] px-6 py-14 md:px-8 md:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 text-[16rem] font-medium leading-none tracking-[-0.1em] text-white/[0.015] md:text-[26rem]">
          @
        </div>

        <div className="relative mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            {c.label}
          </p>

          <h1 className="mt-8 max-w-5xl whitespace-pre-line text-[clamp(3rem,6vw,5.8rem)] font-medium leading-[0.98] tracking-[-0.055em]">
            {c.title}
          </h1>

          <p className="mt-9 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
            {c.intro}
          </p>
        </div>
      </section>

      {/* ROUTING */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {c.chooseLabel}
          </p>

          <h2 className="mt-6 max-w-3xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] md:text-5xl">
            {c.chooseTitle}
          </h2>

          <div className="mt-14 grid border-l border-t border-zinc-800 md:grid-cols-2">
            {cards.map((card) => {
              const className =
                "group relative flex min-h-[330px] flex-col border-b border-r border-zinc-800 bg-[#090909] p-7 transition duration-300 hover:bg-[#111111] md:p-9";

              const body = (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-yellow-500">
                      {card.number}
                    </span>

                    <span className="text-xl text-zinc-400 transition group-hover:text-yellow-500">
                      ↗
                    </span>
                  </div>

                  <div className="my-auto py-10">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                      {card.label}
                    </p>

                    <h3 className="mt-4 max-w-lg text-2xl font-medium tracking-[-0.03em] md:text-3xl">
                      {card.title}
                    </h3>

                    <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
                      {card.text}
                    </p>
                  </div>

                  <span className="w-fit border-b border-zinc-700 pb-2 text-xs font-semibold text-zinc-300 transition group-hover:border-yellow-500 group-hover:text-yellow-500">
                    {card.action}
                  </span>
                </>
              );

              return card.external ? (
                <a
                  key={card.number}
                  href={card.href}
                  className={className}
                >
                  {body}
                </a>
              ) : (
                <Link
                  key={card.number}
                  href={card.href}
                  className={className}
                >
                  {body}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIRECT CONTACT */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {c.directLabel}
            </p>

            <h2 className="mt-6 text-3xl font-medium tracking-[-0.04em] md:text-4xl">
              {c.directTitle}
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
              {c.directText}
            </p>
          </div>

          <div className="self-end border-t border-zinc-800 pt-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              {c.emailLabel}
            </p>

            <a
              href="mailto:contact@legacymusicgroup.fr"
              className="mt-4 inline-block break-all text-xl font-medium tracking-[-0.025em] transition hover:text-yellow-500 md:text-3xl"
            >
              contact@legacymusicgroup.fr
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT QUALITY */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.55fr_1.45fr] md:gap-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            {c.responseLabel}
          </p>

          <div>
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] md:text-5xl">
              {c.responseTitle}
            </h2>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-400 md:text-base">
              {c.responseText}
            </p>
          </div>
        </div>
      </section>

      {/* CAREERS */}
      <section className="border-t border-zinc-900 bg-[#0a0a0a] px-6 py-14 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
              {c.careersLabel}
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              {c.careersTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
              {c.careersText}
            </p>
          </div>

          <a
            href="https://careers.lmgmusic.fr"
            className="w-fit border-b border-yellow-500 pb-2 text-xs font-semibold text-zinc-300 transition hover:text-yellow-500"
          >
            {c.careersAction} ↗
          </a>
        </div>
      </section>
    </>
  );
}
