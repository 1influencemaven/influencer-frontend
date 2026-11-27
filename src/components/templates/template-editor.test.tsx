/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TemplateEditor } from "@/components/templates/template-editor";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

const replace = jest.fn();
jest.mock("../../i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useRouter: () => ({ replace, push: jest.fn() }),
}));

// The rich editor is covered by Tiptap itself; here a textarea stands in for it.
jest.mock("./template-body-editor", () => ({
  TemplateBodyEditor: ({ initialHtml, onChange }: { initialHtml: string; onChange: (v: string) => void }) => (
    <textarea aria-label="body" defaultValue={initialHtml} onChange={(e) => onChange(e.target.value)} />
  ),
}));
jest.mock("./template-preview-sheet", () => ({ TemplatePreviewSheet: () => null }));
jest.mock("./variable-picker", () => ({
  VariablePicker: ({ onSelect, label }: { onSelect: (v: { key: string; token: string }) => void; label?: string }) => (
    <button type="button" onClick={() => onSelect({ key: "firstName", token: "{{firstName}}" })}>
      {`pick-${label ?? "icon"}`}
    </button>
  ),
}));

const api = {
  createTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  getTemplate: jest.fn(),
  validateTemplate: jest.fn().mockResolvedValue({ valid: true, issues: [] }),
};
jest.mock("../../services/templates.service", () => ({
  createTemplate: (...a: unknown[]) => api.createTemplate(...a),
  updateTemplate: (...a: unknown[]) => api.updateTemplate(...a),
  getTemplate: (...a: unknown[]) => api.getTemplate(...a),
  validateTemplate: (...a: unknown[]) => api.validateTemplate(...a),
  getVariablesCatalog: jest.fn().mockResolvedValue({ groups: { influencer: [], prospect: [], custom: [] } }),
  listTemplates: jest.fn(),
  setTemplateArchived: jest.fn(),
  exportTemplateForSaleshandy: jest.fn(),
}));
jest.mock("../../services/influencers.service", () => ({ getInfluencer: jest.fn().mockResolvedValue({ name: "Sofía" }) }));

function renderEditor(templateId?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TemplateEditor influencerId="i1" templateId={templateId} />
    </QueryClientProvider>,
  );
}

beforeEach(() => jest.clearAllMocks());

describe("TemplateEditor", () => {
  it("flags required fields and does not call the API", async () => {
    renderEditor();
    await userEvent.click(screen.getByRole("button", { name: "create" }));
    expect(screen.getByText("errors.name")).toBeInTheDocument();
    expect(screen.getByText("errors.subject")).toBeInTheDocument();
    expect(screen.getByText("errors.body")).toBeInTheDocument();
    expect(api.createTemplate).not.toHaveBeenCalled();
  });

  it("inserts a variable at the subject cursor and creates the template", async () => {
    api.createTemplate.mockResolvedValue({ id: "t9" });
    renderEditor();
    await userEvent.type(screen.getByPlaceholderText("namePlaceholder"), "Intro");
    const subject = screen.getByPlaceholderText("subjectPlaceholder") as HTMLInputElement;
    await userEvent.type(subject, "Hola , gracias");
    subject.setSelectionRange(5, 5);
    await userEvent.click(screen.getByRole("button", { name: "pick-insertVariable" }));
    expect(subject.value).toBe("Hola {{firstName}}, gracias");
    fireEvent.change(screen.getByLabelText("body"), { target: { value: "<p>Cuerpo</p>" } });
    await userEvent.click(screen.getByRole("button", { name: "create" }));
    await waitFor(() => expect(api.createTemplate).toHaveBeenCalled());
    expect(api.createTemplate.mock.calls[0][0]).toEqual({
      influencerId: "i1",
      name: "Intro",
      subject: "Hola {{firstName}}, gracias",
      bodyHtml: "<p>Cuerpo</p>",
    });
    expect(replace).toHaveBeenCalledWith("/dashboard/creators/i1/templates/t9");
  });

  it("loads a saved template and only sends changed fields", async () => {
    api.getTemplate.mockResolvedValue({
      id: "t1", influencerId: "i1", name: "Intro", subject: "Hola", preHeader: null, bodyHtml: "<p>x</p>",
      status: "ACTIVE", validation: { valid: true, issues: [] },
    });
    api.updateTemplate.mockResolvedValue({ id: "t1", status: "ACTIVE", validation: { valid: true, issues: [] } });
    renderEditor("t1");
    const name = await screen.findByDisplayValue("Intro");
    await userEvent.type(name, " v2");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(api.updateTemplate).toHaveBeenCalledWith("t1", { name: "Intro v2" }));
  });
});
