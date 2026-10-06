import type { Metadata } from "next";

import ArtistPortalHome from "@/components/artist-portal/ArtistPortalHome";

export const metadata: Metadata = {
  title: { absolute: "LMG For Artist | L’application des artistes LMG Music" },
  description:
    "L’application des artistes accompagnés par LMG Music : calendrier, documents, validations, royalties et contrats depuis votre téléphone.",
  alternates: {
    canonical: "https://artistportal.lmgmusic.fr",
  },
};

export default function ArtistPortalPage() {
  return <ArtistPortalHome />;
}
