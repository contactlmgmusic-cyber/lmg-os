import { supabase } from "@/lib/supabase";

export async function findNextRelease(artisteId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("sorties")
    .select("*")
    .eq("artiste_id", artisteId)
    .gte("date_sortie", today)
    .order("date_sortie")
    .limit(1)
    .single();

  return data;
}