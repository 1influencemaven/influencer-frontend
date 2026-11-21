"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LeadDetail } from "@/types/lead-discovery";

type LeadWorkflowSectionProps = {
  lead: LeadDetail;
};

export function LeadWorkflowSection({ lead }: LeadWorkflowSectionProps) {
  const t = useTranslations("LeadDiscovery.detail");
  const tLead = useTranslations("LeadDiscovery");

  return (
    <section className="space-y-4" aria-labelledby="lead-workflow">
      <h2
        id="lead-workflow"
        className="text-sm font-medium tracking-wide text-muted-foreground uppercase"
      >
        {t("workflowTitle")}
      </h2>
      <Card className="gap-4 py-4 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">{t("workflowStatus")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {tLead(`leadStatus.${lead.status}`)}
            </Badge>
            {lead.status === "APPROVED" && lead.selectedForOutreach ? (
              <Badge variant="secondary">{tLead("selectedForOutreach")}</Badge>
            ) : null}
          </div>
          {lead.status === "APPROVED" ? (
            <p className="text-sm text-muted-foreground">
              {lead.selectedForOutreach
                ? t("outreachSelected")
                : t("outreachNotSelected")}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
