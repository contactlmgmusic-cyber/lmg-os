import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";

import { createCareersPublicClient } from "@/lib/careers-public.server";

export const dynamic = "force-dynamic";

const departmentLabels: Record<string, string> = {
  music: "Music",
  creative: "Creative",
  business: "Business",
  tech_digital: "Tech & Digital",
};

const contractLabels: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Internship",
  alternance: "Apprenticeship",
  freelance: "Freelance",
  project: "Project",
};

const remoteLabels: Record<string, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getJob(slug: string) {
  const supabase = createCareersPublicClient();

  const { data } = await supabase
    .from("careers_jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    return {
      title: "Opportunity | LMG Careers",
    };
  }

  return {
    title: `${job.title} | LMG Careers`,
    description:
      job.short_description ||
      `Explore the ${job.title} opportunity at LMG.`,
    alternates: {
      canonical:
        `https://careers.lmgmusic.fr/jobs/${job.slug}`,
    },
  };
}

export default async function CareersJobPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    notFound();
  }

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
            All opportunities
          </Link>

          <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-9">
              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                {departmentLabels[job.department] ??
                  job.department}
              </p>

              <h1 className="max-w-6xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] md:text-7xl lg:text-8xl xl:text-9xl">
                {job.title}
              </h1>
            </div>

            <div className="lg:col-span-3 lg:pb-2">
              <div className="border-t border-white/20 pt-6">
                <div className="space-y-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                  <p>
                    {contractLabels[job.employment_type] ??
                      job.employment_type}
                  </p>

                  {job.location && <p>{job.location}</p>}

                  {job.remote_policy && (
                    <p>
                      {remoteLabels[job.remote_policy] ??
                        job.remote_policy}
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
                title="The role"
                content={job.description}
              />

              <JobSection
                number="02"
                title="What you'll do"
                content={job.responsibilities}
              />

              <JobSection
                number="03"
                title="What we're looking for"
                content={job.profile}
              />

              <JobSection
                number="04"
                title="What LMG offers"
                content={job.benefits}
              />
            </div>
          </div>

          <aside className="lg:col-span-4 lg:pl-10">
            <div className="sticky top-32 border-t border-[#d5ad58] pt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                Interested?
              </p>

              <h2 className="mt-7 text-4xl font-medium leading-[0.95] tracking-[-0.05em] md:text-5xl">
                Make your
                <br />
                move.
              </h2>

              <p className="mt-7 max-w-sm text-sm leading-7 text-white/50">
                Tell us who you are, what you&apos;ve built
                and why this opportunity speaks to you.
              </p>

              <Link
                href={`/careers/apply?job=${job.slug}`}
                className="mt-9 inline-flex rounded-full bg-[#d5ad58] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:opacity-80"
              >
                Apply now
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
