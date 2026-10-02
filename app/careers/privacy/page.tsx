import type { Metadata } from "next";

import CareersPrivacyContent from "@/components/careers/CareersPrivacyContent";

export const metadata: Metadata = {
  title: "Candidate Privacy | LMG Careers",
  description:
    "Information about how LMG processes personal data submitted through LMG Careers.",
  alternates: {
    canonical: "https://careers.lmgmusic.fr/privacy",
  },
};

export default function CareersPrivacyPage() {
  return <CareersPrivacyContent />;
}
