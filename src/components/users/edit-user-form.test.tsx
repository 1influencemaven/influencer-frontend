/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { EditUserForm } from "@/components/users/edit-user-form";
import { getUser, updateUser } from "@/services/users.service";
import { useRouter } from "@/i18n/navigation";

const editUserMessages = {
  nameLabel: "Name",
  namePlaceholder: "Jane Doe",
  emailLabel: "Email address",
  emailPlaceholder: "user@company.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Leave empty to keep current password",
  roleLabel: "Role",
  submit: "Save changes",
  submitting: "Saving...",
  cancel: "Cancel",
  loading: "Loading user...",
  backToList: "Back to list",
  roles: {
    USER: "User",
    ADMIN: "Administrator",
  },
  errors: {
    generic: "Could not update the user.",
    forbidden: "You do not have permission to edit users.",
    notFound: "The user does not exist.",
    loadFailed: "Could not load the user.",
    emailConflict: "A user with this email already exists.",
    nameRequired: "Name is required.",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name cannot exceed 100 characters.",
    emailRequired: "Email address is required.",
    emailInvalid: "Enter a valid email address.",
    passwordMin: "Password must be at least 8 characters.",
    roleRequired: "Select a role.",
  },
};

const mockReplace = jest.fn();

const translateEditUser = (key: string) => {
  if (key.startsWith("errors.")) {
    const nested = key.replace("errors.", "");
    return editUserMessages.errors[
      nested as keyof typeof editUserMessages.errors
    ];
  }

  if (key.startsWith("roles.")) {
    const role = key.replace("roles.", "");
    return editUserMessages.roles[
      role as keyof typeof editUserMessages.roles
    ];
  }

  return editUserMessages[key as keyof typeof editUserMessages] ?? key;
};

jest.mock("next-intl", () => ({
  useTranslations: () => translateEditUser,
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
  getUser: jest.fn(),
  updateUser: jest.fn(),
}));

const mockedGetUser = jest.mocked(getUser);
const mockedUpdateUser = jest.mocked(updateUser);
const mockedUseRouter = jest.mocked(useRouter);

describe("EditUserForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    } as never);
    mockedGetUser.mockResolvedValue({
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "USER",
    });
  });

  it("loads the user and renders the edit form", async () => {
    render(<EditUserForm userId="user-1" />);

    expect(await screen.findByLabelText(editUserMessages.nameLabel)).toHaveValue(
      "Jane Doe",
    );
    expect(screen.getByLabelText(editUserMessages.emailLabel)).toHaveValue(
      "jane@example.com",
    );
    expect(mockedGetUser).toHaveBeenCalledWith("user-1");
  });

  it("updates the user without sending an empty password", async () => {
    mockedUpdateUser.mockResolvedValue({
      id: "user-1",
      name: "Updated Name",
      email: "updated@example.com",
      role: "ADMIN",
    });

    const { user } = renderWithUser(<EditUserForm userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(editUserMessages.nameLabel)).toHaveValue(
        "Jane Doe",
      );
    });

    await user.clear(screen.getByLabelText(editUserMessages.nameLabel));
    await user.type(
      screen.getByLabelText(editUserMessages.nameLabel),
      "Updated Name",
    );
    await user.clear(screen.getByLabelText(editUserMessages.emailLabel));
    await user.type(
      screen.getByLabelText(editUserMessages.emailLabel),
      "updated@example.com",
    );
    await user.selectOptions(
      screen.getByLabelText(editUserMessages.roleLabel),
      "ADMIN",
    );
    await user.click(screen.getByRole("button", { name: editUserMessages.submit }));

    await waitFor(() => {
      expect(mockedUpdateUser).toHaveBeenCalledWith("user-1", {
        name: "Updated Name",
        email: "updated@example.com",
        role: "ADMIN",
      });
      expect(mockReplace).toHaveBeenCalledWith("/users");
    });
  });

  it("shows a not found message when the user cannot be loaded", async () => {
    mockedGetUser.mockRejectedValue({
      status: 404,
      message: "Not found",
    });

    render(<EditUserForm userId="missing-id" />);

    expect(await screen.findByText(editUserMessages.errors.notFound)).toBeInTheDocument();
  });
});
