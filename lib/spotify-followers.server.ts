import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function saveSpotifyFollowersSnapshot(
  supabase: SupabaseClient,
  artisteId: string,
  followers: number
) {
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const normalizedFollowers = Math.max(0, Math.round(Number(followers) || 0));

  const { data: existing, error: lookupError } = await supabase
    .from("analytics")
    .select("id")
    .eq("artiste_id", artisteId)
    .eq("plateforme", "Spotify")
    .eq("date_snapshot", snapshotDate)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Impossible de lire le snapshot Spotify : ${lookupError.message}`);
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("analytics")
      .update({ followers: normalizedFollowers })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`Impossible d’actualiser les followers Spotify : ${updateError.message}`);
    }

    return;
  }

  const { error: insertError } = await supabase.from("analytics").insert({
    artiste_id: artisteId,
    plateforme: "Spotify",
    followers: normalizedFollowers,
    date_snapshot: snapshotDate,
  });

  if (insertError) {
    throw new Error(`Impossible d’enregistrer les followers Spotify : ${insertError.message}`);
  }
}
