"use client";

import { useTranslations } from "next-intl";

import { ContactChannelSummary } from "@/components/lead-discovery/contact-channel-summary";
import { OutreachReadinessBadge } from "@/components/lead-discovery/outreach-readiness-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LeadDetail } from "@/types/lead-discovery";

type LeadListItemProps = {
  lead: LeadDetail;
  isUpdating: boolean;
  onApprove: () => void;
  onDiscard: () => void;
  onSelectForOutreach: () => void;
  onDeselectForOutreach: () => void;
};

export function LeadListItem({
  lead,
  isUpdating,
  onApprove,
  onDiscard,
  onSelectForOutreach,
  onDeselectForOutreach,
}: LeadListItemProps) {
  const t = useTranslations("LeadDiscovery");

  return (
    <li className="rounded-md border border-border bg-background">
      <Link
        href={`/dashboard/leads/${lead.id}`}
        className="flex min-w-0 flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{lead.person.name}</p>
          {lead.person.position ? (
            <p className="truncate text-xs text-muted-foreground">
              {lead.person.position}
            </p>
          ) : null}
          <p className="truncate text-xs text-muted-foreground">
            {lead.person.company}
          </p>
          <ContactChannelSummary channels={lead.contactChannels} />
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <OutreachReadinessBadge readiness={lead.outreachReadiness} />
            <Badge variant="outline">{t(`leadStatus.${lead.status}`)}</Badge>
            {lead.status === "APPROVED" && lead.selectedForOutreach ? (
              <Badge variant="secondary">{t("selectedForOutreach")}</Badge>
            ) : null}
          </div>
        </div>
      </Link>
      {lead.status === "UNDER_REVIEW" ? (
        <div
          className="flex flex-wrap gap-2 border-t border-border px-2 py-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            size="sm"
            disabled={isUpdating}
            onClick={onApprove}
          >
            {t("approve")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isUpdating}
            onClick={onDiscard}
          >
            {t("discard")}
          </Button>
        </div>
      ) : null}
      {lead.status === "APPROVED" ? (
        <div
          className="flex flex-wrap gap-2 border-t border-border px-2 py-2"
          onClick={(event) => event.stopPropagation()}
        >
          {lead.selectedForOutreach ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={onDeselectForOutreach}
            >
              {isUpdating ? t("deselecting") : t("deselectForOutreach")}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={onSelectForOutreach}
            >
              {isUpdating ? t("selecting") : t("selectForOutreach")}
            </Button>
          )}
        </div>
      ) : null}
    </li>
  );
}
