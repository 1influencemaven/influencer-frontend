/**
 * @jest-environment node
 */

import {
  AUTH_PATHS,
  buildLocalizedPath,
  getPathnameWithoutLocale,
  isAuthPath,
  isProtectedPath,
  PROTECTED_PATHS,
  resolveAuthRedirect,
} from "@/lib/auth/proxy-auth.utils";

const localeConfig = {
  locales: ["es", "en"],
  defaultLocale: "es",
};

describe("proxy-auth utils", () => {
  it("exports protected and auth paths", () => {
    expect(PROTECTED_PATHS).toContain("/dashboard");
    expect(AUTH_PATHS).toContain("/login");
  });

  describe("getPathnameWithoutLocale", () => {
    it("strips supported locale prefixes", () => {
      expect(getPathnameWithoutLocale("/es/dashboard", localeConfig)).toEqual({
        locale: "es",
        pathname: "/dashboard",
      });
    });

    it("returns the root path for locale-only urls", () => {
      expect(getPathnameWithoutLocale("/en", localeConfig)).toEqual({
        locale: "en",
        pathname: "/",
      });
    });

    it("returns null locale when no prefix is present", () => {
      expect(getPathnameWithoutLocale("/dashboard", localeConfig)).toEqual({
        locale: null,
        pathname: "/dashboard",
      });
    });
  });

  describe("path matchers", () => {
    it("detects protected paths", () => {
      expect(isProtectedPath("/dashboard")).toBe(true);
      expect(isProtectedPath("/dashboard/campaigns")).toBe(true);
      expect(isProtectedPath("/login")).toBe(false);
    });

    it("detects auth paths", () => {
      expect(isAuthPath("/login")).toBe(true);
      expect(isAuthPath("/dashboard")).toBe(false);
    });
  });

  describe("buildLocalizedPath", () => {
    it("builds localized urls with fallback locale", () => {
      expect(
        buildLocalizedPath(
          "http://localhost:3001",
          null,
          localeConfig.defaultLocale,
          "/login",
        ).toString(),
      ).toBe("http://localhost:3001/es/login");
    });
  });

  describe("resolveAuthRedirect", () => {
    it("redirects unauthenticated users away from protected routes", () => {
      expect(
        resolveAuthRedirect(
          "/es/dashboard",
          false,
          localeConfig,
          "http://localhost:3001",
        )?.toString(),
      ).toBe("http://localhost:3001/es/login");
    });

    it("redirects authenticated users away from login", () => {
      expect(
        resolveAuthRedirect(
          "/es/login",
          true,
          localeConfig,
          "http://localhost:3001",
        )?.toString(),
      ).toBe("http://localhost:3001/es/dashboard");
    });

    it("returns null for public routes", () => {
      expect(
        resolveAuthRedirect(
          "/es",
          false,
          localeConfig,
          "http://localhost:3001",
        ),
      ).toBeNull();
    });
  });
});
