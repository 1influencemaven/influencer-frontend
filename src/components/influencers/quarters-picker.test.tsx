/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuartersPicker } from "@/components/influencers/quarters-picker";

describe("QuartersPicker", () => {
  it("adds multiple quarters for a year without duplicates", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <QuartersPicker
        label="Quarters"
        yearLabel="Year"
        addLabel="Add"
        value={[{ year: 2026, quarter: "Q1" }]}
        onChange={onChange}
      />,
    );

    await user.clear(screen.getByLabelText("Year"));
    await user.type(screen.getByLabelText("Year"), "2026");
    await user.click(screen.getByRole("button", { name: "Q1" }));
    await user.click(screen.getByRole("button", { name: "Q3" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onChange).toHaveBeenCalledWith([
      { year: 2026, quarter: "Q1" },
      { year: 2026, quarter: "Q3" },
    ]);
  });
});
