/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { LoginForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/stores/auth.store";
import { getAuthErrorMessage, login, me } from "@/services/auth.service";
import { useRouter } from "@/i18n/navigation";

const loginMessages = {
  emailLabel: "Email address",
  emailPlaceholder: "you@brand.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Your password",
  submit: "Continue",
  submitting: "Signing in...",
  helper: "The session will use backend HttpOnly cookies.",
  errors: {
    invalidCredentials: "Invalid credentials. Check your email and password.",
    generic: "Could not sign in. Please try again.",
    emailRequired: "Email address is required.",
    emailInvalid: "Enter a valid email address.",
    passwordRequired: "Password is required.",
    passwordMin: "Password must be at least 8 characters.",
  },
};

const mockReplace = jest.fn();
const mockSetUser = jest.fn();
const mockSetLoading = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const [root, nested] = key.split(".") as [keyof typeof loginMessages, string?];

    if (nested && root === "errors") {
      return loginMessages.errors[nested as keyof typeof loginMessages.errors];
    }

    return loginMessages[root as keyof typeof loginMessages] ?? key;
  },
}));

jest.mock("../../i18n/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../services/auth.service", () => ({
  login: jest.fn(),
  me: jest.fn(),
  getAuthErrorMessage: jest.fn(),
}));

jest.mock("../../stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

const mockedLogin = jest.mocked(login);
const mockedMe = jest.mocked(me);
const mockedGetAuthErrorMessage = jest.mocked(getAuthErrorMessage);
const mockedUseRouter = jest.mocked(useRouter);
const mockedUseAuthStore = jest.mocked(useAuthStore);

const validCredentials = {
  email: "user@example.com",
  password: "password123",
};

const authenticatedUser = {
  id: "user-1",
  email: validCredentials.email,
  role: "USER" as const,
};

function setupAuthStoreMock(): void {
  mockedUseAuthStore.mockImplementation((selector) =>
    selector({
      setUser: mockSetUser,
      setLoading: mockSetLoading,
    } as never),
  );
}

async function fillValidCredentials(user: ReturnType<typeof renderWithUser>["user"]) {
  await user.type(screen.getByLabelText(loginMessages.emailLabel), validCredentials.email);
  await user.type(
    screen.getByLabelText(loginMessages.passwordLabel),
    validCredentials.password,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthStoreMock();
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    } as never);
    mockedGetAuthErrorMessage.mockImplementation((error) =>
      error instanceof Error ? error.message : "Could not sign in. Please try again.",
    );
  });

  it("renders the login form fields and actions", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(loginMessages.emailLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(loginMessages.passwordLabel)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: loginMessages.submit }),
    ).toBeInTheDocument();
    expect(screen.getByText(loginMessages.helper)).toBeInTheDocument();
  });

  describe("Zod validation", () => {
    it("shows validation errors when required fields are empty", async () => {
      const { user } = renderWithUser(<LoginForm />);

      await user.click(screen.getByRole("button", { name: loginMessages.submit }));

      await waitFor(() => {
        expect(screen.getByText(loginMessages.errors.emailRequired)).toBeInTheDocument();
        expect(screen.getByText(loginMessages.errors.passwordRequired)).toBeInTheDocument();
      });

      expect(mockedLogin).not.toHaveBeenCalled();
    });

    it("shows email and password format errors", async () => {
      const { user } = renderWithUser(<LoginForm />);

      await user.type(screen.getByLabelText(loginMessages.emailLabel), "invalid-email");
      await user.type(screen.getByLabelText(loginMessages.passwordLabel), "short");
      await user.click(screen.getByRole("button", { name: loginMessages.submit }));

      await waitFor(() => {
        expect(screen.getByText(loginMessages.errors.emailInvalid)).toBeInTheDocument();
        expect(screen.getByText(loginMessages.errors.passwordMin)).toBeInTheDocument();
      });

      expect(mockedLogin).not.toHaveBeenCalled();
    });
  });

  describe("submit flow", () => {
    it("logs in, hydrates the session and redirects to the dashboard", async () => {
      mockedLogin.mockResolvedValue({
        user: {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
        },
      });
      mockedMe.mockResolvedValue(authenticatedUser);

      const { user } = renderWithUser(<LoginForm />);
      await fillValidCredentials(user);
      await user.click(screen.getByRole("button", { name: loginMessages.submit }));

      await waitFor(() => {
        expect(mockedLogin).toHaveBeenCalledWith(validCredentials);
        expect(mockedMe).toHaveBeenCalledTimes(1);
        expect(mockSetUser).toHaveBeenCalledWith(authenticatedUser);
        expect(mockReplace).toHaveBeenCalledWith("/dashboard");
      });

      expect(mockSetLoading).toHaveBeenNthCalledWith(1, true);
      expect(mockSetLoading).toHaveBeenLastCalledWith(false);
    });

    it("shows invalid credentials when the backend returns 401", async () => {
      mockedLogin.mockRejectedValue({
        status: 401,
        message: "Invalid credentials",
      });

      const { user } = renderWithUser(<LoginForm />);
      await fillValidCredentials(user);
      await user.click(screen.getByRole("button", { name: loginMessages.submit }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          loginMessages.errors.invalidCredentials,
        );
      });

      expect(mockedMe).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(mockSetLoading).toHaveBeenLastCalledWith(false);
    });

    it("shows a backend error message for non-auth failures", async () => {
      mockedLogin.mockRejectedValue({
        status: 500,
        message: "Internal server error",
      });
      mockedGetAuthErrorMessage.mockReturnValue("Internal server error");

      const { user } = renderWithUser(<LoginForm />);
      await fillValidCredentials(user);
      await user.click(screen.getByRole("button", { name: loginMessages.submit }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Internal server error",
        );
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("falls back to the generic error when no message is available", async () => {
      mockedLogin.mockRejectedValue(new Error(""));
      mockedGetAuthErrorMessage.mockReturnValue("");

      const { user } = renderWithUser(<LoginForm />);
      await fillValidCredentials(user);
      await user.click(screen.getByRole("button", { name: loginMessages.submit }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          loginMessages.errors.generic,
        );
      });
    });
  });

  describe("loading state", () => {
    it("disables the form and shows the submitting label while logging in", async () => {
      let resolveLogin: (value: unknown) => void = () => undefined;

      mockedLogin.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve;
          }),
      );
      mockedMe.mockResolvedValue(authenticatedUser);

      const { user } = renderWithUser(<LoginForm />);
      await fillValidCredentials(user);
      await user.click(screen.getByRole("button", { name: loginMessages.submit }));

      expect(await screen.findByRole("button", { name: loginMessages.submitting })).toBeDisabled();
      expect(screen.getByLabelText(loginMessages.emailLabel)).toBeDisabled();
      expect(screen.getByLabelText(loginMessages.passwordLabel)).toBeDisabled();
      expect(mockSetLoading).toHaveBeenCalledWith(true);

      resolveLogin({
        user: {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
        },
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard");
      });

      expect(mockSetLoading).toHaveBeenLastCalledWith(false);
    });
  });
});
