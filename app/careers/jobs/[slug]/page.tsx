import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CareersJobPageContent from "@/components/careers/CareersJobPageContent";
import { createCareersPublicClient } from "@/lib/careers-public.server";

export const dynamic = "force-dynamic";

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

  return <CareersJobPageContent job={job} />;
}
