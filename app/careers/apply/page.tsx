import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CareersApplyForm from "@/components/careers/CareersApplyForm";
import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import { createCareersPublicClient } from "@/lib/careers-public.server";

export const metadata: Metadata = {
  title: "Apply | LMG Careers",
  description: "Apply for an opportunity at LMG.",
  alternates: {
    canonical: "https://careers.lmgmusic.fr/apply",
  },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    job?: string;
  }>;
};

const departmentLabels: Record<string, string> = {
  music: "Music",
  creative: "Creative",
  business: "Business",
  tech_digital: "Tech & Digital",
};

export default async function ApplyPage({
  searchParams,
}: PageProps) {
  const { job: slug } = await searchParams;

  if (!slug) {
    notFound();
  }

  const supabase = createCareersPublicClient();

  const { data: job } = await supabase
    .from("careers_jobs")
    .select(`
      title,
      slug,
      department,
      employment_type,
      location
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="px-6 pb-20 pt-40 md:px-10 md:pb-28 md:pt-48">
        <div className="mx-auto max-w-[1600px]">
          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 transition hover:text-white"
          >
            <span>←</span>
            Back to opportunity
          </Link>

          <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-9">
              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                Apply ·{" "}
                {departmentLabels[job.department] ??
                  job.department}
              </p>

              <h1 className="max-w-6xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] md:text-7xl lg:text-8xl xl:text-9xl">
                {job.title}
              </h1>
            </div>

            <div className="lg:col-span-3 lg:pb-2">
              <p className="border-t border-white/20 pt-6 text-sm leading-7 text-white/45">
                Tell us who you are and what you&apos;d
                bring to this opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <CareersApplyForm job={job} />
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
