import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const ACCESS_TOKEN_COOKIE = "access_token";

export const PROTECTED_PATHS = ["/dashboard", "/users", "/campaigns"] as const;

export const AUTH_PATHS = ["/login"] as const;

function getPathnameWithoutLocale(pathname: string): {
  locale: string | null;
  pathname: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && routing.locales.includes(firstSegment as "es" | "en")) {
    const rest = segments.slice(1);
    return {
      locale: firstSegment,
      pathname: rest.length > 0 ? `/${rest.join("/")}` : "/",
    };
  }

  return {
    locale: null,
    pathname,
  };
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`),
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (authPath) => pathname === authPath || pathname.startsWith(`${authPath}/`),
  );
}

function hasSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
}

function buildLocalizedPath(
  request: NextRequest,
  locale: string | null,
  path: string,
): URL {
  const activeLocale = locale ?? routing.defaultLocale;
  return new URL(`/${activeLocale}${path}`, request.url);
}

export function applyAuthMiddleware(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const { locale, pathname } = getPathnameWithoutLocale(request.nextUrl.pathname);
  const sessionActive = hasSession(request);

  if (isProtectedPath(pathname) && !sessionActive) {
    return NextResponse.redirect(buildLocalizedPath(request, locale, "/login"));
  }

  if (isAuthPath(pathname) && sessionActive) {
    return NextResponse.redirect(buildLocalizedPath(request, locale, "/dashboard"));
  }

  return response;
}
