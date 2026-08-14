import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  createClient,
} from "@supabase/supabase-js";
import {
  getYouTubeChannelVideos,
  resolveYouTubeChannel,
} from "@/lib/youtube.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type YouTubeArtist = {
  id: string;
  nom: string | null;
  youtube_channel_id: string;
};

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
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
          "Accès au cron refusé.",
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
      data: artistsData,
      error: artistsError,
    } = await supabaseAdmin
      .from("artistes")
      .select(
        `
          id,
          nom,
          youtube_channel_id
        `
      )
      .not(
        "youtube_channel_id",
        "is",
        null
      )
      .order("nom", {
        ascending: true,
      });

    if (artistsError) {
      throw new Error(
        `Impossible de charger les artistes YouTube : ${artistsError.message}`
      );
    }

    const artists =
      (artistsData ||
        []) as YouTubeArtist[];

    let synchronized = 0;
    let failed = 0;
    let importedVideos = 0;

    const results: Array<{
      artisteId: string;
      artiste: string;
      status:
        | "synchronized"
        | "failed";
      videos?: number;
      error?: string;
    }> = [];

    for (const artiste of artists) {
      try {
        const channel =
          await resolveYouTubeChannel(
            artiste.youtube_channel_id
          );

        const videos =
          await getYouTubeChannelVideos(
            channel,
            50
          );

        const syncedAt =
          new Date().toISOString();

        const {
          error: updateArtistError,
        } = await supabaseAdmin
          .from("artistes")
          .update({
            youtube_channel_id:
              channel.id,
            youtube_url:
              channel.youtubeUrl,
            youtube_title:
              channel.title,
            youtube_image_url:
              channel.imageUrl,
            youtube_subscribers:
              channel.subscriberCount,
            youtube_views:
              channel.viewCount,
            youtube_video_count:
              channel.videoCount,
            youtube_last_synced_at:
              syncedAt,
          })
          .eq("id", artiste.id);

        if (updateArtistError) {
          throw new Error(
            updateArtistError.message
          );
        }

        if (videos.length > 0) {
          const rows =
            videos.map(
              (video) => ({
                artiste_id:
                  artiste.id,
                youtube_video_id:
                  video.id,
                titre:
                  video.title,
                description:
                  video.description,
                published_at:
                  video.publishedAt,
                thumbnail_url:
                  video.thumbnailUrl,
                youtube_url:
                  video.youtubeUrl,
                view_count:
                  video.viewCount,
                like_count:
                  video.likeCount,
                comment_count:
                  video.commentCount,
                duration:
                  video.duration,
                updated_at:
                  syncedAt,
              })
            );

          const {
            error: videosError,
          } = await supabaseAdmin
            .from("youtube_videos")
            .upsert(rows, {
              onConflict:
                "artiste_id,youtube_video_id",
            });

          if (videosError) {
            throw new Error(
              videosError.message
            );
          }
        }

        synchronized += 1;
        importedVideos +=
          videos.length;

        results.push({
          artisteId:
            artiste.id,
          artiste:
            artiste.nom ||
            "Artiste",
          status:
            "synchronized",
          videos:
            videos.length,
        });
      } catch (syncError) {
        failed += 1;

        const errorMessage =
          syncError instanceof Error
            ? syncError.message
            : "Erreur inconnue";

        console.error(
          "Erreur synchronisation YouTube :",
          artiste.id,
          errorMessage
        );

        results.push({
          artisteId:
            artiste.id,
          artiste:
            artiste.nom ||
            "Artiste",
          status: "failed",
          error:
            errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed:
        artists.length,
      synchronized,
      failed,
      importedVideos,
      results,
    });
  } catch (error) {
    console.error(
      "Erreur cron YouTube :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "La synchronisation automatique YouTube a échoué.",
      },
      {
        status: 500,
      }
    );
  }
}