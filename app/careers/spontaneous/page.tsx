import { careersIdentityReady } from "@/lib/careers-identity.server";
import CareersUnavailable from "@/components/careers/CareersUnavailable";
import type { Metadata } from "next";

import CareersSpontaneousPageContent from "@/components/careers/CareersSpontaneousPageContent";

export const metadata: Metadata = {
  title: "Introduce yourself | LMG Careers",
  description:
    "Introduce yourself to LMG and tell us what you could build with us.",
  alternates: {
    canonical: "https://careers.lmgmusic.fr/spontaneous",
  },
};

export default function SpontaneousApplicationPage() {
  if (!careersIdentityReady()) return <CareersUnavailable />;
  return <CareersSpontaneousPageContent />;
}
