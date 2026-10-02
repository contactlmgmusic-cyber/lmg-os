"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

const content = {
  en: {
    eyebrow: "LMG Music / FAQ",
    title1: "Questions.",
    title2: "Clear answers.",
    intro:
      "A few essentials about LMG Music, artist projects, collaborations and how to get in touch.",

    index: "Explore",
    questions: "Questions",

    items: [
      {
        number: "01",
        question: "What is LMG Music?",
        answer:
          "LMG Music is the music division of LMG. We work across artist development, artistic direction, strategy, production, releases and the development of projects around music.",
      },
      {
        number: "02",
        question: "How can I present my artist project?",
        answer:
          "Use the dedicated project submission form to introduce your music, your universe, your current situation and your ambitions. Links to music and relevant social profiles help us understand the project.",
      },
      {
        number: "03",
        question: "Does submitting a project guarantee a response?",
        answer:
          "No. Every project can be reviewed, but submitting a project does not guarantee a response, a meeting or a collaboration with LMG Music.",
      },
      {
        number: "04",
        question: "What kind of artists does LMG Music work with?",
        answer:
          "We look first at the identity, vision, music and development potential of a project. There is no single profile or musical path that defines an LMG Music artist.",
      },
      {
        number: "05",
        question: "What does artist development include?",
        answer:
          "Depending on the project, our work can involve artistic direction, positioning, release strategy, production coordination, image, communication, partnerships and long-term development.",
      },
      {
        number: "06",
        question: "Does LMG Music also work on live projects?",
        answer:
          "Yes. Live & Entertainment covers areas such as performances, showcases, booking opportunities and experiences developed around artists and their music.",
      },
      {
        number: "07",
        question: "Can independent artists work with LMG Music?",
        answer:
          "A project's current structure is one of many factors we consider. The right form of collaboration depends on the artist, the project, its needs and the framework agreed between the parties.",
      },
      {
        number: "08",
        question: "How can I contact LMG Music for a professional collaboration?",
        answer:
          "For partnerships, media, business enquiries or other professional requests, use our Contact page so your message can be directed appropriately.",
      },
      {
        number: "09",
        question: "Where can I find opportunities to join the team?",
        answer:
          "Jobs, internships and other recruitment opportunities are published on the dedicated LMG Music Careers platform.",
      },
      {
        number: "10",
        question: "Where can I find LMG Music news and releases?",
        answer:
          "Our Newsroom covers announcements and stories from LMG Music, while the Releases section brings together music released across the ecosystem.",
      },
    ],

    projectEyebrow: "Artists",
    projectTitle: "Have a project?",
    projectText:
      "Introduce your music, your universe and the direction you want to take next.",
    projectCta: "Present a project",

    contactEyebrow: "Still have a question?",
    contactTitle: "Talk to us.",
    contactText:
      "For partnerships, media enquiries or another professional request, contact LMG Music.",
    contactCta: "Contact LMG Music",
  },

  fr: {
    eyebrow: "LMG Music / FAQ",
    title1: "Questions.",
    title2: "Réponses claires.",
    intro:
      "L’essentiel à savoir sur LMG Music, les projets artistes, les collaborations et les différentes façons de nous contacter.",

    index: "Explorer",
    questions: "Questions",

    items: [
      {
        number: "01",
        question: "Qu’est-ce que LMG Music ?",
        answer:
          "LMG Music est le pôle musique de LMG. Nous intervenons autour du développement artistique, de la direction artistique, de la stratégie, de la production, des sorties et du développement de projets autour de la musique.",
      },
      {
        number: "02",
        question: "Comment présenter mon projet artistique ?",
        answer:
          "Utilise le formulaire dédié pour nous présenter ta musique, ton univers, ta situation actuelle et tes ambitions. Les liens vers ta musique et tes réseaux nous permettent de mieux comprendre ton projet.",
      },
      {
        number: "03",
        question: "Est-ce que l’envoi d’un projet garantit une réponse ?",
        answer:
          "Non. Chaque projet peut être étudié, mais l’envoi d’une candidature ne garantit ni une réponse, ni un rendez-vous, ni une collaboration avec LMG Music.",
      },
      {
        number: "04",
        question: "Quels types d’artistes LMG Music accompagne-t-il ?",
        answer:
          "Nous regardons avant tout l’identité, la vision, la musique et le potentiel de développement du projet. Il n’existe pas un profil ou un parcours musical unique pour travailler avec LMG Music.",
      },
      {
        number: "05",
        question: "Que comprend le développement artistique ?",
        answer:
          "Selon le projet, notre travail peut concerner la direction artistique, le positionnement, la stratégie de sortie, la coordination de production, l’image, la communication, les partenariats et le développement à long terme.",
      },
      {
        number: "06",
        question: "LMG Music intervient-il aussi sur le live ?",
        answer:
          "Oui. Live & Entertainment couvre notamment les performances, showcases, opportunités de booking et expériences développées autour des artistes et de leur musique.",
      },
      {
        number: "07",
        question: "Un artiste indépendant peut-il travailler avec LMG Music ?",
        answer:
          "La structure actuelle d’un projet fait partie des éléments étudiés. La forme de collaboration dépend de l’artiste, du projet, de ses besoins et du cadre défini entre les parties.",
      },
      {
        number: "08",
        question: "Comment contacter LMG Music pour une collaboration professionnelle ?",
        answer:
          "Pour un partenariat, une demande média, une proposition professionnelle ou une autre demande, utilise notre page Contact afin que ton message soit orienté correctement.",
      },
      {
        number: "09",
        question: "Où trouver les opportunités pour rejoindre l’équipe ?",
        answer:
          "Les offres d’emploi, stages et autres opportunités de recrutement sont publiées sur la plateforme Careers dédiée de LMG Music.",
      },
      {
        number: "10",
        question: "Où retrouver les actualités et sorties LMG Music ?",
        answer:
          "Notre Newsroom rassemble les annonces et actualités de LMG Music, tandis que la section Sorties regroupe les projets musicaux publiés au sein de l’écosystème.",
      },
    ],

    projectEyebrow: "Artistes",
    projectTitle: "Un projet ?",
    projectText:
      "Présente-nous ta musique, ton univers et la direction que tu souhaites donner à la suite.",
    projectCta: "Présenter un projet",

    contactEyebrow: "Encore une question ?",
    contactTitle: "Parlons-en.",
    contactText:
      "Pour un partenariat, une demande média ou une autre demande professionnelle, contacte LMG Music.",
    contactCta: "Contacter LMG Music",
  },
} as const;

export default function MusicFaqContent() {
  const { locale } = useSiteLanguage();
  const c = content[locale];

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="border-b border-zinc-900 bg-[#050505] px-6 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-[1500px]">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
            {c.eyebrow}
          </p>

          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <h1 className="max-w-[950px] text-[15vw] font-black uppercase leading-[0.78] tracking-[-0.075em] sm:text-[11vw] lg:text-[7vw]">
              {c.title1}
              <br />
              <span className="text-zinc-600">{c.title2}</span>
            </h1>

            <p className="max-w-md text-base leading-7 text-zinc-400 md:text-lg">
              {c.intro}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex items-end justify-between border-b border-zinc-800 pb-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                {c.index}
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] md:text-5xl">
                {c.questions}
              </h2>
            </div>

            <span className="text-xs font-medium text-zinc-600">
              01 — {String(c.items.length).padStart(2, "0")}
            </span>
          </div>

          <div>
            {c.items.map((item) => (
              <details
                key={item.number}
                className="group border-b border-zinc-800"
              >
                <summary className="grid cursor-pointer list-none grid-cols-[50px_1fr_auto] items-center gap-4 py-7 md:grid-cols-[90px_1fr_auto] md:py-9">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-yellow-500">
                    {item.number}
                  </span>

                  <h3 className="max-w-4xl text-lg font-semibold tracking-[-0.02em] md:text-2xl">
                    {item.question}
                  </h3>

                  <span className="ml-4 text-xl font-light text-zinc-500 transition-transform duration-300 group-open:rotate-45 group-open:text-yellow-500">
                    +
                  </span>
                </summary>

                <div className="grid grid-cols-[50px_1fr] gap-4 pb-8 md:grid-cols-[90px_1fr] md:pb-10">
                  <span />

                  <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base md:leading-8">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT CTA */}
      <section className="border-y border-zinc-900 bg-[#080808] px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.projectEyebrow}
            </p>
          </div>

          <div>
            <h2 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.055em] md:text-7xl">
              {c.projectTitle}
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-zinc-400">
              {c.projectText}
            </p>

            <Link
              href="/rejoindre"
              className="mt-8 inline-flex rounded-full bg-yellow-500 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-yellow-400"
            >
              {c.projectCta} ↗
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
            {c.contactEyebrow}
          </p>

          <div className="mt-8 grid gap-10 border-t border-zinc-800 pt-10 lg:grid-cols-[1fr_0.65fr] lg:items-end">
            <h2 className="text-6xl font-black uppercase leading-[0.85] tracking-[-0.06em] md:text-8xl">
              {c.contactTitle}
            </h2>

            <div>
              <p className="max-w-md leading-7 text-zinc-400">
                {c.contactText}
              </p>

              <Link
                href="/contact"
                className="mt-7 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:text-yellow-500"
              >
                {c.contactCta}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
