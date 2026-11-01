import { resolveBbcUiState } from "./bbc-run-ui-state";
import type {
  BrandBusinessContact,
  LeadDiscoveryRun,
} from "@/types/lead-discovery";

function contact(
  overrides: Partial<BrandBusinessContact> = {},
): BrandBusinessContact {
  return {
    id: "c1",
    brandCandidateId: "b1",
    email: "partnerships@brand.com",
    label: "Partnerships",
    isGeneric: true,
    commercialRelevance: "HIGH",
    source: "PUBLIC_WEB",
    sourceUrl: "https://brand.com/partnerships",
    evidences: [],
    createdAt: "2026-10-29T00:00:00.000Z",
    updatedAt: "2026-10-29T00:00:00.000Z",
    ...overrides,
  };
}

function bbcRun(
  overrides: Partial<LeadDiscoveryRun> &
    Pick<LeadDiscoveryRun, "status"> & {
      searchMetadata?: LeadDiscoveryRun["searchMetadata"];
    },
): LeadDiscoveryRun {
  return {
    id: "run-1",
    brandCandidateId: "b1",
    influencerId: "i1",
    providerId: "bbc-brightdata",
    providerOptions: { mode: "bbc-v1-allowlist-html" },
    limit: 10,
    errorMessage: null,
    createdAt: "2026-10-29T12:00:00.000Z",
    updatedAt: "2026-10-29T12:00:00.000Z",
    searchMetadata: null,
    ...overrides,
  };
}

describe("resolveBbcUiState", () => {
  it("returns idle with no BBC runs", () => {
    expect(resolveBbcUiState({ runs: [], contacts: [] }).kind).toBe("idle");
  });

  it("maps PROCESSING to processing (not an error)", () => {
    const state = resolveBbcUiState({
      runs: [bbcRun({ status: "PROCESSING" })],
      contacts: [],
    });
    expect(state.kind).toBe("processing");
    expect(state.runId).toBe("run-1");
  });

  it("maps PROCESSING + contacts to partial_while_processing", () => {
    const state = resolveBbcUiState({
      runs: [bbcRun({ status: "PROCESSING" })],
      contacts: [contact()],
    });
    expect(state.kind).toBe("partial_while_processing");
    expect(state.contactCount).toBe(1);
  });

  it("maps RESULTS_FOUND including partial pagesFailed", () => {
    const state = resolveBbcUiState({
      runs: [
        bbcRun({
          status: "COMPLETED",
          searchMetadata: {
            schemaVersion: 2,
            providerId: "bbc-brightdata",
            outcome: "RESULTS_FOUND",
            businessContacts: {
              created: 2,
              updated: 0,
              emailsFound: 2,
              pagesAttempted: 3,
              pagesSucceeded: 1,
              pagesFailed: 2,
            },
          },
        }),
      ],
      contacts: [contact(), contact({ id: "c2", email: "press@brand.com" })],
    });
    expect(state.kind).toBe("results_found");
    expect(state.pagesFailed).toBe(2);
    expect(state.contactsCreated).toBe(2);
  });

  it("maps NO_MATCHES distinctly from provider failure", () => {
    const state = resolveBbcUiState({
      runs: [
        bbcRun({
          status: "COMPLETED",
          searchMetadata: {
            schemaVersion: 2,
            providerId: "bbc-brightdata",
            outcome: "NO_MATCHES",
            businessContacts: {
              created: 0,
              updated: 0,
              emailsFound: 0,
              pagesAttempted: 3,
              pagesSucceeded: 3,
              pagesFailed: 0,
            },
          },
        }),
      ],
      contacts: [],
    });
    expect(state.kind).toBe("no_matches");
  });

  it("maps PROVIDER_FAILURE distinctly from no matches", () => {
    const state = resolveBbcUiState({
      runs: [
        bbcRun({
          status: "COMPLETED",
          searchMetadata: {
            schemaVersion: 2,
            providerId: "bbc-brightdata",
            outcome: "PROVIDER_FAILURE",
            providerFailureKind: "transport",
            businessContacts: {
              created: 0,
              updated: 0,
              emailsFound: 0,
              pagesAttempted: 3,
              pagesSucceeded: 0,
              pagesFailed: 3,
            },
          },
        }),
      ],
      contacts: [],
    });
    expect(state.kind).toBe("provider_failure");
    expect(state.providerFailureKind).toBe("transport");
  });

  it("maps FAILED with orphan contact note via contactCount", () => {
    const state = resolveBbcUiState({
      runs: [
        bbcRun({
          status: "FAILED",
          errorMessage: "CONTACT_PERSIST_FAILED: boom",
        }),
      ],
      contacts: [contact()],
    });
    expect(state.kind).toBe("failed");
    expect(state.contactCount).toBe(1);
    expect(state.errorMessage).toContain("CONTACT_PERSIST_FAILED");
  });

  it("surfaces load_error without inventing outcomes", () => {
    const state = resolveBbcUiState({
      runs: [],
      contacts: [],
      loadError: "Network down",
    });
    expect(state.kind).toBe("load_error");
    expect(state.errorMessage).toBe("Network down");
  });
});
