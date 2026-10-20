import type { Metadata } from "next";

import CareersLanguageProvider from "@/components/careers/CareersLanguageProvider";
import { readCareersLocale } from "@/lib/careers-locale.server";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await readCareersLocale()) === "fr";
  const description = fr
    ? "Découvrez les opportunités professionnelles de LMG dans la musique, la création, le business et la technologie."
    : "Explore careers and opportunities across music, creative, business and technology at LMG.";
  const socialDescription = fr ? "Construisez la suite avec LMG." : "Build what's next with LMG.";
  return {
    metadataBase: new URL("https://careers.lmgmusic.fr"),
    title: { absolute: "LMG Careers", template: "%s" },
    description,
    openGraph: {
      type: "website", siteName: "LMG Careers", title: "LMG Careers",
      description: socialDescription, url: "https://careers.lmgmusic.fr",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "LMG Careers" }],
    },
    twitter: {
      card: "summary_large_image", title: "LMG Careers",
      description: socialDescription, images: ["/og-image.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function CareersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await readCareersLocale();
  return <CareersLanguageProvider initialLocale={locale}>{children}</CareersLanguageProvider>;
}
