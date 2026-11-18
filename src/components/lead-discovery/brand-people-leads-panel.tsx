"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types/lead-discovery";

type BrandPeopleLeadsPanelProps = {
  brandCandidateId: string;
  leads: Lead[];
  loading: boolean;
};

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Minimal Track 2B people list for an APPROVED brand (Paso 8).
 * Data comes from the same poll as BBC (useBbcDiscovery.leads).
 */
export function BrandPeopleLeadsPanel({
  brandCandidateId,
  leads,
  loading,
}: BrandPeopleLeadsPanelProps) {
  const t = useTranslations("LeadDiscovery.peopleLeads");

  return (
    <section
      className="mt-4 space-y-3 rounded-md border border-border bg-muted/30 p-3"
      aria-labelledby={`people-title-${brandCandidateId}`}
    >
      <div className="space-y-1">
        <h4
          id={`people-title-${brandCandidateId}`}
          className="text-sm font-medium"
        >
          {t("title")}
        </h4>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      ) : null}

      {!loading && leads.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      ) : null}

      {!loading && leads.length > 0 ? (
        <ul className="space-y-2">
          {leads.map((lead) => {
            const linkedin = isHttpUrl(lead.profileUrl)
              ? lead.profileUrl
              : null;
            return (
              <li
                key={lead.id}
                className="rounded-md border border-border bg-background p-3 text-sm"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">
                    {lead.contactName}
                  </span>
                  {lead.title ? (
                    <span className="text-xs text-muted-foreground">
                      {lead.title}
                    </span>
                  ) : null}
                  <Badge variant="secondary">{t(`status.${lead.status}`)}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {linkedin ? (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {t("linkedin")}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("noLinkedin")}
                    </span>
                  )}
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("noEmail")}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
