"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listBrandBusinessContacts } from "@/services/lead-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { BrandBusinessContact } from "@/types/lead-discovery";

type BrandBusinessContactsPanelProps = {
  brandCandidateId: string;
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

function evidenceLink(contact: BrandBusinessContact): string | null {
  if (isHttpUrl(contact.sourceUrl)) {
    return contact.sourceUrl;
  }
  const fromEvidence = contact.evidences.find((item) =>
    isHttpUrl(item.sourceUrl),
  );
  return fromEvidence?.sourceUrl ?? null;
}

function evidenceSnippet(contact: BrandBusinessContact): string | null {
  const snippet = contact.evidences.find(
    (item) => item.evidenceSnippet.trim().length > 0,
  )?.evidenceSnippet;
  return snippet?.trim() || null;
}

export function BrandBusinessContactsPanel({
  brandCandidateId,
}: BrandBusinessContactsPanelProps) {
  const t = useTranslations("LeadDiscovery.businessContacts");
  const [contacts, setContacts] = useState<BrandBusinessContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Bumped from retry (event handler) to re-run the effect without sync setState in it. */
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const rows = await listBrandBusinessContacts(brandCandidateId);
        if (cancelled) {
          return;
        }
        setContacts(rows);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setContacts([]);
        setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [brandCandidateId, reloadToken]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }

  return (
    <section
      className="mt-4 space-y-3 rounded-md border border-border bg-muted/30 p-3"
      aria-labelledby={`bbc-title-${brandCandidateId}`}
    >
      <div className="space-y-1">
        <h4
          id={`bbc-title-${brandCandidateId}`}
          className="text-sm font-medium"
        >
          {t("title")}
        </h4>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>

      {error ? (
        <div className="space-y-2" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={handleRetry}>
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

      {!loading && contacts.length > 0 ? (
        <ul className="space-y-2">
          {contacts.map((contact) => {
            const link = evidenceLink(contact);
            const snippet = evidenceSnippet(contact);
            return (
              <li
                key={contact.id}
                className="rounded-md border border-border bg-background p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {contact.email}
                  </a>
                  {contact.label ? (
                    <Badge variant="outline">{contact.label}</Badge>
                  ) : null}
                  <Badge variant="secondary">
                    {t(`relevance.${contact.commercialRelevance}`)}
                  </Badge>
                </div>
                {snippet ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {t("evidence")}:{" "}
                    </span>
                    {snippet}
                  </p>
                ) : null}
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
      ) : null}
    </section>
  );
}
