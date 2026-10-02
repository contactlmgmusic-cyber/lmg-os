import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import WhatWeDoContent from "@/components/site/WhatWeDoContent";

export const metadata: Metadata = {
  title: "What We Do | LMG Music",
  description:
    "Discover how LMG Music develops artists and music projects through artistic direction, releases, project strategy, live opportunities and long-term development.",
  alternates: {
    canonical: "https://www.lmgmusic.fr/about/what-we-do",
  },
};

export default function WhatWeDoPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <WhatWeDoContent />
      <Footer />
    </main>
  );
}
