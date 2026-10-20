import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import CareersJobPageContent from "@/components/careers/CareersJobPageContent";
import { createCareersPublicClient } from "@/lib/careers-public.server";
import { readCareersLocale } from "@/lib/careers-locale.server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getJob = cache(async (slug: string) => {
  const supabase = createCareersPublicClient();

  const { data } = await supabase
    .from("careers_jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [job, locale] = await Promise.all([getJob(slug), readCareersLocale()]);
  const fr = locale === "fr";

  if (!job) {
    return {
      title: fr ? "Opportunité | LMG Careers" : "Opportunity | LMG Careers",
    };
  }

  return {
    title: `${job.title} | LMG Careers`,
    description:
      job.short_description || (fr
        ? `Découvrez l’opportunité ${job.title} chez LMG.`
        : `Explore the ${job.title} opportunity at LMG.`),
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

  const employmentTypes: Record<string, string> = {
    cdi: "FULL_TIME", cdd: "TEMPORARY", stage: "INTERN", alternance: "INTERN",
    freelance: "CONTRACTOR", project: "CONTRACTOR",
  };
  const structuredData = {
    "@context": "https://schema.org", "@type": "JobPosting",
    title: job.title,
    description: job.description || job.short_description || job.title,
    datePosted: job.published_at || job.created_at,
    ...(job.closes_at ? { validThrough: job.closes_at } : {}),
    employmentType: employmentTypes[job.employment_type] || "OTHER",
    hiringOrganization: {
      "@type": "Organization", name: "Legacy Music Group",
      sameAs: "https://www.lmgmusic.fr", logo: "https://careers.lmgmusic.fr/careers/lmg-music-logo.png",
    },
    ...(job.remote_policy === "remote"
      ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "France" } }
      : job.location ? { jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "FR" } } } : {}),
    url: `https://careers.lmgmusic.fr/jobs/${job.slug}`,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <CareersJobPageContent job={job} />
  </>;
}
