import type { Metadata } from "next";
import { headers } from "next/headers";
import CookieConsent from "@/components/site/CookieConsent";
import Footer from "@/components/site/Footer";
import { SiteLanguageProvider } from "@/components/site/LanguageProvider";
import Navbar from "@/components/site/Navbar";

export async function generateMetadata(): Promise<Metadata> {
  const raw = (await headers()).get("x-lmg-public-path") || "/";
  const path = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  return { metadataBase: new URL("https://www.lmgmusic.fr"), alternates: { canonical: `https://www.lmgmusic.fr${path}` } };
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteLanguageProvider>
      <Navbar />

      {children}

      <Footer />
      <CookieConsent />
    </SiteLanguageProvider>
  );
}
