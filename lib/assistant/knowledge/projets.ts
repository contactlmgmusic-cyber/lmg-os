import { supabase } from "@/lib/supabase";

export async function findProject(projectId: string) {
  const { data } = await supabase
    .from("projets")
    .select("*")
    .eq("id", projectId)
    .single();

  return data;
}