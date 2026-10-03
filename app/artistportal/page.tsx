import type { Metadata } from "next";

import ArtistPortalHome from "@/components/artist-portal/ArtistPortalHome";

export const metadata: Metadata = {
  title: "LMG For Artist",
  description:
    "The private mobile experience designed for artists supported by LMG Music.",
  alternates: {
    canonical: "https://artistportal.lmgmusic.fr",
  },
};

export default function ArtistPortalPage() {
  return <ArtistPortalHome />;
}
