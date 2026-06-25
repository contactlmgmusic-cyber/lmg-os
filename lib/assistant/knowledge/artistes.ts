import { supabase } from "@/lib/supabase";

export async function findArtistByName(name: string) {
  const { data } = await supabase
    .from("artistes")
    .select("*")
    .ilike("nom", `%${name}%`)
    .limit(1)
    .single();

  return data;
}