/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { RequireRole } from "@/components/auth/require-role";
import { useRole } from "@/hooks/use-role";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";

const mockReplace = jest.fn();

jest.mock("../../i18n/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../hooks/use-role", () => ({
  useRole: jest.fn(),
}));

jest.mock("../../stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUseRole = jest.mocked(useRole);
const mockedUseAuthStore = jest.mocked(useAuthStore);

function setupSession({
  isHydrated = true,
  isAuthenticated = true,
  canAccess = true,
}: {
  isHydrated?: boolean;
  isAuthenticated?: boolean;
  canAccess?: boolean;
}) {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      isHydrated,
      isAuthenticated,
    } as never),
  );

  mockedUseRole.mockReturnValue({
    canAccess: () => canAccess,
  } as never);
}

describe("RequireRole", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    } as never);
  });

  it("allows ADMIN users to access admin-only routes", () => {
    setupSession({ canAccess: true });

    render(
      <RequireRole roles={["ADMIN"]}>
        <div>Admin route</div>
      </RequireRole>,
    );

    expect(screen.getByText("Admin route")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects USER users away from admin-only routes", async () => {
    setupSession({ canAccess: false });

    render(
      <RequireRole roles={["ADMIN"]}>
        <div>Admin route</div>
      </RequireRole>,
    );

    expect(screen.queryByText("Admin route")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("allows USER users to access user routes", () => {
    setupSession({ canAccess: true });

    render(
      <RequireRole roles={["USER", "ADMIN"]}>
        <div>Shared route</div>
      </RequireRole>,
    );

    expect(screen.getByText("Shared route")).toBeInTheDocument();
  });

  it("shows the loading screen while access is being resolved", () => {
    setupSession({ isHydrated: false, canAccess: false });

    const { container } = render(
      <RequireRole roles={["ADMIN"]}>
        <div>Register user form</div>
      </RequireRole>,
    );

    expect(screen.queryByText("Register user form")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
