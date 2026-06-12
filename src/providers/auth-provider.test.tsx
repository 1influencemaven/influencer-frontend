/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { AuthProvider } from "@/providers/auth-provider";
import { me } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

jest.mock("../services/auth.service", () => ({
  me: jest.fn(),
}));

jest.mock("../stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

const mockedMe = jest.mocked(me);
const mockedUseAuthStore = jest.mocked(useAuthStore);

const mockSetUser = jest.fn();
const mockClearUser = jest.fn();
const mockSetHydrated = jest.fn();
const mockSetLoading = jest.fn();

function setupAuthStoreMock(): void {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      setUser: mockSetUser,
      clearUser: mockClearUser,
      setHydrated: mockSetHydrated,
      setLoading: mockSetLoading,
    } as never),
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthStoreMock();
  });

  it("hydrates an authenticated user session", async () => {
    mockedMe.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: "USER",
    });

    render(
      <AuthProvider>
        <div>App content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetUser).toHaveBeenCalledWith({
        id: "user-1",
        email: "user@example.com",
        role: "USER",
      });
      expect(mockSetHydrated).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenLastCalledWith(false);
    });

    expect(screen.getByText("App content")).toBeInTheDocument();
  });

  it("hydrates an admin session", async () => {
    mockedMe.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    });

    render(
      <AuthProvider>
        <div>Admin app</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        id: "admin-1",
        email: "admin@example.com",
        role: "ADMIN",
      });
    });
  });

  it("clears the session when hydration returns unauthorized", async () => {
    mockedMe.mockRejectedValue({
      status: 401,
      message: "Unauthorized",
    });

    render(
      <AuthProvider>
        <div>App content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockClearUser).toHaveBeenCalledTimes(1);
      expect(mockSetHydrated).toHaveBeenCalledWith(true);
    });

    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it("keeps hydration completed for non-auth backend failures", async () => {
    mockedMe.mockRejectedValue({
      status: 500,
      message: "Server error",
    });

    render(
      <AuthProvider>
        <div>App content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockSetHydrated).toHaveBeenCalledWith(true);
    });

    expect(mockClearUser).not.toHaveBeenCalled();
    expect(mockSetUser).not.toHaveBeenCalled();
  });
});
