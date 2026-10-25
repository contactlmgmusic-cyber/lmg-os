import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

type PlatformSnapshot = {
  artisteId: string;
  plateforme: string;
  streams?: number;
  followers?: number;
  vues?: number;
};

function normalizeMetric(value: number | undefined) {
  if (value === undefined) return undefined;
  return Math.max(0, Math.round(Number(value) || 0));
}

export async function savePlatformMetricsSnapshot(
  supabase: SupabaseClient,
  snapshot: PlatformSnapshot
) {
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const metrics = {
    streams: normalizeMetric(snapshot.streams),
    followers: normalizeMetric(snapshot.followers),
    vues: normalizeMetric(snapshot.vues),
  };
  const definedMetrics = Object.fromEntries(
    Object.entries(metrics).filter(([, value]) => value !== undefined)
  );

  const { data: existing, error: lookupError } = await supabase
    .from("analytics")
    .select("id")
    .eq("artiste_id", snapshot.artisteId)
    .eq("plateforme", snapshot.plateforme)
    .eq("date_snapshot", snapshotDate)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Impossible de lire le snapshot ${snapshot.plateforme} : ${lookupError.message}`);
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("analytics")
      .update(definedMetrics)
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`Impossible d’actualiser les métriques ${snapshot.plateforme} : ${updateError.message}`);
    }

    return;
  }

  const { error: insertError } = await supabase.from("analytics").insert({
    artiste_id: snapshot.artisteId,
    plateforme: snapshot.plateforme,
    date_snapshot: snapshotDate,
    ...definedMetrics,
  });

  if (insertError) {
    throw new Error(`Impossible d’enregistrer les métriques ${snapshot.plateforme} : ${insertError.message}`);
  }
}
