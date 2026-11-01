"use client";

import { useTranslations } from "next-intl";

import { LeadListItem } from "@/components/lead-discovery/lead-list-item";
import { LeadRunOutcomeBanner } from "@/components/lead-discovery/lead-run-outcome-banner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLeadDiscovery } from "@/hooks/use-lead-discovery";

const LIMIT_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

type LeadContactsPanelProps = {
  brandCandidateId: string;
};

function emptyLeadsMessageKey(
  runs: ReturnType<typeof useLeadDiscovery>["runs"],
): "emptyLeads" | "emptyLeadsAfterProviderFailure" | "emptyLeadsLegitimate" {
  const completed = runs
    .filter((run) => run.status === "COMPLETED" && run.searchMetadata?.outcome)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const outcome = completed[0]?.searchMetadata?.outcome;
  if (outcome === "PROVIDER_FAILURE") {
    return "emptyLeadsAfterProviderFailure";
  }
  if (outcome === "EMPTY_LEGITIMATE") {
    return "emptyLeadsLegitimate";
  }
  return "emptyLeads";
}

export function LeadContactsPanel({ brandCandidateId }: LeadContactsPanelProps) {
  const t = useTranslations("LeadDiscovery");
  const {
    limit,
    setLimit,
    leads,
    runs,
    searching,
    updatingId,
    error,
    hasProcessing,
    loadingMeta,
    loadingLeads,
    canSearch,
    rebuildMode,
    bbcV1Active,
    startSearch,
    refreshLeadsAndRuns,
    updateStatus,
    selectForOutreach,
    deselectForOutreach,
  } = useLeadDiscovery(brandCandidateId);

  return (
    <div className="mt-4 space-y-3 rounded-md border border-border bg-muted/30 p-3">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">{t("panelTitle")}</h4>
        <p className="text-xs text-muted-foreground">{t("panelDescription")}</p>
      </div>

      {bbcV1Active || rebuildMode ? (
        <p
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
          role="status"
        >
          {t("bbcV1PersonLeadsBanner")}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <LeadRunOutcomeBanner runs={runs} />

      {!bbcV1Active ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t("limitLabel")}</Label>
            <select
              className="h-9 min-w-16 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={limit}
              disabled={searching || hasProcessing}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              {LIMIT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={
              searching || hasProcessing || loadingMeta || !canSearch
            }
            onClick={() => void startSearch()}
          >
            {searching || hasProcessing ? t("searching") : t("searchAction")}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loadingLeads}
          onClick={() => void refreshLeadsAndRuns().catch(() => undefined)}
        >
          {t("refreshLeads")}
        </Button>
      )}

      <div className="space-y-2">
        <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("leadsTitle")}
        </h5>
        {loadingLeads ? (
          <p className="text-xs text-muted-foreground">{t("loadingLeads")}</p>
        ) : leads.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t(emptyLeadsMessageKey(runs))}
          </p>
        ) : (
          <ul className="space-y-2">
            {leads.map((lead) => (
              <LeadListItem
                key={lead.id}
                lead={lead}
                isUpdating={updatingId === lead.id}
                onApprove={() =>
                  void updateStatus(lead.id, { status: "APPROVED" })
                }
                onDiscard={() =>
                  void updateStatus(lead.id, { status: "DISCARDED" })
                }
                onSelectForOutreach={() => void selectForOutreach(lead.id)}
                onDeselectForOutreach={() => void deselectForOutreach(lead.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
