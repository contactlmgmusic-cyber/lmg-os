import type { Metadata } from "next";

import MusicPressContent from "@/components/site/MusicPressContent";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Press & Releases | LMG Music",
  description:
    "Official news, announcements and media resources from LMG Music.",
  alternates: {
    canonical: "/press",
  },
};

export default async function PressPage() {
  const { data } = await supabase
    .from("site_news")
    .select(
      "id, slug, title_fr, title_en, excerpt_fr, excerpt_en, published_at"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(6);

  return <MusicPressContent articles={data || []} />;
}
