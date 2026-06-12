import { render, screen } from "@testing-library/react";

import { AppSidebar } from "@/components/app-sidebar";

jest.mock("./layout/sidebar-content", () => ({
  SidebarContent: () => <nav aria-label="Main sidebar">Sidebar content</nav>,
}));

describe("AppSidebar", () => {
  it("renders an aside landmark with sidebar content", () => {
    render(<AppSidebar />);

    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByLabelText("Main sidebar")).toBeInTheDocument();
  });
});
