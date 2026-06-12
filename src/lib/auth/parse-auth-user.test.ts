/**
 * @jest-environment node
 */

import { parseAuthUser } from "@/lib/auth/parse-auth-user";

describe("parseAuthUser", () => {
  it("parses a flat auth user payload", () => {
    expect(
      parseAuthUser({
        id: "user-1",
        email: "user@example.com",
        role: "USER",
      }),
    ).toEqual({
      id: "user-1",
      email: "user@example.com",
      role: "USER",
    });
  });

  it("parses a nested user payload", () => {
    expect(
      parseAuthUser({
        user: {
          id: "admin-1",
          email: "admin@example.com",
          role: "ADMIN",
        },
      }),
    ).toEqual({
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });

  it("rejects invalid payloads", () => {
    expect(() => parseAuthUser(null)).toThrow("Invalid auth user response");
    expect(() => parseAuthUser("invalid")).toThrow("Invalid auth user response");
    expect(() =>
      parseAuthUser({ id: 1, email: "user@example.com", role: "USER" }),
    ).toThrow("Invalid auth user response");
    expect(() =>
      parseAuthUser({ id: "user-1", email: "user@example.com", role: "GUEST" }),
    ).toThrow("Invalid auth user response");
    expect(() =>
      parseAuthUser({ id: "user-1", role: "USER" }),
    ).toThrow("Invalid auth user response");
  });
});
