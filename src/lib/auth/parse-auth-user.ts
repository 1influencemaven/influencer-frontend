import type { AuthUser, UserRole } from "@/types/auth";

const USER_ROLES: readonly UserRole[] = ["USER", "ADMIN"];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function parseAuthUser(data: unknown): AuthUser {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid auth user response");
  }

  const record = data as Record<string, unknown>;
  const nestedUser =
    typeof record.user === "object" && record.user !== null
      ? (record.user as Record<string, unknown>)
      : record;

  const id = nestedUser.id;
  const email = nestedUser.email;
  const role = nestedUser.role;

  if (typeof id !== "string" || typeof email !== "string" || !isUserRole(role)) {
    throw new Error("Invalid auth user response");
  }

  return { id, email, role };
}
