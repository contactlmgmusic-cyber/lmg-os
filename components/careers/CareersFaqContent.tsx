"use client";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

const faqs = {
  en: [
    ["01", "How do I apply for a role at LMG?", "Open the position that interests you, review the role and submit your application directly through LMG Careers. We ask for a few essential details, your CV and, where relevant, links to your work."],
    ["02", "Can I apply if I don't see the right role?", "Yes. You can introduce yourself through our open application form. Tell us what you do, where you could contribute and what you want to build. We keep relevant profiles in mind as LMG grows."],
    ["03", "Do you offer internships or apprenticeships?", "When internships or apprenticeships are available, they are published alongside our other opportunities. Availability depends on current projects, team needs and our ability to provide meaningful supervision."],
    ["04", "Does LMG work with freelancers?", "Yes. Some needs may be project-based and involve independent creative, technical or specialist talent. These opportunities can be published on LMG Careers or sourced directly by our team."],
    ["05", "What happens after I apply?", "Our team reviews applications against the needs of the role. Selected profiles may then be contacted for an initial conversation, followed by additional discussions or practical steps depending on the position."],
    ["06", "How long does the recruitment process take?", "There is no single timeline. It depends on the role, the number of applications and the people involved in the process. We aim to move thoughtfully while keeping the process proportionate to the opportunity."],
    ["07", "Can I apply for more than one position?", "Yes. If several opportunities genuinely match your experience and interests, you can apply to more than one. We recommend keeping each application relevant to the role concerned."],
    ["08", "What should I include in my application?", "A clear CV is essential. Depending on your field, a portfolio, website, LinkedIn profile or examples of previous work can also help us understand what you bring and how you think."],
    ["09", "Where are LMG roles based?", "The location and working arrangement are specified on each opportunity. Depending on the role, work may be on-site, hybrid or remote."],
    ["10", "What happens to my personal data?", "Information submitted through LMG Careers is used to review and manage your application. Access is limited to the people involved in recruitment. More information is available in our privacy information."],
  ],

  fr: [
    ["01", "Comment postuler à un poste chez LMG ?", "Ouvrez l'offre qui vous intéresse, consultez les détails du rôle puis envoyez directement votre candidature via LMG Careers. Nous vous demanderons quelques informations essentielles, votre CV et, lorsque cela est pertinent, des liens vers votre travail."],
    ["02", "Puis-je postuler si aucune offre ne me correspond ?", "Oui. Vous pouvez vous présenter via notre formulaire de candidature spontanée. Dites-nous ce que vous faites, où vous pourriez contribuer et ce que vous souhaitez construire. Nous gardons en tête les profils pertinents à mesure que LMG se développe."],
    ["03", "Proposez-vous des stages ou des alternances ?", "Lorsque des stages ou des alternances sont disponibles, ils sont publiés avec nos autres opportunités. Leur disponibilité dépend des projets en cours, des besoins de l'équipe et de notre capacité à assurer un accompagnement pertinent."],
    ["04", "LMG travaille-t-il avec des freelances ?", "Oui. Certains besoins peuvent être liés à des projets et faire appel à des talents indépendants créatifs, techniques ou spécialisés. Ces opportunités peuvent être publiées sur LMG Careers ou recherchées directement par notre équipe."],
    ["05", "Que se passe-t-il après ma candidature ?", "Notre équipe examine les candidatures en fonction des besoins du rôle. Les profils retenus peuvent ensuite être contactés pour un premier échange, suivi d'autres discussions ou d'étapes pratiques selon le poste."],
    ["06", "Combien de temps dure le processus de recrutement ?", "Il n'existe pas de délai unique. Cela dépend du rôle, du nombre de candidatures et des personnes impliquées dans le processus. Nous cherchons à avancer avec attention tout en gardant un processus proportionné à l'opportunité."],
    ["07", "Puis-je postuler à plusieurs postes ?", "Oui. Si plusieurs opportunités correspondent réellement à votre expérience et à vos intérêts, vous pouvez candidater à plusieurs offres. Nous vous recommandons d'adapter chaque candidature au rôle concerné."],
    ["08", "Que dois-je inclure dans ma candidature ?", "Un CV clair est essentiel. Selon votre domaine, un portfolio, un site web, un profil LinkedIn ou des exemples de travaux précédents peuvent également nous aider à comprendre ce que vous apportez et votre manière de travailler."],
    ["09", "Où sont basés les postes chez LMG ?", "La localisation et le mode de travail sont précisés sur chaque offre. Selon le rôle, le travail peut être réalisé sur site, en hybride ou à distance."],
    ["10", "Que deviennent mes données personnelles ?", "Les informations transmises via LMG Careers sont utilisées pour examiner et gérer votre candidature. Leur accès est limité aux personnes impliquées dans le recrutement. Vous trouverez davantage d'informations dans notre politique de confidentialité."],
  ],
} as const;

const ui = {
  en: {
    eyebrow: "Careers FAQ",
    hero1: "Before",
    hero2: "you make",
    hero3: "your move.",
    intro: "A few things worth knowing before you apply.",
    description:
      "From open applications to internships, freelance opportunities and what happens after you hit submit.",
    interested: "Still interested?",
    fit1: "Find where",
    fit2: "you fit.",
    jobs: "View open positions",
    introduce: "Introduce yourself",
  },
  fr: {
    eyebrow: "FAQ Careers",
    hero1: "Avant",
    hero2: "de faire",
    hero3: "le premier pas.",
    intro: "Quelques éléments utiles à connaître avant de postuler.",
    description:
      "Des candidatures spontanées aux stages, en passant par les missions freelance et les étapes qui suivent l'envoi de votre candidature.",
    interested: "Toujours intéressé(e) ?",
    fit1: "Trouvez",
    fit2: "votre place.",
    jobs: "Voir les offres",
    introduce: "Présentez-vous",
  },
} as const;

export default function CareersFaqContent() {
  const { locale } = useCareersLanguage();
  const t = ui[locale];
  const items = faqs[locale];

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d5ad58]">
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
          {items.map(([number, question, answer]) => (
            <details
              key={number}
              className="group border-b border-white/15"
            >
              <summary className="grid cursor-pointer list-none grid-cols-[48px_1fr_auto] items-start gap-5 py-8 md:grid-cols-[90px_1fr_auto] md:gap-10 md:py-10">
                <span className="pt-1 text-xs font-bold tracking-[0.16em] text-[#d5ad58]">
                  {number}
                </span>

                <h2 className="max-w-4xl text-xl font-bold leading-tight tracking-[-0.025em] md:text-3xl">
                  {question}
                </h2>

                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xl transition duration-300 group-open:rotate-45 group-open:border-[#d5ad58] group-open:text-[#d5ad58]">
                  +
                </span>
              </summary>

              <div className="grid grid-cols-[48px_1fr] gap-5 pb-10 md:grid-cols-[90px_1fr] md:gap-10">
                <div />

                <p className="max-w-3xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                  {answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="rounded-[2rem] bg-[#d5ad58] px-6 py-12 text-black md:px-12 md:py-16">
          <p className="text-xs font-black uppercase tracking-[0.2em]">
            {t.interested}
          </p>

          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="max-w-4xl text-5xl font-black uppercase leading-[0.86] tracking-[-0.06em] md:text-7xl">
              {t.fit1}
              <br />
              {t.fit2}
            </h2>

            <div className="flex flex-wrap gap-3">
              <a
                href="/jobs"
                className="rounded-full bg-black px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-black"
              >
                {t.jobs}
              </a>

              <a
                href="/spontaneous"
                className="rounded-full border border-black px-7 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-black hover:text-white"
              >
                {t.introduce}
              </a>
            </div>
          </div>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
