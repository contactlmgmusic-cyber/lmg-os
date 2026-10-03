import type { Metadata } from "next";

import LiveEntertainmentContent from "@/components/site/LiveEntertainmentContent";

export const metadata: Metadata = {
  title: "Live & Entertainment | LMG Music",
  description:
    "Discover LMG Music's approach to live performance, events, showcases and experiences connecting artists with audiences.",
  alternates: {
    canonical: "https://www.lmgmusic.fr/about/live",
  },
};

export default function LivePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      
      <LiveEntertainmentContent />
      
    </main>
  );
}
