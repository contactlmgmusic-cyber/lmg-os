import { careersIdentityReady } from "@/lib/careers-identity.server";
import CareersUnavailable from "@/components/careers/CareersUnavailable";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CareersApplyPageContent from "@/components/careers/CareersApplyPageContent";
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

export default async function ApplyPage({
  searchParams,
}: PageProps) {
  if (!careersIdentityReady()) return <CareersUnavailable />;
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

  return <CareersApplyPageContent job={job} />;
}
