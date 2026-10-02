import type { Metadata } from "next";

import CareersHome from "@/components/careers/CareersHome";

export const metadata: Metadata = {
  title: "Careers | LMG",
  description:
    "Explore careers and opportunities across music, creative, business and technology at LMG.",
  alternates: {
    canonical: "https://careers.lmgmusic.fr",
  },
};

export default function CareersPage() {
  return <CareersHome />;
}
