import type { Metadata } from "next";

import ArtistPortalContent from "@/components/site/ArtistPortalContent";

export const metadata: Metadata = {
  title: "Artist Portal | LMG Music",
  description:
    "Secure workspace for LMG Music artists to access projects, schedules, documents and key information.",
  alternates: {
    canonical: "/artist-portal",
  },
};

export default function ArtistPortalPage() {
  return <ArtistPortalContent />;
}
