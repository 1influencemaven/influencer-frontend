"use client";

import { useTranslations } from "next-intl";

import { LeadListItem } from "@/components/lead-discovery/lead-list-item";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLeadDiscovery } from "@/hooks/use-lead-discovery";

const LIMIT_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

type LeadContactsPanelProps = {
  brandCandidateId: string;
};

export function LeadContactsPanel({ brandCandidateId }: LeadContactsPanelProps) {
  const t = useTranslations("LeadDiscovery");
  const {
    limit,
    setLimit,
    leads,
    searching,
    updatingId,
    error,
    hasProcessing,
    loadingMeta,
    loadingLeads,
    canSearch,
    startSearch,
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

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

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

      <div className="space-y-2">
        <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("leadsTitle")}
        </h5>
        {loadingLeads ? (
          <p className="text-xs text-muted-foreground">{t("loadingLeads")}</p>
        ) : leads.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("emptyLeads")}</p>
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
