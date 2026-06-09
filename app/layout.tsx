import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
    "Lille",
  ],
  openGraph: {
    title: "Legacy Music Group",
    description:
      "Management, marketing, booking et développement artistique pour les talents de demain.",
    url: "https://legacymusicgroup.fr",
    siteName: "Legacy Music Group",
    images: [
      {
        url: "/logo-lmg.png",
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
    images: ["/logo-lmg.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}