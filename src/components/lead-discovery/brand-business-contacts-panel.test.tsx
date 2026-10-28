/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BrandBusinessContactsPanel } from "@/components/lead-discovery/brand-business-contacts-panel";
import { listBrandBusinessContacts } from "@/services/lead-discovery.service";
import type { BrandBusinessContact } from "@/types/lead-discovery";

jest.mock("../../services/lead-discovery.service", () => ({
  listBrandBusinessContacts: jest.fn(),
}));

const messages: Record<string, string> = {
  title: "Brand business contacts",
  description: "Company inboxes — not person leads.",
  loading: "Loading business contacts…",
  empty: "No brand business contacts yet.",
  retry: "Retry",
  evidence: "Evidence",
  openEvidence: "Open evidence",
  "relevance.HIGH": "High",
  "relevance.NEUTRAL": "Neutral",
  "relevance.LOW": "Low",
  "relevance.UNKNOWN": "Unknown",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

const mockedList = jest.mocked(listBrandBusinessContacts);

function contact(
  overrides: Partial<BrandBusinessContact> = {},
): BrandBusinessContact {
  return {
    id: "bbc-1",
    brandCandidateId: "b1",
    email: "partnerships@mcgeeandco.com",
    label: "Partnerships",
    isGeneric: true,
    commercialRelevance: "HIGH",
    source: "PUBLIC_WEB",
    sourceUrl: "https://www.mcgeeandco.com/pages/contact",
    evidences: [
      {
        sourceUrl: "https://www.mcgeeandco.com/pages/contact",
        evidenceSnippet: "partnerships@mcgeeandco.com",
        discoveredAt: "2026-09-13T00:00:00.000Z",
      },
    ],
    createdAt: "2026-09-13T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z",
    ...overrides,
  };
}

describe("BrandBusinessContactsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading then contacts (not as person leads)", async () => {
    let resolveList!: (value: BrandBusinessContact[]) => void;
    mockedList.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    );

    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("Loading business contacts…")).toBeInTheDocument();
    expect(screen.getByText("Brand business contacts")).toBeInTheDocument();
    expect(
      screen.getByText("Company inboxes — not person leads."),
    ).toBeInTheDocument();

    resolveList([contact()]);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "partnerships@mcgeeandco.com" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText(/Evidence:/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open evidence" })).toHaveAttribute(
      "href",
      "https://www.mcgeeandco.com/pages/contact",
    );
    expect(screen.queryByText("Leads")).not.toBeInTheDocument();
    expect(screen.queryByText("Select for outreach")).not.toBeInTheDocument();
  });

  it("shows empty state", async () => {
    mockedList.mockResolvedValue([]);
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    await waitFor(() => {
      expect(
        screen.getByText("No brand business contacts yet."),
      ).toBeInTheDocument();
    });
  });

  it("shows error and retries", async () => {
    const user = userEvent.setup();
    mockedList
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce([contact()]);

    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network down");
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "partnerships@mcgeeandco.com" }),
      ).toBeInTheDocument();
    });
    expect(mockedList).toHaveBeenCalledTimes(2);
  });
});
