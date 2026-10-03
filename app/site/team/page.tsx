import type { Metadata } from "next";

import TeamContent from "@/components/site/TeamContent";

export const metadata: Metadata = {
  title: "Team | LMG Music",
  description:
    "Discover the team behind LMG Music and the complementary expertise driving its artistic, strategic and creative development.",
  alternates: {
    canonical: "https://www.lmgmusic.fr/team",
  },
  openGraph: {
    title: "Team | LMG Music",
    description:
      "Meet the team behind LMG Music and discover how strategy, communication and artistic direction work together.",
    url: "https://www.lmgmusic.fr/team",
    siteName: "LMG Music",
    type: "website",
  },
};

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      
      <TeamContent />
      
    </main>
  );
}
