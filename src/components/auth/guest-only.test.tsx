/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { GuestOnly } from "@/components/auth/guest-only";
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
  isAuthenticated = false,
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

describe("GuestOnly", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    } as never);
  });

  it("renders guest content for unauthenticated users", () => {
    setupSession({ isHydrated: true, isAuthenticated: false });

    render(
      <GuestOnly>
        <div>Login page</div>
      </GuestOnly>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects authenticated users to the dashboard", async () => {
    setupSession({ isHydrated: true, isAuthenticated: true });

    render(
      <GuestOnly>
        <div>Login page</div>
      </GuestOnly>,
    );

    expect(screen.queryByText("Login page")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows the loading screen while auth is hydrating", () => {
    setupSession({ isHydrated: false, isAuthenticated: false });

    const { container } = render(
      <GuestOnly>
        <div>Login page</div>
      </GuestOnly>,
    );

    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
