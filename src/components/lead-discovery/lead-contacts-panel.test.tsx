/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LeadContactsPanel } from "@/components/lead-discovery/lead-contacts-panel";
import { useLeadDiscovery } from "@/hooks/use-lead-discovery";
import type { ContactChannel, LeadDetail } from "@/types/lead-discovery";

const messages = {
  panelTitle: "Leads",
  panelDescription: "Discover relevant people.",
  limitLabel: "Max leads",
  searchAction: "Search leads with AI",
  searching: "Searching...",
  leadsTitle: "Leads",
  emptyLeads: "No leads found yet.",
  loadingLeads: "Loading leads…",
  approve: "Approve",
  discard: "Discard",
  selectForOutreach: "Select for outreach",
  selectedForOutreach: "Selected for outreach",
  deselectForOutreach: "Clear selection",
  selecting: "Selecting...",
  deselecting: "Clearing selection...",
  selectError: "Could not select lead",
  deselectError: "Could not clear selection",
  leadStatus: {
    UNDER_REVIEW: "Under review",
    APPROVED: "Approved",
    DISCARDED: "Discarded",
    DUPLICATE: "Duplicate",
  },
  channels: {
    LINKEDIN: "LinkedIn",
    EMAIL: "Email",
    WEBSITE: "Website",
  },
  outreachReadiness: {
    LIMITED: "Limited",
    PARTIAL: "Partial",
    READY: "Ready",
  },
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    if (namespace === "LeadDiscovery.channels") {
      return messages.channels[key as keyof typeof messages.channels] ?? key;
    }
    if (namespace === "LeadDiscovery.outreachReadiness") {
      return (
        messages.outreachReadiness[
          key as keyof typeof messages.outreachReadiness
        ] ?? key
      );
    }
    if (key.startsWith("leadStatus.")) {
      const status = key.replace(
        "leadStatus.",
        "",
      ) as keyof typeof messages.leadStatus;
      return messages.leadStatus[status] ?? key;
    }
    return messages[key as keyof typeof messages] ?? key;
  },
}));

jest.mock("../../i18n/navigation", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("../../hooks/use-lead-discovery", () => ({
  useLeadDiscovery: jest.fn(),
}));

const mockedUseLeadDiscovery = jest.mocked(useLeadDiscovery);

function channel(type: ContactChannel["type"]): ContactChannel {
  return {
    id: `c-${type}`,
    leadId: "l1",
    type,
    value: type === "EMAIL" ? "hidden@acme.com" : "https://example.com",
    status: "ACTIVE",
    source: "LINKEDIN_SCRAPER",
    sourceUrl: null,
    isGeneric: type === "EMAIL" ? true : null,
    metadata: null,
    createdAt: "",
    updatedAt: "",
  };
}

function baseLeadDetail(overrides: Partial<LeadDetail> = {}): LeadDetail {
  return {
    id: "l1",
    status: "APPROVED",
    selectedForOutreach: false,
    person: {
      name: "Ada Lovelace",
      position: "CMO",
      company: "Acme",
    },
    contactChannels: [channel("LINKEDIN")],
    outreachReadiness: "PARTIAL",
    email: null,
    profileUrl: "https://linkedin.com/in/ada",
    ...overrides,
  };
}

function mockHook(partial: Partial<ReturnType<typeof useLeadDiscovery>> = {}) {
  const selectForOutreach = jest.fn();
  const deselectForOutreach = jest.fn();
  const updateStatus = jest.fn();
  const startSearch = jest.fn();
  const setLimit = jest.fn();

  mockedUseLeadDiscovery.mockReturnValue({
    providers: ["ai+brightdata"],
    defaultProvider: "ai+brightdata",
    limit: 10,
    setLimit,
    leads: [],
    runs: [],
    loadingMeta: false,
    loadingLeads: false,
    searching: false,
    updatingId: null,
    error: null,
    hasProcessing: false,
    canSearch: true,
    startSearch,
    updateStatus,
    selectForOutreach,
    deselectForOutreach,
    ...partial,
  });

  return { selectForOutreach, deselectForOutreach, updateStatus };
}

describe("LeadContactsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows empty state when no leads", () => {
    mockHook({ leads: [] });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText(messages.emptyLeads)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockHook({ loadingLeads: true });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText(messages.loadingLeads)).toBeInTheDocument();
  });

  it("shows error from hook", () => {
    mockHook({ error: messages.selectError });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(screen.getByRole("alert")).toHaveTextContent(messages.selectError);
  });

  it("shows lead without exposing email address", () => {
    mockHook({
      leads: [
        baseLeadDetail({
          contactChannels: [channel("LINKEDIN"), channel("WEBSITE")],
          outreachReadiness: "PARTIAL",
        }),
      ],
    });
    render(<LeadContactsPanel brandCandidateId="b1" />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it("shows LIMITED readiness", () => {
    mockHook({
      leads: [
        baseLeadDetail({
          contactChannels: [],
          outreachReadiness: "LIMITED",
        }),
      ],
    });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("Limited")).toBeInTheDocument();
  });

  it("indicates Email channel without showing address", () => {
    mockHook({
      leads: [
        baseLeadDetail({
          contactChannels: [
            channel("LINKEDIN"),
            channel("EMAIL"),
            channel("WEBSITE"),
          ],
        }),
      ],
    });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.queryByText("hidden@acme.com")).not.toBeInTheDocument();
  });

  it("navigates to lead detail on row link", () => {
    mockHook({ leads: [baseLeadDetail()] });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(screen.getByRole("link", { name: /Ada Lovelace/i })).toHaveAttribute(
      "href",
      "/dashboard/leads/l1",
    );
  });

  it("shows select action for APPROVED lead when not selected", () => {
    mockHook({ leads: [baseLeadDetail()] });
    render(<LeadContactsPanel brandCandidateId="b1" />);

    expect(
      screen.getByRole("button", { name: messages.selectForOutreach }),
    ).toBeInTheDocument();
  });

  it("calls selectForOutreach on select click", async () => {
    const user = userEvent.setup();
    const { selectForOutreach } = mockHook({ leads: [baseLeadDetail()] });
    render(<LeadContactsPanel brandCandidateId="b1" />);

    await user.click(
      screen.getByRole("button", { name: messages.selectForOutreach }),
    );

    expect(selectForOutreach).toHaveBeenCalledWith("l1");
  });

  it("shows approve for UNDER_REVIEW", () => {
    mockHook({
      leads: [baseLeadDetail({ status: "UNDER_REVIEW" })],
    });
    render(<LeadContactsPanel brandCandidateId="b1" />);

    expect(
      screen.getByRole("button", { name: messages.approve }),
    ).toBeInTheDocument();
  });
});
