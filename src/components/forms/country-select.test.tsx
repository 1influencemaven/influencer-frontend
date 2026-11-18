/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CountrySelect } from "@/components/forms/country-select";

describe("CountrySelect", () => {
  it("renders label, search and country options", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CountrySelect
        label="Country where the talent is located"
        placeholder="Select a country"
        searchPlaceholder="Search country…"
        value=""
        onChange={onChange}
        locale="en"
      />,
    );

    expect(
      screen.getByLabelText("Country where the talent is located"),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search country…"), "Colom");
    const select = screen.getByLabelText(
      "Country where the talent is located",
    ) as HTMLSelectElement;
    expect(
      Array.from(select.options).some((option) => option.value === "CO"),
    ).toBe(true);

    await user.selectOptions(select, "CO");
    expect(onChange).toHaveBeenCalledWith("CO");
  });
});
