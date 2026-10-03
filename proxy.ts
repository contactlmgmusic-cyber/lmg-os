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

  /*
   * ─────────────────────────────────────────────
   * DOMAIN ROUTING
   * ─────────────────────────────────────────────
   */

  const isMusicDomain =
    hostname === "lmgmusic.fr" ||
    hostname === "www.lmgmusic.fr";

  const isOsDomain =
    hostname === "os.lmgmusic.fr";

  const isCareersDomain =
    hostname === "careers.lmgmusic.fr";

  const isArtistPortalDomain =
    hostname === "artistportal.lmgmusic.fr";

  const isAgencyDomain =
    hostname === "agency.legacymusicgroup.fr" ||
    hostname === "www.agency.legacymusicgroup.fr";

  /*
   * INTERNAL DOMAIN NAMESPACES
   *
   * Public frontend namespaces are implementation details.
   * They must never be exposed through the OS domain.
   */
  if (
    isOsDomain &&
    (
      path === "/site" ||
      path.startsWith("/site/") ||
      path === "/agency" ||
      path.startsWith("/agency/") ||
      path === "/careers" ||
      path.startsWith("/careers/") ||
      path === "/artistportal" ||
      path.startsWith("/artistportal/")
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  /*
   * LMG MUSIC PUBLIC WEBSITE
   *
   * lmgmusic.fr/          -> /site
   * lmgmusic.fr/artistes  -> /site/artistes
   * lmgmusic.fr/releases  -> /site/releases
   *
   * /site remains an internal namespace only.
   */
  if (isMusicDomain) {
    /*
     * Maintenance is controlled from LMG OS through
     * public.site_settings.
     *
     * Only the public LMG Music domain is affected.
     * os.lmgmusic.fr never enters this block.
     */
    if (path !== "/maintenance") {
      try {
        const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL;

        const supabaseAnonKey =
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
          const maintenanceResponse = await fetch(
            `${supabaseUrl}/rest/v1/site_settings?id=eq.lmg_music&select=maintenance_enabled`,
            {
              headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
              cache: "no-store",
            }
          );

          if (maintenanceResponse.ok) {
            const settings = (await maintenanceResponse.json()) as Array<{
              maintenance_enabled: boolean;
            }>;

            if (settings[0]?.maintenance_enabled) {
              const url = request.nextUrl.clone();

              url.pathname = "/maintenance";

              return NextResponse.rewrite(url);
            }
          }
        }
      } catch (error) {
        /*
         * Fail open:
         * if Supabase cannot be reached, the public website
         * remains available instead of becoming unavailable.
         */
        console.error(
          "Unable to read LMG Music maintenance state:",
          error
        );
      }
    }

    /*
     * Avoid rewriting an already-internal URL.
     * We will redirect those URLs publicly below.
     */
    if (!path.startsWith("/site")) {
      const url = request.nextUrl.clone();

      url.pathname =
        path === "/"
          ? "/site"
          : `/site${path}`;

      return NextResponse.rewrite(url);
    }

    /*
     * Prevent /site from appearing publicly.
     *
     * lmgmusic.fr/site/artistes
     * -> lmgmusic.fr/artistes
     */
    const url = request.nextUrl.clone();

    const publicPath = path.replace(/^\/site/, "");

    url.pathname =
      publicPath === ""
        ? "/"
        : publicPath;

    return NextResponse.redirect(url);
  }

  /*
   * LMG CAREERS
   *
   * careers.lmgmusic.fr/             -> /careers
   * careers.lmgmusic.fr/jobs         -> /careers/jobs
   * careers.lmgmusic.fr/jobs/[slug]  -> /careers/jobs/[slug]
   * careers.lmgmusic.fr/apply        -> /careers/apply
   *
   * /careers remains an internal namespace only.
   */
  if (isCareersDomain) {
    if (!path.startsWith("/careers")) {
      const url = request.nextUrl.clone();

      url.pathname =
        path === "/"
          ? "/careers"
          : `/careers${path}`;

      return NextResponse.rewrite(url);
    }

    const url = request.nextUrl.clone();
    const publicPath = path.replace(/^\/careers/, "");

    url.pathname =
      publicPath === ""
        ? "/"
        : publicPath;

    return NextResponse.redirect(url);
  }

  /*
   * LMG ARTIST PORTAL
   *
   * artistportal.lmgmusic.fr/ -> /artistportal
   *
   * /artistportal remains an internal namespace only.
   */
  if (isArtistPortalDomain) {
    if (!path.startsWith("/artistportal")) {
      const url = request.nextUrl.clone();

      url.pathname =
        path === "/"
          ? "/artistportal"
          : `/artistportal${path}`;

      return NextResponse.rewrite(url);
    }

    const url = request.nextUrl.clone();
    const publicPath = path.replace(/^\/artistportal/, "");

    url.pathname =
      publicPath === ""
        ? "/"
        : publicPath;

    return NextResponse.redirect(url);
  }

  /*
   * LMG AGENCY
   */
  if (isAgencyDomain && !path.startsWith("/agency")) {
    const url = request.nextUrl.clone();

    url.pathname =
      path === "/"
        ? "/agency"
        : `/agency${path}`;

    return NextResponse.rewrite(url);
  }

  /*
   * ─────────────────────────────────────────────
   * LMG OS
   * ─────────────────────────────────────────────
   *
   * os.lmgmusic.fr keeps the native OS routes.
   *
   * We deliberately continue through the existing
   * authentication / role logic below.
   */

  const isPublicRoute =
    /*
     * Keep the legacy/public paths available on
     * non-Music domains when needed.
     */
    path === "/" ||
    path === "/site" ||
    path.startsWith("/site/") ||
    path === "/agency" ||
    path.startsWith("/agency/") ||
    path === "/careers" ||
    path.startsWith("/careers/") ||
    path === "/artistportal" ||
    path.startsWith("/artistportal/") ||
    path === "/login" ||
    path === "/signup";

  if (
    isPublicRoute &&
    path !== "/login" &&
    path !== "/signup"
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
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
      const url =
        request.nextUrl.clone();

      url.pathname = "/";

      return NextResponse.redirect(url);
    }

    return response;
  }

  const roleHome =
    getRoleHome(profile.role);

  if (
    path === "/login" ||
    path === "/signup"
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname = roleHome;

    return NextResponse.redirect(url);
  }

  if (
    path === "/dashboard" &&
    !EXECUTIVE_ROLES.includes(
      profile.role
    )
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname = roleHome;

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
