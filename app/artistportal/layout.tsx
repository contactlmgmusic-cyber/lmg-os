import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://artistportal.lmgmusic.fr"),
  title: {
    default: "LMG For Artist",
    template: "%s | LMG For Artist",
  },
  description:
    "LMG For Artist brings your schedule, documents, validations, royalties, events and contracts together in one secure space.",
  alternates: {
    canonical: "https://artistportal.lmgmusic.fr",
  },
  openGraph: {
    title: "LMG For Artist",
    description:
      "Your career. Your team. One place.",
    url: "https://artistportal.lmgmusic.fr",
    siteName: "LMG For Artist",
    type: "website",
  },
};

export default function ArtistPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
