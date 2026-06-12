/**
 * @jest-environment node
 */

import type { NextRequest } from "next/server";
import { NextRequest as NextRequestImpl, NextResponse } from "next/server";

jest.mock("./i18n/routing", () => ({
  routing: {
    locales: ["es", "en"],
    defaultLocale: "es",
    localePrefix: "always",
  },
}));

jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("./lib/auth/proxy-auth", () => ({
  applyAuthMiddleware: jest.fn(),
}));

import createIntlMiddleware from "next-intl/middleware";

import { applyAuthMiddleware } from "./lib/auth/proxy-auth";

const mockIntlMiddleware = jest.fn();
const mockApplyAuthMiddleware = jest.mocked(applyAuthMiddleware);

let proxy: (request: NextRequest) => NextResponse;

beforeAll(async () => {
  jest.mocked(createIntlMiddleware).mockReturnValue(mockIntlMiddleware);
  ({ default: proxy } = await import("@/proxy"));
});

describe("proxy middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIntlMiddleware.mockReturnValue(NextResponse.next());
    mockApplyAuthMiddleware.mockImplementation((_request, response) => response);
  });

  it("applies auth checks after locale handling", () => {
    const request = new NextRequestImpl("http://localhost:3001/es/dashboard");
    const intlResponse = NextResponse.next();

    mockIntlMiddleware.mockReturnValue(intlResponse);

    const response = proxy(request);

    expect(mockIntlMiddleware).toHaveBeenCalledWith(request);
    expect(mockApplyAuthMiddleware).toHaveBeenCalledWith(request, intlResponse);
    expect(response).toBe(intlResponse);
  });

  it("skips auth checks when locale middleware already redirects", () => {
    const request = new NextRequestImpl("http://localhost:3001/es");
    const redirectResponse = NextResponse.redirect("http://localhost:3001/en");

    mockIntlMiddleware.mockReturnValue(redirectResponse);

    const response = proxy(request);

    expect(mockApplyAuthMiddleware).not.toHaveBeenCalled();
    expect(response).toBe(redirectResponse);
  });
});
