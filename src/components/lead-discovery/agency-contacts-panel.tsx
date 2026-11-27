"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import {
  ApproveAllButton,
  ApproveProspectButton,
} from "@/components/prospects/approve-prospect-button";
import { Button } from "@/components/ui/button";
import { useAgencyContacts } from "@/hooks/use-agency-contacts";
import type { AgencyContactCommercial } from "@/types/lead-discovery";

type AgencyContactsPanelProps = {
  influencerId: string | null | undefined;
  /** Align with BBC search polling (track 2C finishes in the same run). */
  pollWhile?: boolean;
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

function evidenceLink(contact: AgencyContactCommercial): string | null {
  const fromEvidence = contact.evidence.find((item) =>
    isHttpUrl(item.sourceUrl),
  );
  return fromEvidence?.sourceUrl ?? null;
}

function evidenceSnippet(contact: AgencyContactCommercial): string | null {
  const snippet = contact.evidence.find(
    (item) => item.evidenceSnippet.trim().length > 0,
  )?.evidenceSnippet;
  return snippet?.trim() || null;
}

function eligibilityClass(
  status: AgencyContactCommercial["eligibilityStatus"],
): string {
  if (status === "ACTIONABLE") {
    return "border-border bg-background";
  }
  return "border-dashed border-border bg-muted/40";
}

type AgencyGroup = {
  agencyId: string;
  agencyName: string;
  agencyDomain: string;
  agencyRelevanceStatus: AgencyContactCommercial["agencyRelevanceStatus"];
  contacts: AgencyContactCommercial[];
};

export function AgencyContactsPanel({
  influencerId,
  pollWhile = false,
}: AgencyContactsPanelProps) {
  const t = useTranslations("LeadDiscovery.agencyContacts");
  const { contacts, loading, error, refresh } = useAgencyContacts(
    influencerId,
    { pollWhile },
  );

  const groups = useMemo(() => {
    const byAgency = new Map<string, AgencyGroup>();
    for (const contact of contacts) {
      const existing = byAgency.get(contact.agencyId);
      if (existing) {
        existing.contacts.push(contact);
      } else {
        byAgency.set(contact.agencyId, {
          agencyId: contact.agencyId,
          agencyName: contact.agencyName,
          agencyDomain: contact.agencyDomain,
          agencyRelevanceStatus: contact.agencyRelevanceStatus,
          contacts: [contact],
        });
      }
    }
    return Array.from(byAgency.values());
  }, [contacts]);

  if (!influencerId) {
    return (
      <p className="text-xs text-muted-foreground">{t("missingInfluencer")}</p>
    );
  }

  return (
    <div className="space-y-3" data-testid="agency-contacts-panel">
      <div className="space-y-1">
        <h6 className="text-xs font-medium text-foreground">
          {t("contactsTitle")}
        </h6>
        <p className="text-xs text-muted-foreground">{t("contactsDescription")}</p>
      </div>

      {error ? (
        <div className="space-y-2" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={refresh}>
            {t("retry")}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      ) : null}

      {!loading && !error && contacts.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      ) : null}

      {!loading && groups.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <ApproveAllButton
              influencerId={influencerId}
              items={contacts.map((contact) => ({
                type: "AGENCY_CONTACT" as const,
                id: contact.agencyContactId,
                influencerId: influencerId ?? undefined,
              }))}
            />
          </div>
          {groups.map((group) => (
            <div key={group.agencyId} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {group.agencyName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {group.agencyDomain}
                </span>
                <Badge variant="outline">
                  {t(`agencyRelevance.${group.agencyRelevanceStatus}`)}
                </Badge>
              </div>
              <ul className="space-y-2">
                {group.contacts.map((contact) => {
                  const link = evidenceLink(contact);
                  const snippet = evidenceSnippet(contact);
                  const verification =
                    contact.provenance.verificationStatus === "VERIFIED"
                      ? t("verification.VERIFIED")
                      : t("verification.UNVERIFIED");
                  return (
                    <li
                      key={contact.agencyContactId}
                      className={`rounded-md border p-3 text-sm ${eligibilityClass(contact.eligibilityStatus)}`}
                      data-eligibility={contact.eligibilityStatus}
                      data-contact-kind={contact.contactKind}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`mailto:${contact.email}`}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {contact.email}
                        </a>
                        <Badge variant="secondary">
                          {t(`contactKind.${contact.contactKind}`)}
                        </Badge>
                        <Badge variant="secondary">
                          {t(`relevance.${contact.commercialRelevance}`)}
                        </Badge>
                        <Badge
                          variant={
                            contact.eligibilityStatus === "ACTIONABLE"
                              ? "default"
                              : "outline"
                          }
                        >
                          {t(`eligibility.${contact.eligibilityStatus}`)}
                        </Badge>
                        {contact.priority ? (
                          <Badge variant="default">{t("priority")}</Badge>
                        ) : null}
                        <ApproveProspectButton
                          type="AGENCY_CONTACT"
                          id={contact.agencyContactId}
                          influencerId={influencerId}
                          className="ml-auto"
                        />
                      </div>
                      {contact.displayName || contact.title ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[contact.displayName, contact.title]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                      {snippet ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {t("evidence")}:{" "}
                          </span>
                          {snippet}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("operation")}:{" "}
                        {t(`researchOperation.${contact.researchOperation}`)}
                        {` · ${t(`attribution.${contact.attributionStatus}`)}`}
                        {` · ${verification}`}
                      </p>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
                        >
                          {t("openEvidence")}
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
