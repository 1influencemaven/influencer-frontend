import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { applyAuthMiddleware } from "@/lib/auth/proxy-auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  if (response.headers.get("location")) {
    return response;
  }

  return applyAuthMiddleware(request, response);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
