import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { safeNext } from "@/lib/open-redirect";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
const COOKIE = "absy-locale";

function localeRouting(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|avif|ico|xml|txt)$/)
  ) {
    return NextResponse.next();
  }
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const cookie = req.cookies.get(COOKIE)?.value as Locale | undefined;
    const locale: Locale = cookie && locales.includes(cookie) ? cookie : defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, locale, { path: "/", maxAge: 31536000 });
    return res;
  }
  return NextResponse.next();
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/login";
  const isApi = pathname.startsWith("/api");
  const isAuthPath = isAdmin || isLogin || isApi;

  if (!isAuthPath) return localeRouting(req);
  if (isApi) return NextResponse.next();

  // Auth-gated paths: refresh the session and enforce admin access.
  const res = NextResponse.next({ request: req });
  if (!hasSupabaseEnv) {
    // No env configured — never block the login/bootstrap flow; the login
    // server action shows the setup error. Public site is unaffected.
    if (isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `next=${encodeURIComponent(safeNext(pathname, "/admin"))}`;
      return NextResponse.redirect(url);
    }
    return res;
  }

  try {
    const cookieChanges: import("@/lib/supabase/middleware").MiddlewareCookieChange[] = [];
    const supabase = createMiddlewareClient(req, cookieChanges);
    const { data } = await supabase.auth.getUser();
    const isAdminUser = data?.user?.app_metadata?.role === "admin";

    // Persist refreshed tokens to the downstream request AND the browser.
    for (const change of cookieChanges) {
      res.cookies.set(change.name, change.value, change.options as never);
    }

    if (isAdmin && !isAdminUser) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `next=${encodeURIComponent(safeNext(pathname + search, "/admin"))}`;
      return NextResponse.redirect(url);
    }
    if (isLogin && isAdminUser) {
      const url = req.nextUrl.clone();
      const fallback = "/admin";
      const nextParam = req.nextUrl.searchParams.get("next");
      url.search = "";
      url.pathname = safeNext(nextParam, fallback).split("?")[0] || fallback;
      return NextResponse.redirect(url);
    }
  } catch {
    if (isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `next=${encodeURIComponent(safeNext(pathname, "/admin"))}`;
      return NextResponse.redirect(url);
    }
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };