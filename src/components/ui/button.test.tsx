import { screen } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label", () => {
    renderWithUser(<Button>Continue</Button>);

    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    const { user } = renderWithUser(
      <Button onClick={handleClick}>Continue</Button>,
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire click events when disabled", async () => {
    const handleClick = jest.fn();
    const { user } = renderWithUser(
      <Button disabled onClick={handleClick}>
        Continue
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("supports a loading-style disabled state", () => {
    renderWithUser(
      <Button disabled aria-busy="true">
        Saving...
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("renders as a child element when asChild is enabled", () => {
    renderWithUser(
      <Button asChild>
        <a href="/dashboard">Go to dashboard</a>
      </Button>,
    );

    expect(
      screen.getByRole("link", { name: "Go to dashboard" }),
    ).toBeInTheDocument();
  });
});
