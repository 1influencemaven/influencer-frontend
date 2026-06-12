import { render, screen } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { SidebarContent } from "@/components/layout/sidebar-content";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      brand: "Influencer AI",
      tagline: "Control panel",
      dashboard: "Dashboard",
      campaigns: "Campaigns",
      creators: "Creators",
      users: "Users",
      settings: "Settings",
    };

    return labels[key] ?? key;
  },
}));

jest.mock("../../i18n/navigation", () => ({
  Link: ({
    href,
    children,
    onClick,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
  usePathname: jest.fn(() => "/dashboard"),
}));

jest.mock("../../hooks/use-role", () => ({
  useRole: jest.fn(() => ({
    user: {
      id: "user-1",
      email: "user@example.com",
      role: "USER",
    },
    role: "USER",
  })),
}));

jest.mock("../dashboard/role-badge", () => ({
  RoleBadge: ({ role }: { role: string }) => (
    <span data-testid="role-badge">{role}</span>
  ),
}));

describe("SidebarContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders brand, navigation and the authenticated user section", () => {
    render(<SidebarContent />);

    expect(screen.getByText("Influencer AI")).toBeInTheDocument();
    expect(screen.getByText("Control panel")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("role-badge")).toHaveTextContent("USER");
  });

  it("marks the active route in the navigation", () => {
    render(<SidebarContent />);

    const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
    expect(dashboardLink.className).toContain("border-primary");
  });

  it("calls onNavigate when a link is clicked", async () => {
    const onNavigate = jest.fn();
    const { user } = renderWithUser(
      <SidebarContent onNavigate={onNavigate} />,
    );

    await user.click(screen.getByRole("link", { name: /Campaigns/i }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("hides admin-only links for regular users", () => {
    render(<SidebarContent />);

    expect(screen.queryByRole("link", { name: /Users/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/i })).toBeInTheDocument();
  });
});
