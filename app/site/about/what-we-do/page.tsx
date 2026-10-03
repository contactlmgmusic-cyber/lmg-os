import type { Metadata } from "next";

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
      
      <WhatWeDoContent />
      
    </main>
  );
}
