import type { Metadata } from "next";

import CareersFaqContent from "@/components/careers/CareersFaqContent";

export const metadata: Metadata = {
  title: "FAQ | LMG Careers",
  description:
    "Answers to common questions about careers, applications and opportunities at LMG.",
  alternates: {
    canonical: "https://careers.lmgmusic.fr/faq",
  },
};

export default function CareersFaqPage() {
  return <CareersFaqContent />;
}
