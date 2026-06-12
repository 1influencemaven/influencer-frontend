/**
 * @jest-environment node
 */

import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser } from "@/types/auth";

const initialState = {
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  loading: false,
};

const mockUser: AuthUser = {
  id: "user-1",
  email: "user@example.com",
  role: "USER",
};

function resetAuthStore(): void {
  useAuthStore.setState(initialState);
}

describe("useAuthStore", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("starts with the expected initial state", () => {
    expect(useAuthStore.getState()).toMatchObject(initialState);
  });

  describe("setUser", () => {
    it("stores the authenticated user", () => {
      useAuthStore.getState().setUser(mockUser);

      expect(useAuthStore.getState()).toMatchObject({
        user: mockUser,
        isAuthenticated: true,
        isHydrated: false,
        loading: false,
      });
    });

    it("replaces an existing user", () => {
      const adminUser: AuthUser = {
        id: "admin-1",
        email: "admin@example.com",
        role: "ADMIN",
      };

      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(adminUser);

      expect(useAuthStore.getState().user).toEqual(adminUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe("clearUser", () => {
    it("resets authentication state", () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isHydrated: true,
        loading: true,
      });

      useAuthStore.getState().clearUser();

      expect(useAuthStore.getState()).toMatchObject({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
        loading: true,
      });
    });
  });

  describe("setHydrated", () => {
    it("updates hydration state", () => {
      useAuthStore.getState().setHydrated(true);

      expect(useAuthStore.getState().isHydrated).toBe(true);

      useAuthStore.getState().setHydrated(false);

      expect(useAuthStore.getState().isHydrated).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("updates loading state", () => {
      useAuthStore.getState().setLoading(true);

      expect(useAuthStore.getState().loading).toBe(true);

      useAuthStore.getState().setLoading(false);

      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe("state transitions", () => {
    it("supports a full session lifecycle", () => {
      const { setLoading, setUser, setHydrated, clearUser } =
        useAuthStore.getState();

      setLoading(true);
      expect(useAuthStore.getState().loading).toBe(true);

      setUser(mockUser);
      expect(useAuthStore.getState()).toMatchObject({
        user: mockUser,
        isAuthenticated: true,
        loading: true,
      });

      setHydrated(true);
      setLoading(false);

      expect(useAuthStore.getState()).toMatchObject({
        user: mockUser,
        isAuthenticated: true,
        isHydrated: true,
        loading: false,
      });

      clearUser();

      expect(useAuthStore.getState()).toMatchObject({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
        loading: false,
      });
    });
  });
});
