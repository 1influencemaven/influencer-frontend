/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApproveAllButton, ApproveProspectButton } from "@/components/prospects/approve-prospect-button";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

const service = {
  getApprovedIds: jest.fn(),
  approveContacts: jest.fn(),
  unapproveContacts: jest.fn(),
};
jest.mock("../../services/prospects.service", () => ({
  getApprovedIds: (...a: unknown[]) => service.getApprovedIds(...a),
  approveContacts: (...a: unknown[]) => service.approveContacts(...a),
  unapproveContacts: (...a: unknown[]) => service.unapproveContacts(...a),
  importProspectsCsv: jest.fn(),
  listProspects: jest.fn(),
  updateProspect: jest.fn(),
}));

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
  service.getApprovedIds.mockResolvedValue({ leadIds: [], brandBusinessContactIds: ["bc-approved"], agencyContactIds: [] });
});

describe("ApproveProspectButton", () => {
  it("approves a contact and shows the approved state", async () => {
    service.approveContacts.mockResolvedValue([{ type: "BRAND_CONTACT", id: "bc1", outcome: "created", prospectId: "p1" }]);
    renderWithClient(<ApproveProspectButton type="BRAND_CONTACT" id="bc1" influencerId="i1" />);
    await userEvent.click(await screen.findByRole("button", { name: "approve" }));
    expect(service.approveContacts).toHaveBeenCalledWith([{ type: "BRAND_CONTACT", id: "bc1", influencerId: "i1" }]);
    expect(await screen.findByText("approved")).toBeInTheDocument();
  });

  it("shows why a contact was skipped", async () => {
    service.approveContacts.mockResolvedValue([{ type: "LEAD", id: "l1", outcome: "skipped", reason: "NO_VALID_EMAIL" }]);
    renderWithClient(<ApproveProspectButton type="LEAD" id="l1" influencerId="i1" />);
    await userEvent.click(await screen.findByRole("button", { name: "approve" }));
    expect(await screen.findByText("skip.NO_VALID_EMAIL")).toBeInTheDocument();
  });

  it("reflects already-approved contacts and lets the user remove them", async () => {
    service.unapproveContacts.mockResolvedValue({ archived: 1 });
    renderWithClient(<ApproveProspectButton type="BRAND_CONTACT" id="bc-approved" influencerId="i1" />);
    expect(await screen.findByText("approved")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "remove" }));
    await waitFor(() =>
      expect(service.unapproveContacts).toHaveBeenCalledWith([{ type: "BRAND_CONTACT", id: "bc-approved", influencerId: "i1" }]),
    );
    expect(await screen.findByRole("button", { name: "approve" })).toBeInTheDocument();
  });
});

describe("ApproveAllButton", () => {
  it("approves only the contacts not yet approved and reports the result", async () => {
    service.approveContacts.mockResolvedValue([
      { type: "BRAND_CONTACT", id: "bc2", outcome: "created" },
      { type: "LEAD", id: "l9", outcome: "skipped", reason: "NO_VALID_EMAIL" },
    ]);
    renderWithClient(
      <ApproveAllButton
        influencerId="i1"
        items={[
          { type: "BRAND_CONTACT", id: "bc-approved" },
          { type: "BRAND_CONTACT", id: "bc2" },
          { type: "LEAD", id: "l9" },
        ]}
      />,
    );
    const button = await screen.findByRole("button", { name: 'approveAll:{"count":2}' });
    await userEvent.click(button);
    expect(service.approveContacts).toHaveBeenCalledWith([
      { type: "BRAND_CONTACT", id: "bc2" },
      { type: "LEAD", id: "l9" },
    ]);
    expect(await screen.findByText('bulkDone:{"added":1,"skipped":1}')).toBeInTheDocument();
  });
});
