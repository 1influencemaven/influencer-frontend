/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { RoleGate } from "@/components/auth/role-gate";
import { useRole } from "@/hooks/use-role";
import type { UserRole } from "@/types/auth";

jest.mock("../../hooks/use-role", () => ({
  useRole: jest.fn(),
}));

const mockedUseRole = jest.mocked(useRole);

function setupRole(role: UserRole | null) {
  mockedUseRole.mockReturnValue({
    canAccess: (roles: readonly UserRole[]) =>
      role ? roles.includes(role) : false,
  } as never);
}

describe("RoleGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders admin-only content for ADMIN users", () => {
    setupRole("ADMIN");

    render(
      <RoleGate roles={["ADMIN"]}>
        <div>Admin controls</div>
      </RoleGate>,
    );

    expect(screen.getByText("Admin controls")).toBeInTheDocument();
  });

  it("hides admin-only content from USER users", () => {
    setupRole("USER");

    render(
      <RoleGate roles={["ADMIN"]}>
        <div>Admin controls</div>
      </RoleGate>,
    );

    expect(screen.queryByText("Admin controls")).not.toBeInTheDocument();
  });

  it("renders shared content for USER users", () => {
    setupRole("USER");

    render(
      <RoleGate roles={["USER", "ADMIN"]}>
        <div>Shared dashboard</div>
      </RoleGate>,
    );

    expect(screen.getByText("Shared dashboard")).toBeInTheDocument();
  });

  it("supports custom fallbacks when access is denied", () => {
    setupRole("USER");

    render(
      <RoleGate roles={["ADMIN"]} fallback={<div>Access denied</div>}>
        <div>Admin controls</div>
      </RoleGate>,
    );

    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(screen.queryByText("Admin controls")).not.toBeInTheDocument();
  });
});
