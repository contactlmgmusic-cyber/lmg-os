import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import MusicNewsContent from "@/components/site/MusicNewsContent";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News | LMG Music",
  description:
    "Latest news, releases, projects and milestones from LMG Music.",
  alternates: {
    canonical: "https://www.lmgmusic.fr/news",
  },
};

export default async function NewsPage() {
  const { data } = await supabase
    .from("site_news")
    .select(`
      id,
      slug,
      title_fr,
      title_en,
      excerpt_fr,
      excerpt_en,
      category_fr,
      category_en,
      image_url,
      featured,
      published_at
    `)
    .eq("status", "published")
    .not("slug", "is", null)
    .order("featured", { ascending: false })
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <MusicNewsContent articles={data || []} />
      <Footer />
    </main>
  );
}
