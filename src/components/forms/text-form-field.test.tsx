import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { render, screen, waitFor } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { TextFormField } from "@/components/forms/text-form-field";

type FormValues = {
  email: string;
};

function TextFieldHarness({
  disabled,
  errorMessage,
}: {
  disabled?: boolean;
  errorMessage?: string;
}) {
  const form = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (errorMessage) {
      form.setError("email", { type: "manual", message: errorMessage });
    }
  }, [errorMessage, form]);

  return (
    <TextFormField
      control={form.control}
      name="email"
      label="Email"
      placeholder="you@example.com"
      disabled={disabled}
    />
  );
}

describe("TextFormField", () => {
  it("renders a labeled input", () => {
    render(<TextFieldHarness />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const { user } = renderWithUser(<TextFieldHarness />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");

    expect(screen.getByLabelText("Email")).toHaveValue("user@example.com");
  });

  it("supports disabled state", () => {
    render(<TextFieldHarness disabled />);

    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("shows validation errors with alert semantics", async () => {
    render(<TextFieldHarness errorMessage="Email required" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email required");
    });

    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});
