import type { Metadata } from "next";
import "./agency.css";
import "./agency-home.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agency.legacymusicgroup.fr"),
  title: {
    absolute: "LMG Agency — Brands that move",
  },
  description:
    "LMG Agency transforme les visions en marques visibles, crédibles et mémorables — de la stratégie au lancement.",
  openGraph: {
    title: "LMG Agency — Brands that move",
    description:
      "Stratégie, identité, contenu et digital pour des marques qui avancent.",
    url: "https://agency.legacymusicgroup.fr",
    siteName: "LMG Agency",
    locale: "fr_FR",
    type: "website",
  },
};

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="agency-site">{children}</div>;
}
