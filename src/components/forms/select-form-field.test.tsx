import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { render, screen, waitFor } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import { SelectFormField } from "@/components/forms/select-form-field";

type FormValues = {
  role: string;
};

const roleOptions = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
] as const;

function SelectFieldHarness({
  disabled,
  errorMessage,
}: {
  disabled?: boolean;
  errorMessage?: string;
}) {
  const form = useForm<FormValues>({
    defaultValues: { role: "" },
  });

  useEffect(() => {
    if (errorMessage) {
      form.setError("role", { type: "manual", message: errorMessage });
    }
  }, [errorMessage, form]);

  return (
    <SelectFormField
      control={form.control}
      name="role"
      label="Role"
      placeholder="Select a role"
      options={roleOptions}
      disabled={disabled}
    />
  );
}

describe("SelectFormField", () => {
  it("renders a labeled select with options", () => {
    render(<SelectFieldHarness />);

    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "User" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
  });

  it("updates the selected value", async () => {
    const { user } = renderWithUser(<SelectFieldHarness />);

    await user.selectOptions(screen.getByLabelText("Role"), "ADMIN");

    expect(screen.getByLabelText("Role")).toHaveValue("ADMIN");
  });

  it("supports disabled state", () => {
    render(<SelectFieldHarness disabled />);

    expect(screen.getByLabelText("Role")).toBeDisabled();
  });

  it("shows validation errors with alert semantics", async () => {
    render(<SelectFieldHarness errorMessage="Role required" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Role required");
    });

    expect(screen.getByLabelText("Role")).toHaveAttribute("aria-invalid", "true");
  });
});
