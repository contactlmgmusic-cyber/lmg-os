import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CsvRow = Record<
  string,
  string | undefined
>;

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

function normalizeHeader(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeRow(
  row: CsvRow
) {
  const normalized: CsvRow = {};

  for (
    const [key, value] of
    Object.entries(row)
  ) {
    normalized[
      normalizeHeader(key)
    ] =
      typeof value === "string"
        ? value.trim()
        : value;
  }

  return normalized;
}

function getFirstValue(
  row: CsvRow,
  keys: string[]
) {
  for (const key of keys) {
    const value = row[key];

    if (
      value !== undefined &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

function parseMetricNumber(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return 0;
  }

  const cleaned = value
    .replace(/\s/g, "")
    .replace(/\u00a0/g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");

  const parsed =
    Number(cleaned);

  if (
    !Number.isFinite(parsed)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(parsed)
  );
}

function parseMetricDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  const cleanValue =
    value.trim();

  const isoMatch =
    cleanValue.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const frenchMatch =
    cleanValue.match(
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
    );

  if (frenchMatch) {
    const day =
      frenchMatch[1].padStart(
        2,
        "0"
      );

    const month =
      frenchMatch[2].padStart(
        2,
        "0"
      );

    return `${frenchMatch[3]}-${month}-${day}`;
  }

  const parsedDate =
    new Date(cleanValue);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate
    .toISOString()
    .slice(0, 10);
}

export async function POST(
  request: NextRequest
) {
  let importId:
    | string
    | null = null;

  const supabaseAdmin =
    createSupabaseAdmin();

  try {
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

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

    const allowedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.ARTISTIC_DIRECTOR,
    ];

    if (
      !profile ||
      !allowedRoles.includes(
        profile.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Tu n’as pas l’autorisation d’importer ces statistiques.",
        },
        {
          status: 403,
        }
      );
    }

    const formData =
      await request.formData();

    const artisteId =
      String(
        formData.get(
          "artisteId"
        ) || ""
      ).trim();

    const file =
      formData.get("file");

    const validUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        artisteId
      );

    if (
      !validUuid ||
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Artiste ou fichier CSV invalide.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.size === 0 ||
      file.size >
        5 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "Le fichier doit peser moins de 5 Mo.",
        },
        {
          status: 400,
        }
      );
    }

    const fileName =
      file.name.toLowerCase();

    if (
      !fileName.endsWith(".csv")
    ) {
      return NextResponse.json(
        {
          error:
            "Seuls les fichiers CSV sont acceptés.",
        },
        {
          status: 400,
        }
      );
    }

    const { data: artiste } =
      await supabaseAdmin
        .from("artistes")
        .select(
          "id, nom, manager_id"
        )
        .eq("id", artisteId)
        .single();

    if (!artiste) {
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
      artiste.manager_id !==
        user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Tu ne peux importer que les statistiques de tes artistes.",
        },
        {
          status: 403,
        }
      );
    }

    const fileContent =
      await file.text();

    const parsedRows =
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_column_count: true,
        trim: true,
      }) as CsvRow[];

    if (
      parsedRows.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Le fichier CSV ne contient aucune donnée.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      parsedRows.length > 50000
    ) {
      return NextResponse.json(
        {
          error:
            "Le fichier contient trop de lignes.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: importRecord,
      error: importError,
    } = await supabaseAdmin
      .from(
        "spotify_analytics_imports"
      )
      .insert({
        artiste_id:
          artisteId,
        uploaded_by:
          user.id,
        file_name:
          file.name,
        status:
          "processing",
      })
      .select("id")
      .single();

    if (
      importError ||
      !importRecord
    ) {
      throw new Error(
        `Impossible de créer l’import : ${
          importError?.message ||
          "erreur inconnue"
        }`
      );
    }

    importId =
      importRecord.id;

    const normalizedRows =
      parsedRows.map(
        normalizeRow
      );

    const rowsToInsert =
      normalizedRows.map(
        (row) => {
          const metricDate =
            parseMetricDate(
              getFirstValue(
                row,
                [
                  "date",
                  "jour",
                  "day",
                  "metric_date",
                  "date_du_stream",
                ]
              )
            );

          return {
            import_id:
              importRecord.id,

            artiste_id:
              artisteId,

            metric_date:
              metricDate,

            spotify_track_id:
              getFirstValue(
                row,
                [
                  "spotify_track_id",
                  "track_id",
                  "uri",
                  "spotify_uri",
                  "track_uri",
                  "identifiant_du_titre",
                ]
              ),

            track_name:
              getFirstValue(
                row,
                [
                  "track_name",
                  "track",
                  "song",
                  "song_name",
                  "titre",
                  "nom_du_titre",
                ]
              ),

            release_name:
              getFirstValue(
                row,
                [
                  "release_name",
                  "release",
                  "album",
                  "album_name",
                  "sortie",
                  "nom_de_la_sortie",
                ]
              ),

            streams:
              parseMetricNumber(
                getFirstValue(
                  row,
                  [
                    "streams",
                    "stream",
                    "ecoutes",
                    "nombre_de_streams",
                  ]
                )
              ),

            listeners:
              parseMetricNumber(
                getFirstValue(
                  row,
                  [
                    "listeners",
                    "listener",
                    "auditeurs",
                    "auditeurs_uniques",
                  ]
                )
              ),

            saves:
              parseMetricNumber(
                getFirstValue(
                  row,
                  [
                    "saves",
                    "save",
                    "sauvegardes",
                    "enregistrements",
                  ]
                )
              ),

            playlist_adds:
              parseMetricNumber(
                getFirstValue(
                  row,
                  [
                    "playlist_adds",
                    "playlist_add",
                    "ajouts_aux_playlists",
                    "ajouts_playlist",
                  ]
                )
              ),

            raw_data:
              row,
          };
        }
      );

    const metricDates =
      rowsToInsert
        .map(
          (row) =>
            row.metric_date
        )
        .filter(
          (
            date
          ): date is string =>
            Boolean(date)
        )
        .sort();

    const batchSize = 500;

    for (
      let index = 0;
      index <
      rowsToInsert.length;
      index += batchSize
    ) {
      const batch =
        rowsToInsert.slice(
          index,
          index + batchSize
        );

      const { error } =
        await supabaseAdmin
          .from(
            "spotify_analytics_rows"
          )
          .insert(batch);

      if (error) {
        throw new Error(
          `Erreur d’enregistrement des statistiques : ${error.message}`
        );
      }
    }

    const completedAt =
      new Date().toISOString();

    const {
      error: updateError,
    } = await supabaseAdmin
      .from(
        "spotify_analytics_imports"
      )
      .update({
        status:
          "completed",
        rows_imported:
          rowsToInsert.length,

        period_start:
          metricDates[0] ||
          null,

        period_end:
          metricDates[
            metricDates.length -
              1
          ] || null,

        error_message:
          null,

        completed_at:
          completedAt,
      })
      .eq(
        "id",
        importRecord.id
      );

    if (updateError) {
      throw new Error(
        `Import enregistré mais statut non actualisé : ${updateError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      importId:
        importRecord.id,
      artiste:
        artiste.nom,
      rowsImported:
        rowsToInsert.length,
      periodStart:
        metricDates[0] ||
        null,
      periodEnd:
        metricDates[
          metricDates.length - 1
        ] || null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur inconnue pendant l’import.";

    console.error(
      "Erreur import Spotify Analytics :",
      error
    );

    if (importId) {
      await supabaseAdmin
        .from(
          "spotify_analytics_imports"
        )
        .update({
          status: "failed",
          error_message:
            errorMessage,
          completed_at:
            new Date().toISOString(),
        })
        .eq("id", importId);
    }

    return NextResponse.json(
      {
        error:
          errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}