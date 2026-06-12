import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  resolveAuthRedirect,
} from "@/lib/auth/proxy-auth.utils";
import { routing } from "@/i18n/routing";

const ACCESS_TOKEN_COOKIE = "access_token";

export {
  AUTH_PATHS,
  PROTECTED_PATHS,
} from "@/lib/auth/proxy-auth.utils";

function hasSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
}

export function applyAuthMiddleware(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const redirectUrl = resolveAuthRedirect(
    request.nextUrl.pathname,
    hasSession(request),
    routing,
    request.url,
  );

  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
