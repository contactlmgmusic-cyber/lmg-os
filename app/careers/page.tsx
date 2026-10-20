import CareersHome from "@/components/careers/CareersHome";
import { careersPageMetadata } from "@/lib/careers-locale.server";

export const generateMetadata = () => careersPageMetadata({
  titleFr: "Carrières | LMG", titleEn: "Careers | LMG",
  descriptionFr: "Découvrez les métiers et opportunités de LMG dans la musique, la création, le business et la technologie.",
  descriptionEn: "Explore careers and opportunities across music, creative, business and technology at LMG.",
  canonical: "https://careers.lmgmusic.fr",
});

export default function CareersPage() {
  return <CareersHome />;
}
