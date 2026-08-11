import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  getCentralGoogleGmail,
} from "@/lib/google-gmail-central.server";
import { ROLES } from "@/lib/roles";

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

function encodeSubject(subject: string) {
  return `=?UTF-8?B?${Buffer.from(
    subject,
    "utf8"
  ).toString("base64")}?=`;
}

function createRawEmail({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) {
  const email = [
    "From: Legacy Music Group <contact@legacymusicgroup.fr>",
    "Reply-To: contact@legacymusicgroup.fr",
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(
      message,
      "utf8"
    ).toString("base64"),
  ].join("\r\n");

  return Buffer.from(email)
    .toString("base64url");
}

export async function POST(
  request: NextRequest
) {
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
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentification requise.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin =
      createSupabaseAdmin();

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
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
            "Tu n’as pas l’autorisation d’envoyer des e-mails.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const to =
      String(body.to || "").trim();

    const subject =
      String(
        body.subject || ""
      ).trim();

    const message =
      String(
        body.message || ""
      ).trim();

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        to
      );

    if (
      !validEmail ||
      !subject ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            "Destinataire, objet ou message invalide.",
        },
        { status: 400 }
      );
    }

    if (
      subject.length > 200 ||
      message.length > 50000
    ) {
      return NextResponse.json(
        {
          error:
            "Le contenu de l’e-mail est trop long.",
        },
        { status: 400 }
      );
    }

    const { gmail } =
      await getCentralGoogleGmail(
        request.nextUrl.origin
      );

    const result =
      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: createRawEmail({
            to,
            subject,
            message,
          }),
        },
      });

    return NextResponse.json({
      success: true,
      messageId:
        result.data.id || null,
      threadId:
        result.data.threadId || null,
    });
  } catch (error) {
    console.error(
      "Erreur envoi Gmail :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d’envoyer l’e-mail.",
      },
      { status: 500 }
    );
  }
}