import type { Metadata } from "next";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import CareersJobsList from "@/components/careers/CareersJobsList";
import { createCareersPublicClient } from "@/lib/careers-public.server";

export const metadata: Metadata = {
  title: "Jobs | LMG Careers",
  description:
    "Explore current opportunities across music, creative, business and technology at LMG.",
  alternates: {
    canonical: "https://careers.lmgmusic.fr/jobs",
  },
};

export const dynamic = "force-dynamic";

export default async function CareersJobsPage() {
  const supabase = createCareersPublicClient();

  const { data: jobs, error } = await supabase
    .from("careers_jobs")
    .select(`
      id,
      title,
      slug,
      department,
      employment_type,
      location,
      remote_policy,
      short_description
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="px-6 pb-24 pt-40 md:px-10 md:pb-32 md:pt-48">
        <div className="mx-auto max-w-[1600px]">
          <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.32em] text-[#d5ad58]">
            Open opportunities
          </p>

          <div className="grid gap-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="text-[15vw] font-black uppercase leading-[0.78] tracking-[-0.075em] sm:text-[12vw] lg:text-[7vw]">
                Find your
                <br />
                next move.
              </h1>
            </div>

            <div className="lg:col-span-4 lg:pb-3">
              <p className="max-w-md text-sm leading-7 text-white/55 md:text-base">
                Join the people shaping music, image,
                business and technology across LMG.
              </p>

              <div className="mt-9 border-t border-white/15 pt-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  {jobs?.length ?? 0}{" "}
                  {jobs?.length === 1
                    ? "open opportunity"
                    : "open opportunities"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[1600px] px-6 pt-12 md:px-10 md:pt-16">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d5ad58]">
                Find your place
              </p>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.05em] md:text-6xl">
                Explore opportunities.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/45 md:col-span-5 md:justify-self-end">
              Different disciplines. Shared ambition.
              Find where your perspective can make a difference.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mx-auto max-w-[1600px] px-6 py-24 text-sm text-white/45 md:px-10">
            Opportunities are temporarily unavailable.
          </div>
        ) : (
          <div className="mt-14">
            <CareersJobsList jobs={jobs ?? []} />
          </div>
        )}
      </section>

      <section className="px-3 pb-3 pt-28 md:px-5 md:pb-5 md:pt-40">
        <div className="rounded-[2rem] bg-[#d5ad58] px-6 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto max-w-[1500px]">
            <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em]">
              Nothing fits yet?
            </p>

            <div className="grid gap-12 md:grid-cols-2">
              <h2 className="text-6xl font-black uppercase leading-[0.82] tracking-[-0.07em] md:text-8xl">
                Make the
                <br />
                first move.
              </h2>

              <div className="flex flex-col justify-end md:items-start">
                <p className="max-w-md text-sm leading-7 text-black/60">
                  The right role may not be open today.
                  Tell us who you are, what you do and what
                  you would like to build with LMG.
                </p>

                <a
                  href="/spontaneous"
                  className="mt-8 rounded-full bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                >
                  Introduce yourself
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
