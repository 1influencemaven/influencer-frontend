/**
 * @jest-environment node
 */

import { isNavItemActive } from "@/config/dashboard-nav";

describe("isNavItemActive", () => {
  it("matches the dashboard route exactly", () => {
    expect(isNavItemActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavItemActive("/dashboard/campaigns", "/dashboard")).toBe(false);
  });

  it("matches nested routes for non-dashboard items", () => {
    expect(isNavItemActive("/dashboard/campaigns", "/dashboard/campaigns")).toBe(
      true,
    );
    expect(
      isNavItemActive("/dashboard/campaigns/new", "/dashboard/campaigns"),
    ).toBe(true);
    expect(isNavItemActive("/dashboard/settings", "/dashboard/campaigns")).toBe(
      false,
    );
  });
});
