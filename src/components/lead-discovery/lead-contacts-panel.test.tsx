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
  emptyLeadsLegitimate:
    "Search finished with no matching people. This is a valid empty result, not a technical failure.",
  emptyLeadsAfterProviderFailure:
    "No leads were saved because a discovery provider failed. See the warning above.",
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
  runOutcome: {
    providerFailureTitle: "Provider failure",
    emptyLegitimateTitle: "No matching contacts",
    emptyLegitimateBody: "Valid empty.",
    pagesSummary:
      "Pages attempted: {attempted}, succeeded: {succeeded}, failed: {failed}",
    peopleTraceSummary: "hits {hits}",
    warnings: {
      unlocker_all_pages_failed: "Unlocker failed for every attempted page.",
      people_scraper_all_failed: "Scraper failed.",
      people_search_provider_failed: "Search failed.",
      mixed_provider_failure: "Mixed failure.",
      generic: "Provider failed.",
    },
    failureCategories: {
      network_error: "Network error",
      http_error: "HTTP error",
      empty_body: "Empty response",
      timeout: "Timeout",
      url_normalization_error: "Invalid URL",
      unknown_error: "Unknown error",
    },
  },
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    const translate = (key: string, values?: Record<string, number>) => {
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
      if (namespace === "LeadDiscovery.runOutcome") {
        if (key.startsWith("warnings.")) {
          const code = key.replace(
            "warnings.",
            "",
          ) as keyof typeof messages.runOutcome.warnings;
          return messages.runOutcome.warnings[code] ?? key;
        }
        if (key.startsWith("failureCategories.")) {
          const cat = key.replace(
            "failureCategories.",
            "",
          ) as keyof typeof messages.runOutcome.failureCategories;
          return messages.runOutcome.failureCategories[cat] ?? key;
        }
        const template =
          messages.runOutcome[key as keyof typeof messages.runOutcome];
        if (typeof template !== "string") {
          return key;
        }
        if (!values) {
          return template;
        }
        return Object.entries(values).reduce(
          (acc, [name, value]) => acc.replace(`{${name}}`, String(value)),
          template,
        );
      }
      if (key.startsWith("leadStatus.")) {
        const status = key.replace(
          "leadStatus.",
          "",
        ) as keyof typeof messages.leadStatus;
        return messages.leadStatus[status] ?? key;
      }
      return (messages[key as keyof typeof messages] as string) ?? key;
    };
    return translate;
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

  it("shows provider-failure empty copy and warning banner", () => {
    mockHook({
      leads: [],
      runs: [
        {
          id: "r1",
          brandCandidateId: "b1",
          influencerId: "i1",
          status: "COMPLETED",
          providerId: "ai+brightdata",
          providerOptions: {},
          limit: 5,
          errorMessage: null,
          createdAt: "2026-10-22T20:34:02.544Z",
          updatedAt: "2026-10-22T20:34:02.544Z",
          searchMetadata: {
            strategy: "llm",
            tracks: ["2A", "2B"],
            priorityRoles: [],
            scraperIds: [],
            plannedQueriesCount: 0,
            validatedQueriesCount: 0,
            queries: [],
            fallbackUsed: true,
            fallbackReason: "search_tavily",
            searchHitsCount: 50,
            outcome: "PROVIDER_FAILURE",
            warningCode: "unlocker_all_pages_failed",
            warningMessage: "Unlocker failed",
            businessContactDiscovery: {
              pagesAttempted: 12,
              pagesSucceeded: 0,
              pagesFailed: 12,
              emailsFound: 0,
              contactsCreated: 0,
              contactsUpdated: 0,
              failureCountsByCategory: { network_error: 12 },
            },
          },
        },
      ],
    });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(
      screen.getByText(messages.emptyLeadsAfterProviderFailure),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Provider failure");
    expect(
      screen.getByText("Unlocker failed for every attempted page."),
    ).toBeInTheDocument();
  });

  it("shows legitimate empty copy without alert role", () => {
    mockHook({
      leads: [],
      runs: [
        {
          id: "r2",
          brandCandidateId: "b1",
          influencerId: "i1",
          status: "COMPLETED",
          providerId: "ai+brightdata",
          providerOptions: {},
          limit: 5,
          errorMessage: null,
          createdAt: "2026-10-22T20:34:02.544Z",
          updatedAt: "2026-10-22T20:34:02.544Z",
          searchMetadata: {
            strategy: "llm",
            tracks: ["2B"],
            priorityRoles: [],
            scraperIds: [],
            plannedQueriesCount: 0,
            validatedQueriesCount: 0,
            queries: [],
            fallbackUsed: false,
            fallbackReason: null,
            searchHitsCount: 0,
            outcome: "EMPTY_LEGITIMATE",
            warningCode: null,
            warningMessage: null,
          },
        },
      ],
    });
    render(<LeadContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText(messages.emptyLeadsLegitimate)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No matching contacts");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
