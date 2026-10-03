import type { Metadata } from "next";

import ContactContent from "@/components/site/ContactContent";

export const metadata: Metadata = {
  title: "Contact | LMG Music",
  description:
    "Contact LMG Music for artist projects, partnerships, press enquiries and general requests.",
  alternates: {
    canonical: "https://www.lmgmusic.fr/contact",
  },
  openGraph: {
    title: "Contact | LMG Music",
    description:
      "Artist projects, partnerships, press and general enquiries.",
    url: "https://www.lmgmusic.fr/contact",
    siteName: "LMG Music",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      
      <ContactContent />
      
    </main>
  );
}
