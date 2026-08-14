import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  createServerClient,
} from "@supabase/ssr";
import {
  createClient,
} from "@supabase/supabase-js";
import {
  getYouTubeChannelVideos,
  resolveYouTubeChannel,
} from "@/lib/youtube.server";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    if (!validUuid(id)) {
      return NextResponse.json(
        {
          error:
            "Identifiant artiste invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseAuth =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        }
      );

    const {
      data: { user },
    } =
      await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentification requise.",
        },
        {
          status: 401,
        }
      );
    }

    const supabaseAdmin =
      createSupabaseAdmin();

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile
    ) {
      return NextResponse.json(
        {
          error:
            "Profil utilisateur introuvable.",
        },
        {
          status: 403,
        }
      );
    }

    const allowedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.ARTISTIC_DIRECTOR,
    ];

    if (
      !allowedRoles.includes(
        profile.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Tu n’as pas l’autorisation de synchroniser cette chaîne YouTube.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: artiste,
      error: artisteError,
    } = await supabaseAdmin
      .from("artistes")
      .select(
        `
          id,
          nom,
          manager_id,
          youtube_channel_id,
          youtube_url
        `
      )
      .eq("id", id)
      .single();

    if (
      artisteError ||
      !artiste
    ) {
      return NextResponse.json(
        {
          error:
            "Artiste introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      profile.role ===
        ROLES.MANAGER &&
      artiste.manager_id !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Tu ne peux synchroniser que les artistes dont tu es le manager.",
        },
        {
          status: 403,
        }
      );
    }

    let body: {
      channel?: string;
    } = {};

    try {
      body =
        await request.json();
    } catch {
      body = {};
    }

    const requestedChannel =
      String(
        body.channel ||
          artiste.youtube_channel_id ||
          artiste.youtube_url ||
          ""
      ).trim();

    if (!requestedChannel) {
      return NextResponse.json(
        {
          error:
            "Renseigne l’URL, l’identifiant ou le nom de la chaîne YouTube.",
        },
        {
          status: 400,
        }
      );
    }

    const channel =
      await resolveYouTubeChannel(
        requestedChannel
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
      .eq("id", id);

    if (updateArtistError) {
      throw new Error(
        `Impossible de mettre à jour l’artiste : ${updateArtistError.message}`
      );
    }

    if (videos.length > 0) {
      const rows = videos.map(
        (video) => ({
          artiste_id: id,
          youtube_video_id:
            video.id,
          titre: video.title,
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
          `Impossible d’enregistrer les vidéos : ${videosError.message}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      channel: {
        id: channel.id,
        title: channel.title,
        imageUrl:
          channel.imageUrl,
        youtubeUrl:
          channel.youtubeUrl,
        subscriberCount:
          channel.subscriberCount,
        viewCount:
          channel.viewCount,
        videoCount:
          channel.videoCount,
      },
      importedVideos:
        videos.length,
      syncedAt,
    });
  } catch (error) {
    console.error(
      "Erreur synchronisation YouTube :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "La synchronisation YouTube a échoué.",
      },
      {
        status: 500,
      }
    );
  }
}