"use client";

import { useTranslations } from "next-intl";

import { OutreachReadinessBadge } from "@/components/lead-discovery/outreach-readiness-badge";
import { Badge } from "@/components/ui/badge";
import type { LeadDetail } from "@/types/lead-discovery";

type LeadDetailHeaderProps = {
  lead: LeadDetail;
};

export function LeadDetailHeader({ lead }: LeadDetailHeaderProps) {
  const t = useTranslations("LeadDiscovery");

  return (
    <header className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">
          {lead.person.name}
        </h1>
        {lead.person.position ? (
          <p className="text-sm text-muted-foreground">
            {lead.person.position}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">{lead.person.company}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{t(`leadStatus.${lead.status}`)}</Badge>
        {lead.status === "APPROVED" && lead.selectedForOutreach ? (
          <Badge variant="secondary">{t("selectedForOutreach")}</Badge>
        ) : null}
        <OutreachReadinessBadge readiness={lead.outreachReadiness} />
      </div>
    </header>
  );
}
