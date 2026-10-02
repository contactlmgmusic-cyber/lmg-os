"use client";

import Link from "next/link";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

type Job = {
  title: string;
  slug: string;
  department: string;
  employment_type: string;
  location: string | null;
  remote_policy: string | null;
  short_description: string | null;
  description: string | null;
  responsibilities: string | null;
  profile: string | null;
  benefits: string | null;
};

const translations = {
  en: {
    all: "All opportunities",
    departments: {
      music: "Music",
      creative: "Creative",
      business: "Business",
      tech_digital: "Tech & Digital",
    },
    contracts: {
      cdi: "CDI",
      cdd: "CDD",
      stage: "Internship",
      alternance: "Apprenticeship",
      freelance: "Freelance",
      project: "Project",
    },
    remote: {
      onsite: "On-site",
      hybrid: "Hybrid",
      remote: "Remote",
    },
    role: "The role",
    responsibilities: "What you'll do",
    profile: "What we're looking for",
    benefits: "What LMG offers",
    interested: "Interested?",
    make: "Make your",
    move: "move.",
    pitch:
      "Tell us who you are, what you've built and why this opportunity speaks to you.",
    apply: "Apply now",
  },

  fr: {
    all: "Toutes les opportunités",
    departments: {
      music: "Musique",
      creative: "Créatif",
      business: "Business",
      tech_digital: "Tech & Digital",
    },
    contracts: {
      cdi: "CDI",
      cdd: "CDD",
      stage: "Stage",
      alternance: "Alternance",
      freelance: "Freelance",
      project: "Projet",
    },
    remote: {
      onsite: "Sur site",
      hybrid: "Hybride",
      remote: "À distance",
    },
    role: "Le rôle",
    responsibilities: "Vos missions",
    profile: "Le profil recherché",
    benefits: "Ce que LMG propose",
    interested: "Intéressé(e) ?",
    make: "Faites votre",
    move: "move.",
    pitch:
      "Dites-nous qui vous êtes, ce que vous avez construit et pourquoi cette opportunité vous parle.",
    apply: "Postuler",
  },
} as const;

export default function CareersJobPageContent({
  job,
}: {
  job: Job;
}) {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="px-6 pb-20 pt-40 md:px-10 md:pb-28 md:pt-48">
        <div className="mx-auto max-w-[1600px]">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 transition hover:text-white"
          >
            <span>←</span>
            {t.all}
          </Link>

          <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-9">
              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                {t.departments[
                  job.department as keyof typeof t.departments
                ] ?? job.department}
              </p>

              <h1 className="max-w-6xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] md:text-7xl lg:text-8xl xl:text-9xl">
                {job.title}
              </h1>
            </div>

            <div className="lg:col-span-3 lg:pb-2">
              <div className="border-t border-white/20 pt-6">
                <div className="space-y-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                  <p>
                    {t.contracts[
                      job.employment_type as keyof typeof t.contracts
                    ] ?? job.employment_type}
                  </p>

                  {job.location && <p>{job.location}</p>}

                  {job.remote_policy && (
                    <p>
                      {t.remote[
                        job.remote_policy as keyof typeof t.remote
                      ] ?? job.remote_policy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {job.short_description && (
              <p className="max-w-4xl text-2xl leading-[1.35] tracking-[-0.035em] text-white/75 md:text-4xl">
                {job.short_description}
              </p>
            )}

            <div className="mt-20 space-y-20">
              <JobSection
                number="01"
                title={t.role}
                content={job.description}
              />

              <JobSection
                number="02"
                title={t.responsibilities}
                content={job.responsibilities}
              />

              <JobSection
                number="03"
                title={t.profile}
                content={job.profile}
              />

              <JobSection
                number="04"
                title={t.benefits}
                content={job.benefits}
              />
            </div>
          </div>

          <aside className="lg:col-span-4 lg:pl-10">
            <div className="sticky top-32 border-t border-[#d5ad58] pt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                {t.interested}
              </p>

              <h2 className="mt-7 text-4xl font-medium leading-[0.95] tracking-[-0.05em] md:text-5xl">
                {t.make}
                <br />
                {t.move}
              </h2>

              <p className="mt-7 max-w-sm text-sm leading-7 text-white/50">
                {t.pitch}
              </p>

              <Link
                href={`/apply?job=${encodeURIComponent(job.slug)}`}
                className="mt-9 inline-flex rounded-full bg-[#d5ad58] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:opacity-80"
              >
                {t.apply}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}

function JobSection({
  number,
  title,
  content,
}: {
  number: string;
  title: string;
  content: string | null;
}) {
  if (!content) return null;

  return (
    <section className="grid gap-6 border-t border-white/15 pt-8 md:grid-cols-[70px_1fr]">
      <span className="text-[10px] text-[#d5ad58]">
        {number}
      </span>

      <div>
        <h2 className="text-3xl font-medium tracking-[-0.045em] md:text-4xl">
          {title}
        </h2>

        <div className="mt-7 whitespace-pre-line text-sm leading-8 text-white/55 md:text-base">
          {content}
        </div>
      </div>
    </section>
  );
}
