import type { Metadata } from "next";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";

export const metadata: Metadata = {
  title: "Candidate Privacy | LMG Careers",
  description:
    "Information about how LMG processes personal data submitted through LMG Careers.",
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  {
    number: "01",
    title: "Who processes your data?",
    content: (
      <>
        <p>
          Applications submitted through LMG Careers are
          processed by LMG for recruitment purposes.
        </p>

        <p className="mt-5">
          Full legal identification of the data controller
          will be published here before the Careers platform
          enters production.
        </p>
      </>
    ),
  },
  {
    number: "02",
    title: "What information do we collect?",
    content: (
      <p>
        Depending on your application, we may collect your
        name, contact details, location, availability, CV,
        professional experience, LinkedIn profile, portfolio
        or website, application message, area of interest and
        information generated during the recruitment process.
      </p>
    ),
  },
  {
    number: "03",
    title: "Why do we use it?",
    content: (
      <p>
        We use this information to receive and review
        applications, assess profiles in relation to current
        opportunities, communicate with candidates, organise
        recruitment steps and manage our recruitment process.
      </p>
    ),
  },
  {
    number: "04",
    title: "Who can access it?",
    content: (
      <p>
        Access is restricted to people at LMG who need the
        information for recruitment and, where necessary, to
        technical service providers involved in operating the
        Careers platform and securely hosting its data.
      </p>
    ),
  },
  {
    number: "05",
    title: "How long do we keep it?",
    content: (
      <>
        <p>
          Information is retained for the time necessary to
          manage the recruitment process.
        </p>

        <p className="mt-5">
          Where a profile may be relevant for future
          opportunities, candidate information may be retained
          for up to two years from the last contact, unless
          the candidate requests deletion or objects to that
          continued retention.
        </p>
      </>
    ),
  },
  {
    number: "06",
    title: "Your rights",
    content: (
      <p>
        Subject to the conditions provided by applicable data
        protection law, you may request access to your personal
        data, correction of inaccurate information, deletion,
        restriction of processing or object to certain uses of
        your data. Where applicable, you may also exercise your
        right to data portability.
      </p>
    ),
  },
  {
    number: "07",
    title: "Recruitment decisions",
    content: (
      <p>
        Applications are reviewed as part of LMG&apos;s
        recruitment process. LMG Careers is not intended to
        make hiring decisions based solely on automated
        processing.
      </p>
    ),
  },
  {
    number: "08",
    title: "Questions or requests",
    content: (
      <p>
        A dedicated contact address for privacy and candidate
        data requests will be displayed here before the
        platform enters production. Candidates may also lodge
        a complaint with the competent data protection
        authority.
      </p>
    ),
  },
];

export default function CareersPrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d5ad58]">
          Candidate privacy
        </p>

        <h1 className="mt-8 max-w-6xl text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
          Your data.
          <br />
          Clearly
          <br />
          handled.
        </h1>

        <div className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-2 md:gap-20">
          <p className="max-w-xl text-2xl font-semibold leading-tight md:text-4xl">
            Applying means sharing part of your professional
            story. We treat that information accordingly.
          </p>

          <p className="max-w-xl text-base leading-7 text-white/55">
            This notice explains what information is processed
            through LMG Careers, why we use it, who may access
            it and what rights you have over your data.
          </p>
        </div>
      </section>

      <section className="border-t border-white/15">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          {sections.map((section) => (
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
                {section.content}
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
            Your profile
            <br />
            stays yours.
          </h2>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
