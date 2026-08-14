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
  extractSpotifyArtistId,
  getSpotifyArtist,
  getSpotifyArtistReleases,
} from "@/lib/spotify.server";
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
    const { id: artisteId } =
      await params;

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

    const {
      data: artiste,
      error: artisteError,
    } = await supabaseAdmin
      .from("artistes")
      .select(
        "id, nom, manager_id, spotify_artist_id"
      )
      .eq("id", artisteId)
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

    const privilegedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.ARTISTIC_DIRECTOR,
    ];

    const isPrivileged =
      privilegedRoles.includes(
        profile.role
      );

    const isAssignedManager =
      profile.role ===
        ROLES.MANAGER &&
      artiste.manager_id === user.id;

    if (
      !isPrivileged &&
      !isAssignedManager
    ) {
      return NextResponse.json(
        {
          error:
            "Tu n’as pas accès à cet artiste.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request
        .json()
        .catch(() => ({}));

    const spotifyValue =
      String(
        body.spotifyValue ||
          artiste.spotify_artist_id ||
          ""
      ).trim();

    const spotifyArtistId =
      extractSpotifyArtistId(
        spotifyValue
      );

    if (!spotifyArtistId) {
      return NextResponse.json(
        {
          error:
            "Lien ou identifiant Spotify invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const [
      spotifyArtist,
      spotifyReleases,
    ] = await Promise.all([
      getSpotifyArtist(
        spotifyArtistId
      ),
      getSpotifyArtistReleases(
        spotifyArtistId
      ),
    ]);

    const synchronizedAt =
      new Date().toISOString();

    const spotifyImageUrl =
      spotifyArtist.images?.[0]
        ?.url || null;

    const {
      error: updateArtistError,
    } = await supabaseAdmin
      .from("artistes")
      .update({
        spotify_artist_id:
          spotifyArtist.id,
        spotify_url:
          spotifyArtist
            .external_urls
            ?.spotify || null,
        spotify_image_url:
          spotifyImageUrl,
        spotify_last_synced_at:
          synchronizedAt,
      })
      .eq("id", artiste.id);

    if (updateArtistError) {
      throw new Error(
        `Impossible de mettre à jour l’artiste : ${updateArtistError.message}`
      );
    }

    const releaseRows =
      spotifyReleases.map(
        (release) => ({
          artiste_id:
            artiste.id,

          spotify_release_id:
            release.id,

          spotify_url:
            release
              .external_urls
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

    if (
      releaseRows.length > 0
    ) {
      const {
        error: releasesError,
      } = await supabaseAdmin
        .from(
          "spotify_releases"
        )
        .upsert(
          releaseRows,
          {
            onConflict:
              "artiste_id,spotify_release_id",
          }
        );

      if (releasesError) {
        throw new Error(
          `Impossible d’enregistrer les sorties Spotify : ${releasesError.message}`
        );
      }
    }

    return NextResponse.json({
      success: true,

      artist: {
        id:
          spotifyArtist.id,
        name:
          spotifyArtist.name,
        url:
          spotifyArtist
            .external_urls
            ?.spotify || null,
        imageUrl:
          spotifyImageUrl,
      },

      releasesImported:
        releaseRows.length,

      synchronizedAt,
    });
  } catch (error) {
    console.error(
      "Erreur synchronisation Spotify :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "La synchronisation Spotify a échoué.",
      },
      {
        status: 500,
      }
    );
  }
}