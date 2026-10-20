import { careersIdentity } from "@/lib/careers-identity.server";
import CareersPrivacyContent from "@/components/careers/CareersPrivacyContent";
import { careersPageMetadata } from "@/lib/careers-locale.server";

export const generateMetadata = () => careersPageMetadata({
  titleFr: "Confidentialité des candidats | LMG Careers", titleEn: "Candidate Privacy | LMG Careers",
  descriptionFr: "Découvrez comment LMG traite les données personnelles transmises dans le cadre d’une candidature.",
  descriptionEn: "Information about how LMG processes personal data submitted through LMG Careers.",
  canonical: "https://careers.lmgmusic.fr/privacy",
});

export default function CareersPrivacyPage() {
  return <CareersPrivacyContent identity={careersIdentity()} />;
}
