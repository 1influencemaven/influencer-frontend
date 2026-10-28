"use client";

import { useTranslations } from "next-intl";

import type {
  LeadDiscoveryRun,
  LeadSearchMetadata,
} from "@/types/lead-discovery";

type LeadRunOutcomeBannerProps = {
  runs: LeadDiscoveryRun[];
};

const SAFE_FAILURE_CATEGORIES = new Set([
  "http_error",
  "empty_body",
  "timeout",
  "network_error",
  "url_normalization_error",
  "unknown_error",
]);

function latestCompletedWithMetadata(
  runs: LeadDiscoveryRun[],
): LeadSearchMetadata | null {
  const completed = runs
    .filter((run) => run.status === "COMPLETED" && run.searchMetadata)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  return completed[0]?.searchMetadata ?? null;
}

function sanitizeFailureCategories(
  counts: Record<string, number> | undefined,
): Array<{ key: string; count: number }> {
  if (!counts) {
    return [];
  }
  return Object.entries(counts)
    .filter(([key, count]) => SAFE_FAILURE_CATEGORIES.has(key) && count > 0)
    .map(([key, count]) => ({ key, count }));
}

/**
 * FULL can mean BBC-only (no Person Leads). Surface that distinction without
 * treating it as EMPTY_LEGITIMATE or PROVIDER_FAILURE.
 */
function isFullBusinessContactsOnly(metadata: LeadSearchMetadata): boolean {
  if (metadata.outcome !== "FULL") {
    return false;
  }
  const personLeads = metadata.personLeadsCreated ?? 0;
  const bbcCreated =
    metadata.businessContactsCreated ??
    metadata.businessContactDiscovery?.contactsCreated ??
    0;
  return personLeads === 0 && bbcCreated > 0;
}

export function LeadRunOutcomeBanner({ runs }: LeadRunOutcomeBannerProps) {
  const t = useTranslations("LeadDiscovery.runOutcome");
  const metadata = latestCompletedWithMetadata(runs);

  if (!metadata?.outcome) {
    return null;
  }

  const bbc = metadata.businessContactDiscovery;
  const failureCategories = sanitizeFailureCategories(
    bbc?.failureCountsByCategory,
  );
  const isProviderFailure = metadata.outcome === "PROVIDER_FAILURE";
  const isEmptyLegitimate = metadata.outcome === "EMPTY_LEGITIMATE";
  const isBbcOnly = isFullBusinessContactsOnly(metadata);

  if (metadata.outcome === "FULL" && !isBbcOnly) {
    return null;
  }

  if (isBbcOnly) {
    return (
      <div
        className="space-y-2 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground"
        role="status"
      >
        <p className="font-medium">{t("bbcOnlyTitle")}</p>
        <p className="text-xs">{t("bbcOnlyBody")}</p>
        <p className="text-xs">
          {t("resultCounts", {
            businessContacts: metadata.businessContactsCreated ??
              bbc?.contactsCreated ??
              0,
            personLeads: metadata.personLeadsCreated ?? 0,
          })}
        </p>
        {metadata.peopleSearchTrace ? (
          <p className="text-xs">
            {t("peopleTraceSummary", {
              hits: metadata.peopleSearchTrace.searchHitsReceived,
              linkedin: metadata.peopleSearchTrace.linkedinUrlValidated,
              qualified: metadata.peopleSearchTrace.qualifiedCandidates,
            })}
          </p>
        ) : null}
      </div>
    );
  }

  const role = isProviderFailure ? "alert" : "status";
  const toneClass = isProviderFailure
    ? "border-destructive/40 bg-destructive/10 text-destructive"
    : "border-border bg-muted/50 text-muted-foreground";

  const warningKey =
    metadata.warningCode &&
    [
      "unlocker_all_pages_failed",
      "people_scraper_all_failed",
      "people_search_provider_failed",
      "mixed_provider_failure",
    ].includes(metadata.warningCode)
      ? metadata.warningCode
      : "generic";

  return (
    <div className={`space-y-2 rounded-md border p-3 text-sm ${toneClass}`} role={role}>
      <p className="font-medium">
        {isProviderFailure
          ? t("providerFailureTitle")
          : t("emptyLegitimateTitle")}
      </p>
      <p className="text-xs">
        {isProviderFailure
          ? t(`warnings.${warningKey}`)
          : t("emptyLegitimateBody")}
      </p>

      {bbc && bbc.pagesAttempted > 0 ? (
        <p className="text-xs">
          {t("pagesSummary", {
            attempted: bbc.pagesAttempted,
            succeeded: bbc.pagesSucceeded,
            failed: bbc.pagesFailed,
          })}
        </p>
      ) : null}

      {failureCategories.length > 0 ? (
        <ul className="list-inside list-disc text-xs">
          {failureCategories.map(({ key, count }) => (
            <li key={key}>
              {t(`failureCategories.${key}`)}: {count}
            </li>
          ))}
        </ul>
      ) : null}

      {isEmptyLegitimate && metadata.peopleSearchTrace ? (
        <p className="text-xs">
          {t("peopleTraceSummary", {
            hits: metadata.peopleSearchTrace.searchHitsReceived,
            linkedin: metadata.peopleSearchTrace.linkedinUrlValidated,
            qualified: metadata.peopleSearchTrace.qualifiedCandidates,
          })}
        </p>
      ) : null}
    </div>
  );
}
