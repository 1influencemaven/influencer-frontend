"use client";

import { useEffect } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || !isAuthenticated) {
    return <AuthLoadingScreen />;
  }

  return children;
}
