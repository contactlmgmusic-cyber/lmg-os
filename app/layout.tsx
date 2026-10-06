import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { publicDomain } from "@/lib/public-domains.server";

const defaultMetadata: Metadata = {
  metadataBase: new URL("https://www.lmgmusic.fr"),
  title: {
    default: "Legacy Music Group | Artist Management, Marketing & Booking",
    template: "%s | Legacy Music Group",
  },
  description:
    "Legacy Music Group accompagne les artistes dans leur développement, leur image, leur marketing et leur stratégie musicale.",
  keywords: [
    "Legacy Music Group",
    "LMG",
    "management artiste",
    "label musique",
    "marketing musical",
    "booking artiste",
    "développement artistique",
    "Paris",
  ],

  verification: {
  google: "SNckPjUVJwb5yHuLC0C45-DKhiUOUKrkQQfiYU1MWHU",
},

  openGraph: {
    title: "Legacy Music Group",
    description:
      "Management, marketing, booking et développement artistique pour les talents de demain.",
    url: "https://www.lmgmusic.fr",
    siteName: "Legacy Music Group",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Legacy Music Group",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legacy Music Group",
    description:
      "Management, marketing, booking et développement artistique pour les talents de demain.",
    images: ["/og-image.jpg"],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const domain = await publicDomain();
  return { ...defaultMetadata, ...(domain.kind === "music" ? { title: { default: "LMG Music | Artistes, musique et développement artistique", template: "%s" }, openGraph: { ...defaultMetadata.openGraph, title: "LMG Music", siteName: "LMG Music" }, twitter: { ...defaultMetadata.twitter, title: "LMG Music" } } : {}), ...(domain.kind === "os" || domain.kind === "preview" ? { robots: { index: false, follow: false } } : {}) };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = (await headers()).get("x-lmg-language") === "en" ? "en" : "fr";
  return (
    <html lang={language}>
      <body>
  {children}
</body>
    </html>
  );
}