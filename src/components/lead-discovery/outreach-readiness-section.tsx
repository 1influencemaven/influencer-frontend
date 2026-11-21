"use client";

import { useTranslations } from "next-intl";

import { OutreachReadinessBadge } from "@/components/lead-discovery/outreach-readiness-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OutreachReadiness } from "@/types/lead-discovery";

type OutreachReadinessSectionProps = {
  readiness: OutreachReadiness;
};

export function OutreachReadinessSection({
  readiness,
}: OutreachReadinessSectionProps) {
  const t = useTranslations("LeadDiscovery.contactability");

  return (
    <section className="space-y-4" aria-labelledby="lead-contactability">
      <h2
        id="lead-contactability"
        className="text-sm font-medium tracking-wide text-muted-foreground uppercase"
      >
        {t("title")}
      </h2>
      <Card className="gap-4 py-4 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <OutreachReadinessBadge readiness={readiness} />
            <span>{t(readiness)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <p className="text-sm text-muted-foreground">
            {t(`${readiness}_desc`)}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
