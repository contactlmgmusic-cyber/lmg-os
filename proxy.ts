import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  EXECUTIVE_ROLES,
  getRoleHome,
  isUserRole,
} from "@/lib/roles";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";

  const isAgencyDomain =
    hostname === "agency.legacymusicgroup.fr" ||
    hostname === "www.agency.legacymusicgroup.fr";

  if (isAgencyDomain && !path.startsWith("/agency")) {
    const url = request.nextUrl.clone();
    url.pathname = path === "/" ? "/agency" : `/agency${path}`;
    return NextResponse.rewrite(url);
  }

  const maintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  const maintenancePrefixes = [
    "/login",
    "/signup",
    "/dashboard",
    "/admin",
    "/artistes",
    "/projets",
    "/sorties",
    "/release-planner",
    "/booking",
    "/medias",
    "/influenceurs",
    "/campagnes",
    "/contrats",
    "/splits",
    "/royalties",
    "/finances",
    "/taches",
    "/mes-taches",
    "/calendrier",
    "/rollout",
    "/drive",
    "/assistant",
    "/chat",
    "/equipe",
    "/notifications",
    "/invitations",
    "/mon-espace-artiste",
    "/manager",
    "/agency",
  ];

  const isMaintenanceAllowed =
    path === "/maintenance" ||
    maintenancePrefixes.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );

  if (maintenanceMode && !isMaintenanceAllowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  const isPublicRoute =
    path === "/" ||
    path === "/site" ||
    path.startsWith("/site/") ||
    path === "/agency" ||
    path.startsWith("/agency/") ||
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

  if (!user) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isUserRole(profile?.role)) {
    if (path !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return response;
  }

  const roleHome = getRoleHome(profile.role);

  if (path === "/login" || path === "/signup") {
    const url = request.nextUrl.clone();
    url.pathname = roleHome;
    return NextResponse.redirect(url);
  }

  if (
    path === "/dashboard" &&
    !EXECUTIVE_ROLES.includes(profile.role)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = roleHome;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
