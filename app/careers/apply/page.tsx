import { careersSubmissionsReady } from "@/lib/careers-identity.server";
import CareersUnavailable from "@/components/careers/CareersUnavailable";
import { notFound } from "next/navigation";

import CareersApplyPageContent from "@/components/careers/CareersApplyPageContent";
import { createCareersPublicClient } from "@/lib/careers-public.server";
import { careersPageMetadata } from "@/lib/careers-locale.server";

export const generateMetadata = () => careersPageMetadata({
  titleFr: "Postuler | LMG Careers", titleEn: "Apply | LMG Careers",
  descriptionFr: "Envoyez votre candidature pour une opportunité chez LMG.",
  descriptionEn: "Apply for an opportunity at LMG.",
  canonical: "https://careers.lmgmusic.fr/apply", noindex: true,
});

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    job?: string;
  }>;
};

export default async function ApplyPage({
  searchParams,
}: PageProps) {
  if (!careersSubmissionsReady()) return <CareersUnavailable />;
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
