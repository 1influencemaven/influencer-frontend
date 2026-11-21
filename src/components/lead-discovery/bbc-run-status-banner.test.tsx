/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { BbcRunStatusBanner } from "@/components/lead-discovery/bbc-run-status-banner";
import type { BbcUiState } from "@/lib/bbc-run-ui-state";

const messages: Record<string, string> = {
  processingTitle: "Search in progress",
  processingBody: "Job running",
  partialProcessingTitle: "Partial while processing",
  partialProcessingBody: "{count} contacts visible",
  resultsFoundTitle: "Business contacts found",
  resultsFoundBody: "Created: {created}; updated: {updated}.",
  resultsFoundPartial: "Some pages failed",
  noMatchesTitle: "No valid matches",
  noMatchesBody: "Provider OK, no emails",
  providerFailureTitle: "Provider failure",
  providerFailureBody: "Unreliable ({kind})",
  failedTitle: "Run failure",
  failedBody: "App failure",
  failedOrphansNote: "Orphan contacts note",
  pollErrorTitle: "Could not refresh",
  researchTraceTitle: "Research progress",
  researchTraceCounts:
    "SERP queries: {serp}/{maxSerp}; pages fetched: {pages}/{maxPages}",
  researchFinalize: "Finished: {summary}",
  "failureKind.transport": "transport / network",
  "failureKind.unknown": "unknown",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    let text = messages[key] ?? key;
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  },
}));

function state(partial: Partial<BbcUiState> & Pick<BbcUiState, "kind">): BbcUiState {
  return { contactCount: 0, ...partial };
}

describe("BbcRunStatusBanner", () => {
  it("shows processing as status, not alert", () => {
    render(
      <BbcRunStatusBanner state={state({ kind: "processing", runId: "r1" })} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Search in progress");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows provider failure as alert, not empty-search copy", () => {
    render(
      <BbcRunStatusBanner
        state={state({
          kind: "provider_failure",
          providerFailureKind: "transport",
        })}
      />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Provider failure");
    expect(alert).toHaveTextContent("transport / network");
    expect(screen.queryByText("No valid matches")).not.toBeInTheDocument();
  });

  it("shows NO_MATCHES distinctly", () => {
    render(<BbcRunStatusBanner state={state({ kind: "no_matches" })} />);
    expect(screen.getByRole("status")).toHaveTextContent("No valid matches");
  });

  it("shows RESULTS_FOUND with partial note", () => {
    render(
      <BbcRunStatusBanner
        state={state({
          kind: "results_found",
          contactsCreated: 1,
          contactsUpdated: 0,
          pagesFailed: 2,
        })}
      />,
    );
    expect(screen.getByText("Business contacts found")).toBeInTheDocument();
    expect(screen.getByText("Some pages failed")).toBeInTheDocument();
  });

  it("shows FAILED with orphan note when contacts exist", () => {
    render(
      <BbcRunStatusBanner
        state={state({
          kind: "failed",
          errorMessage: "FAILED: boom",
          contactCount: 2,
        })}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("FAILED: boom");
    expect(screen.getByText("Orphan contacts note")).toBeInTheDocument();
  });

  it("surfaces poll errors", () => {
    render(
      <BbcRunStatusBanner
        state={state({ kind: "idle" })}
        pollError="timeout"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Could not refresh");
    expect(screen.getByRole("alert")).toHaveTextContent("timeout");
  });

  it("shows operational researchTrace without private reasoning", () => {
    render(
      <BbcRunStatusBanner
        state={state({
          kind: "results_found",
          contactsCreated: 1,
          contactsUpdated: 0,
        })}
        runs={[
          {
            id: "r1",
            brandCandidateId: "b1",
            status: "COMPLETED",
            createdAt: "2026-10-30T12:00:00.000Z",
            updatedAt: "2026-10-30T12:01:00.000Z",
            searchMetadata: {
              schemaVersion: 2,
              providerId: "brightdata",
              outcome: "RESULTS_FOUND",
              researchTrace: {
                mode: "ai",
                serpQueriesUsed: 2,
                pagesFetched: 1,
                maxSerp: 5,
                maxPages: 5,
                finalizeSummary: "Enough commercial emails",
                steps: [
                  {
                    iteration: 1,
                    action: "search_web",
                    reason: "Find partnerships page",
                    query: "Acme partnerships",
                    observation: "outcome=ok; hits=3",
                  },
                ],
              },
            },
          } as never,
        ]}
      />,
    );
    expect(screen.getByText("Research progress")).toBeInTheDocument();
    expect(
      screen.getByText("SERP queries: 2/5; pages fetched: 1/5"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Finished: Enough commercial emails"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/search_web: Acme partnerships/),
    ).toBeInTheDocument();
  });
});
