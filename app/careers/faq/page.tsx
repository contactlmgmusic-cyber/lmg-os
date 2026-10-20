import CareersFaqContent from "@/components/careers/CareersFaqContent";
import { careersPageMetadata } from "@/lib/careers-locale.server";

export const generateMetadata = () => careersPageMetadata({
  titleFr: "FAQ | LMG Careers", titleEn: "FAQ | LMG Careers",
  descriptionFr: "Retrouvez les réponses aux questions fréquentes sur les candidatures et opportunités chez LMG.",
  descriptionEn: "Answers to common questions about careers, applications and opportunities at LMG.",
  canonical: "https://careers.lmgmusic.fr/faq",
});

export default function CareersFaqPage() {
  return <CareersFaqContent />;
}
