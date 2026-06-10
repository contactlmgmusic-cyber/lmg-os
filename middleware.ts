import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const maintenanceMode =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

const isMaintenanceAllowed =
  path === "/maintenance" ||
  path.startsWith("/login") ||
  path.startsWith("/signup") ||
  path.startsWith("/dashboard") ||
  path.startsWith("/admin") ||
  path.startsWith("/artistes") ||
  path.startsWith("/projets") ||
  path.startsWith("/booking") ||
  path.startsWith("/medias") ||
  path.startsWith("/influenceurs") ||
  path.startsWith("/campagnes") ||
  path.startsWith("/contrats") ||
  path.startsWith("/splits") ||
  path.startsWith("/royalties") ||
  path.startsWith("/finances") ||
  path.startsWith("/taches") ||
  path.startsWith("/mes-taches") ||
  path.startsWith("/calendrier") ||
  path.startsWith("/rollout") ||
  path.startsWith("/drive") ||
  path.startsWith("/assistant") ||
  path.startsWith("/chat") ||
  path.startsWith("/equipe") ||
  path.startsWith("/notifications") ||
  path.startsWith("/invitations") ||
  path.startsWith("/mon-espace-artiste") ||
  path.startsWith("/manager");

if (maintenanceMode && !isMaintenanceAllowed) {
  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.redirect(url);
}

  const isPublicRoute =
    path === "/" ||
    path === "/site" ||
    path.startsWith("/site/") ||
    path === "/login" ||
    path === "/signup";

  if (isPublicRoute && path !== "/login" && path !== "/signup") {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};