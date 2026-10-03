import CookieConsent from "@/components/site/CookieConsent";
import Footer from "@/components/site/Footer";
import { SiteLanguageProvider } from "@/components/site/LanguageProvider";
import Navbar from "@/components/site/Navbar";

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
