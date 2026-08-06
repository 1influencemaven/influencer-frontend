"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
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
    canSearch,
    startSearch,
    updateStatus,
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
        {leads.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("emptyLeads")}</p>
        ) : (
          <ul className="space-y-2">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="flex flex-col gap-2 rounded-md border border-border bg-background p-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">
                    {lead.contactName}
                    {lead.title ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {lead.title}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.email}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">
                      {t(`leadStatus.${lead.status}`)}
                    </Badge>
                    <Badge variant="secondary">
                      {t(`confidence.${lead.emailConfidence}`)}
                    </Badge>
                    {lead.isGeneric ? (
                      <Badge variant="destructive">{t("generic")}</Badge>
                    ) : null}
                    <Badge variant="outline">{lead.providerId}</Badge>
                  </div>
                </div>
                {lead.status === "UNDER_REVIEW" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updatingId === lead.id}
                      onClick={() =>
                        void updateStatus(lead.id, { status: "APPROVED" })
                      }
                    >
                      {t("approve")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updatingId === lead.id}
                      onClick={() =>
                        void updateStatus(lead.id, { status: "DISCARDED" })
                      }
                    >
                      {t("discard")}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
