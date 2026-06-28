/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { UsersTable } from "@/components/users/users-table";
import { deleteUser, listUsers } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth.store";

const usersMessages = {
  loading: "Loading users...",
  loadError: "Could not load users.",
  retry: "Retry",
  emptyState: "No users listed yet.",
  deleteConfirm: "Delete this user?",
  deleteConfirmAction: "Confirm",
  deleteCancel: "Cancel",
  deleting: "Deleting...",
  editAction: "Edit",
  deleteAction: "Delete",
  deleteForbidden: "You cannot delete your own account.",
  deleteError: "Could not delete the user.",
  columns: {
    name: "Name",
    email: "Email",
    role: "Role",
    createdAt: "Created",
    actions: "Actions",
  },
};

const translateUsers = (key: string) => {
  if (key.startsWith("columns.")) {
    const column = key.replace("columns.", "");
    return usersMessages.columns[column as keyof typeof usersMessages.columns];
  }

  return usersMessages[key as keyof typeof usersMessages] ?? key;
};

jest.mock("next-intl", () => ({
  useTranslations: () => translateUsers,
  useLocale: () => "en",
}));

jest.mock("../../i18n/navigation", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("../../services/users.service", () => ({
  listUsers: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("../../stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

const mockedListUsers = jest.mocked(listUsers);
const mockedDeleteUser = jest.mocked(deleteUser);
const mockedUseAuthStore = jest.mocked(useAuthStore);

const mockUsers = [
  {
    id: "user-1",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "USER" as const,
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN" as const,
    createdAt: "2026-06-02T10:00:00.000Z",
  },
];

describe("UsersTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { id: "admin-1", email: "admin@example.com", role: "ADMIN" },
        isAuthenticated: true,
        isHydrated: true,
        loading: false,
        setUser: jest.fn(),
        clearUser: jest.fn(),
        setHydrated: jest.fn(),
        setLoading: jest.fn(),
      }),
    );
  });

  it("renders users after loading", async () => {
    mockedListUsers.mockResolvedValue(mockUsers);

    render(<UsersTable />);

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows the empty state when there are no users", async () => {
    mockedListUsers.mockResolvedValue([]);

    render(<UsersTable />);

    expect(await screen.findByText(usersMessages.emptyState)).toBeInTheDocument();
  });

  it("shows a retry action when loading fails", async () => {
    mockedListUsers.mockRejectedValue("unknown");

    render(<UsersTable />);

    expect(await screen.findByText(usersMessages.loadError)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: usersMessages.retry })).toBeInTheDocument();
  });

  it("renders edit links for each user", async () => {
    mockedListUsers.mockResolvedValue(mockUsers);

    render(<UsersTable />);

    await screen.findByText("Jane Doe");

    const editLinks = screen.getAllByRole("link", { name: usersMessages.editAction });
    expect(editLinks[0]).toHaveAttribute("href", "/users/user-1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/users/admin-1/edit");
  });

  it("deletes a user after inline confirmation", async () => {
    mockedListUsers.mockResolvedValue(mockUsers);
    mockedDeleteUser.mockResolvedValue({ message: "User deleted successfully" });

    const { user } = renderWithUser(<UsersTable />);

    await screen.findByText("Jane Doe");

    const deleteButtons = screen.getAllByRole("button", {
      name: usersMessages.deleteAction,
    });
    await user.click(deleteButtons[0]);

    expect(screen.getByText(usersMessages.deleteConfirm)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: usersMessages.deleteConfirmAction }),
    );

    await waitFor(() => {
      expect(mockedDeleteUser).toHaveBeenCalledWith("user-1");
    });

    await waitFor(() => {
      expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
    });
  });

  it("disables delete for the current user", async () => {
    mockedListUsers.mockResolvedValue(mockUsers);

    render(<UsersTable />);

    await screen.findByText("Admin User");

    const adminRow = screen.getByText("Admin User").closest("tr");
    const adminDeleteButton = adminRow?.querySelector("button");

    expect(adminDeleteButton).toBeDisabled();
  });
});
