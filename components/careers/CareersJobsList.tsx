"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCareersLanguage } from "@/components/careers/CareersLanguageProvider";

type Job = {
  id: string;
  title: string;
  slug: string;
  department: string;
  employment_type: string;
  location: string | null;
  remote_policy: string | null;
  short_description: string | null;
};

const translations = {
  en: {
    departments: {
      all: "All",
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
    opportunities: "Opportunities",
    empty: "Nothing open here right now.",
    emptyText:
      "We're always interested in meeting people who want to build what's next.",
    introduce: "Introduce yourself →",
  },

  fr: {
    departments: {
      all: "Tout",
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
    opportunities: "Opportunités",
    empty: "Aucune opportunité ouverte ici pour le moment.",
    emptyText:
      "Nous sommes toujours intéressés par les personnes qui souhaitent construire la suite avec nous.",
    introduce: "Présentez-vous →",
  },
} as const;

const departmentValues = [
  "all",
  "music",
  "creative",
  "business",
  "tech_digital",
] as const;

export default function CareersJobsList({
  jobs,
}: {
  jobs: Job[];
}) {
  const { locale } = useCareersLanguage();
  const t = translations[locale];

  const [department, setDepartment] = useState("all");

  const filteredJobs = useMemo(() => {
    if (department === "all") return jobs;

    return jobs.filter(
      (job) => job.department === department
    );
  }, [department, jobs]);

  return (
    <>
      <div className="border-y border-white/15">
        <div className="mx-auto flex max-w-[1500px] flex-wrap gap-x-8 gap-y-2 px-6 py-5 md:px-10 lg:px-14">
          {departmentValues.map((value) => {
            const active = department === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setDepartment(value)}
                className={`relative py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  active
                    ? "text-[#d6ae5d]"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {t.departments[value]}

                {active && (
                  <span className="absolute inset-x-0 -bottom-[21px] h-px bg-[#d6ae5d]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 md:px-10 lg:px-14">
        {filteredJobs.length === 0 ? (
          <div className="py-28 md:py-36">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6ae5d]">
              {t.opportunities}
            </p>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              {t.empty}
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/55">
              {t.emptyText}
            </p>

            <Link
              href="/spontaneous"
              className="mt-8 inline-flex border-b border-[#d6ae5d] pb-1 text-sm font-semibold text-[#d6ae5d]"
            >
              {t.introduce}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/15">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="group grid gap-8 py-10 transition md:grid-cols-[220px_1fr_auto] md:items-start md:py-12"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d6ae5d]">
                    {t.departments[
                      job.department as keyof typeof t.departments
                    ] ?? job.department}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-[0.12em] text-white/40">
                    <span>
                      {t.contracts[
                        job.employment_type as keyof typeof t.contracts
                      ] ?? job.employment_type}
                    </span>

                    {job.remote_policy && (
                      <>
                        <span>·</span>

                        <span>
                          {t.remote[
                            job.remote_policy as keyof typeof t.remote
                          ] ?? job.remote_policy}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="max-w-3xl text-2xl font-semibold tracking-[-0.03em] transition group-hover:text-[#d6ae5d] md:text-3xl">
                    {job.title}
                  </h2>

                  {job.short_description && (
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                      {job.short_description}
                    </p>
                  )}

                  {job.location && (
                    <p className="mt-5 text-xs uppercase tracking-[0.14em] text-white/35">
                      {job.location}
                    </p>
                  )}
                </div>

                <div className="text-2xl text-white/35 transition group-hover:translate-x-1 group-hover:text-[#d6ae5d]">
                  →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
