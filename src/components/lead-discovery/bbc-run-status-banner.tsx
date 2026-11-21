"use client";

import { useTranslations } from "next-intl";

import type { BbcUiState } from "@/lib/bbc-run-ui-state";
import type { LeadDiscoveryRun } from "@/types/lead-discovery";

type BbcRunStatusBannerProps = {
  state: BbcUiState;
  pollError?: string | null;
  /** Latest runs — used to surface AI researchTrace operational steps. */
  runs?: LeadDiscoveryRun[];
};

/**
 * Distinct visual states for BBC v1 runs. Does not treat PROCESSING as error
 * or PROVIDER_FAILURE as an empty legitimate search.
 */
function latestResearchTrace(runs: LeadDiscoveryRun[] | undefined) {
  if (!runs?.length) return null;
  const sorted = [...runs].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const run of sorted) {
    const meta = run.searchMetadata;
    if (meta?.researchTrace) return meta.researchTrace;
  }
  return null;
}

function ResearchTraceBlock({
  trace,
  t,
}: {
  trace: NonNullable<ReturnType<typeof latestResearchTrace>>;
  t: ReturnType<typeof useTranslations<"LeadDiscovery.bbc">>;
}) {
  if (!trace.steps?.length && !trace.finalizeSummary) return null;
  return (
    <div
      className="space-y-1 rounded-md border border-border bg-background p-3 text-xs text-muted-foreground"
      role="status"
    >
      <p className="font-medium text-foreground">{t("researchTraceTitle")}</p>
      <p>
        {t("researchTraceCounts", {
          serp: trace.serpQueriesUsed ?? 0,
          pages: trace.pagesFetched ?? 0,
          maxSerp: trace.maxSerp ?? 5,
          maxPages: trace.maxPages ?? 5,
        })}
      </p>
      {trace.finalizeSummary ? (
        <p>{t("researchFinalize", { summary: trace.finalizeSummary })}</p>
      ) : null}
      {trace.steps && trace.steps.length > 0 ? (
        <ul className="list-inside list-disc space-y-0.5">
          {trace.steps.slice(0, 8).map((step) => (
            <li key={`${step.iteration}-${step.action}-${step.reason}`}>
              {step.action}
              {step.query ? `: ${step.query}` : ""}
              {step.url ? `: ${step.url}` : ""} — {step.reason}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function BbcRunStatusBanner({
  state,
  pollError,
  runs,
}: BbcRunStatusBannerProps) {
  const t = useTranslations("LeadDiscovery.bbc");
  const trace = latestResearchTrace(runs);
  const researchBlock = trace ? (
    <ResearchTraceBlock trace={trace} t={t} />
  ) : null;

  if (state.kind === "idle" && !pollError && !researchBlock) {
    return null;
  }

  if (pollError) {
    return (
      <div
        className="space-y-1 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        role="alert"
      >
        <p className="font-medium">{t("pollErrorTitle")}</p>
        <p className="text-xs">{pollError}</p>
      </div>
    );
  }

  if (state.kind === "load_error") {
    return null; // parent already shows load error + retry
  }

  if (state.kind === "processing") {
    return (
      <div className="space-y-2">
        <div
          className="space-y-1 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium">{t("processingTitle")}</p>
          <p className="text-xs">{t("processingBody")}</p>
        </div>
        {researchBlock}
      </div>
    );
  }

  if (state.kind === "partial_while_processing") {
    return (
      <div className="space-y-2">
        <div
          className="space-y-1 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium">{t("partialProcessingTitle")}</p>
          <p className="text-xs">
            {t("partialProcessingBody", { count: state.contactCount })}
          </p>
        </div>
        {researchBlock}
      </div>
    );
  }

  if (state.kind === "results_found") {
    const partial = (state.pagesFailed ?? 0) > 0;
    return (
      <div className="space-y-2">
        <div
          className="space-y-1 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground"
          role="status"
        >
          <p className="font-medium">{t("resultsFoundTitle")}</p>
          <p className="text-xs">
            {t("resultsFoundBody", {
              created: state.contactsCreated ?? 0,
              updated: state.contactsUpdated ?? 0,
            })}
          </p>
          {partial ? (
            <p className="text-xs">{t("resultsFoundPartial")}</p>
          ) : null}
        </div>
        {researchBlock}
      </div>
    );
  }

  if (state.kind === "no_matches") {
    return (
      <div className="space-y-2">
        <div
          className="space-y-1 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground"
          role="status"
        >
          <p className="font-medium">{t("noMatchesTitle")}</p>
          <p className="text-xs">{t("noMatchesBody")}</p>
        </div>
        {researchBlock}
      </div>
    );
  }

  if (state.kind === "provider_failure") {
    const kind = state.providerFailureKind;
    const kindLabel =
      kind === "transport" ||
      kind === "http" ||
      kind === "empty_body" ||
      kind === "malformed"
        ? t(`failureKind.${kind}`)
        : t("failureKind.unknown");
    return (
      <div className="space-y-2">
        <div
          className="space-y-1 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium">{t("providerFailureTitle")}</p>
          <p className="text-xs">
            {t("providerFailureBody", { kind: kindLabel })}
          </p>
          {state.errorMessage ? (
            <p className="text-xs opacity-90">{state.errorMessage}</p>
          ) : null}
        </div>
        {researchBlock}
      </div>
    );
  }

  if (state.kind === "failed") {
    return (
      <div className="space-y-2">
        <div
          className="space-y-1 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium">{t("failedTitle")}</p>
          <p className="text-xs">
            {state.errorMessage?.trim()
              ? state.errorMessage
              : t("failedBody")}
          </p>
          {state.contactCount > 0 ? (
            <p className="text-xs">{t("failedOrphansNote")}</p>
          ) : null}
        </div>
        {researchBlock}
      </div>
    );
  }

  return researchBlock;
}
