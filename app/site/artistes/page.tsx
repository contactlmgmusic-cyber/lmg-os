import type { Metadata } from "next";

import ArtistsContent from "@/components/site/ArtistsContent";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Artists | LMG Music",
  description:
    "Discover the artists and creative projects developed alongside LMG Music.",
  alternates: {
    canonical: "/artistes",
  },
};

export default async function ArtistsPage() {
  const { data: artists } = await supabase
    .from("public_artistes")
    .select(`
      id,
      nom,
      slug,
      style,
      ville,
      photo_url,
      spotify_image_url,
      youtube_image_url
    `)
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("created_at", { ascending: false });

  return <ArtistsContent artists={artists || []} />;
}
