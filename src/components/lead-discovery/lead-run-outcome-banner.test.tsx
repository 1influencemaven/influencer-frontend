/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { LeadRunOutcomeBanner } from "@/components/lead-discovery/lead-run-outcome-banner";
import type { LeadDiscoveryRun } from "@/types/lead-discovery";

const messages: Record<string, string> = {
  providerFailureTitle: "Provider failure",
  emptyLegitimateTitle: "No matching contacts",
  emptyLegitimateBody:
    "The search completed without critical provider errors, but no valid contacts were found.",
  bbcOnlyTitle: "Business contacts found, no person leads",
  bbcOnlyBody:
    "Brand business contacts were saved. Person lead discovery did not produce qualified LinkedIn profiles above the ranking threshold.",
  resultCounts:
    "Business contacts created: {businessContacts}; person leads created: {personLeads}",
  pagesSummary: "Pages attempted: {attempted}, succeeded: {succeeded}, failed: {failed}",
  peopleTraceSummary:
    "Search hits: {hits}; LinkedIn profiles validated: {linkedin}; above threshold: {qualified}",
  "warnings.unlocker_all_pages_failed":
    "Business-contact Unlocker failed for every attempted page.",
  "warnings.people_scraper_all_failed":
    "People scraper failed for every selected profile.",
  "warnings.people_search_provider_failed":
    "People search provider failed with no usable hits.",
  "warnings.mixed_provider_failure":
    "More than one discovery provider failed; results may be incomplete.",
  "warnings.generic": "A discovery provider failed; results may be incomplete.",
  "failureCategories.network_error": "Network error",
  "failureCategories.http_error": "HTTP error",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, number>) => {
    const template = messages[key] ?? key;
    if (!values) {
      return template;
    }
    return Object.entries(values).reduce(
      (acc, [name, value]) => acc.replace(`{${name}}`, String(value)),
      template,
    );
  },
}));

function run(
  overrides: Partial<LeadDiscoveryRun> & {
    searchMetadata: NonNullable<LeadDiscoveryRun["searchMetadata"]>;
  },
): LeadDiscoveryRun {
  return {
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
    ...overrides,
  };
}

describe("LeadRunOutcomeBanner", () => {
  it("shows provider failure with sanitized page counts and categories", () => {
    render(
      <LeadRunOutcomeBanner
        runs={[
          run({
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
              warningMessage: "Business-contact Unlocker failed for every attempted page.",
              businessContactDiscovery: {
                pagesAttempted: 12,
                pagesSucceeded: 0,
                pagesFailed: 12,
                emailsFound: 0,
                contactsCreated: 0,
                contactsUpdated: 0,
                failureCountsByCategory: {
                  network_error: 12,
                  secret_token: 1,
                },
              },
            },
          }),
        ]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Provider failure");
    expect(
      screen.getByText(
        "Business-contact Unlocker failed for every attempted page.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pages attempted: 12, succeeded: 0, failed: 12"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Network error: 12/)).toBeInTheDocument();
    expect(screen.queryByText(/secret_token/)).not.toBeInTheDocument();
  });

  it("distinguishes empty legitimate from technical failure", () => {
    render(
      <LeadRunOutcomeBanner
        runs={[
          run({
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
              searchHitsCount: 10,
              outcome: "EMPTY_LEGITIMATE",
              warningCode: null,
              warningMessage: null,
              peopleSearchTrace: {
                searchHitsReceived: 10,
                linkedinUrlValidated: 0,
                scoredCandidates: 0,
                qualifiedCandidates: 0,
                selectedProfileUrlsCount: 0,
                selectedProfileUrls: [],
                brightDataSearchRequests: 2,
                brightDataSearchFailures: 0,
                tavilyFallbackRequests: 0,
                scraperInvocations: 0,
                scraperSuccesses: 0,
                scraperFailures: 0,
                searchFailureCodes: [],
                scraperErrorCodes: [],
              },
            },
          }),
        ]}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No matching contacts");
    expect(
      screen.getByText(
        /Search hits: 10; LinkedIn profiles validated: 0; above threshold: 0/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("hides banner for FULL outcome with person leads", () => {
    const { container } = render(
      <LeadRunOutcomeBanner
        runs={[
          run({
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
              searchHitsCount: 5,
              outcome: "FULL",
              warningCode: null,
              warningMessage: null,
              personLeadsCreated: 2,
              businessContactsCreated: 0,
            },
          }),
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows BBC-only notice when FULL but no person leads", () => {
    render(
      <LeadRunOutcomeBanner
        runs={[
          run({
            searchMetadata: {
              strategy: "llm",
              tracks: ["2A", "2B"],
              priorityRoles: [],
              scraperIds: [],
              plannedQueriesCount: 0,
              validatedQueriesCount: 0,
              queries: [],
              fallbackUsed: false,
              fallbackReason: null,
              searchHitsCount: 41,
              outcome: "FULL",
              warningCode: null,
              warningMessage: null,
              personLeadsCreated: 0,
              businessContactsCreated: 1,
              peopleSearchTrace: {
                searchHitsReceived: 41,
                linkedinUrlValidated: 4,
                scoredCandidates: 4,
                qualifiedCandidates: 0,
                selectedProfileUrlsCount: 0,
                selectedProfileUrls: [],
                brightDataSearchRequests: 5,
                brightDataSearchFailures: 0,
                tavilyFallbackRequests: 0,
                scraperInvocations: 0,
                scraperSuccesses: 0,
                scraperFailures: 0,
                searchFailureCodes: [],
                scraperErrorCodes: [],
              },
            },
          }),
        ]}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Business contacts found, no person leads",
    );
    expect(
      screen.getByText(
        /Business contacts created: 1; person leads created: 0/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Search hits: 41; LinkedIn profiles validated: 4; above threshold: 0/,
      ),
    ).toBeInTheDocument();
  });

  it("hides banner when outcome is absent (legacy run)", () => {
    const { container } = render(
      <LeadRunOutcomeBanner
        runs={[
          run({
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
              searchHitsCount: 5,
            },
          }),
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
