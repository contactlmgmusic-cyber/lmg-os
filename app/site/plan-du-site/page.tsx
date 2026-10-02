import type { Metadata } from "next";

import SiteMapContent from "@/components/site/SiteMapContent";

export const metadata: Metadata = {
  title: "Plan du site | LMG Music",
  description:
    "Retrouvez les principales pages et ressources du site LMG Music.",
  alternates: {
    canonical: "/plan-du-site",
  },
};

export default function SiteMapPage() {
  return <SiteMapContent />;
}
