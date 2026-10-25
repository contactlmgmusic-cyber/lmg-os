import type { Metadata } from "next";
import { headers } from "next/headers";
import CookieConsent from "@/components/site/CookieConsent";
import Footer from "@/components/site/Footer";
import { SiteLanguageProvider } from "@/components/site/LanguageProvider";
import Navbar from "@/components/site/Navbar";

export async function generateMetadata(): Promise<Metadata> {
  const raw = (await headers()).get("x-lmg-public-path") || "/";
  const path = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  const pages: Record<string, [string, string]> = {
    "/": ["LMG Music | Artistes, musique et développement artistique", "LMG Music accompagne ses artistes en management, développement artistique, marketing et booking. Découvrez les artistes, sorties et actualités."],
    "/about": ["À propos | LMG Music", "Découvrez la vision de LMG Music et notre manière de construire des trajectoires artistiques durables."],
    "/about/what-we-do": ["Notre approche | LMG Music", "Management, stratégie, image, marketing et développement artistique : découvrez l'approche de LMG Music."],
    "/about/live": ["LMG Live | Concerts, booking et événements", "Découvrez les activités live de LMG Music : booking, concerts, événements et accompagnement scénique."],
    "/artistes": ["Artistes | LMG Music", "Découvrez les artistes accompagnés par LMG Music, leurs univers, leurs actualités et leurs projets."],
    "/releases": ["Sorties musicales | LMG Music", "Retrouvez les dernières sorties, projets et nouveautés des artistes accompagnés par LMG Music."],
    "/services": ["Services | LMG Music", "Découvrez les services de LMG Music en management, développement artistique, marketing, image et booking."],
    "/team": ["Équipe | LMG Music", "Découvrez l'équipe de LMG Music et les expertises réunies au service des artistes et de leurs projets."],
    "/press": ["Presse | LMG Music", "Accédez aux actualités presse, informations officielles et ressources médias de LMG Music."],
    "/contact": ["Contact | LMG Music", "Contactez LMG Music pour une demande professionnelle, média, partenariat ou information."],
    "/accessibilite": ["Accessibilité | LMG Music", "Consultez la déclaration et les engagements d'accessibilité du site LMG Music."],
    "/mentions-legales": ["Mentions légales | LMG Music", "Éditeur, domiciliation confirmée à Paris et informations légales de LMG Music."],
    "/confidentialite": ["Confidentialité | LMG Music", "Traitement des candidatures, données personnelles, cookies et droits sur le site LMG Music."],
    "/cookies": ["Politique de cookies | LMG Music", "Choisissez et gérez les cookies de mesure d’audience sur LMG Music."],
    "/rejoindre": ["Présenter un projet | LMG Music", "Présentez votre projet artistique et candidatez auprès de LMG Music."],
    "/news": ["Actualités | LMG Music", "Retrouvez les dernières actualités des artistes et projets de LMG Music."],
  };
  const page = pages[path];
  return { title: { default: page?.[0] || "LMG Music | Artistes, musique et développement artistique", template: "%s" }, description: page?.[1], metadataBase: new URL("https://www.lmgmusic.fr"), alternates: { canonical: `https://www.lmgmusic.fr${path}` }, openGraph: { title: page?.[0] || "LMG Music", description: page?.[1], url: `https://www.lmgmusic.fr${path}`, siteName: "LMG Music", locale: "fr_FR", type: "website" } };
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteLanguageProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@graph": [
          { "@type": "WebSite", "@id": "https://www.lmgmusic.fr/#website", name: "LMG Music", url: "https://www.lmgmusic.fr/", publisher: { "@id": "https://www.lmgmusic.fr/#organization" } },
          { "@type": "Organization", "@id": "https://www.lmgmusic.fr/#organization", name: "LMG Music", url: "https://www.lmgmusic.fr/", parentOrganization: { "@type": "Organization", name: "Legacy Music Group", url: "https://www.legacymusicgroup.fr/" }, address: { "@type": "PostalAddress", streetAddress: "138 Avenue Victor Hugo", postalCode: "75016", addressLocality: "Paris", addressCountry: "FR" } },
        ],
      }) }} />
      <Navbar />

      {children}

      <Footer />
      <CookieConsent />
    </SiteLanguageProvider>
  );
}
