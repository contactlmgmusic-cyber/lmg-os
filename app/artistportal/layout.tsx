import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://artistportal.lmgmusic.fr"),
  title: {
    default: "LMG For Artist",
    template: "%s | LMG For Artist",
  },
  description:
    "L’application des artistes accompagnés par LMG Music : calendrier, documents, validations, royalties et contrats depuis votre téléphone.",
  alternates: {
    canonical: "https://artistportal.lmgmusic.fr",
  },
  openGraph: {
    title: "LMG For Artist",
    description:
      "Ton projet. Ton équipe. Un seul espace, depuis l’application LMG For Artist.",
    url: "https://artistportal.lmgmusic.fr",
    siteName: "LMG For Artist",
    type: "website",
    locale: "fr_FR",
    images: [{ url: "https://www.lmgmusic.fr/og-image.jpg", width: 1200, height: 630, alt: "LMG Music" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LMG For Artist",
    description: "L’application des artistes accompagnés par LMG Music. Ton projet. Ton équipe. Un seul espace.",
    images: ["https://www.lmgmusic.fr/og-image.jpg"],
  },
};

export default function ArtistPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
