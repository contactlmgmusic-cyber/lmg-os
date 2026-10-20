import CareersJobsPageContent from "@/components/careers/CareersJobsPageContent";
import { createCareersPublicClient } from "@/lib/careers-public.server";
import { careersPageMetadata } from "@/lib/careers-locale.server";

export const generateMetadata = () => careersPageMetadata({
  titleFr: "Offres | LMG Careers", titleEn: "Jobs | LMG Careers",
  descriptionFr: "Découvrez les opportunités actuellement ouvertes chez LMG.",
  descriptionEn: "Explore current opportunities across music, creative, business and technology at LMG.",
  canonical: "https://careers.lmgmusic.fr/jobs",
});

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
    <CareersJobsPageContent
      jobs={jobs ?? []}
      hasError={Boolean(error)}
    />
  );
}
