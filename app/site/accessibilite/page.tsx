import type { Metadata } from "next";

import AccessibilityContent from "@/components/site/AccessibilityContent";

export const metadata: Metadata = {
  title: "Accessibilité | LMG Music",
  description:
    "Informations relatives à l’accessibilité du site LMG Music.",
  alternates: {
    canonical: "/accessibilite",
  },
};

export default function AccessibilityPage() {
  return <AccessibilityContent />;
}
