/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BrandBusinessContactsPanel } from "@/components/lead-discovery/brand-business-contacts-panel";
import { useBbcDiscovery } from "@/hooks/use-bbc-discovery";
import type { BrandBusinessContact, Lead } from "@/types/lead-discovery";
import type { BbcUiState } from "@/lib/bbc-run-ui-state";

jest.mock("../../hooks/use-bbc-discovery", () => ({
  useBbcDiscovery: jest.fn(),
}));

jest.mock("./agency-contacts-panel", () => ({
  AgencyContactsPanel: ({
    influencerId,
  }: {
    influencerId?: string | null;
  }) => (
    <div data-testid="agency-contacts-stub">
      {influencerId ? `agency-for:${influencerId}` : "agency-missing"}
    </div>
  ),
}));

const messages: Record<string, string> = {
  title: "Brand business contacts",
  description: "Company inboxes — not person leads.",
  loading: "Loading business contacts…",
  empty: "No brand business contacts yet.",
  emptyAfterProviderFailure:
    "No brand business contacts were saved because Bright Data did not return usable content.",
  emptyAfterNoMatches: "BBC search completed with no matches.",
  emptyAfterFailed: "Run failed empty.",
  retry: "Retry",
  evidence: "Evidence",
  openEvidence: "Open evidence",
  source: "Source",
  evidenceUnverified: "Found in source; not SMTP-verified",
  "attribution.ATTRIBUTED": "Attributed to brand",
  "attribution.UNATTRIBUTED": "Attribution uncertain",
  "verification.UNVERIFIED": "Not SMTP-verified",
  "verification.VERIFIED": "SMTP-verified",
  "type.generic": "Brand inbox",
  "type.personLike": "Person-like local part",
  "sections.genericTitle": "Brand inboxes (generic)",
  "sections.genericDescription": "Department inboxes",
  "sections.genericEmpty": "No generic brand inboxes persisted yet.",
  "sections.otherTitle": "Other commercial emails",
  "sections.otherDescription": "Other emails",
  "sections.otherEmpty": "No other commercial emails persisted yet.",
  "sections.agenciesTitle": "Influencer agencies",
  "sections.agenciesPending": "Agency discovery (track 2C) has not started for this run.",
  "sections.agenciesExecuted": "Agency discovery (track 2C) ran for this Lead Discovery execution.",
  "sections.agenciesResults": "Track 2C found {count} agency association(s).",
  "sections.agenciesNoMatches": "Track 2C ran with no agency matches.",
  "sections.agenciesFailed": "Track 2C failed (provider/search).",
  "relevance.HIGH": "High — partnerships/creators",
  "relevance.NEUTRAL": "Medium — marketing/press/affiliate",
  "relevance.LOW": "Low — support",
  "relevance.UNKNOWN": "Unclassified commercial relevance",
  "coverageTier.HIGH": "High — partnerships/creators",
  "coverageTier.MEDIUM": "Medium — marketing/press/affiliate",
  "coverageTier.GENERAL": "General — info/contact",
  "coverageTier.LOW": "Low — support",
  "coverageTier.OTHER": "Other — not a known commercial mailbox",
  activeBanner: "BBC v1 mode active",
  engineMastra: "Engine: Mastra (FIND_BRAND_EMAILS)",
  searchAction: "Search business contacts",
  searching: "Searching contacts…",
  refresh: "Refresh results",
  processingTitle: "Search in progress",
  processingBody: "Job running",
  partialProcessingTitle: "Partial",
  partialProcessingBody: "{count} contacts",
  resultsFoundTitle: "Business contacts found",
  resultsFoundBody: "Created: {created}; updated: {updated}.",
  resultsFoundPartial: "Partial pages",
  noMatchesTitle: "No valid matches",
  noMatchesBody: "No emails",
  providerFailureTitle: "Provider failure",
  providerFailureBody: "Unreliable ({kind})",
  failedTitle: "Run failure",
  failedBody: "App failure",
  failedOrphansNote: "Orphans",
  pollErrorTitle: "Poll failed",
  researchTraceTitle: "Research progress",
  researchTraceCounts:
    "SERP queries: {serp}/{maxSerp}; pages fetched: {pages}/{maxPages}",
  researchFinalize: "Finished: {summary}",
  "failureKind.transport": "transport",
  "failureKind.http": "HTTP",
  "failureKind.malformed": "malformed",
  "failureKind.empty_body": "empty",
  "failureKind.unknown": "unknown",
  "people.title": "People (LinkedIn)",
  "people.description": "People for this brand",
  "people.loading": "Loading people…",
  "people.empty": "No people for this brand yet.",
  "people.linkedin": "LinkedIn",
  "people.noLinkedin": "No LinkedIn",
  "people.noEmail": "No email",
  "people.status.UNDER_REVIEW": "Under review",
  "people.status.APPROVED": "Approved",
  "people.status.DISCARDED": "Discarded",
  "people.status.DUPLICATE": "Duplicate",
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    return (key: string, values?: Record<string, unknown>) => {
      if (namespace === "LeadDiscovery.peopleLeads") {
        return messages[`people.${key}`] ?? key;
      }
      if (
        namespace === "LeadDiscovery.bbc" ||
        namespace === "LeadDiscovery.businessContacts"
      ) {
        let text = messages[key] ?? key;
        if (values) {
          for (const [k, v] of Object.entries(values)) {
            text = text.replace(`{${k}}`, String(v));
          }
        }
        return text;
      }
      return messages[key] ?? key;
    };
  },
}));

const mockedHook = jest.mocked(useBbcDiscovery);

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

function mockBbc(
  partial: Partial<ReturnType<typeof useBbcDiscovery>> = {},
) {
  const startSearch = jest.fn();
  const refresh = jest.fn();
  const uiState: BbcUiState = partial.uiState ?? {
    kind: "idle",
    contactCount: partial.contacts?.length ?? 0,
  };

  mockedHook.mockReturnValue({
    bbcV1Active: false,
    canSearch: false,
    contacts: [],
    leads: [],
    runs: [],
    loading: false,
    loadingMeta: false,
    searching: false,
    hasProcessing: false,
    error: null,
    pollError: null,
    startSearch,
    refresh,
    refreshQuiet: jest.fn(),
    ...partial,
    uiState: partial.uiState ?? uiState,
  });

  return { startSearch, refresh };
}

function personLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    brandCandidateId: "b1",
    influencerId: "i1",
    runId: "run-1",
    contactName: "Alex Partner",
    title: "Influencer Marketing Manager",
    email: "alex@brand.com",
    emailConfidence: "UNKNOWN",
    isGeneric: false,
    profileUrl: "https://www.linkedin.com/in/alex-partner",
    providerId: "mastra-find-brand-people",
    sourceOptionId: null,
    fitReason: null,
    source: "mastra-find-brand-people",
    status: "UNDER_REVIEW",
    selectedForOutreach: false,
    metadata: null,
    createdAt: "2026-11-08T00:00:00.000Z",
    updatedAt: "2026-11-08T00:00:00.000Z",
    ...overrides,
  };
}

describe("BrandBusinessContactsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows contacts (not as person leads)", () => {
    mockBbc({ contacts: [contact({ commercialCoverageTier: "HIGH" })] });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("Brand business contacts")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "partnerships@mcgeeandco.com" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Brand inbox")).toBeInTheDocument();
    expect(
      screen.getByText("High — partnerships/creators"),
    ).toBeInTheDocument();
  });

  it("RF-02.1: person-like coverage OTHER is not labeled General", () => {
    mockBbc({
      contacts: [
        contact({
          email: "john.smith@brand.com",
          label: null,
          isGeneric: false,
          commercialRelevance: "UNKNOWN",
          commercialCoverageTier: "OTHER",
        }),
      ],
    });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(
      screen.getByText("Other — not a known commercial mailbox"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/General — info\/contact/i)).not.toBeInTheDocument();
  });

  it("RF-01 case 10: never presents found email as SMTP-verified even with evidence", () => {
    mockBbc({
      contacts: [
        contact({
          discoveryStatus: "FOUND",
          attributionStatus: "ATTRIBUTED",
          verificationStatus: "UNVERIFIED",
        }),
      ],
    });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText(/Not SMTP-verified/i)).toBeInTheDocument();
    expect(screen.queryByText(/^SMTP-verified$/i)).not.toBeInTheDocument();
  });

  it("shows BBC search controls when bbcV1Active", async () => {
    const user = userEvent.setup();
    const { startSearch } = mockBbc({
      bbcV1Active: true,
      canSearch: true,
      uiState: { kind: "idle", contactCount: 0 },
    });

    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("BBC v1 mode active")).toBeInTheDocument();
    const button = screen.getByRole("button", {
      name: "Search business contacts",
    });
    await user.click(button);
    expect(startSearch).toHaveBeenCalled();
  });

  it("shows PROCESSING status without treating as empty error", () => {
    mockBbc({
      bbcV1Active: true,
      canSearch: true,
      hasProcessing: true,
      uiState: { kind: "processing", runId: "r1", contactCount: 0 },
    });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("Search in progress")).toBeInTheDocument();
    expect(
      screen.queryByText("No brand business contacts yet."),
    ).not.toBeInTheDocument();
  });

  it("shows PROVIDER_FAILURE empty copy, not no-matches", () => {
    mockBbc({
      uiState: {
        kind: "provider_failure",
        contactCount: 0,
        providerFailureKind: "http",
      },
    });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(
      screen.getByText(
        "No brand business contacts were saved because Bright Data did not return usable content.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("BBC search completed with no matches."),
    ).not.toBeInTheDocument();
  });

  it("shows NO_MATCHES empty copy", () => {
    mockBbc({
      uiState: { kind: "no_matches", contactCount: 0 },
    });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(
      screen.getByText("BBC search completed with no matches."),
    ).toBeInTheDocument();
  });

  it("retries on load error", async () => {
    const user = userEvent.setup();
    const { refresh } = mockBbc({
      error: "Network error",
      uiState: { kind: "load_error", errorMessage: "Network error", contactCount: 0 },
    });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(refresh).toHaveBeenCalled();
  });

  it("shows people panel with name, LinkedIn and email", () => {
    mockBbc({
      contacts: [contact()],
      leads: [personLead()],
    });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("People (LinkedIn)")).toBeInTheDocument();
    expect(screen.getByText("Alex Partner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/alex-partner",
    );
    expect(
      screen.getByRole("link", { name: "alex@brand.com" }),
    ).toBeInTheDocument();
  });

  it("passes influencerId into agency contacts section", () => {
    mockBbc({ contacts: [contact()] });
    render(
      <BrandBusinessContactsPanel
        brandCandidateId="b1"
        influencerId="inf-9"
      />,
    );
    expect(screen.getByTestId("agency-contacts-stub")).toHaveTextContent(
      "agency-for:inf-9",
    );
  });

  it("shows empty people copy when no leads", () => {
    mockBbc({ contacts: [], leads: [] });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(
      screen.getByText("No people for this brand yet."),
    ).toBeInTheDocument();
  });
});
