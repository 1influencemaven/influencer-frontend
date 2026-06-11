import { create } from "zustand";

import type { AuthUser } from "@/types/auth";

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loading: boolean;
};

export type AuthActions = {
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setHydrated: (isHydrated: boolean) => void;
  setLoading: (loading: boolean) => void;
};

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  loading: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  setLoading: (loading) => set({ loading }),
}));
