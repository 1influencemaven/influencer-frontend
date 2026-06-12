import { screen } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("Input", () => {
  it("renders with an associated label", () => {
    renderWithUser(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="you@example.com" />
      </>,
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const handleChange = jest.fn();
    const { user } = renderWithUser(
      <Input aria-label="Email" onChange={handleChange} />,
    );

    await user.type(screen.getByLabelText("Email"), "user@example.com");

    expect(handleChange).toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveValue("user@example.com");
  });

  it("supports disabled state", async () => {
    const handleChange = jest.fn();
    const { user } = renderWithUser(
      <Input aria-label="Email" disabled onChange={handleChange} />,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toBeDisabled();

    await user.type(input, "user@example.com");

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("exposes invalid state for accessibility", () => {
    renderWithUser(<Input aria-label="Email" aria-invalid="true" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
