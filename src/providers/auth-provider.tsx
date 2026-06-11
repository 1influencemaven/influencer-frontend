"use client";

import { useEffect } from "react";

import { me } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { isApiError } from "@/types/api-error";

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      setLoading(true);

      try {
        const user = await me();

        if (!cancelled) {
          setUser(user);
        }
      } catch (error) {
        if (!cancelled && isApiError(error) && error.status === 401) {
          clearUser();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHydrated(true);
        }
      }
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser, setHydrated, setLoading]);

  return children;
}
