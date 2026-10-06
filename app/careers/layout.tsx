import type { Metadata } from "next";

import CareersLanguageProvider from "@/components/careers/CareersLanguageProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://careers.lmgmusic.fr"
  ),

  title: {
    absolute: "Careers | LMG",
    template: "%s",
  },

  description:
    "Explore careers and opportunities across music, creative, business and technology at LMG.",

  openGraph: {
    type: "website",
    siteName: "LMG Careers",
    title: "Careers | LMG",
    description: "Build what's next with LMG.",
    url: "https://careers.lmgmusic.fr",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function CareersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CareersLanguageProvider>
      {children}
    </CareersLanguageProvider>
  );
}
