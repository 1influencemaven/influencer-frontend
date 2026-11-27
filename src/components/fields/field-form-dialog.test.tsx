/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FieldFormDialog, previewKey } from "@/components/fields/field-form-dialog";
import type { CustomField } from "@/types/fields";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const field: CustomField = {
  id: "f1",
  key: "dealStage",
  label: "Deal Stage",
  fieldType: "dropdown",
  origin: "CUSTOM",
  fallbackText: null,
  metadata: { options: ["Open", "Won"] },
  tags: ["CRM"],
  isActive: true,
  disabledReason: null,
  editable: true,
  saleshandyFieldId: "r1",
  systemMapping: null,
  lastSyncedAt: null,
  createdAt: "2026-11-25T00:00:00.000Z",
  updatedAt: "2026-11-25T00:00:00.000Z",
};

function setup(target: CustomField | null) {
  const onCreate = jest.fn().mockResolvedValue(undefined);
  const onUpdate = jest.fn().mockResolvedValue(undefined);
  const onClose = jest.fn();
  render(
    <FieldFormDialog
      field={target}
      availableTags={["CRM", "Sales"]}
      onClose={onClose}
      onCreate={onCreate}
      onUpdate={onUpdate}
    />,
  );
  return { onCreate, onUpdate, onClose, user: userEvent.setup() };
}

describe("previewKey", () => {
  it("matches the backend key format", () => {
    expect(previewKey("Deal Stage")).toBe("dealStage");
    expect(previewKey("Año de fundación")).toBe("anoDeFundacion");
    expect(previewKey("2024 Budget")).toBe("field2024Budget");
    expect(previewKey("   ")).toBe("");
  });
});

describe("FieldFormDialog", () => {
  it("creates a dropdown field only after adding options", async () => {
    const { onCreate, user } = setup(null);
    await user.type(screen.getByLabelText(/form.label/), "Plan Tier");
    await user.click(screen.getByRole("radio", { name: "types.dropdown" }));
    await user.click(screen.getByRole("button", { name: "form.create" }));
    expect(screen.getByRole("alert")).toHaveTextContent("form.errors.optionsRequired");
    expect(onCreate).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("form.options"), "Free{Enter}Pro{Enter}pro{Enter}");
    await user.click(screen.getByRole("button", { name: "form.create" }));
    expect(onCreate).toHaveBeenCalledWith({
      label: "Plan Tier",
      fieldType: "dropdown",
      metadata: { options: ["Free", "Pro"] },
    });
  });

  it("edit omits tags when untouched", async () => {
    const { onUpdate, user } = setup(field);
    expect(screen.queryByText("form.tagsReplaceWarning")).not.toBeInTheDocument();
    const label = screen.getByLabelText(/form.label/);
    await user.clear(label);
    await user.type(label, "Pipeline Stage");
    await user.click(screen.getByRole("button", { name: "form.save" }));
    expect(onUpdate).toHaveBeenCalledWith("f1", { label: "Pipeline Stage" });
  });

  it("edit sends the full tag list and warns about replacement", async () => {
    const { onUpdate, user } = setup(field);
    await user.type(screen.getByLabelText("form.tags"), "Sales{Enter}");
    expect(screen.getByText("form.tagsReplaceWarning")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "form.save" }));
    expect(onUpdate).toHaveBeenCalledWith("f1", { tags: ["CRM", "Sales"] });
  });

  it("locks the type when editing", () => {
    setup(field);
    expect(screen.getByRole("radio", { name: "types.dropdown" })).toBeDisabled();
    expect(screen.getByText("form.typeLocked")).toBeInTheDocument();
  });
});
