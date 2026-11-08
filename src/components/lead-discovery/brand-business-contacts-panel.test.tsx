/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BrandBusinessContactsPanel } from "@/components/lead-discovery/brand-business-contacts-panel";
import { useBbcDiscovery } from "@/hooks/use-bbc-discovery";
import type { BrandBusinessContact } from "@/types/lead-discovery";
import type { BbcUiState } from "@/lib/bbc-run-ui-state";

jest.mock("../../hooks/use-bbc-discovery", () => ({
  useBbcDiscovery: jest.fn(),
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
  "type.generic": "Brand inbox",
  "type.personLike": "Person-like local part",
  "sections.genericTitle": "Brand inboxes (generic)",
  "sections.genericDescription": "Department inboxes",
  "sections.genericEmpty": "No generic brand inboxes persisted yet.",
  "sections.otherTitle": "Other commercial emails",
  "sections.otherDescription": "Other emails",
  "sections.otherEmpty": "No other commercial emails persisted yet.",
  "sections.agenciesTitle": "Influencer agencies",
  "sections.agenciesPending": "Agency discovery (track 2C) is not implemented yet.",
  "relevance.HIGH": "High",
  "relevance.NEUTRAL": "Neutral",
  "relevance.LOW": "Low",
  "relevance.UNKNOWN": "Unknown",
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
};

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    return (key: string, values?: Record<string, unknown>) => {
      if (namespace === "LeadDiscovery.bbc" || namespace === "LeadDiscovery.businessContacts") {
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

describe("BrandBusinessContactsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows contacts (not as person leads)", () => {
    mockBbc({ contacts: [contact()] });
    render(<BrandBusinessContactsPanel brandCandidateId="b1" />);
    expect(screen.getByText("Brand business contacts")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "partnerships@mcgeeandco.com" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Brand inbox")).toBeInTheDocument();
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
});
