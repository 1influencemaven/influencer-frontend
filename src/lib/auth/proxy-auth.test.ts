/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server";

jest.mock("../../i18n/routing", () => ({
  routing: {
    locales: ["es", "en"],
    defaultLocale: "es",
    localePrefix: "always",
  },
}));

import { applyAuthMiddleware } from "@/lib/auth/proxy-auth";

function createRequest(pathname: string, accessToken?: string): NextRequest {
  const headers = accessToken
    ? { cookie: `access_token=${accessToken}` }
    : undefined;

  return new NextRequest(new URL(`http://localhost:3001${pathname}`), {
    headers,
  });
}

describe("applyAuthMiddleware", () => {
  it("redirects unauthenticated users from protected routes", () => {
    const response = applyAuthMiddleware(
      createRequest("/es/dashboard"),
      NextResponse.next(),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3001/es/login",
    );
  });

  it("redirects unauthenticated users from admin register routes", () => {
    const response = applyAuthMiddleware(
      createRequest("/es/users/new"),
      NextResponse.next(),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3001/es/login",
    );
  });

  it("redirects authenticated users away from login", () => {
    const response = applyAuthMiddleware(
      createRequest("/es/login", "session-token"),
      NextResponse.next(),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3001/es/dashboard",
    );
  });

  it("allows authenticated access to protected routes", () => {
    const original = NextResponse.next();
    const response = applyAuthMiddleware(
      createRequest("/es/users", "session-token"),
      original,
    );

    expect(response).toBe(original);
  });

  it("allows guest access to public routes", () => {
    const original = NextResponse.next();
    const response = applyAuthMiddleware(createRequest("/es"), original);

    expect(response).toBe(original);
  });
});
