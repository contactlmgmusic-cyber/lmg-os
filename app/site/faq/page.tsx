import type { Metadata } from "next";

import MusicFaqContent from "@/components/site/MusicFaqContent";

export const metadata: Metadata = {
  title: "FAQ | LMG Music",
  description:
    "Answers to frequently asked questions about LMG Music, artist projects, collaborations, live and careers.",
  alternates: {
    canonical: "/faq",
  },
};

export default function MusicFaqPage() {
  return <MusicFaqContent />;
}
