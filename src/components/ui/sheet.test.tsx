import { render, screen } from "@testing-library/react";

import { renderWithUser } from "@/components/component-test-utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

describe("Sheet", () => {
  it("opens content when the trigger is clicked", async () => {
    const { user } = renderWithUser(
      <Sheet>
        <SheetTrigger>Open settings</SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Manage your preferences</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByRole("button", { name: "Open settings" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Manage your preferences")).toBeInTheDocument();
  });

  it("provides an accessible close control", async () => {
    const { user } = renderWithUser(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports a disabled trigger", () => {
    render(
      <Sheet>
        <SheetTrigger disabled>Open settings</SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("button", { name: "Open settings" })).toBeDisabled();
  });
});
