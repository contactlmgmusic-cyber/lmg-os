import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifySignedGoogleOAuthState,
} from "@/lib/google-calendar.server";
import {
  createGoogleDriveOAuthClient,
} from "@/lib/google-drive.server";
import { google } from "googleapis";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase indisponible.");
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

function redirectToManager(
  request: NextRequest,
  status: string
) {
  const url = new URL(
    "/drive/manager",
    request.nextUrl.origin
  );

  url.searchParams.set("googleDrive", status);

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code =
    request.nextUrl.searchParams.get("code");

  const state =
    request.nextUrl.searchParams.get("state");

  const oauthError =
    request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return redirectToManager(
      request,
      "access-denied"
    );
  }

  if (!code || !state) {
    return redirectToManager(
      request,
      "invalid-callback"
    );
  }

  const statePayload =
    verifySignedGoogleOAuthState(state);

  if (!statePayload) {
    return redirectToManager(
      request,
      "invalid-state"
    );
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", statePayload.userId)
        .single();

    if (
      profileError ||
      !profile ||
      (
        profile.role !== ROLES.SUPER_ADMIN &&
        profile.role !== ROLES.ADMIN
      )
    ) {
      return redirectToManager(
        request,
        "forbidden"
      );
    }

    const redirectUri =
      `${request.nextUrl.origin}/api/google-drive/callback`;

    const oauth2Client =
      createGoogleDriveOAuthClient(redirectUri);

    const { tokens } =
      await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    const { data: existingConnection } =
      await supabaseAdmin
        .from("google_drive_connections")
        .select("refresh_token, root_folder_id")
        .eq("id", "lmg-central")
        .maybeSingle();

    const refreshToken =
      tokens.refresh_token ||
      existingConnection?.refresh_token ||
      null;

    if (!tokens.access_token || !refreshToken) {
      return redirectToManager(
        request,
        "missing-token"
      );
    }

    let rootFolderId =
      existingConnection?.root_folder_id || null;

    if (!rootFolderId) {
      const { data: folder } =
        await drive.files.create({
          requestBody: {
            name: "LMG OS",
            mimeType:
              "application/vnd.google-apps.folder",
          },
          fields: "id",
        });

      rootFolderId = folder.id || null;
    }

    if (!rootFolderId) {
      return redirectToManager(
        request,
        "folder-error"
      );
    }

    let googleEmail: string | null = null;

    try {
      const { data: about } =
        await drive.about.get({
          fields: "user(emailAddress)",
        });

      googleEmail =
        about.user?.emailAddress || null;
    } catch (error) {
      console.error(
        "Adresse Google Drive indisponible :",
        error
      );
    }

    const tokenExpiry =
      tokens.expiry_date
        ? new Date(
            tokens.expiry_date
          ).toISOString()
        : null;

    const { error: saveError } =
      await supabaseAdmin
        .from("google_drive_connections")
        .upsert(
          {
            id: "lmg-central",
            connected_by:
              statePayload.userId,
            google_email: googleEmail,
            access_token:
              tokens.access_token,
            refresh_token: refreshToken,
            token_expiry: tokenExpiry,
            root_folder_id: rootFolderId,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

    if (saveError) {
      console.error(
        "Erreur sauvegarde Google Drive :",
        saveError
      );

      return redirectToManager(
        request,
        "save-error"
      );
    }

    return redirectToManager(
      request,
      "connected"
    );
  } catch (error) {
    console.error(
      "Erreur callback Google Drive :",
      error
    );

    return redirectToManager(
      request,
      "connection-error"
    );
  }
}