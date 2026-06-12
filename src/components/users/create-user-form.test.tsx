/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { CreateUserForm } from "@/components/users/create-user-form";
import { createUser } from "@/services/users.service";
import { useRouter } from "@/i18n/navigation";

const createUserMessages = {
  nameLabel: "Name",
  namePlaceholder: "Jane Doe",
  emailLabel: "Email address",
  emailPlaceholder: "user@company.com",
  passwordLabel: "Password",
  passwordPlaceholder: "At least 8 characters",
  roleLabel: "Role",
  submit: "Create user",
  submitting: "Creating user...",
  cancel: "Cancel",
  roles: {
    USER: "User",
    ADMIN: "Administrator",
  },
  errors: {
    generic: "Could not create the user. Please try again.",
    forbidden: "You do not have permission to create users.",
    emailConflict: "A user with this email already exists.",
    nameRequired: "Name is required.",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name cannot exceed 100 characters.",
    emailRequired: "Email address is required.",
    emailInvalid: "Enter a valid email address.",
    passwordRequired: "Password is required.",
    passwordMin: "Password must be at least 8 characters.",
    roleRequired: "Select a role.",
  },
};

const mockReplace = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key.startsWith("errors.")) {
      const nested = key.replace("errors.", "");
      return createUserMessages.errors[
        nested as keyof typeof createUserMessages.errors
      ];
    }

    if (key.startsWith("roles.")) {
      const role = key.replace("roles.", "");
      return createUserMessages.roles[
        role as keyof typeof createUserMessages.roles
      ];
    }

    return createUserMessages[key as keyof typeof createUserMessages] ?? key;
  },
}));

jest.mock("../../i18n/navigation", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
  useRouter: jest.fn(),
}));

jest.mock("../../services/users.service", () => ({
  createUser: jest.fn(),
}));

const mockedCreateUser = jest.mocked(createUser);
const mockedUseRouter = jest.mocked(useRouter);

const validPayload = {
  name: "Jane Doe",
  email: "jane@company.com",
  password: "password123",
  role: "USER" as const,
};

async function fillValidForm(
  user: ReturnType<typeof renderWithUser>["user"],
  overrides: Partial<typeof validPayload> = {},
) {
  const values = { ...validPayload, ...overrides };

  await user.type(screen.getByLabelText(createUserMessages.nameLabel), values.name);
  await user.type(screen.getByLabelText(createUserMessages.emailLabel), values.email);
  await user.type(
    screen.getByLabelText(createUserMessages.passwordLabel),
    values.password,
  );
  await user.selectOptions(
    screen.getByLabelText(createUserMessages.roleLabel),
    values.role,
  );
}

describe("CreateUserForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    } as never);
  });

  it("renders the register form fields and actions", () => {
    render(<CreateUserForm />);

    expect(screen.getByLabelText(createUserMessages.nameLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(createUserMessages.emailLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(createUserMessages.passwordLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(createUserMessages.roleLabel)).toBeInTheDocument();
    expect(screen.getByRole("option", { name: createUserMessages.roles.USER })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: createUserMessages.roles.ADMIN })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: createUserMessages.submit }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: createUserMessages.cancel })).toHaveAttribute(
      "href",
      "/users",
    );
  });

  describe("validations", () => {
    it("shows validation errors for empty required fields", async () => {
      const { user } = renderWithUser(<CreateUserForm />);

      await user.clear(screen.getByLabelText(createUserMessages.nameLabel));
      await user.clear(screen.getByLabelText(createUserMessages.emailLabel));
      await user.clear(screen.getByLabelText(createUserMessages.passwordLabel));
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(screen.getByText(createUserMessages.errors.nameRequired)).toBeInTheDocument();
        expect(screen.getByText(createUserMessages.errors.emailRequired)).toBeInTheDocument();
        expect(screen.getByText(createUserMessages.errors.passwordRequired)).toBeInTheDocument();
      });

      expect(mockedCreateUser).not.toHaveBeenCalled();
    });

    it("shows field format and length errors", async () => {
      const { user } = renderWithUser(<CreateUserForm />);

      await user.type(screen.getByLabelText(createUserMessages.nameLabel), "A");
      await user.type(screen.getByLabelText(createUserMessages.emailLabel), "invalid-email");
      await user.type(screen.getByLabelText(createUserMessages.passwordLabel), "short");
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(screen.getByText(createUserMessages.errors.nameMin)).toBeInTheDocument();
        expect(screen.getByText(createUserMessages.errors.emailInvalid)).toBeInTheDocument();
        expect(screen.getByText(createUserMessages.errors.passwordMin)).toBeInTheDocument();
      });
    });
  });

  describe("submit flow", () => {
    it("creates a user and redirects to the users list", async () => {
      mockedCreateUser.mockResolvedValue({
        id: "user-1",
        email: validPayload.email,
        role: validPayload.role,
        name: validPayload.name,
      });

      const { user } = renderWithUser(<CreateUserForm />);
      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(mockedCreateUser).toHaveBeenCalledWith(validPayload);
        expect(mockReplace).toHaveBeenCalledWith("/users");
      });
    });

    it("allows registering an administrator account", async () => {
      mockedCreateUser.mockResolvedValue({
        id: "admin-1",
        email: "admin@company.com",
        role: "ADMIN",
        name: "Admin User",
      });

      const { user } = renderWithUser(<CreateUserForm />);
      await fillValidForm(user, {
        name: "Admin User",
        email: "admin@company.com",
        role: "ADMIN",
      });
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(mockedCreateUser).toHaveBeenCalledWith({
          name: "Admin User",
          email: "admin@company.com",
          password: validPayload.password,
          role: "ADMIN",
        });
      });
    });

    it("shows an email conflict error from the backend", async () => {
      mockedCreateUser.mockRejectedValue({
        status: 409,
        message: "Email already exists",
      });

      const { user } = renderWithUser(<CreateUserForm />);
      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          createUserMessages.errors.emailConflict,
        );
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("shows a forbidden error when the user lacks permissions", async () => {
      mockedCreateUser.mockRejectedValue({
        status: 403,
        message: "Forbidden",
      });

      const { user } = renderWithUser(<CreateUserForm />);
      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          createUserMessages.errors.forbidden,
        );
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("shows the backend error message for unexpected failures", async () => {
      mockedCreateUser.mockRejectedValue({
        status: 500,
        message: "Internal server error",
      });

      const { user } = renderWithUser(<CreateUserForm />);
      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Internal server error",
        );
      });
    });

    it("falls back to the generic error when no message is available", async () => {
      mockedCreateUser.mockRejectedValue("unknown");

      const { user } = renderWithUser(<CreateUserForm />);
      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          createUserMessages.errors.generic,
        );
      });
    });
  });

  describe("loading state", () => {
    it("disables the form while the user is being created", async () => {
      let resolveCreateUser: (value: unknown) => void = () => undefined;

      mockedCreateUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCreateUser = resolve;
          }),
      );

      const { user } = renderWithUser(<CreateUserForm />);
      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: createUserMessages.submit }));

      expect(
        await screen.findByRole("button", { name: createUserMessages.submitting }),
      ).toBeDisabled();
      expect(screen.getByLabelText(createUserMessages.nameLabel)).toBeDisabled();

      resolveCreateUser({
        id: "user-1",
        email: validPayload.email,
        role: validPayload.role,
        name: validPayload.name,
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/users");
      });
    });
  });
});
