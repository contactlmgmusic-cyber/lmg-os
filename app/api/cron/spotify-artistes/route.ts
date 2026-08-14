import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getSpotifyArtist,
  getSpotifyArtistReleases,
} from "@/lib/spotify.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration Supabase indisponible."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function isCronAuthorized(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  return (
    request.headers.get(
      "authorization"
    ) === `Bearer ${cronSecret}`
  );
}

export async function GET(
  request: NextRequest
) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          "Accès au cron Spotify refusé.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const supabaseAdmin =
      createSupabaseAdmin();

    const {
      data: artistes,
      error: artistesError,
    } = await supabaseAdmin
      .from("artistes")
      .select(
        "id, nom, spotify_artist_id"
      )
      .not(
        "spotify_artist_id",
        "is",
        null
      )
      .limit(50);

    if (artistesError) {
      throw new Error(
        `Erreur chargement artistes : ${artistesError.message}`
      );
    }

    let synchronized = 0;
    let failed = 0;

    const results: Array<{
      artisteId: string;
      artiste: string;
      status: "success" | "failed";
      releasesImported?: number;
      error?: string;
    }> = [];

    for (const artiste of artistes || []) {
      try {
        const spotifyArtist =
          await getSpotifyArtist(
            artiste.spotify_artist_id
          );

        const releases =
          await getSpotifyArtistReleases(
            artiste.spotify_artist_id
          );

        const synchronizedAt =
          new Date().toISOString();

        const {
          error: artistUpdateError,
        } = await supabaseAdmin
          .from("artistes")
          .update({
            spotify_url:
              spotifyArtist
                .external_urls
                ?.spotify || null,

            spotify_image_url:
              spotifyArtist.images?.[0]
                ?.url || null,

            spotify_last_synced_at:
              synchronizedAt,
          })
          .eq("id", artiste.id);

        if (artistUpdateError) {
          throw new Error(
            `Impossible de mettre à jour l’artiste : ${artistUpdateError.message}`
          );
        }

        const releaseRows =
          releases.map(
            (release: any) => ({
              artiste_id:
                artiste.id,

              spotify_release_id:
                release.id,

              spotify_url:
                release.external_urls
                  ?.spotify || null,

              titre:
                release.name,

              release_type:
                release.album_type ||
                null,

              release_date:
                release.release_date ||
                null,

              release_date_precision:
                release
                  .release_date_precision ||
                null,

              cover_url:
                release.images?.[0]
                  ?.url || null,

              total_tracks:
                Number(
                  release.total_tracks ||
                    0
                ),

              updated_at:
                synchronizedAt,
            })
          );

        if (releaseRows.length > 0) {
          const {
            error: releasesError,
          } = await supabaseAdmin
            .from(
              "spotify_releases"
            )
            .upsert(releaseRows, {
              onConflict:
                "artiste_id,spotify_release_id",
            });

          if (releasesError) {
            throw new Error(
              `Impossible d’enregistrer les sorties : ${releasesError.message}`
            );
          }
        }

        synchronized += 1;

        results.push({
          artisteId: artiste.id,
          artiste:
            artiste.nom || "Artiste",
          status: "success",
          releasesImported:
            releaseRows.length,
        });
      } catch (artistError) {
        failed += 1;

        const errorMessage =
          artistError instanceof Error
            ? artistError.message
            : "Erreur Spotify inconnue.";

        console.error(
          "Erreur synchronisation Spotify :",
          artiste.id,
          errorMessage
        );

        results.push({
          artisteId: artiste.id,
          artiste:
            artiste.nom || "Artiste",
          status: "failed",
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed:
        artistes?.length || 0,
      synchronized,
      failed,
      results,
    });
  } catch (error) {
    console.error(
      "Erreur cron Spotify :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "La synchronisation Spotify automatique a échoué.",
      },
      {
        status: 500,
      }
    );
  }
}