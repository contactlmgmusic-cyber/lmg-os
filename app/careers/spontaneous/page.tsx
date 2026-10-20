import { careersSubmissionsReady } from "@/lib/careers-identity.server";
import CareersUnavailable from "@/components/careers/CareersUnavailable";
import CareersSpontaneousPageContent from "@/components/careers/CareersSpontaneousPageContent";
import { careersPageMetadata } from "@/lib/careers-locale.server";

export const generateMetadata = () => careersPageMetadata({
  titleFr: "Candidature spontanée | LMG Careers", titleEn: "Introduce yourself | LMG Careers",
  descriptionFr: "Présentez votre parcours à LMG et dites-nous ce que vous aimeriez construire avec nous.",
  descriptionEn: "Introduce yourself to LMG and tell us what you could build with us.",
  canonical: "https://careers.lmgmusic.fr/spontaneous",
});

export default function SpontaneousApplicationPage() {
  if (!careersSubmissionsReady()) return <CareersUnavailable />;
  return <CareersSpontaneousPageContent />;
}
