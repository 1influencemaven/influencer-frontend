/**
 * @jest-environment node
 */

import { shouldAttemptRefresh } from "@/lib/api/auth-refresh-policy";

describe("shouldAttemptRefresh", () => {
  it("returns false for missing urls", () => {
    expect(shouldAttemptRefresh(undefined)).toBe(false);
  });

  it("returns false for auth endpoints that must not refresh", () => {
    expect(shouldAttemptRefresh("/auth/refresh")).toBe(false);
    expect(shouldAttemptRefresh("/auth/login")).toBe(false);
    expect(shouldAttemptRefresh("/auth/logout")).toBe(false);
    expect(shouldAttemptRefresh("/auth/register")).toBe(false);
  });

  it("returns true for regular api routes", () => {
    expect(shouldAttemptRefresh("/auth/me")).toBe(true);
    expect(shouldAttemptRefresh("/users")).toBe(true);
  });
});
