"use client";

import {
  canAccess,
  hasAnyRole,
  hasRole,
  isAdmin,
  isUser,
} from "@/lib/auth/roles";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types/auth";

export function useRole() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? null;

  return {
    user,
    role,
    isAdmin: isAdmin(user),
    isUser: isUser(user),
    hasRole: (requiredRole: UserRole) => hasRole(user, requiredRole),
    hasAnyRole: (allowedRoles: readonly UserRole[]) =>
      hasAnyRole(role, allowedRoles),
    canAccess: (allowedRoles: readonly UserRole[]) =>
      canAccess(role, allowedRoles),
  };
}
