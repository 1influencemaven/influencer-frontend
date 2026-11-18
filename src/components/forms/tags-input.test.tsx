/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TagsInput } from "@/components/forms/tags-input";

describe("TagsInput", () => {
  it("adds niches with Enter and removes chips", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { rerender } = render(
      <TagsInput
        id="niches"
        label="Niches"
        value={[]}
        onChange={onChange}
        placeholder="Add niche"
      />,
    );

    await user.type(screen.getByLabelText("Niches"), "Fitness{Enter}");
    expect(onChange).toHaveBeenCalledWith(["Fitness"]);

    rerender(
      <TagsInput
        id="niches"
        label="Niches"
        value={["Fitness"]}
        onChange={onChange}
        placeholder="Add niche"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove Fitness" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
