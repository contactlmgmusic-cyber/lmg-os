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
      "id, slug, title_fr, title_en, excerpt_fr, excerpt_en, published_at, category_fr, category_en"
    )
    .eq("status", "published")
    .neq("slug", "test")
    .order("published_at", { ascending: false })
    .limit(100);

  return <MusicPressContent articles={(data || []).filter(article => [article.category_fr, article.category_en].some(category => category && /^(presse|press|communiqué(?: de presse)?|press release)$/i.test(category.trim())))} />;
}
