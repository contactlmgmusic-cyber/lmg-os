import type { Metadata } from "next";

import AboutMusicContent from "@/components/site/AboutMusicContent";

export const metadata: Metadata = {
  title: "About LMG Music | LMG Music",
  description:
    "Discover LMG Music, the music division of LMG Group dedicated to artists, music development and long-term creative projects.",
  alternates: {
    canonical: "https://www.lmgmusic.fr/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      
      <AboutMusicContent />
      
    </main>
  );
}
