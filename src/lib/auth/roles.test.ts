/**
 * @jest-environment node
 */

import {
  canAccess,
  hasAnyRole,
  hasRole,
  isAdmin,
  isUser,
  USER_ROLES,
} from "@/lib/auth/roles";
import type { AuthUser } from "@/types/auth";

const adminUser: AuthUser = {
  id: "1",
  email: "admin@example.com",
  role: "ADMIN",
};

const regularUser: AuthUser = {
  id: "2",
  email: "user@example.com",
  role: "USER",
};

describe("roles", () => {
  it("exports the supported user roles", () => {
    expect(USER_ROLES).toEqual(["USER", "ADMIN"]);
  });

  describe("hasRole", () => {
    it("returns true when the user has the requested role", () => {
      expect(hasRole(adminUser, "ADMIN")).toBe(true);
    });

    it("returns false when the user has a different role", () => {
      expect(hasRole(regularUser, "ADMIN")).toBe(false);
    });

    it("returns false for missing users", () => {
      expect(hasRole(null, "USER")).toBe(false);
      expect(hasRole(undefined, "USER")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("returns true when the role is allowed", () => {
      expect(hasAnyRole("USER", ["USER", "ADMIN"])).toBe(true);
    });

    it("returns false when the role is not allowed", () => {
      expect(hasAnyRole("USER", ["ADMIN"])).toBe(false);
    });

    it("returns false for empty roles", () => {
      expect(hasAnyRole(null, ["USER"])).toBe(false);
      expect(hasAnyRole(undefined, ["USER"])).toBe(false);
    });
  });

  describe("role helpers", () => {
    it("identifies admin users", () => {
      expect(isAdmin(adminUser)).toBe(true);
      expect(isAdmin(regularUser)).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });

    it("identifies regular users", () => {
      expect(isUser(regularUser)).toBe(true);
      expect(isUser(adminUser)).toBe(false);
      expect(isUser(undefined)).toBe(false);
    });

    it("delegates access checks to hasAnyRole", () => {
      expect(canAccess("ADMIN", ["ADMIN"])).toBe(true);
      expect(canAccess("USER", ["ADMIN"])).toBe(false);
    });
  });
});
