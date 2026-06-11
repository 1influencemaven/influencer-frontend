"use client";

import { useEffect } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { useRole } from "@/hooks/use-role";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types/auth";

type RequireRoleProps = {
  roles: readonly UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
};

export function RequireRole({
  roles,
  children,
  redirectTo = "/dashboard",
}: RequireRoleProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { canAccess } = useRole();

  const hasAccess = canAccess(roles);

  useEffect(() => {
    if (isHydrated && isAuthenticated && !hasAccess) {
      router.replace(redirectTo);
    }
  }, [hasAccess, isAuthenticated, isHydrated, redirectTo, router]);

  if (!isHydrated || !isAuthenticated || !hasAccess) {
    return <AuthLoadingScreen />;
  }

  return children;
}
