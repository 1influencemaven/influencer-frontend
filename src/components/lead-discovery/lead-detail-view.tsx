"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { LeadContactChannelsSection } from "@/components/lead-discovery/lead-contact-channels-section";
import { LeadDetailHeader } from "@/components/lead-discovery/lead-detail-header";
import { LeadWorkflowSection } from "@/components/lead-discovery/lead-workflow-section";
import { OutreachReadinessSection } from "@/components/lead-discovery/outreach-readiness-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getLeadById } from "@/services/lead-discovery.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { LeadDetail } from "@/types/lead-discovery";

type LeadDetailViewProps = {
  leadId: string;
};

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const t = useTranslations("LeadDiscovery.detail");
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLead = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detail = await getLeadById(leadId);
      setLead(detail);
    } catch (loadError) {
      if (isApiError(loadError) && loadError.status === 404) {
        setError(t("notFound"));
      } else {
        setError(getApiErrorMessage(loadError, t("loadFailed")));
      }
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId, t]);

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/dashboard/brand-discovery">{t("back")}</Link>
        </Button>
      </div>

      {loading ? (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/dashboard/brand-discovery">{t("back")}</Link>
          </Button>
        </section>
      ) : null}

      {!loading && !error && lead ? (
        <div className="flex flex-col gap-8">
          <LeadDetailHeader lead={lead} />
          <LeadContactChannelsSection channels={lead.contactChannels} />
          <OutreachReadinessSection readiness={lead.outreachReadiness} />
          <LeadWorkflowSection lead={lead} />
        </div>
      ) : null}
    </div>
  );
}
