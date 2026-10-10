import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { EXECUTIVE_ROLES, getRoleHome, isUserRole } from "@/lib/roles";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname;
  const music = hostname === "lmgmusic.fr" || hostname === "www.lmgmusic.fr";
  const careers = hostname === "careers.lmgmusic.fr";
  const artist = hostname === "artistportal.lmgmusic.fr";
  const os = hostname === "os.lmgmusic.fr";
  const agency = ["agency.legacymusicgroup.fr", "www.agency.legacymusicgroup.fr"].includes(hostname);
  if (agency) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://www.lmgagency.fr");
    if (path === "/agency" || path.startsWith("/agency/")) target.pathname = path.slice(7) || "/";
    return NextResponse.redirect(target, 308);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-lmg-language", careers ? "en" : "fr");
  requestHeaders.set("x-lmg-public-path", path);
  const options = { request: { headers: requestHeaders } };
  const redirectTo = (pathname: string) => { const url = request.nextUrl.clone(); url.pathname = pathname; return NextResponse.redirect(url); };
  const namespace = music ? "/site" : careers ? "/careers" : artist ? "/artistportal" : agency ? "/agency" : null;
  if (namespace) {
    if (path === namespace || path.startsWith(`${namespace}/`)) {
      const target = request.nextUrl.clone(); target.pathname = path.slice(namespace.length) || "/";
      return NextResponse.redirect(target, 308);
    }
    if (music && path === "/artists") {
      const target = request.nextUrl.clone(); target.pathname = "/artistes";
      return NextResponse.redirect(target, 308);
    }
    if (music && path === "/maintenance") return NextResponse.next(options);
    if (music) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && key) {
        try {
          const result = await fetch(`${url}/rest/v1/site_settings?id=eq.lmg_music&select=maintenance_enabled`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            next: { revalidate: 15 }, signal: AbortSignal.timeout(3000),
          });
          if (result.ok && (await result.json())[0]?.maintenance_enabled) {
            const target = request.nextUrl.clone(); target.pathname = "/maintenance";
            return NextResponse.rewrite(target, { ...options, status: 503, headers: { "Retry-After": "3600", "X-Robots-Tag": "noindex", "Cache-Control": "no-store" } });
          }
        } catch { console.error("Music maintenance state unavailable"); }
      }
    }
    const target = request.nextUrl.clone(); target.pathname = path === "/" ? namespace : `${namespace}${path}`;
    return NextResponse.rewrite(target, options);
  }
  if (os && ["/site", "/agency", "/careers", "/artistportal"].some(prefix => path === prefix || path.startsWith(`${prefix}/`))) return redirectTo("/");
  if (os && path === "/candidatures") return redirectTo("/dashboard/candidatures");
  const publicRoute = ["/login", "/mobile-auth", "/signup", "/forgot-password", "/reset-password", "/auth/callback"].includes(path);
  if (!os && ["/site", "/agency", "/careers", "/artistportal"].some(prefix => path === prefix || path.startsWith(`${prefix}/`))) return NextResponse.next(options);
  let response = NextResponse.next(options);
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next(options);
        items.forEach(({ name, value, options: cookieOptions }) => response.cookies.set(name, value, cookieOptions));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const redirectWithCookies = (pathname: string) => {
    const target = redirectTo(pathname);
    response.cookies.getAll().forEach(cookie => target.cookies.set(cookie));
    return target;
  };
  if (!user) {
    if (publicRoute) return response;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${path}${request.nextUrl.search}`);
    const target = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach(cookie => target.cookies.set(cookie));
    return target;
  }
  // Recovery and OAuth callbacks must remain reachable with an authenticated session.
  if (["/reset-password", "/auth/callback", "/forgot-password"].includes(path)) return response;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isUserRole(profile?.role)) {
    if (publicRoute) return response;
    await supabase.auth.signOut();
    return redirectWithCookies("/login");
  }
  if (path === "/login") {
    const requestedPath = request.nextUrl.searchParams.get("next");
    if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
      return redirectWithCookies(requestedPath);
    }
  }
  if (path === "/" || path === "/login" || path === "/signup" || (path === "/dashboard" && !EXECUTIVE_ROLES.includes(profile.role))) return redirectWithCookies(getRoleHome(profile.role));
  return response;
}
export const config = {
  matcher: ["/((?!api(?:/|$)|_next/static|_next/image|robots\\.txt$|sitemap\\.xml$|favicon\\.ico$|.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|mp4|css|js|map)$).*)"],
};
