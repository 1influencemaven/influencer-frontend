"use client";

import { useRole } from "@/hooks/use-role";
import type { UserRole } from "@/types/auth";

type RoleGateProps = {
  roles: readonly UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGate({
  roles,
  children,
  fallback = null,
}: RoleGateProps) {
  const { canAccess } = useRole();

  if (!canAccess(roles)) {
    return fallback;
  }

  return children;
}
