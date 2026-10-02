import type { Metadata } from "next";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";

export const metadata: Metadata = {
  title: "FAQ | LMG Careers",
  description:
    "Answers to common questions about careers, applications and opportunities at LMG.",
};

const faqs = [
  {
    number: "01",
    question: "How do I apply for a role at LMG?",
    answer:
      "Open the position that interests you, review the role and submit your application directly through LMG Careers. We ask for a few essential details, your CV and, where relevant, links to your work.",
  },
  {
    number: "02",
    question: "Can I apply if I don't see the right role?",
    answer:
      "Yes. You can introduce yourself through our open application form. Tell us what you do, where you could contribute and what you want to build. We keep relevant profiles in mind as LMG grows.",
  },
  {
    number: "03",
    question: "Do you offer internships or apprenticeships?",
    answer:
      "When internships or apprenticeships are available, they are published alongside our other opportunities. Availability depends on current projects, team needs and our ability to provide meaningful supervision.",
  },
  {
    number: "04",
    question: "Does LMG work with freelancers?",
    answer:
      "Yes. Some needs may be project-based and involve independent creative, technical or specialist talent. These opportunities can be published on LMG Careers or sourced directly by our team.",
  },
  {
    number: "05",
    question: "What happens after I apply?",
    answer:
      "Our team reviews applications against the needs of the role. Selected profiles may then be contacted for an initial conversation, followed by additional discussions or practical steps depending on the position.",
  },
  {
    number: "06",
    question: "How long does the recruitment process take?",
    answer:
      "There is no single timeline. It depends on the role, the number of applications and the people involved in the process. We aim to move thoughtfully while keeping the process proportionate to the opportunity.",
  },
  {
    number: "07",
    question: "Can I apply for more than one position?",
    answer:
      "Yes. If several opportunities genuinely match your experience and interests, you can apply to more than one. We recommend keeping each application relevant to the role concerned.",
  },
  {
    number: "08",
    question: "What should I include in my application?",
    answer:
      "A clear CV is essential. Depending on your field, a portfolio, website, LinkedIn profile or examples of previous work can also help us understand what you bring and how you think.",
  },
  {
    number: "09",
    question: "Where are LMG roles based?",
    answer:
      "The location and working arrangement are specified on each opportunity. Depending on the role, work may be on-site, hybrid or remote.",
  },
  {
    number: "10",
    question: "What happens to my personal data?",
    answer:
      "Information submitted through LMG Careers is used to review and manage your application. Access is limited to the people involved in recruitment. More information is available in our privacy information.",
  },
];

export default function CareersFaqPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d5ad58]">
          Careers FAQ
        </p>

        <h1 className="mt-8 max-w-6xl text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
          Before
          <br />
          you make
          <br />
          your move.
        </h1>

        <div className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-2 md:gap-20">
          <p className="max-w-xl text-2xl font-semibold leading-tight md:text-4xl">
            A few things worth knowing before you apply.
          </p>

          <p className="max-w-xl text-base leading-7 text-white/55">
            From open applications to internships,
            freelance opportunities and what happens
            after you hit submit.
          </p>
        </div>
      </section>

      <section className="border-t border-white/15">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          {faqs.map((faq) => (
            <details
              key={faq.number}
              className="group border-b border-white/15"
            >
              <summary className="grid cursor-pointer list-none grid-cols-[48px_1fr_auto] items-start gap-5 py-8 md:grid-cols-[90px_1fr_auto] md:gap-10 md:py-10">
                <span className="pt-1 text-xs font-bold tracking-[0.16em] text-[#d5ad58]">
                  {faq.number}
                </span>

                <h2 className="max-w-4xl text-xl font-bold leading-tight tracking-[-0.025em] md:text-3xl">
                  {faq.question}
                </h2>

                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xl transition duration-300 group-open:rotate-45 group-open:border-[#d5ad58] group-open:text-[#d5ad58]">
                  +
                </span>
              </summary>

              <div className="grid grid-cols-[48px_1fr] gap-5 pb-10 md:grid-cols-[90px_1fr] md:gap-10">
                <div />

                <p className="max-w-3xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="rounded-[2rem] bg-[#d5ad58] px-6 py-12 text-black md:px-12 md:py-16">
          <p className="text-xs font-black uppercase tracking-[0.2em]">
            Still interested?
          </p>

          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="max-w-4xl text-5xl font-black uppercase leading-[0.86] tracking-[-0.06em] md:text-7xl">
              Find where
              <br />
              you fit.
            </h2>

            <div className="flex flex-wrap gap-3">
              <a
                href="/jobs"
                className="rounded-full bg-black px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-black"
              >
                View open positions
              </a>

              <a
                href="/spontaneous"
                className="rounded-full border border-black px-7 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-black hover:text-white"
              >
                Introduce yourself
              </a>
            </div>
          </div>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
