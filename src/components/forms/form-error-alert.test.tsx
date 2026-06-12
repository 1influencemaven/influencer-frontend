import { render, screen } from "@testing-library/react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";

describe("FormErrorAlert", () => {
  it("renders nothing when message is empty", () => {
    const { container } = render(<FormErrorAlert message="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders an accessible alert with the error message", () => {
    render(<FormErrorAlert message="Invalid credentials" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Invalid credentials");
  });
});
