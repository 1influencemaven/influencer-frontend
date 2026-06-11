import type { AuthUser, UserRole } from "@/types/auth";

export const USER_ROLES = ["USER", "ADMIN"] as const satisfies readonly UserRole[];

export function hasRole(
  user: AuthUser | null | undefined,
  role: UserRole,
): boolean {
  return user?.role === role;
}

export function hasAnyRole(
  userRole: UserRole | null | undefined,
  allowedRoles: readonly UserRole[],
): boolean {
  if (!userRole) {
    return false;
  }

  return allowedRoles.includes(userRole);
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "ADMIN");
}

export function isUser(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "USER");
}

export function canAccess(
  userRole: UserRole | null | undefined,
  allowedRoles: readonly UserRole[],
): boolean {
  return hasAnyRole(userRole, allowedRoles);
}
