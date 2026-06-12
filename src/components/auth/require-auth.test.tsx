/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { RequireAuth } from "@/components/auth/require-auth";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";

const mockReplace = jest.fn();

jest.mock("../../i18n/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUseAuthStore = jest.mocked(useAuthStore);

function setupSession({
  isHydrated = true,
  isAuthenticated = true,
}: {
  isHydrated?: boolean;
  isAuthenticated?: boolean;
}) {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      isHydrated,
      isAuthenticated,
    } as never),
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    } as never);
  });

  it("renders protected content for authenticated users", () => {
    setupSession({ isHydrated: true, isAuthenticated: true });

    render(
      <RequireAuth>
        <div>Protected area</div>
      </RequireAuth>,
    );

    expect(screen.getByText("Protected area")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users to login", async () => {
    setupSession({ isHydrated: true, isAuthenticated: false });

    render(
      <RequireAuth>
        <div>Protected area</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected area")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("shows the loading screen while auth is hydrating", () => {
    setupSession({ isHydrated: false, isAuthenticated: false });

    const { container } = render(
      <RequireAuth>
        <div>Protected area</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("Protected area")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
