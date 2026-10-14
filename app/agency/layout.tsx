import type { Metadata } from "next";
import "./agency.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agency.legacymusicgroup.fr"),
  title: {
  absolute: "LMG Agency | Agence créative & digitale",
},
  description:
    "Identité, communication, contenu, digital et marketing pour les marques, les entreprises, les entrepreneurs et les talents.",
  openGraph: {
    title: "LMG Agency | Agence créative & digitale",
    description:
      "Votre vision mérite d’être remarquée. Découvrez LMG Agency.",
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